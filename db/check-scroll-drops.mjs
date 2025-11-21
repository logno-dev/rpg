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

async function checkScrollDrops() {
  console.log('📜 Checking scroll drop rates...\n');
  
  const result = await client.execute(`
    SELECT 
      m.name as mob_name,
      i.name as item_name,
      ml.drop_chance,
      ml.quantity_min,
      ml.quantity_max
    FROM mob_loot ml
    JOIN mobs m ON ml.mob_id = m.id
    JOIN items i ON ml.item_id = i.id
    WHERE i.teaches_ability_id IS NOT NULL
    ORDER BY m.id, i.name
  `);
  
  console.log('Scroll Drop Rates:');
  console.log('═══════════════════════════════════════════════════════');
  for (const row of result.rows) {
    const dropPercent = (row.drop_chance * 100).toFixed(0);
    console.log(`${row.mob_name.padEnd(20)} → ${row.item_name.padEnd(25)} ${dropPercent}%`);
  }
  console.log('\n✅ Total scroll drops configured:', result.rows.length);
}

checkScrollDrops();
