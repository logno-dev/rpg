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
  console.log('Running migration 030...');
  const migration = readFileSync(join(__dirname, 'migrations', '030_fix_combat_sessions_mob_id.sql'), 'utf-8');
  
  const statements = migration.split(';').filter(s => s.trim());
  
  for (const stmt of statements) {
    if (stmt.trim()) {
      try {
        await db.execute(stmt);
        console.log('✓ Executed statement');
      } catch (error) {
        console.error('Error:', error.message);
        console.error('Statement:', stmt.substring(0, 100));
      }
    }
  }
  
  console.log('✅ Migration 030 complete!');
}

runMigration().catch(console.error);
