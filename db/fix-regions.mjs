import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
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

console.log('Updating all characters to have current_region = 1...');
const result = await client.execute({
  sql: 'UPDATE characters SET current_region = 1 WHERE current_region IS NULL',
  args: [],
});
console.log('Updated', result.rowsAffected, 'characters');

const chars = await client.execute({
  sql: 'SELECT id, name, current_region FROM characters',
  args: [],
});
console.log('\nAll characters:');
console.log(chars.rows);

process.exit(0);
