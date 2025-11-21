#!/usr/bin/env node
import 'dotenv/config';
import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log('🔍 Checking for duplicate scroll items...\n');

// Find all scrolls that teach the same ability
const scrollsResult = await db.execute({
  sql: `SELECT 
          id,
          name,
          type,
          value,
          teaches_ability_id
        FROM items
        WHERE type = 'scroll' 
          AND teaches_ability_id IS NOT NULL
        ORDER BY teaches_ability_id, value`,
  args: [],
});

const scrolls = scrollsResult.rows;

console.log(`Found ${scrolls.length} scrolls in items table\n`);

// Group by teaches_ability_id
const scrollsByAbility = {};
for (const scroll of scrolls) {
  const abilityId = scroll.teaches_ability_id;
  if (!scrollsByAbility[abilityId]) {
    scrollsByAbility[abilityId] = [];
  }
  scrollsByAbility[abilityId].push(scroll);
}

// Find duplicates (multiple scrolls teaching the same ability)
const duplicates = Object.entries(scrollsByAbility)
  .filter(([abilityId, items]) => items.length > 1)
  .map(([abilityId, items]) => ({ abilityId, items }));

if (duplicates.length === 0) {
  console.log('✅ No duplicate scrolls found!');
  process.exit(0);
}

console.log(`Found ${duplicates.length} abilities with multiple scrolls:\n`);

for (const { abilityId, items } of duplicates) {
  console.log(`🎯 Ability ID ${abilityId}:`);
  for (const item of items) {
    console.log(`   - ${item.name} (id: ${item.id}, value: ${item.value}g)`);
  }
  console.log('');
}

// Check which of these duplicate scrolls are in merchant inventory
console.log('\n📊 Checking merchant inventory for these duplicates...\n');

for (const { abilityId, items } of duplicates) {
  console.log(`Ability ID ${abilityId} - ${items[0].name}:`);
  
  for (const item of items) {
    const inMerchant = await db.execute({
      sql: 'SELECT id, merchant_id, stock FROM merchant_inventory WHERE item_id = ?',
      args: [item.id],
    });
    
    if (inMerchant.rows.length > 0) {
      console.log(`   ✓ Item ${item.id} (${item.value}g) IS in merchant inventory:`, inMerchant.rows.map(r => `merchant_id: ${r.merchant_id}, stock: ${r.stock}`).join(', '));
    } else {
      console.log(`   ✗ Item ${item.id} (${item.value}g) NOT in merchant inventory`);
    }
  }
  console.log('');
}

process.exit(0);
