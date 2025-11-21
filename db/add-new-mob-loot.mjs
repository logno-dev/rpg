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

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function addMobLoot() {
  console.log('Adding loot tables for new mobs...\n');
  
  // Get mob IDs
  const getMobId = async (name) => {
    const result = await client.execute({
      sql: 'SELECT id FROM mobs WHERE name = ?',
      args: [name]
    });
    return result.rows[0]?.id;
  };
  
  // Get common item IDs (from seed data)
  const items = {
    rustySword: 1,
    ironSword: 2,
    steelSword: 3,
    clothArmor: 6,
    leatherArmor: 7,
    chainmail: 8,
    leatherHelmet: 9,
    ironHelmet: 10,
    leatherBoots: 11,
    leatherGloves: 12,
    healthPotion: 13,
    manaPotion: 14,
    bread: 15,
  };
  
  // Loot configuration: [mobName, itemId, dropChance, minQty, maxQty]
  const lootTables = [
    // Zombie (Lvl 8) - basic dungeon drops
    ['Zombie', items.ironSword, 0.12, 1, 1],
    ['Zombie', items.leatherArmor, 0.10, 1, 1],
    ['Zombie', items.healthPotion, 0.25, 1, 1],
    ['Zombie', items.bread, 0.15, 1, 2],
    
    // Ghoul (Lvl 9) - slightly better
    ['Ghoul', items.ironSword, 0.15, 1, 1],
    ['Ghoul', items.leatherHelmet, 0.12, 1, 1],
    ['Ghoul', items.healthPotion, 0.30, 1, 2],
    ['Ghoul', items.manaPotion, 0.15, 1, 1],
    
    // Wraith (Lvl 11) - magic-focused
    ['Wraith', items.manaPotion, 0.35, 1, 2],
    ['Wraith', items.healthPotion, 0.25, 1, 1],
    ['Wraith', items.leatherGloves, 0.15, 1, 1],
    
    // Dark Cultist (Lvl 12) - better loot
    ['Dark Cultist', items.steelSword, 0.15, 1, 1],
    ['Dark Cultist', items.chainmail, 0.10, 1, 1],
    ['Dark Cultist', items.manaPotion, 0.30, 1, 2],
    ['Dark Cultist', items.healthPotion, 0.30, 1, 2],
    
    // Gargoyle (Lvl 14) - rare, tanky drops
    ['Gargoyle', items.steelSword, 0.20, 1, 1],
    ['Gargoyle', items.chainmail, 0.15, 1, 1],
    ['Gargoyle', items.ironHelmet, 0.18, 1, 1],
    ['Gargoyle', items.healthPotion, 0.40, 2, 3],
    
    // Shadow Fiend (Lvl 15) - best dungeon mob loot
    ['Shadow Fiend', items.steelSword, 0.25, 1, 1],
    ['Shadow Fiend', items.chainmail, 0.20, 1, 1],
    ['Shadow Fiend', items.manaPotion, 0.40, 2, 3],
    ['Shadow Fiend', items.healthPotion, 0.40, 2, 3],
    
    // Mountain Lion (Lvl 6) - nature drops
    ['Mountain Lion', items.leatherArmor, 0.18, 1, 1],
    ['Mountain Lion', items.leatherBoots, 0.15, 1, 1],
    ['Mountain Lion', items.healthPotion, 0.20, 1, 1],
    ['Mountain Lion', items.bread, 0.25, 1, 2],
    
    // Hill Giant (Lvl 7) - strong drops
    ['Hill Giant', items.ironSword, 0.20, 1, 1],
    ['Hill Giant', items.leatherArmor, 0.15, 1, 1],
    ['Hill Giant', items.healthPotion, 0.30, 1, 2],
    ['Hill Giant', items.bread, 0.30, 2, 4],
    
    // Orc Warrior (Lvl 9) - similar to Orc but slightly better
    ['Orc Warrior', items.steelSword, 0.15, 1, 1],
    ['Orc Warrior', items.chainmail, 0.10, 1, 1],
    ['Orc Warrior', items.healthPotion, 0.28, 1, 2],
    ['Orc Warrior', items.manaPotion, 0.20, 1, 1],
    
    // Stone Elemental (Lvl 10) - rare, mineral drops
    ['Stone Elemental', items.ironHelmet, 0.25, 1, 1],
    ['Stone Elemental', items.chainmail, 0.15, 1, 1],
    ['Stone Elemental', items.healthPotion, 0.35, 1, 2],
    
    // Wyvern (Lvl 11) - flying beast drops
    ['Wyvern', items.steelSword, 0.18, 1, 1],
    ['Wyvern', items.leatherGloves, 0.20, 1, 1],
    ['Wyvern', items.healthPotion, 0.30, 1, 2],
    ['Wyvern', items.manaPotion, 0.25, 1, 2],
    
    // Dire Wolf (Lvl 4) - similar to Wolf
    ['Dire Wolf', items.leatherArmor, 0.18, 1, 1],
    ['Dire Wolf', items.leatherBoots, 0.20, 1, 1],
    ['Dire Wolf', items.healthPotion, 0.18, 1, 1],
    
    // Forest Troll (Lvl 7) - forest giant
    ['Forest Troll', items.ironSword, 0.18, 1, 1],
    ['Forest Troll', items.leatherArmor, 0.15, 1, 1],
    ['Forest Troll', items.healthPotion, 0.30, 1, 2],
    ['Forest Troll', items.bread, 0.35, 2, 4],
    
    // Rabid Dog (Lvl 2) - low level aggressive
    ['Rabid Dog', items.rustySword, 0.08, 1, 1],
    ['Rabid Dog', items.healthPotion, 0.15, 1, 1],
    ['Rabid Dog', items.bread, 0.20, 1, 1],
  ];
  
  let addedCount = 0;
  
  for (const [mobName, itemId, dropChance, minQty, maxQty] of lootTables) {
    const mobId = await getMobId(mobName);
    
    if (!mobId) {
      console.log(`⚠️  Mob not found: ${mobName}`);
      continue;
    }
    
    // Check if loot already exists
    const existing = await client.execute({
      sql: 'SELECT * FROM mob_loot WHERE mob_id = ? AND item_id = ?',
      args: [mobId, itemId]
    });
    
    if (existing.rows.length > 0) {
      console.log(`⏭️  Skipping ${mobName} -> Item ${itemId} (already exists)`);
      continue;
    }
    
    await client.execute({
      sql: 'INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max) VALUES (?, ?, ?, ?, ?)',
      args: [mobId, itemId, dropChance, minQty, maxQty]
    });
    
    console.log(`✅ Added loot for ${mobName}: Item ${itemId} (${(dropChance * 100).toFixed(0)}% chance, ${minQty}-${maxQty} qty)`);
    addedCount++;
  }
  
  console.log(`\n✨ Added ${addedCount} loot table entries!`);
}

addMobLoot().then(() => {
  console.log('Done!');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
