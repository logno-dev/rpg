import { createClient } from '@libsql/client';
import 'dotenv/config';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

async function cleanupDuplicates() {
  console.log('🧹 Starting database cleanup...\n');
  
  try {
    // ==================== CLEANUP DUPLICATE MOBS ====================
    console.log('=== PHASE 1: Cleaning up duplicate mobs ===');
    
    // Find all duplicate mob names
    const duplicateMobs = await client.execute(`
      SELECT name, COUNT(*) as count 
      FROM mobs 
      GROUP BY name 
      HAVING COUNT(*) > 1 
      ORDER BY name
    `);
    
    console.log(`Found ${duplicateMobs.rows.length} mob names with duplicates\n`);
    
    let totalMobsDeleted = 0;
    
    for (const dupMob of duplicateMobs.rows) {
      const mobName = dupMob.name;
      
      // Get all copies of this mob, ordered by ID (keep the first one)
      const copies = await client.execute({
        sql: 'SELECT id FROM mobs WHERE name = ? ORDER BY id',
        args: [mobName]
      });
      
      // Keep the first ID, delete the rest
      const keepId = copies.rows[0].id;
      const deleteIds = copies.rows.slice(1).map(r => r.id);
      
      console.log(`  ${mobName}: Keeping ID ${keepId}, deleting ${deleteIds.length} duplicates`);
      
      // Update mob_loot references to point to the kept mob
      for (const deleteId of deleteIds) {
        await client.execute({
          sql: 'UPDATE mob_loot SET mob_id = ? WHERE mob_id = ?',
          args: [keepId, deleteId]
        });
      }
      
      // Update region_mobs references
      // First, check if the kept mob already has an entry for each region
      for (const deleteId of deleteIds) {
        const regionMobEntries = await client.execute({
          sql: 'SELECT region_id, spawn_weight FROM region_mobs WHERE mob_id = ?',
          args: [deleteId]
        });
        
        for (const entry of regionMobEntries.rows) {
          // Check if kept mob already has entry for this region
          const existing = await client.execute({
            sql: 'SELECT id FROM region_mobs WHERE mob_id = ? AND region_id = ?',
            args: [keepId, entry.region_id]
          });
          
          if (existing.rows.length === 0) {
            // Transfer the entry to the kept mob
            await client.execute({
              sql: 'UPDATE region_mobs SET mob_id = ? WHERE mob_id = ? AND region_id = ?',
              args: [keepId, deleteId, entry.region_id]
            });
          } else {
            // Delete the duplicate entry (kept mob already has one)
            await client.execute({
              sql: 'DELETE FROM region_mobs WHERE mob_id = ? AND region_id = ?',
              args: [deleteId, entry.region_id]
            });
          }
        }
      }
      
      // Update dungeon_encounters references
      for (const deleteId of deleteIds) {
        await client.execute({
          sql: 'UPDATE dungeon_encounters SET mob_id = ? WHERE mob_id = ?',
          args: [keepId, deleteId]
        });
      }
      
      // Delete combat sessions with duplicate mobs
      for (const deleteId of deleteIds) {
        await client.execute({
          sql: 'DELETE FROM combat_sessions WHERE mob_id = ?',
          args: [deleteId]
        });
      }
      
      // Now delete the duplicate mobs
      for (const deleteId of deleteIds) {
        await client.execute({
          sql: 'DELETE FROM mobs WHERE id = ?',
          args: [deleteId]
        });
        totalMobsDeleted++;
      }
    }
    
    console.log(`\n✅ Deleted ${totalMobsDeleted} duplicate mobs\n`);
    
    // ==================== CLEANUP DUPLICATE ITEMS ====================
    console.log('=== PHASE 2: Cleaning up duplicate items ===');
    
    // Find all duplicate item names
    const duplicateItems = await client.execute(`
      SELECT name, COUNT(*) as count 
      FROM items 
      GROUP BY name 
      HAVING COUNT(*) > 1 
      ORDER BY name
    `);
    
    console.log(`Found ${duplicateItems.rows.length} item names with duplicates\n`);
    
    let totalItemsDeleted = 0;
    
    for (const dupItem of duplicateItems.rows) {
      const itemName = dupItem.name;
      
      // Get all copies of this item, ordered by ID (keep the first one)
      const copies = await client.execute({
        sql: 'SELECT id FROM items WHERE name = ? ORDER BY id',
        args: [itemName]
      });
      
      // Keep the first ID, delete the rest
      const keepId = copies.rows[0].id;
      const deleteIds = copies.rows.slice(1).map(r => r.id);
      
      console.log(`  ${itemName}: Keeping ID ${keepId}, deleting ${deleteIds.length} duplicates`);
      
      // Update character_inventory references
      for (const deleteId of deleteIds) {
        // Check if character already has the kept item
        const inventories = await client.execute({
          sql: 'SELECT character_id, quantity FROM character_inventory WHERE item_id = ?',
          args: [deleteId]
        });
        
        for (const inv of inventories.rows) {
          const existing = await client.execute({
            sql: 'SELECT id, quantity FROM character_inventory WHERE character_id = ? AND item_id = ?',
            args: [inv.character_id, keepId]
          });
          
          if (existing.rows.length === 0) {
            // Character doesn't have kept item, transfer the entry
            await client.execute({
              sql: 'UPDATE character_inventory SET item_id = ? WHERE character_id = ? AND item_id = ?',
              args: [keepId, inv.character_id, deleteId]
            });
          } else {
            // Character already has kept item, merge quantities
            await client.execute({
              sql: 'UPDATE character_inventory SET quantity = quantity + ? WHERE character_id = ? AND item_id = ?',
              args: [inv.quantity, inv.character_id, keepId]
            });
            // Delete the duplicate entry
            await client.execute({
              sql: 'DELETE FROM character_inventory WHERE character_id = ? AND item_id = ?',
              args: [inv.character_id, deleteId]
            });
          }
        }
      }
      
      // Update mob_loot references
      for (const deleteId of deleteIds) {
        // Check if mob already has loot entry for kept item
        const lootEntries = await client.execute({
          sql: 'SELECT mob_id FROM mob_loot WHERE item_id = ?',
          args: [deleteId]
        });
        
        for (const loot of lootEntries.rows) {
          const existing = await client.execute({
            sql: 'SELECT id FROM mob_loot WHERE mob_id = ? AND item_id = ?',
            args: [loot.mob_id, keepId]
          });
          
          if (existing.rows.length === 0) {
            // Update to kept item
            await client.execute({
              sql: 'UPDATE mob_loot SET item_id = ? WHERE mob_id = ? AND item_id = ?',
              args: [keepId, loot.mob_id, deleteId]
            });
          } else {
            // Delete duplicate loot entry
            await client.execute({
              sql: 'DELETE FROM mob_loot WHERE mob_id = ? AND item_id = ?',
              args: [loot.mob_id, deleteId]
            });
          }
        }
      }
      
      // Update region_rare_loot references
      for (const deleteId of deleteIds) {
        const rareLoot = await client.execute({
          sql: 'SELECT region_id FROM region_rare_loot WHERE item_id = ?',
          args: [deleteId]
        });
        
        for (const rare of rareLoot.rows) {
          const existing = await client.execute({
            sql: 'SELECT id FROM region_rare_loot WHERE region_id = ? AND item_id = ?',
            args: [rare.region_id, keepId]
          });
          
          if (existing.rows.length === 0) {
            await client.execute({
              sql: 'UPDATE region_rare_loot SET item_id = ? WHERE region_id = ? AND item_id = ?',
              args: [keepId, rare.region_id, deleteId]
            });
          } else {
            await client.execute({
              sql: 'DELETE FROM region_rare_loot WHERE region_id = ? AND item_id = ?',
              args: [rare.region_id, deleteId]
            });
          }
        }
      }
      
      // Update named_mob_loot references
      for (const deleteId of deleteIds) {
        const namedLoot = await client.execute({
          sql: 'SELECT named_mob_id FROM named_mob_loot WHERE item_id = ?',
          args: [deleteId]
        });
        
        for (const loot of namedLoot.rows) {
          const existing = await client.execute({
            sql: 'SELECT id FROM named_mob_loot WHERE named_mob_id = ? AND item_id = ?',
            args: [loot.named_mob_id, keepId]
          });
          
          if (existing.rows.length === 0) {
            await client.execute({
              sql: 'UPDATE named_mob_loot SET item_id = ? WHERE named_mob_id = ? AND item_id = ?',
              args: [keepId, loot.named_mob_id, deleteId]
            });
          } else {
            await client.execute({
              sql: 'DELETE FROM named_mob_loot WHERE named_mob_id = ? AND item_id = ?',
              args: [loot.named_mob_id, deleteId]
            });
          }
        }
      }
      
      // Update merchant_inventory references
      for (const deleteId of deleteIds) {
        const merchantInv = await client.execute({
          sql: 'SELECT merchant_id FROM merchant_inventory WHERE item_id = ?',
          args: [deleteId]
        });
        
        for (const inv of merchantInv.rows) {
          const existing = await client.execute({
            sql: 'SELECT id FROM merchant_inventory WHERE merchant_id = ? AND item_id = ?',
            args: [inv.merchant_id, keepId]
          });
          
          if (existing.rows.length === 0) {
            await client.execute({
              sql: 'UPDATE merchant_inventory SET item_id = ? WHERE merchant_id = ? AND item_id = ?',
              args: [keepId, inv.merchant_id, deleteId]
            });
          } else {
            await client.execute({
              sql: 'DELETE FROM merchant_inventory WHERE merchant_id = ? AND item_id = ?',
              args: [inv.merchant_id, deleteId]
            });
          }
        }
      }
      
      // Now delete the duplicate items
      for (const deleteId of deleteIds) {
        await client.execute({
          sql: 'DELETE FROM items WHERE id = ?',
          args: [deleteId]
        });
        totalItemsDeleted++;
      }
    }
    
    console.log(`\n✅ Deleted ${totalItemsDeleted} duplicate items\n`);
    
    // ==================== CLEANUP DUPLICATE ABILITIES ====================
    console.log('=== PHASE 3: Cleaning up duplicate abilities ===');
    
    // Find all duplicate ability names
    const duplicateAbilities = await client.execute(`
      SELECT name, COUNT(*) as count 
      FROM abilities 
      GROUP BY name 
      HAVING COUNT(*) > 1 
      ORDER BY name
    `);
    
    console.log(`Found ${duplicateAbilities.rows.length} ability names with duplicates\n`);
    
    let totalAbilitiesDeleted = 0;
    
    for (const dupAbility of duplicateAbilities.rows) {
      const abilityName = dupAbility.name;
      
      // Get all copies of this ability, ordered by ID (keep the first one)
      const copies = await client.execute({
        sql: 'SELECT id FROM abilities WHERE name = ? ORDER BY id',
        args: [abilityName]
      });
      
      // Keep the first ID, delete the rest
      const keepId = copies.rows[0].id;
      const deleteIds = copies.rows.slice(1).map(r => r.id);
      
      console.log(`  ${abilityName}: Keeping ID ${keepId}, deleting ${deleteIds.length} duplicates`);
      
      // Update character_abilities references
      for (const deleteId of deleteIds) {
        const charAbilities = await client.execute({
          sql: 'SELECT character_id FROM character_abilities WHERE ability_id = ?',
          args: [deleteId]
        });
        
        for (const charAbility of charAbilities.rows) {
          const existing = await client.execute({
            sql: 'SELECT id FROM character_abilities WHERE character_id = ? AND ability_id = ?',
            args: [charAbility.character_id, keepId]
          });
          
          if (existing.rows.length === 0) {
            // Character doesn't have kept ability, transfer the entry
            await client.execute({
              sql: 'UPDATE character_abilities SET ability_id = ? WHERE character_id = ? AND ability_id = ?',
              args: [keepId, charAbility.character_id, deleteId]
            });
          } else {
            // Character already has kept ability, delete duplicate
            await client.execute({
              sql: 'DELETE FROM character_abilities WHERE character_id = ? AND ability_id = ?',
              args: [charAbility.character_id, deleteId]
            });
          }
        }
      }
      
      // Update ability_effects references
      for (const deleteId of deleteIds) {
        await client.execute({
          sql: 'UPDATE ability_effects SET ability_id = ? WHERE ability_id = ?',
          args: [keepId, deleteId]
        });
      }
      
      // Update items.teaches_ability_id references
      for (const deleteId of deleteIds) {
        await client.execute({
          sql: 'UPDATE items SET teaches_ability_id = ? WHERE teaches_ability_id = ?',
          args: [keepId, deleteId]
        });
      }
      
      // Now delete the duplicate abilities
      for (const deleteId of deleteIds) {
        await client.execute({
          sql: 'DELETE FROM abilities WHERE id = ?',
          args: [deleteId]
        });
        totalAbilitiesDeleted++;
      }
    }
    
    console.log(`\n✅ Deleted ${totalAbilitiesDeleted} duplicate abilities\n`);
    
    // ==================== SUMMARY ====================
    console.log('=== CLEANUP SUMMARY ===');
    
    const finalMobCount = await client.execute('SELECT COUNT(*) as total FROM mobs');
    const finalItemCount = await client.execute('SELECT COUNT(*) as total FROM items');
    const finalAbilityCount = await client.execute('SELECT COUNT(*) as total FROM abilities');
    const uniqueMobs = await client.execute('SELECT COUNT(DISTINCT name) as total FROM mobs');
    const uniqueItems = await client.execute('SELECT COUNT(DISTINCT name) as total FROM items');
    const uniqueAbilities = await client.execute('SELECT COUNT(DISTINCT name) as total FROM abilities');
    
    console.log(`\nMobs:`);
    console.log(`  Total: ${finalMobCount.rows[0].total}`);
    console.log(`  Unique names: ${uniqueMobs.rows[0].total}`);
    console.log(`  Deleted: ${totalMobsDeleted}`);
    
    console.log(`\nItems:`);
    console.log(`  Total: ${finalItemCount.rows[0].total}`);
    console.log(`  Unique names: ${uniqueItems.rows[0].total}`);
    console.log(`  Deleted: ${totalItemsDeleted}`);
    
    console.log(`\nAbilities:`);
    console.log(`  Total: ${finalAbilityCount.rows[0].total}`);
    console.log(`  Unique names: ${uniqueAbilities.rows[0].total}`);
    console.log(`  Deleted: ${totalAbilitiesDeleted}`);
    
    console.log('\n🎉 Database cleanup complete!');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

// Run the cleanup
cleanupDuplicates();
