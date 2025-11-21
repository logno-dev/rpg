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

console.log('Mobs in Region 5 (Scorched Badlands):\n');

const mobs = await db.execute({
  sql: `SELECT id, name, level, max_health, damage_min, damage_max 
        FROM mobs 
        WHERE region_id = 5 
        ORDER BY level`,
  args: []
});

if (mobs.rows.length === 0) {
  console.log('⚠️  No mobs found in Region 5!');
} else {
  mobs.rows.forEach(mob => {
    console.log(`  ID ${mob.id}: ${mob.name} (Level ${mob.level}) - ${mob.max_health} HP, ${mob.damage_min}-${mob.damage_max} dmg`);
  });
}
