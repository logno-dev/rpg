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

console.log('Checking which dungeons have encounters:\n');

const dungeons = await db.execute({
  sql: `SELECT 
          d.id,
          d.name,
          d.region_id,
          r.name as region_name,
          COUNT(de.id) as encounter_count
        FROM dungeons d
        JOIN regions r ON d.region_id = r.id
        LEFT JOIN dungeon_encounters de ON d.id = de.dungeon_id
        GROUP BY d.id
        ORDER BY d.region_id, d.id`,
  args: []
});

const withEncounters = dungeons.rows.filter(d => d.encounter_count > 0);
const withoutEncounters = dungeons.rows.filter(d => d.encounter_count === 0);

console.log(`✓ Dungeons WITH encounters (${withEncounters.length}):\n`);
withEncounters.forEach(d => {
  console.log(`  ${d.id}. ${d.name} (Region ${d.region_id}: ${d.region_name}) - ${d.encounter_count} encounters`);
});

console.log(`\n⚠️  Dungeons WITHOUT encounters (${withoutEncounters.length}):\n`);
withoutEncounters.forEach(d => {
  console.log(`  ${d.id}. ${d.name} (Region ${d.region_id}: ${d.region_name})`);
});

// Show example of a dungeon with encounters
if (withEncounters.length > 0) {
  const exampleId = withEncounters[0].id;
  console.log(`\nExample encounters from "${withEncounters[0].name}" (ID ${exampleId}):\n`);
  const exampleEncounters = await db.execute({
    sql: `SELECT encounter_order, mob_id, is_boss FROM dungeon_encounters WHERE dungeon_id = ? ORDER BY encounter_order LIMIT 5`,
    args: [exampleId]
  });
  exampleEncounters.rows.forEach(e => {
    console.log(`  ${e.encounter_order}. ${e.is_boss ? 'BOSS' : `Mob ID ${e.mob_id}`}`);
  });
}
