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

console.log('Checking region_mobs table for Region 5:\n');

const regionMobs = await db.execute({
  sql: `SELECT rm.*, m.name 
        FROM region_mobs rm 
        JOIN mobs m ON rm.mob_id = m.id
        WHERE rm.region_id = 5`,
  args: []
});

if (regionMobs.rows.length === 0) {
  console.log('❌ No mob spawn mappings found for Region 5!');
  console.log('This is why roaming fails.\n');
  
  console.log('Available mobs in Region 5:');
  const mobs = await db.execute({
    sql: 'SELECT id, name, level FROM mobs WHERE region_id = 5 ORDER BY level',
    args: []
  });
  
  mobs.rows.forEach(mob => {
    console.log(`  ID ${mob.id}: ${mob.name} (Level ${mob.level})`);
  });
} else {
  console.log('✓ Mob spawn mappings found:');
  regionMobs.rows.forEach(rm => {
    console.log(`  Mob ${rm.mob_id}: ${rm.name} (weight: ${rm.spawn_weight})`);
  });
}
