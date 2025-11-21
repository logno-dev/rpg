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

console.log('🔧 Fixing merchant inventory levels...\n');

// Get all regions 5-16 with their merchants
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
  console.log(`Fixing ${region.merchant_name} (Region ${region.region_id}: ${region.min_level}-${region.max_level})...`);
  
  // Delete existing inventory for this merchant
  await db.execute({
    sql: 'DELETE FROM merchant_inventory WHERE merchant_id = ?',
    args: [region.merchant_id]
  });
  
  // Get appropriate items for this region's level range
  // Use region's min_level to max_level, plus consumables
  const items = await db.execute({
    sql: `SELECT id, name, type, rarity, required_level 
          FROM items 
          WHERE (
            (required_level >= ? AND required_level <= ?)
            OR (type = 'consumable' AND required_level IS NULL)
            OR (type = 'consumable' AND required_level <= ?)
          )
          AND type IN ('weapon', 'armor', 'consumable')
          ORDER BY type, required_level, rarity
          LIMIT 50`,
    args: [region.min_level, region.max_level, region.max_level]
  });
  
  let addedCount = 0;
  for (const item of items.rows) {
    // Determine price multiplier based on rarity
    let priceMultiplier = 1.0;
    if (item.rarity === 'uncommon') priceMultiplier = 1.2;
    else if (item.rarity === 'rare') priceMultiplier = 1.5;
    else if (item.rarity === 'epic') priceMultiplier = 2.0;
    else if (item.rarity === 'legendary') priceMultiplier = 3.0;
    
    await db.execute({
      sql: 'INSERT INTO merchant_inventory (merchant_id, item_id, stock, price_multiplier) VALUES (?, ?, ?, ?)',
      args: [region.merchant_id, item.id, -1, priceMultiplier]
    });
    addedCount++;
  }
  
  console.log(`  ✓ Added ${addedCount} items (Level ${region.min_level}-${region.max_level})`);
}

console.log('\n✅ All merchant inventories fixed!');
console.log('Merchants now sell items appropriate for their region levels.');
