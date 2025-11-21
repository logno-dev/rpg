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

console.log('Items table schema:\n');

const schema = await db.execute({
  sql: "PRAGMA table_info(items)",
  args: []
});

schema.rows.forEach(col => {
  console.log(`  ${col.name}: ${col.type}`);
});

console.log('\n\nSample items:\n');
const items = await db.execute({
  sql: 'SELECT * FROM items LIMIT 3',
  args: []
});

console.log('Columns:', Object.keys(items.rows[0] || {}));
