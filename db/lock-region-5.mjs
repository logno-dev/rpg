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

console.log('Locking Region 5 (Scorched Badlands)...');
await db.execute({
  sql: 'UPDATE regions SET locked = 1 WHERE id = 5',
  args: []
});

console.log('✓ Region 5 is now locked');
console.log('It will unlock after defeating Vexmora in Shadowdeep Dungeon');

// Check current state
const result = await db.execute('SELECT id, name, locked, unlock_requirement FROM regions WHERE id = 5');
console.log('\nCurrent state:');
console.log(`  ID: ${result.rows[0].id}`);
console.log(`  Name: ${result.rows[0].name}`);
console.log(`  Locked: ${result.rows[0].locked}`);
console.log(`  Unlock Requirement: ${result.rows[0].unlock_requirement}`);
