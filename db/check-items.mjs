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

async function checkItems() {
  console.log('📜 Checking items table for scrolls...\n');
  
  const result = await client.execute(`
    SELECT id, name, type, teaches_ability_id
    FROM items
    WHERE teaches_ability_id IS NOT NULL
    ORDER BY id
  `);
  
  console.log('Scroll Items:');
  console.log('══════════════════════════════════════════');
  for (const row of result.rows) {
    console.log(`ID ${String(row.id).padStart(3)} → ${row.name.padEnd(30)} (teaches ability ${row.teaches_ability_id})`);
  }
  console.log('\n✅ Total scrolls:', result.rows.length);
  
  // Also show first 35 items
  const allItems = await client.execute('SELECT id, name, type FROM items ORDER BY id LIMIT 35');
  console.log('\n📦 First 35 items:');
  console.log('══════════════════════════════════════════');
  for (const row of allItems.rows) {
    const isScroll = row.type === 'consumable' && row.name.includes('Scroll') ? '📜' : '  ';
    console.log(`${isScroll} ID ${String(row.id).padStart(3)} → ${row.name.padEnd(30)} (${row.type})`);
  }
}

checkItems();
