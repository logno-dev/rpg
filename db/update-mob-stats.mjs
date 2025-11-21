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

async function updateMobStats() {
  console.log('Updating mob stats to match their levels...\n');
  
  // Formula for scaling:
  // HP = 50 + (level * 30)
  // Damage = level * 3 to level * 5
  // Defense = Math.floor(level / 2)
  // XP = level * 15
  // Gold = level * 2 to level * 5
  
  // Giant Rat (Level 1)
  await db.execute(`
    UPDATE mobs SET 
      max_health = 80,
      damage_min = 3,
      damage_max = 5,
      defense = 0,
      experience_reward = 15,
      gold_min = 2,
      gold_max = 5
    WHERE name = "Giant Rat"
  `);
  console.log('✓ Giant Rat (Lvl 1): 80 HP, 3-5 dmg');
  
  // Wild Boar (Level 3)
  await db.execute(`
    UPDATE mobs SET 
      max_health = 140,
      damage_min = 9,
      damage_max = 15,
      defense = 1,
      experience_reward = 45,
      gold_min = 6,
      gold_max = 15
    WHERE name = "Wild Boar"
  `);
  console.log('✓ Wild Boar (Lvl 3): 140 HP, 9-15 dmg');
  
  // Goblin (Level 3)
  await db.execute(`
    UPDATE mobs SET 
      max_health = 140,
      damage_min = 9,
      damage_max = 15,
      defense = 1,
      experience_reward = 45,
      gold_min = 6,
      gold_max = 15
    WHERE name = "Goblin"
  `);
  console.log('✓ Goblin (Lvl 3): 140 HP, 9-15 dmg');
  
  // Wolf (Level 5)
  await db.execute(`
    UPDATE mobs SET 
      max_health = 200,
      damage_min = 15,
      damage_max = 25,
      defense = 2,
      experience_reward = 75,
      gold_min = 10,
      gold_max = 25
    WHERE name = "Wolf"
  `);
  console.log('✓ Wolf (Lvl 5): 200 HP, 15-25 dmg');
  
  // Forest Spider (Level 6)
  await db.execute(`
    UPDATE mobs SET 
      max_health = 230,
      damage_min = 18,
      damage_max = 30,
      defense = 3,
      experience_reward = 90,
      gold_min = 12,
      gold_max = 30
    WHERE name = "Forest Spider"
  `);
  console.log('✓ Forest Spider (Lvl 6): 230 HP, 18-30 dmg');
  
  // Orc (Level 8)
  await db.execute(`
    UPDATE mobs SET 
      max_health = 290,
      damage_min = 24,
      damage_max = 40,
      defense = 4,
      experience_reward = 120,
      gold_min = 16,
      gold_max = 40
    WHERE name = "Orc"
  `);
  console.log('✓ Orc (Lvl 8): 290 HP, 24-40 dmg');
  
  // Skeleton (Level 10)
  await db.execute(`
    UPDATE mobs SET 
      max_health = 350,
      damage_min = 30,
      damage_max = 50,
      defense = 5,
      experience_reward = 150,
      gold_min = 20,
      gold_max = 50
    WHERE name = "Skeleton"
  `);
  console.log('✓ Skeleton (Lvl 10): 350 HP, 30-50 dmg');
  
  // Cave Troll (Level 13)
  await db.execute(`
    UPDATE mobs SET 
      max_health = 440,
      damage_min = 39,
      damage_max = 65,
      defense = 6,
      experience_reward = 195,
      gold_min = 26,
      gold_max = 65
    WHERE name = "Cave Troll"
  `);
  console.log('✓ Cave Troll (Lvl 13): 440 HP, 39-65 dmg');
  
  console.log('\n✅ All mob stats updated!');
}

updateMobStats().catch(console.error);
