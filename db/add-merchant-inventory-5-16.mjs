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

console.log('🏪 Adding inventory for merchants in regions 5-16...\n');

// Get merchant IDs for regions 5-16
const merchants = await db.execute({
  sql: 'SELECT id, region_id, name FROM merchants WHERE region_id >= 5 AND region_id <= 16 ORDER BY region_id',
  args: []
});

for (const merchant of merchants.rows) {
  console.log(`Adding inventory for ${merchant.name} (Region ${merchant.region_id})...`);
  
  // Determine level range based on region
  // Region 5 = 13-18, Region 6 = 16-22, etc.
  const minLevel = 10 + (merchant.region_id * 4);
  const maxLevel = minLevel + 10;
  
  // Get appropriate items for this level range
  const items = await db.execute({
    sql: `SELECT id, name, type, rarity, value 
          FROM items 
          WHERE (required_level >= ? AND required_level <= ?) 
            OR (required_level IS NULL AND value < ?)
          ORDER BY type, rarity, name 
          LIMIT 30`,
    args: [minLevel, maxLevel, 100]
  });
  
  let addedCount = 0;
  for (const item of items.rows) {
    // Check if this merchant already has this item
    const existing = await db.execute({
      sql: 'SELECT id FROM merchant_inventory WHERE merchant_id = ? AND item_id = ?',
      args: [merchant.id, item.id]
    });
    
    if (existing.rows.length === 0) {
      // Determine price multiplier based on rarity
      let priceMultiplier = 1.0;
      if (item.rarity === 'uncommon') priceMultiplier = 1.2;
      else if (item.rarity === 'rare') priceMultiplier = 1.5;
      else if (item.rarity === 'epic') priceMultiplier = 2.0;
      else if (item.rarity === 'legendary') priceMultiplier = 3.0;
      
      // Add to merchant inventory
      await db.execute({
        sql: 'INSERT INTO merchant_inventory (merchant_id, item_id, stock, price_multiplier) VALUES (?, ?, ?, ?)',
        args: [merchant.id, item.id, -1, priceMultiplier] // -1 = infinite stock
      });
      addedCount++;
    }
  }
  
  console.log(`  ✓ Added ${addedCount} items (Level ${minLevel}-${maxLevel} range)`);
}

console.log('\n✅ All merchant inventories populated!');
console.log('Merchants now have appropriate items for their regions.');
