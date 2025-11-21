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

console.log('🔥 Adding mob spawn mappings for Region 5 (Scorched Badlands)...\n');

// Region 5 mob spawns with weights
// Lower level mobs are more common, higher level mobs are rarer
const mobSpawns = [
  { mobId: 157, mobName: 'Lesser Imp', weight: 4 },      // Level 13 - very common
  { mobId: 158, mobName: 'Ash Wraith', weight: 3 },      // Level 14 - common
  { mobId: 159, mobName: 'Fire Elemental', weight: 3 },  // Level 15 - common
  { mobId: 160, mobName: 'Hellhound', weight: 2 },       // Level 16 - uncommon
  { mobId: 161, mobName: 'Flame Demon', weight: 2 },     // Level 17 - uncommon
  { mobId: 162, mobName: 'Ifrit', weight: 1 },           // Level 18 - rare
];

for (const spawn of mobSpawns) {
  await db.execute({
    sql: 'INSERT INTO region_mobs (region_id, mob_id, spawn_weight) VALUES (5, ?, ?)',
    args: [spawn.mobId, spawn.weight]
  });
  console.log(`  ✓ Added ${spawn.mobName} (weight: ${spawn.weight})`);
}

console.log('\n✅ Region 5 mob spawns configured!');
console.log('You can now roam in Scorched Badlands.');
