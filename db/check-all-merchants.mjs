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

console.log('Checking merchants for all regions:\n');

const regions = await db.execute({
  sql: 'SELECT id, name FROM regions ORDER BY id',
  args: []
});

const regionsWithoutMerchants = [];

for (const region of regions.rows) {
  const merchants = await db.execute({
    sql: 'SELECT * FROM merchants WHERE region_id = ?',
    args: [region.id]
  });
  
  if (merchants.rows.length === 0) {
    regionsWithoutMerchants.push(region);
    console.log(`❌ Region ${region.id}: ${region.name} - NO MERCHANT`);
  } else {
    const merchantNames = merchants.rows.map(m => m.name).join(', ');
    console.log(`✓ Region ${region.id}: ${region.name} - ${merchantNames}`);
  }
}

if (regionsWithoutMerchants.length > 0) {
  console.log(`\n⚠️  Found ${regionsWithoutMerchants.length} regions without merchants:`);
  regionsWithoutMerchants.forEach(r => {
    console.log(`   Region ${r.id}: ${r.name}`);
  });
} else {
  console.log('\n✅ All regions have merchants!');
}
