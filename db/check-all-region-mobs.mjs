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

console.log('Checking all regions for mob spawn mappings:\n');

const regions = await db.execute({
  sql: 'SELECT id, name FROM regions ORDER BY id',
  args: []
});

const regionsWithoutSpawns = [];

for (const region of regions.rows) {
  const spawns = await db.execute({
    sql: 'SELECT COUNT(*) as count FROM region_mobs WHERE region_id = ?',
    args: [region.id]
  });
  
  const count = spawns.rows[0].count;
  
  if (count === 0) {
    regionsWithoutSpawns.push(region);
    console.log(`❌ Region ${region.id}: ${region.name} - NO SPAWNS`);
  } else {
    console.log(`✓ Region ${region.id}: ${region.name} - ${count} spawns`);
  }
}

if (regionsWithoutSpawns.length > 0) {
  console.log(`\n⚠️  Found ${regionsWithoutSpawns.length} regions without mob spawns!`);
} else {
  console.log('\n✅ All regions have mob spawns configured!');
}
