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

async function checkRegions() {
  const regions = await db.execute('SELECT * FROM regions ORDER BY id');
  
  console.log('Regions:');
  for (const region of regions.rows) {
    console.log(`\n${region.id}. ${region.name}`);
    console.log(`   Locked: ${region.locked ? 'Yes' : 'No'}`);
    console.log(`   Unlock Requirement: ${region.unlock_requirement || 'None'}`);
  }
}

checkRegions().catch(console.error);
