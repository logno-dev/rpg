import { json } from '@solidjs/router';
import type { APIEvent } from '@solidjs/start/server';
import { db } from '~/lib/db';

export async function POST(event: APIEvent) {
  try {
    const body = await event.request.json();
    const { characterId, mobId, namedMobId, result, finalHealth, finalMana } = body;

    // Check if this is dungeon combat
    const activeDungeonResult = await db.execute({
      sql: 'SELECT * FROM character_dungeon_progress WHERE character_id = ? AND status = ?',
      args: [characterId, 'active'],
    });
    const isDungeonCombat = activeDungeonResult.rows.length > 0;

    if (result === 'victory') {
      let mob: any;
      let isNamedMob = false;
      
      // Check if this is a named mob or regular mob
      if (namedMobId) {
        const mobResult = await db.execute({
          sql: 'SELECT * FROM named_mobs WHERE id = ?',
          args: [namedMobId],
        });
        mob = mobResult.rows[0] as any;
        isNamedMob = true;
      } else {
        // Get regular mob rewards
        const mobResult = await db.execute({
          sql: 'SELECT * FROM mobs WHERE id = ?',
          args: [mobId],
        });
        mob = mobResult.rows[0] as any;
      }

      const goldGained = Math.floor(Math.random() * (mob.gold_max - mob.gold_min + 1)) + mob.gold_min;
      const expGained = mob.experience_reward;

      // Get character to check for level up
      const charResult = await db.execute({
        sql: 'SELECT * FROM characters WHERE id = ?',
        args: [characterId],
      });
      const character = charResult.rows[0] as any;

      const EXPERIENCE_PER_LEVEL = 125;
      const POINTS_PER_LEVEL = 3;

      const newExp = character.experience + expGained;
      const expNeeded = character.level * EXPERIENCE_PER_LEVEL;

      let levelUp = false;
      let newLevel = character.level;
      let pointsGained = 0;

      if (newExp >= expNeeded) {
        levelUp = true;
        newLevel = character.level + 1;
        pointsGained = POINTS_PER_LEVEL;
      }

      // Update character
      if (isDungeonCombat) {
        // For dungeon combat, update dungeon session HP/mana instead of character
        await db.execute({
          sql: `UPDATE character_dungeon_progress 
                SET session_health = ?, session_mana = ?, updated_at = unixepoch()
                WHERE character_id = ? AND status = ?`,
          args: [finalHealth, finalMana || 0, characterId, 'active'],
        });
        // Still update exp, gold, level for character
        await db.execute({
          sql: `UPDATE characters 
                SET experience = ?, 
                    gold = gold + ?, 
                    level = ?, 
                    available_points = available_points + ?
                WHERE id = ?`,
          args: [
            levelUp ? 0 : newExp,
            goldGained,
            newLevel,
            pointsGained,
            characterId
          ],
        });
      } else {
        // For normal combat, update character HP and stats
        await db.execute({
          sql: `UPDATE characters 
                SET current_health = ?, 
                    experience = ?, 
                    gold = gold + ?, 
                    level = ?, 
                    available_points = available_points + ?
                WHERE id = ?`,
          args: [
            finalHealth,
            levelUp ? 0 : newExp,
            goldGained,
            newLevel,
            pointsGained,
            characterId
          ],
        });
      }

      // Roll for loot - each item is rolled independently based on drop chance
      const loot: any[] = [];
      
      // Get loot table based on mob type
      let lootResult;
      if (isNamedMob) {
        lootResult = await db.execute({
          sql: 'SELECT * FROM named_mob_loot WHERE named_mob_id = ?',
          args: [namedMobId],
        });
      } else {
        lootResult = await db.execute({
          sql: 'SELECT * FROM mob_loot WHERE mob_id = ?',
          args: [mobId],
        });
      }
      
      // Roll each potential drop independently
      for (const lootRow of lootResult.rows as any[]) {
        if (Math.random() < lootRow.drop_chance) {
          const quantity = lootRow.min_quantity || lootRow.quantity_min || 1;

          // Get item details
          const itemResult = await db.execute({
            sql: 'SELECT * FROM items WHERE id = ?',
            args: [lootRow.item_id],
          });
          const item = itemResult.rows[0] as any;

          // Check if item exists in inventory
          const invResult = await db.execute({
            sql: 'SELECT * FROM character_inventory WHERE character_id = ? AND item_id = ?',
            args: [characterId, item.id],
          });

          if (invResult.rows.length > 0 && item.stackable) {
            // Update quantity
            await db.execute({
              sql: 'UPDATE character_inventory SET quantity = quantity + ? WHERE character_id = ? AND item_id = ?',
              args: [quantity, characterId, item.id],
            });
          } else {
            // Add new item
            await db.execute({
              sql: 'INSERT INTO character_inventory (character_id, item_id, quantity) VALUES (?, ?, ?)',
              args: [characterId, item.id, quantity],
            });
          }

          loot.push({ name: item.name, quantity, rarity: item.rarity });
        }
      }
      
      // Also check for region rare drops (if regular mob)
      if (!isNamedMob && mob.region_id) {
        const rareLootResult = await db.execute({
          sql: 'SELECT * FROM region_rare_loot WHERE region_id = ? AND min_level <= ?',
          args: [mob.region_id, mob.level],
        });
        
        for (const rareLoot of rareLootResult.rows as any[]) {
          if (Math.random() < rareLoot.drop_chance) {
            const itemResult = await db.execute({
              sql: 'SELECT * FROM items WHERE id = ?',
              args: [rareLoot.item_id],
            });
            const item = itemResult.rows[0] as any;
            
            // Add to inventory
            const invResult = await db.execute({
              sql: 'SELECT * FROM character_inventory WHERE character_id = ? AND item_id = ?',
              args: [characterId, item.id],
            });
            
            if (invResult.rows.length > 0 && item.stackable) {
              await db.execute({
                sql: 'UPDATE character_inventory SET quantity = quantity + 1 WHERE character_id = ? AND item_id = ?',
                args: [characterId, item.id],
              });
            } else {
              await db.execute({
                sql: 'INSERT INTO character_inventory (character_id, item_id, quantity) VALUES (?, ?, 1)',
                args: [characterId, item.id],
              });
            }
            
            loot.push({ name: item.name, quantity: 1, rarity: item.rarity });
          }
        }
      }

      // Get updated character data
      const updatedCharResult = await db.execute({
        sql: 'SELECT * FROM characters WHERE id = ?',
        args: [characterId],
      });
      const updatedCharacter = updatedCharResult.rows[0];

      // Get updated inventory
      const inventoryResult = await db.execute({
        sql: `SELECT 
              character_inventory.*, 
              items.*,
              abilities.required_level as ability_required_level,
              abilities.required_strength as ability_required_strength,
              abilities.required_dexterity as ability_required_dexterity,
              abilities.required_intelligence as ability_required_intelligence,
              abilities.required_wisdom as ability_required_wisdom,
              abilities.required_charisma as ability_required_charisma
              FROM character_inventory 
              JOIN items ON character_inventory.item_id = items.id 
              LEFT JOIN abilities ON items.teaches_ability_id = abilities.id
              WHERE character_inventory.character_id = ?
              ORDER BY items.type, items.name`,
        args: [characterId],
      });
      const updatedInventory = inventoryResult.rows.map((row: any) => ({
        ...row,
        required_level: row.ability_required_level || row.required_level,
        required_strength: row.ability_required_strength || row.required_strength,
        required_dexterity: row.ability_required_dexterity || row.required_dexterity,
        required_intelligence: row.ability_required_intelligence || row.required_intelligence,
        required_wisdom: row.ability_required_wisdom || row.required_wisdom,
        required_charisma: row.ability_required_charisma || row.required_charisma,
      }));

      return json({
        success: true,
        result: 'victory',
        expGained,
        goldGained,
        loot,
        levelUp,
        newLevel: levelUp ? newLevel : undefined,
        character: updatedCharacter,
        inventory: updatedInventory,
      });
    } else {
      // Defeat - death penalty
      const charResult = await db.execute({
        sql: 'SELECT * FROM characters WHERE id = ?',
        args: [characterId],
      });
      const character = charResult.rows[0] as any;

      // Death penalties
      const expPenalty = Math.floor(character.experience * 0.25); // Lose 25% of current exp
      const goldPenalty = Math.floor(character.gold * 0.10); // Lose 10% of gold
      
      // Experience can go negative (player must regain to baseline)
      // But gold is capped at 0
      const newExperience = character.experience - expPenalty;
      const newGold = Math.max(0, character.gold - goldPenalty);
      const actualGoldLost = character.gold - newGold;
      
      // Set health to 1 (will need to fully recover)
      await db.execute({
        sql: 'UPDATE characters SET current_health = 1, experience = ?, gold = ? WHERE id = ?',
        args: [newExperience, newGold, characterId],
      });

      // Get updated character data
      const updatedCharResult = await db.execute({
        sql: 'SELECT * FROM characters WHERE id = ?',
        args: [characterId],
      });
      const updatedCharacter = updatedCharResult.rows[0];

      // Get updated inventory
      const inventoryResult = await db.execute({
        sql: `SELECT 
              character_inventory.*, 
              items.*,
              abilities.required_level as ability_required_level,
              abilities.required_strength as ability_required_strength,
              abilities.required_dexterity as ability_required_dexterity,
              abilities.required_intelligence as ability_required_intelligence,
              abilities.required_wisdom as ability_required_wisdom,
              abilities.required_charisma as ability_required_charisma
              FROM character_inventory 
              JOIN items ON character_inventory.item_id = items.id 
              LEFT JOIN abilities ON items.teaches_ability_id = abilities.id
              WHERE character_inventory.character_id = ?
              ORDER BY items.type, items.name`,
        args: [characterId],
      });
      const updatedInventory = inventoryResult.rows.map((row: any) => ({
        ...row,
        required_level: row.ability_required_level || row.required_level,
        required_strength: row.ability_required_strength || row.required_strength,
        required_dexterity: row.ability_required_dexterity || row.required_dexterity,
        required_intelligence: row.ability_required_intelligence || row.required_intelligence,
        required_wisdom: row.ability_required_wisdom || row.required_wisdom,
        required_charisma: row.ability_required_charisma || row.required_charisma,
      }));

      return json({
        success: true,
        result: 'defeat',
        character: updatedCharacter,
        inventory: updatedInventory,
        expLost: expPenalty,
        goldLost: actualGoldLost,
      });
    }
  } catch (error: any) {
    console.error('Finish combat error:', error);
    return json({ error: error.message }, { status: 400 });
  }
}
