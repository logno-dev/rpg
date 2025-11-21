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

async function checkDefeats() {
  const defeats = await db.execute(`
    SELECT 
      cnmd.character_id,
      cnmd.named_mob_id,
      nm.name,
      nm.title,
      cnmd.defeated_at
    FROM character_named_mob_defeats cnmd
    JOIN named_mobs nm ON cnmd.named_mob_id = nm.id
  `);
  
  console.log('Named Mob Defeats:');
  if (defeats.rows.length === 0) {
    console.log('  None recorded');
  } else {
    for (const defeat of defeats.rows) {
      console.log(`  Character ${defeat.character_id} defeated ${defeat.name} ${defeat.title || ''} (ID: ${defeat.named_mob_id})`);
    }
  }
}

checkDefeats().catch(console.error);
