#!/usr/bin/env node
import 'dotenv/config';
import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log('🔍 Finding duplicate scrolls in merchant inventory...\n');

// Find all scrolls in merchant inventory (merchant_id = 1, the starter merchant)
const merchantInventoryResult = await db.execute({
  sql: `SELECT 
          mi.id as merchant_inventory_id,
          mi.item_id,
          mi.merchant_id,
          mi.stock,
          mi.price_multiplier,
          i.name,
          i.type,
          i.value,
          i.teaches_ability_id
        FROM merchant_inventory mi
        JOIN items i ON mi.item_id = i.id
        WHERE mi.merchant_id = 1 
          AND i.type = 'scroll'
        ORDER BY i.name, i.value`,
  args: [],
});

const scrolls = merchantInventoryResult.rows;

console.log(`Found ${scrolls.length} scrolls in merchant inventory\n`);

// Group scrolls by name to find duplicates
const scrollsByName = {};
for (const scroll of scrolls) {
  if (!scrollsByName[scroll.name]) {
    scrollsByName[scroll.name] = [];
  }
  scrollsByName[scroll.name].push(scroll);
}

// Find duplicates
const duplicates = Object.entries(scrollsByName)
  .filter(([name, items]) => items.length > 1)
  .map(([name, items]) => ({ name, items }));

if (duplicates.length === 0) {
  console.log('✅ No duplicate scrolls found!');
  process.exit(0);
}

console.log(`Found ${duplicates.length} duplicate scroll sets:\n`);

for (const { name, items } of duplicates) {
  console.log(`📜 ${name}:`);
  for (const item of items) {
    console.log(`   - merchant_inventory_id: ${item.merchant_inventory_id}, item_id: ${item.item_id}, value: ${item.value}g, teaches_ability: ${item.teaches_ability_id}`);
  }
  
  // Keep the one with value = 0, remove the others
  const zeroValueScroll = items.find(item => item.value === 0);
  const toRemove = items.filter(item => item.value > 0);
  
  if (zeroValueScroll && toRemove.length > 0) {
    console.log(`   ✅ Keeping: item_id ${zeroValueScroll.item_id} (value: 0g)`);
    console.log(`   ❌ Removing: ${toRemove.map(s => `merchant_inventory_id ${s.merchant_inventory_id} (value: ${s.value}g)`).join(', ')}`);
    
    // Remove duplicates with value > 0
    for (const scroll of toRemove) {
      await db.execute({
        sql: 'DELETE FROM merchant_inventory WHERE id = ?',
        args: [scroll.merchant_inventory_id],
      });
    }
  } else if (!zeroValueScroll) {
    console.log(`   ⚠️  No 0-value version found, keeping all`);
  }
  
  console.log('');
}

console.log('\n✨ Done! Duplicate scrolls with cost > 0 have been removed from merchant inventory.');
console.log('Only the free (0g value) versions remain.\n');

process.exit(0);
