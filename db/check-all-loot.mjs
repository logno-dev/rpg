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

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function checkAllLoot() {
  console.log('📦 Checking ALL loot table entries...\n');
  
  const result = await client.execute(`
    SELECT 
      ml.mob_id,
      m.name as mob_name,
      ml.item_id,
      i.name as item_name,
      ml.drop_chance,
      i.teaches_ability_id
    FROM mob_loot ml
    JOIN mobs m ON ml.mob_id = m.id
    JOIN items i ON ml.item_id = i.id
    ORDER BY ml.mob_id, ml.item_id
  `);
  
  console.log('All Loot Table Entries:');
  console.log('═════════════════════════════════════════════════════════════');
  for (const row of result.rows) {
    const dropPercent = (row.drop_chance * 100).toFixed(0);
    const isScroll = row.teaches_ability_id ? '📜' : '  ';
    console.log(`${isScroll} Mob ${row.mob_id} (${row.mob_name.padEnd(15)}) → Item ${String(row.item_id).padStart(2)} (${row.item_name.padEnd(25)}) ${dropPercent.padStart(3)}%`);
  }
  console.log('\n✅ Total loot entries:', result.rows.length);
  console.log('📜 Scroll entries:', result.rows.filter(r => r.teaches_ability_id).length);
}

checkAllLoot();
