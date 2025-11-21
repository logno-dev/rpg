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

async function checkAbilities() {
  const result = await client.execute('SELECT id, name, type FROM abilities ORDER BY id LIMIT 20');
  
  console.log('\n⚔️ Abilities:');
  console.log('══════════════════════════════════════════');
  for (const row of result.rows) {
    console.log(`ID ${String(row.id).padStart(3)} → ${row.name.padEnd(20)} (${row.type})`);
  }
  console.log('\nTotal:', result.rows.length);
}

checkAbilities();
