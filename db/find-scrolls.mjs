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

async function findScrolls() {
  const result = await client.execute(`
    SELECT id, name, teaches_ability_id
    FROM items
    WHERE name LIKE '%Scroll%'
    ORDER BY id
  `);
  
  console.log('\n📜 Items with "Scroll" in name:');
  console.log('══════════════════════════════════════════');
  for (const row of result.rows) {
    console.log(`ID ${String(row.id).padStart(3)} → ${row.name.padEnd(35)} teaches_ability_id: ${row.teaches_ability_id}`);
  }
  console.log('\nTotal:', result.rows.length);
}

findScrolls();
