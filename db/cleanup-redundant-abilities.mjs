#!/usr/bin/env node
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log('🧹 Cleaning up redundant non-tiered abilities...\n');

// Find redundant abilities (those that have a Tier I version)
const redundantAbilities = await db.execute(`
  SELECT 
    a1.id as redundant_id, 
    a1.name as redundant_name, 
    a2.id as tier1_id, 
    a2.name as tier1_name
  FROM abilities a1 
  JOIN abilities a2 ON a1.name || ' I' = a2.name
  WHERE a1.base_id IS NULL OR a1.base_id = 0
  ORDER BY a1.name
`);

console.log(`Found ${redundantAbilities.rows.length} redundant abilities:\n`);
redundantAbilities.rows.forEach(row => {
  console.log(`  - ${row.redundant_name} (ID: ${row.redundant_id}) → has ${row.tier1_name} (ID: ${row.tier1_id})`);
});
console.log('');

// Get all redundant ability IDs
const redundantAbilityIds = redundantAbilities.rows.map(r => r.redundant_id);

if (redundantAbilityIds.length === 0) {
  console.log('No redundant abilities found. Exiting.');
  process.exit(0);
}

// Find scrolls teaching these abilities
const scrollsResult = await db.execute(
  `SELECT id, name, teaches_ability_id FROM items WHERE teaches_ability_id IN (${redundantAbilityIds.join(',')})`
);

const scrollIds = scrollsResult.rows.map(s => s.id);

console.log(`📜 Found ${scrollIds.length} scrolls to delete:`);
scrollsResult.rows.forEach(scroll => {
  console.log(`  - ${scroll.name} (teaches ability ID: ${scroll.teaches_ability_id})`);
});
console.log('');

if (scrollIds.length === 0) {
  console.log('⚠️  No scrolls found for these abilities.');
} else {
  // 1. Delete from mob_loot
  console.log('Removing scrolls from mob loot tables...');
  await db.execute(
    `DELETE FROM mob_loot WHERE item_id IN (${scrollIds.join(',')})`
  );
  console.log(`  ✓ Removed from mob_loot\n`);

  // 2. Delete from merchant_inventory
  console.log('Removing scrolls from merchant inventories...');
  await db.execute(
    `DELETE FROM merchant_inventory WHERE item_id IN (${scrollIds.join(',')})`
  );
  console.log(`  ✓ Removed from merchant_inventory\n`);

  // 3. Delete from character_inventory (players who have them)
  console.log('Removing scrolls from player inventories...');
  await db.execute(
    `DELETE FROM character_inventory WHERE item_id IN (${scrollIds.join(',')})`
  );
  console.log(`  ✓ Removed from character_inventory\n`);

  // 4. Handle quests that reward these scrolls
  console.log('Checking quests that reward these scrolls...');
  const questRewardsResult = await db.execute(
    `SELECT quest_id, reward_item_id FROM quest_rewards WHERE reward_item_id IN (${scrollIds.join(',')})`
  );

  if (questRewardsResult.rows.length > 0) {
    const affectedQuestIds = [...new Set(questRewardsResult.rows.map(r => r.quest_id))];
    console.log(`  Found ${affectedQuestIds.length} quests with these scroll rewards`);
    
    // Delete these quests entirely (objectives and rewards)
    console.log('  Deleting affected quests...');
    await db.execute(
      `DELETE FROM quest_objectives WHERE quest_id IN (${affectedQuestIds.join(',')})`
    );
    await db.execute(
      `DELETE FROM quest_rewards WHERE quest_id IN (${affectedQuestIds.join(',')})`
    );
    await db.execute(
      `DELETE FROM quests WHERE id IN (${affectedQuestIds.join(',')})`
    );
    console.log(`  ✓ Deleted ${affectedQuestIds.length} quests\n`);
  } else {
    console.log(`  ✓ No quests reward these scrolls\n`);
  }

  // 5. Delete the scrolls themselves
  console.log('Deleting scrolls...');
  await db.execute(
    `DELETE FROM items WHERE id IN (${scrollIds.join(',')})`
  );
  console.log(`  ✓ Deleted ${scrollIds.length} scrolls\n`);
}

// 6. Delete learned abilities from characters
console.log('Removing learned abilities from characters...');
await db.execute(
  `DELETE FROM character_abilities WHERE ability_id IN (${redundantAbilityIds.join(',')})`
);
console.log(`  ✓ Removed from character_abilities\n`);

// 7. Delete from hotbars
console.log('Removing abilities from hotbars...');
await db.execute(
  `DELETE FROM character_hotbar WHERE ability_id IN (${redundantAbilityIds.join(',')})`
);
console.log(`  ✓ Removed from hotbars\n`);

// 8. Finally, delete the redundant abilities
console.log('Deleting redundant abilities...');
await db.execute(
  `DELETE FROM abilities WHERE id IN (${redundantAbilityIds.join(',')})`
);
console.log(`  ✓ Deleted ${redundantAbilityIds.length} abilities\n`);

console.log('✅ Cleanup complete!\n');
console.log('📊 Summary:');
console.log(`  - Abilities deleted: ${redundantAbilityIds.length}`);
console.log(`  - Scrolls deleted: ${scrollIds.length}`);
console.log(`  - Removed from: mob loot, merchants, inventories, quests, hotbars`);
console.log('\n🎯 Only tiered abilities (I, II, III, IV, V) remain!\n');

process.exit(0);
