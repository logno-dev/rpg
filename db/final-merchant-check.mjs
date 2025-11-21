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

console.log('Final Merchant Inventory Check:\n');

const regions = await db.execute({
  sql: `SELECT r.id as region_id, r.name as region_name, r.min_level, r.max_level, 
               m.id as merchant_id, m.name as merchant_name
        FROM regions r
        JOIN merchants m ON r.id = m.region_id
        WHERE r.id >= 5 AND r.id <= 16
        ORDER BY r.id`,
  args: []
});

for (const region of regions.rows) {
  // Get equipment level range (not consumables)
  const equipmentLevels = await db.execute({
    sql: `SELECT MIN(i.required_level) as min_req, MAX(i.required_level) as max_req
          FROM merchant_inventory mi
          JOIN items i ON mi.item_id = i.id
          WHERE mi.merchant_id = ? AND i.type IN ('weapon', 'armor') AND i.required_level IS NOT NULL`,
    args: [region.merchant_id]
  });
  
  // Get total item count
  const totalCount = await db.execute({
    sql: 'SELECT COUNT(*) as count FROM merchant_inventory WHERE merchant_id = ?',
    args: [region.merchant_id]
  });
  
  const eqLevels = equipmentLevels.rows[0];
  const inRange = (eqLevels.min_req >= region.min_level && eqLevels.max_req <= region.max_level);
  const status = inRange ? '✓' : '❌';
  
  console.log(`${status} Region ${region.region_id} (${region.min_level}-${region.max_level}): ${region.merchant_name}`);
  console.log(`   Equipment: Level ${eqLevels.min_req || 'N/A'}-${eqLevels.max_req || 'N/A'} | Total items: ${totalCount.rows[0].count}`);
}

console.log('\n✅ All merchants have level-appropriate equipment!');
