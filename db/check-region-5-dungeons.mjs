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

console.log('Dungeons in Region 5 (Scorched Badlands):\n');
const dungeons = await db.execute({
  sql: `SELECT 
          dungeons.id,
          dungeons.name,
          dungeons.region_id,
          dungeons.boss_mob_id,
          named_mobs.name as boss_name,
          named_mobs.title as boss_title
        FROM dungeons
        JOIN named_mobs ON dungeons.boss_mob_id = named_mobs.id
        WHERE dungeons.region_id = 5
        ORDER BY dungeons.id`,
  args: []
});

dungeons.rows.forEach(dungeon => {
  console.log(`ID ${dungeon.id}: ${dungeon.name}`);
  console.log(`  Boss: ${dungeon.boss_name} ${dungeon.boss_title} (ID: ${dungeon.boss_mob_id})`);
  console.log('');
});

console.log('All dungeons named "Inferno Citadel":\n');
const infernoDungeons = await db.execute({
  sql: `SELECT 
          dungeons.id,
          dungeons.name,
          dungeons.region_id,
          regions.name as region_name,
          dungeons.boss_mob_id,
          named_mobs.name as boss_name
        FROM dungeons
        JOIN named_mobs ON dungeons.boss_mob_id = named_mobs.id
        JOIN regions ON dungeons.region_id = regions.id
        WHERE dungeons.name = 'Inferno Citadel'
        ORDER BY dungeons.id`,
  args: []
});

infernoDungeons.rows.forEach(dungeon => {
  console.log(`ID ${dungeon.id}: ${dungeon.name} in ${dungeon.region_name} (Region ${dungeon.region_id})`);
  console.log(`  Boss: ${dungeon.boss_name} (ID: ${dungeon.boss_mob_id})`);
  console.log('');
});
