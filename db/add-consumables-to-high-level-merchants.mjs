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

console.log('Adding consumables and high-level items to merchants 13-16...\n');

// Get merchants for regions 13-16
const merchants = await db.execute({
  sql: 'SELECT id, region_id, name FROM merchants WHERE region_id >= 13 AND region_id <= 16 ORDER BY region_id',
  args: []
});

// Get all consumables and highest level items
const consumables = await db.execute({
  sql: 'SELECT id, name, value FROM items WHERE type = "consumable" ORDER BY value DESC LIMIT 10',
  args: []
});

const highLevelItems = await db.execute({
  sql: `SELECT id, name, rarity, value 
        FROM items 
        WHERE required_level >= 50 
        ORDER BY required_level DESC, rarity DESC 
        LIMIT 20`,
  args: []
});

const allItems = [...consumables.rows, ...highLevelItems.rows];

for (const merchant of merchants.rows) {
  console.log(`Adding items to ${merchant.name} (Region ${merchant.region_id})...`);
  
  let addedCount = 0;
  for (const item of allItems) {
    // Check if merchant already has this item
    const existing = await db.execute({
      sql: 'SELECT id FROM merchant_inventory WHERE merchant_id = ? AND item_id = ?',
      args: [merchant.id, item.id]
    });
    
    if (existing.rows.length === 0) {
      let priceMultiplier = 1.0;
      if (item.rarity === 'uncommon') priceMultiplier = 1.2;
      else if (item.rarity === 'rare') priceMultiplier = 1.5;
      else if (item.rarity === 'epic') priceMultiplier = 2.0;
      else if (item.rarity === 'legendary') priceMultiplier = 3.0;
      
      await db.execute({
        sql: 'INSERT INTO merchant_inventory (merchant_id, item_id, stock, price_multiplier) VALUES (?, ?, ?, ?)',
        args: [merchant.id, item.id, -1, priceMultiplier]
      });
      addedCount++;
    }
  }
  
  console.log(`  ✓ Added ${addedCount} items`);
}

console.log('\n✅ High-level merchants now have inventory!');
