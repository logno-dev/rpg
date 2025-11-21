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

console.log('🔥 Adding encounters for Inferno Citadel (Dungeon ID 11)...\n');

// Inferno Citadel encounters - progressively harder fire mobs leading to Brimstone
const encounters = [
  { order: 1, mobId: 157, isBoss: 0 }, // Lesser Imp
  { order: 2, mobId: 159, isBoss: 0 }, // Fire Elemental
  { order: 3, mobId: 160, isBoss: 0 }, // Hellhound
  { order: 4, mobId: 161, isBoss: 0 }, // Flame Demon
  { order: 5, mobId: 162, isBoss: 0 }, // Ifrit
  { order: 6, mobId: null, isBoss: 1 }, // BOSS: Brimstone
];

for (const encounter of encounters) {
  await db.execute({
    sql: `INSERT INTO dungeon_encounters (dungeon_id, encounter_order, mob_id, is_boss)
          VALUES (11, ?, ?, ?)`,
    args: [encounter.order, encounter.mobId, encounter.isBoss]
  });
  
  if (encounter.isBoss) {
    console.log(`  ✓ Encounter ${encounter.order}: BOSS - Brimstone`);
  } else {
    const mobResult = await db.execute({
      sql: 'SELECT name FROM mobs WHERE id = ?',
      args: [encounter.mobId]
    });
    const mobName = mobResult.rows[0]?.name || 'Unknown';
    console.log(`  ✓ Encounter ${encounter.order}: ${mobName}`);
  }
}

console.log('\n✅ Inferno Citadel encounters added successfully!');
console.log('The dungeon now has 6 encounters leading to Brimstone.');
