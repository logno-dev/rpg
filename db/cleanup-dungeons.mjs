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

async function cleanup() {
  console.log('Cleaning up dungeon data...');
  
  // Delete all dungeon encounters
  await db.execute('DELETE FROM dungeon_encounters');
  console.log('✓ Cleared dungeon encounters');
  
  // Delete all dungeons
  await db.execute('DELETE FROM dungeons');
  console.log('✓ Cleared dungeons');
  
  // Delete all named mobs
  await db.execute('DELETE FROM named_mobs');
  console.log('✓ Cleared named mobs');
  
  // Delete dungeon progress
  await db.execute('DELETE FROM character_dungeon_progress');
  console.log('✓ Cleared dungeon progress');
  
  // Delete named mob defeats
  await db.execute('DELETE FROM character_named_mob_defeats');
  console.log('✓ Cleared named mob defeats');
  
  console.log('\n✅ Cleanup complete!');
}

cleanup().catch(console.error);
