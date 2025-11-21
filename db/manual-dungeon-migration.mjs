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

async function runMigration() {
  console.log('Running migration 028...');
  const migration028 = readFileSync(join(__dirname, 'migrations', '028_create_dungeons_system.sql'), 'utf-8');
  
  // Split by semicolon and execute each statement
  const statements = migration028.split(';').filter(s => s.trim());
  
  for (const stmt of statements) {
    if (stmt.trim()) {
      try {
        await db.execute(stmt);
        console.log('✓ Executed statement');
      } catch (error) {
        console.error('Error:', error.message);
      }
    }
  }
  
  console.log('Running migration 029...');
  const migration029 = readFileSync(join(__dirname, 'migrations', '029_add_named_mob_combat.sql'), 'utf-8');
  
  const statements029 = migration029.split(';').filter(s => s.trim());
  
  for (const stmt of statements029) {
    if (stmt.trim()) {
      try {
        await db.execute(stmt);
        console.log('✓ Executed statement');
      } catch (error) {
        console.error('Error:', error.message);
      }
    }
  }
  
  console.log('✅ Migrations complete!');
}

runMigration().catch(console.error);
