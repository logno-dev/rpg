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

async function checkBuffs() {
  const result = await client.execute(`
    SELECT id, name, category, buff_stat, buff_amount, buff_duration
    FROM abilities
    WHERE category = 'buff'
  `);
  
  console.log('\n🛡️ Buff Abilities:');
  console.log('══════════════════════════════════════════════════════');
  for (const row of result.rows) {
    console.log(`${row.name.padEnd(20)} → +${row.buff_amount} ${row.buff_stat} for ${row.buff_duration}s`);
  }
  console.log('\nTotal:', result.rows.length);
}

checkBuffs();
