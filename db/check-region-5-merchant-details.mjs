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

console.log('Region 5 Merchant (Ignis the Flame Broker) - Item Breakdown:\n');

const merchant = await db.execute({
  sql: 'SELECT id FROM merchants WHERE region_id = 5',
  args: []
});

const merchantId = merchant.rows[0].id;

const items = await db.execute({
  sql: `SELECT i.name, i.type, i.required_level, i.rarity
        FROM merchant_inventory mi
        JOIN items i ON mi.item_id = i.id
        WHERE mi.merchant_id = ?
        ORDER BY i.type, i.required_level
        LIMIT 30`,
  args: [merchantId]
});

console.log('Sample items (first 30):');
items.rows.forEach(item => {
  console.log(`  ${item.type.padEnd(12)} Level ${String(item.required_level || 'N/A').padStart(3)}: ${item.name} (${item.rarity})`);
});

// Count by type
const countByType = await db.execute({
  sql: `SELECT i.type, COUNT(*) as count
        FROM merchant_inventory mi
        JOIN items i ON mi.item_id = i.id
        WHERE mi.merchant_id = ?
        GROUP BY i.type`,
  args: [merchantId]
});

console.log('\n\nItem counts by type:');
countByType.rows.forEach(row => {
  console.log(`  ${row.type}: ${row.count}`);
});
