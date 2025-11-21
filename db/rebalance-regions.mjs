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

async function rebalance() {
  console.log('Rebalancing regions, mobs, and bosses...\n');
  
  // Update mob levels to better fit regions
  console.log('Updating mob levels...');
  
  // Region 1 (1-4): Giant Rat=1, Wild Boar=3
  await db.execute('UPDATE mobs SET level = 1 WHERE name = "Giant Rat"');
  await db.execute('UPDATE mobs SET level = 3 WHERE name = "Wild Boar"');
  
  // Region 2 (3-7): Goblin=3, Wolf=5, Forest Spider=6
  await db.execute('UPDATE mobs SET level = 3 WHERE name = "Goblin"');
  await db.execute('UPDATE mobs SET level = 5 WHERE name = "Wolf"');
  await db.execute('UPDATE mobs SET level = 6 WHERE name = "Forest Spider"');
  
  // Region 3 (5-11): Orc levels - we need more variety, update existing
  await db.execute('UPDATE mobs SET level = 8 WHERE name = "Orc"');
  
  // Region 4 (8-15): Skeleton=10, Cave Troll=13
  await db.execute('UPDATE mobs SET level = 10 WHERE name = "Skeleton"');
  await db.execute('UPDATE mobs SET level = 13 WHERE name = "Cave Troll"');
  
  console.log('✓ Mob levels updated');
  
  // Update boss levels (should be ~2 levels above region max)
  console.log('\nUpdating boss levels...');
  
  // Gnarlroot: Region 1 max is 4, boss should be 5-6
  await db.execute('UPDATE named_mobs SET level = 5 WHERE name = "Gnarlroot"');
  
  // Shadowfang: Region 2 max is 7, boss should be 8-9
  await db.execute('UPDATE named_mobs SET level = 8 WHERE name = "Shadowfang"');
  
  // Gorak: Region 3 max is 11, boss should be 12-13
  await db.execute('UPDATE named_mobs SET level = 12 WHERE name = "Gorak Stonefist"');
  
  // Vexmora: Region 4 max is 15, boss should be 16-17
  await db.execute('UPDATE named_mobs SET level = 16 WHERE name = "Vexmora"');
  
  console.log('✓ Boss levels updated');
  
  // Update boss stats to match new levels
  console.log('\nUpdating boss stats...');
  
  // Gnarlroot (Level 5)
  await db.execute(`
    UPDATE named_mobs 
    SET max_health = 300, damage_min = 10, damage_max = 18, defense = 4, experience_reward = 200
    WHERE name = "Gnarlroot"
  `);
  
  // Shadowfang (Level 8)
  await db.execute(`
    UPDATE named_mobs 
    SET max_health = 450, damage_min = 15, damage_max = 25, defense = 6, experience_reward = 350
    WHERE name = "Shadowfang"
  `);
  
  // Gorak Stonefist (Level 12)
  await db.execute(`
    UPDATE named_mobs 
    SET max_health = 700, damage_min = 22, damage_max = 35, defense = 10, experience_reward = 600
    WHERE name = "Gorak Stonefist"
  `);
  
  // Vexmora (Level 16)
  await db.execute(`
    UPDATE named_mobs 
    SET max_health = 1000, damage_min = 30, damage_max = 50, defense = 12, experience_reward = 900
    WHERE name = "Vexmora"
  `);
  
  console.log('✓ Boss stats updated');
  
  console.log('\n✅ Rebalancing complete!');
}

rebalance().catch(console.error);
