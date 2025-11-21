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

console.log('Checking items by level requirement:\n');

// Get count of items by level range
const itemsByLevel = await db.execute({
  sql: `SELECT 
          CASE 
            WHEN level_requirement IS NULL THEN 'No Level'
            WHEN level_requirement <= 5 THEN '1-5'
            WHEN level_requirement <= 10 THEN '6-10'
            WHEN level_requirement <= 15 THEN '11-15'
            WHEN level_requirement <= 20 THEN '16-20'
            WHEN level_requirement <= 30 THEN '21-30'
            WHEN level_requirement <= 40 THEN '31-40'
            WHEN level_requirement <= 50 THEN '41-50'
            ELSE '51+'
          END as level_range,
          COUNT(*) as count,
          type
        FROM items
        WHERE type IN ('weapon', 'armor', 'consumable')
        GROUP BY level_range, type
        ORDER BY level_range, type`,
  args: []
});

console.log('Items by level range and type:\n');
let currentRange = '';
itemsByLevel.rows.forEach(row => {
  if (row.level_range !== currentRange) {
    if (currentRange !== '') console.log('');
    console.log(`${row.level_range}:`);
    currentRange = row.level_range;
  }
  console.log(`  ${row.type}: ${row.count} items`);
});

// Check high-level items specifically
console.log('\n\nHigh-level items (20+):\n');
const highLevelItems = await db.execute({
  sql: `SELECT name, type, slot, level_requirement, rarity 
        FROM items 
        WHERE level_requirement >= 20 
        ORDER BY level_requirement, type, name 
        LIMIT 20`,
  args: []
});

if (highLevelItems.rows.length > 0) {
  highLevelItems.rows.forEach(item => {
    console.log(`  Level ${item.level_requirement}: ${item.name} (${item.type}/${item.slot || 'N/A'}) - ${item.rarity}`);
  });
} else {
  console.log('  ⚠️  No high-level items found!');
}
