import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnv() {
  try {
    const envPath = join(__dirname, '..', '.env');
    const envFile = readFileSync(envPath, 'utf-8');
    envFile.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').trim();
        process.env[key.trim()] = value;
      }
    });
  } catch (error) {
    console.error('Could not load .env file:', error.message);
  }
}

loadEnv();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function populateLootTables() {
  console.log('💰 POPULATING MOB LOOT TABLES...\n');
  
  // Clear existing mob_loot entries
  await db.execute('DELETE FROM mob_loot');
  console.log('Cleared existing mob loot tables\n');
  
  // Get all mobs grouped by level
  const mobs = await db.execute('SELECT id, name, level, region_id FROM mobs ORDER BY level');
  
  // Get all equipment grouped by level and type
  const equipment = await db.execute(`
    SELECT id, name, type, slot, rarity, required_level 
    FROM items 
    WHERE type IN ('weapon', 'armor') 
    AND rarity IN ('common', 'uncommon', 'rare', 'epic')
    ORDER BY required_level, type
  `);
  
  // Get consumables
  const consumables = await db.execute(`
    SELECT id, name, rarity
    FROM items 
    WHERE type = 'consumable' 
    AND name IN ('Health Potion', 'Mana Potion', 'Bread')
  `);
  
  const healthPotionId = consumables.rows.find(r => r.name === 'Health Potion')?.id;
  const manaPotionId = consumables.rows.find(r => r.name === 'Mana Potion')?.id;
  const breadId = consumables.rows.find(r => r.name === 'Bread')?.id;
  
  let totalDrops = 0;
  
  for (const mob of mobs.rows) {
    const mobLevel = mob.level;
    
    // Always add consumables (high drop rate for lower level, lower for higher)
    const potionDropRate = Math.max(0.15, 0.4 - (mobLevel * 0.005));
    await db.execute({
      sql: 'INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max) VALUES (?, ?, ?, ?, ?)',
      args: [mob.id, healthPotionId, potionDropRate, 1, Math.min(3, Math.floor(mobLevel / 10) + 1)]
    });
    totalDrops++;
    
    await db.execute({
      sql: 'INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max) VALUES (?, ?, ?, ?, ?)',
      args: [mob.id, manaPotionId, potionDropRate * 0.7, 1, Math.min(2, Math.floor(mobLevel / 15) + 1)]
    });
    totalDrops++;
    
    // Lower level mobs drop bread more often
    if (mobLevel <= 15) {
      await db.execute({
        sql: 'INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max) VALUES (?, ?, ?, ?, ?)',
        args: [mob.id, breadId, 0.25, 1, 3]
      });
      totalDrops++;
    }
    
    // Find equipment appropriate for this mob's level
    // Equipment can drop from mobs 3-5 levels below the requirement
    const minEquipLevel = Math.max(1, mobLevel - 2);
    const maxEquipLevel = mobLevel + 3;
    
    const appropriateEquip = equipment.rows.filter(item => 
      item.required_level >= minEquipLevel && item.required_level <= maxEquipLevel
    );
    
    // Add 2-4 equipment drops per mob with appropriate drop rates
    const numDrops = Math.min(appropriateEquip.length, Math.floor(Math.random() * 3) + 2);
    const selectedEquip = appropriateEquip
      .sort(() => Math.random() - 0.5)
      .slice(0, numDrops);
    
    for (const item of selectedEquip) {
      // Drop rate based on rarity
      let dropRate;
      switch (item.rarity) {
        case 'common': dropRate = 0.12; break;
        case 'uncommon': dropRate = 0.08; break;
        case 'rare': dropRate = 0.04; break;
        case 'epic': dropRate = 0.02; break;
        default: dropRate = 0.05;
      }
      
      // Reduce drop rate for equipment above mob level
      if (item.required_level > mobLevel) {
        dropRate *= 0.6;
      }
      
      await db.execute({
        sql: 'INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max) VALUES (?, ?, ?, ?, ?)',
        args: [mob.id, item.id, dropRate, 1, 1]
      });
      totalDrops++;
    }
  }
  
  console.log(`✅ Loot tables populated!`);
  console.log(`   Mobs with loot: ${mobs.rows.length}`);
  console.log(`   Total drop entries: ${totalDrops}`);
  console.log(`   Average drops per mob: ${(totalDrops / mobs.rows.length).toFixed(1)}`);
}

populateLootTables().catch(console.error);
