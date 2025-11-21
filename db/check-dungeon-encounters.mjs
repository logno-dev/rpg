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

console.log('Checking encounters for Inferno Citadel (Dungeon ID 11):\n');

const encounters = await db.execute({
  sql: `SELECT 
          de.id,
          de.encounter_order,
          de.mob_id,
          de.is_boss,
          m.name as mob_name,
          m.level as mob_level
        FROM dungeon_encounters de
        LEFT JOIN mobs m ON de.mob_id = m.id
        WHERE de.dungeon_id = 11
        ORDER BY de.encounter_order`,
  args: []
});

if (encounters.rows.length === 0) {
  console.log('⚠️  No encounters found for this dungeon!');
  console.log('This dungeon needs encounters to be playable.\n');
} else {
  console.log(`Found ${encounters.rows.length} encounters:\n`);
  encounters.rows.forEach(enc => {
    const type = enc.is_boss ? 'BOSS' : 'MOB';
    const mobInfo = enc.mob_name ? `${enc.mob_name} (Level ${enc.mob_level})` : 'Boss encounter';
    console.log(`  ${enc.encounter_order}. [${type}] ${mobInfo}`);
  });
}
