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

console.log('Checking merchant inventory levels:\n');

const regions = await db.execute({
  sql: `SELECT id, name, min_level, max_level FROM regions WHERE id >= 5 ORDER BY id`,
  args: []
});

for (const region of regions.rows) {
  const merchant = await db.execute({
    sql: 'SELECT id, name FROM merchants WHERE region_id = ?',
    args: [region.id]
  });
  
  if (merchant.rows.length > 0) {
    const merchantInfo = merchant.rows[0];
    
    // Get item level range in this merchant's inventory
    const itemLevels = await db.execute({
      sql: `SELECT MIN(i.required_level) as min_req, MAX(i.required_level) as max_req, COUNT(*) as count
            FROM merchant_inventory mi
            JOIN items i ON mi.item_id = i.id
            WHERE mi.merchant_id = ? AND i.required_level IS NOT NULL`,
      args: [merchantInfo.id]
    });
    
    const levels = itemLevels.rows[0];
    const status = (levels.min_req >= region.min_level && levels.max_req <= region.max_level + 5) ? '✓' : '❌';
    
    console.log(`${status} Region ${region.id} (${region.min_level}-${region.max_level}): ${merchantInfo.name}`);
    console.log(`   Selling items: Level ${levels.min_req || 'N/A'}-${levels.max_req || 'N/A'} (${levels.count} items)`);
  }
}
