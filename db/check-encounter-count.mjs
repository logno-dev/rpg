import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';

const envFile = readFileSync('.env', 'utf-8');
let url, token;
envFile.split('\n').forEach(line => {
  if (line.startsWith('TURSO_DATABASE_URL=')) url = line.split('=')[1].trim();
  if (line.startsWith('TURSO_AUTH_TOKEN=')) token = line.split('=')[1].trim();
});

const db = createClient({ url, authToken: token });

console.log('Checking dungeon encounter counts...\n');

const dungeons = await db.execute('SELECT * FROM dungeons ORDER BY id');
console.log('Total dungeons:', dungeons.rows.length, '\n');

for (const dungeon of dungeons.rows) {
  const encounters = await db.execute({
    sql: 'SELECT * FROM dungeon_encounters WHERE dungeon_id = ? ORDER BY encounter_order',
    args: [dungeon.id]
  });
  
  console.log(`Dungeon #${dungeon.id}: ${dungeon.name}`);
  console.log(`  Region: ${dungeon.region_id}, Required Level: ${dungeon.required_level}`);
  console.log(`  Total encounters: ${encounters.rows.length}`);
  console.log(`  Encounter orders: ${encounters.rows.map(e => e.encounter_order).join(', ')}`);
  console.log('');
}
