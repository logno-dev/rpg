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

// New mobs to add diversity across regions
const newMobs = [
  // Shadowdeep Dungeon (8-15) - currently only has Skeleton (10) and Cave Troll (13)
  { name: 'Zombie', level: 8, area: 'dungeon', max_health: 100, damage_min: 10, damage_max: 18, defense: 2, attack_speed: 0.7, experience_reward: 80, gold_min: 10, gold_max: 25, aggressive: 1 },
  { name: 'Ghoul', level: 9, area: 'dungeon', max_health: 110, damage_min: 11, damage_max: 20, defense: 2, attack_speed: 1.2, experience_reward: 90, gold_min: 12, gold_max: 28, aggressive: 1 },
  { name: 'Wraith', level: 11, area: 'dungeon', max_health: 130, damage_min: 14, damage_max: 24, defense: 1, attack_speed: 1.4, experience_reward: 115, gold_min: 18, gold_max: 40, aggressive: 1 },
  { name: 'Dark Cultist', level: 12, area: 'dungeon', max_health: 140, damage_min: 15, damage_max: 26, defense: 3, attack_speed: 1.0, experience_reward: 125, gold_min: 20, gold_max: 45, aggressive: 1 },
  { name: 'Gargoyle', level: 14, area: 'dungeon', max_health: 180, damage_min: 18, damage_max: 32, defense: 6, attack_speed: 0.9, experience_reward: 150, gold_min: 28, gold_max: 60, aggressive: 0 },
  { name: 'Shadow Fiend', level: 15, area: 'dungeon', max_health: 200, damage_min: 20, damage_max: 35, defense: 4, attack_speed: 1.3, experience_reward: 165, gold_min: 32, gold_max: 70, aggressive: 1 },
  
  // Add more variety to Ironpeak Mountains (5-11) - currently only has Orc (8)
  { name: 'Mountain Lion', level: 6, area: 'mountains', max_health: 85, damage_min: 9, damage_max: 16, defense: 2, attack_speed: 1.5, experience_reward: 65, gold_min: 8, gold_max: 20, aggressive: 1 },
  { name: 'Hill Giant', level: 7, area: 'mountains', max_health: 150, damage_min: 12, damage_max: 22, defense: 4, attack_speed: 0.6, experience_reward: 85, gold_min: 15, gold_max: 35, aggressive: 0 },
  { name: 'Orc Warrior', level: 9, area: 'mountains', max_health: 140, damage_min: 13, damage_max: 23, defense: 5, attack_speed: 0.9, experience_reward: 95, gold_min: 16, gold_max: 38, aggressive: 1 },
  { name: 'Stone Elemental', level: 10, area: 'mountains', max_health: 200, damage_min: 16, damage_max: 28, defense: 8, attack_speed: 0.5, experience_reward: 110, gold_min: 20, gold_max: 50, aggressive: 0 },
  { name: 'Wyvern', level: 11, area: 'mountains', max_health: 160, damage_min: 17, damage_max: 30, defense: 3, attack_speed: 1.1, experience_reward: 130, gold_min: 25, gold_max: 55, aggressive: 1 },
  
  // Darkwood Forest (3-7) - add variety
  { name: 'Dire Wolf', level: 4, area: 'forest', max_health: 70, damage_min: 8, damage_max: 14, defense: 2, attack_speed: 1.4, experience_reward: 45, gold_min: 6, gold_max: 16, aggressive: 1 },
  { name: 'Forest Troll', level: 7, area: 'forest', max_health: 130, damage_min: 11, damage_max: 20, defense: 4, attack_speed: 0.8, experience_reward: 75, gold_min: 12, gold_max: 30, aggressive: 0 },
  
  // Greenfield Plains (1-4) - add variety
  { name: 'Rabid Dog', level: 2, area: 'plains', max_health: 45, damage_min: 4, damage_max: 9, defense: 1, attack_speed: 1.3, experience_reward: 22, gold_min: 3, gold_max: 8, aggressive: 1 },
  { name: 'Bandit', level: 4, area: 'plains', max_health: 65, damage_min: 7, damage_max: 13, defense: 2, attack_speed: 1.1, experience_reward: 48, gold_min: 8, gold_max: 20, aggressive: 1 },
];

async function addMobDiversity() {
  console.log('Adding mob diversity...\n');
  
  // Get existing mobs to avoid duplicates
  const existingMobs = await client.execute('SELECT name FROM mobs');
  const existingNames = new Set(existingMobs.rows.map(row => row.name));
  
  let addedCount = 0;
  
  for (const mob of newMobs) {
    if (existingNames.has(mob.name)) {
      console.log(`⏭️  Skipping ${mob.name} (already exists)`);
      continue;
    }
    
    // Insert mob
    const result = await client.execute({
      sql: `INSERT INTO mobs (name, level, area, max_health, damage_min, damage_max, defense, attack_speed, experience_reward, gold_min, gold_max, aggressive)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [mob.name, mob.level, mob.area, mob.max_health, mob.damage_min, mob.damage_max, mob.defense, mob.attack_speed, mob.experience_reward, mob.gold_min, mob.gold_max, mob.aggressive]
    });
    
    const mobId = result.lastInsertRowid;
    
    // Link to appropriate region based on area and level
    let regionId;
    if (mob.area === 'plains' && mob.level <= 4) regionId = 1; // Greenfield Plains
    else if (mob.area === 'forest' && mob.level <= 7) regionId = 2; // Darkwood Forest
    else if (mob.area === 'mountains' && mob.level <= 11) regionId = 3; // Ironpeak Mountains
    else if (mob.area === 'dungeon' && mob.level <= 15) regionId = 4; // Shadowdeep Dungeon
    
    if (regionId) {
      // Assign spawn weight based on level (higher level = slightly lower weight)
      const spawnWeight = Math.max(3, 10 - Math.floor(mob.level / 3));
      
      await client.execute({
        sql: 'INSERT INTO region_mobs (region_id, mob_id, spawn_weight) VALUES (?, ?, ?)',
        args: [regionId, mobId, spawnWeight]
      });
      
      console.log(`✅ Added ${mob.name} (Lvl ${mob.level}) to region ${regionId} with weight ${spawnWeight}`);
      addedCount++;
    }
  }
  
  console.log(`\n✨ Added ${addedCount} new mobs!`);
  
  // Show updated region mob counts
  console.log('\n=== Updated Region Mob Counts ===');
  const regions = await client.execute(`
    SELECT r.id, r.name, r.min_level, r.max_level, COUNT(DISTINCT rm.mob_id) as mob_count
    FROM regions r
    LEFT JOIN region_mobs rm ON r.id = rm.region_id
    WHERE r.id <= 4
    GROUP BY r.id
    ORDER BY r.id
  `);
  
  for (const region of regions.rows) {
    console.log(`${region.name} (Lvl ${region.min_level}-${region.max_level}): ${region.mob_count} mobs`);
    
    // Show mob details
    const mobs = await client.execute({
      sql: `SELECT m.name, m.level, rm.spawn_weight
            FROM mobs m
            JOIN region_mobs rm ON m.id = rm.mob_id
            WHERE rm.region_id = ?
            ORDER BY m.level`,
      args: [region.id]
    });
    
    for (const mob of mobs.rows) {
      console.log(`  - ${mob.name} (Lvl ${mob.level}, Weight: ${mob.spawn_weight})`);
    }
    console.log();
  }
}

addMobDiversity().then(() => {
  console.log('Done!');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
