import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log('Creating sample quest with quest items...\n');

// 1. Create quest items
console.log('Step 1: Creating quest items...');
await db.execute({
  sql: `INSERT INTO crafting_materials (name, description, rarity, is_quest_item, quest_id)
        VALUES (?, ?, ?, ?, NULL)`,
  args: ['Wolf Pelt', 'A pelt from a wild wolf', 'common', 1]
});

const wolfPeltResult = await db.execute({
  sql: 'SELECT id FROM crafting_materials WHERE name = ?',
  args: ['Wolf Pelt']
});
const wolfPeltId = wolfPeltResult.rows[0].id;
console.log(`  Created Wolf Pelt (id: ${wolfPeltId})`);

// 2. Create the quest
console.log('\nStep 2: Creating quest...');
await db.execute({
  sql: `INSERT INTO quests (name, description, region_id, min_level, repeatable, cooldown_hours)
        VALUES (?, ?, ?, ?, ?, ?)`,
  args: [
    'Pelt Collection',
    'The merchant needs wolf pelts for winter clothing. Collect some from the wolves in the forest.',
    2, // Darkwood Forest
    5,
    0,
    0
  ]
});

const questResult = await db.execute({
  sql: 'SELECT id FROM quests WHERE name = ?',
  args: ['Pelt Collection']
});
const questId = questResult.rows[0].id;
console.log(`  Created quest "Pelt Collection" (id: ${questId})`);

// Update the quest item with the quest_id
await db.execute({
  sql: 'UPDATE crafting_materials SET quest_id = ? WHERE id = ?',
  args: [questId, wolfPeltId]
});

// 3. Create quest objective
console.log('\nStep 3: Creating quest objective...');
await db.execute({
  sql: `INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_item_id, target_region_id, required_count, auto_complete)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  args: [
    questId,
    1,
    'collect',
    'Collect 5 Wolf Pelts',
    wolfPeltId,
    2, // Darkwood Forest
    5,
    1
  ]
});
console.log('  Created collect objective for Wolf Pelts');

// 4. Create quest rewards
console.log('\nStep 4: Creating quest rewards...');
await db.execute({
  sql: `INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
        VALUES (?, ?, ?), (?, ?, ?)`,
  args: [
    questId, 'xp', 200,
    questId, 'gold', 40
  ]
});
console.log('  Created rewards: 200 XP, 40 Gold');

// 5. Add wolf pelt drops to wolves (mob_id 3)
console.log('\nStep 5: Adding quest item drops to mob loot...');
const wolfMob = await db.execute({
  sql: 'SELECT id FROM mobs WHERE name = ?',
  args: ['Wolf']
});

if (wolfMob.rows.length > 0) {
  const wolfMobId = wolfMob.rows[0].id;
  
  await db.execute({
    sql: `INSERT INTO mob_crafting_loot (mob_id, material_id, drop_chance, min_quantity, max_quantity)
          VALUES (?, ?, ?, ?, ?)`,
    args: [wolfMobId, wolfPeltId, 0.6, 1, 1] // 60% drop chance
  });
  console.log(`  Added Wolf Pelt drop to Wolf mob (id: ${wolfMobId}) - 60% drop chance`);
} else {
  console.log('  WARNING: Wolf mob not found, skipping loot drop setup');
}

// Verify everything
console.log('\n=== Verification ===');
const quest = await db.execute({
  sql: 'SELECT * FROM quests WHERE id = ?',
  args: [questId]
});
console.log('Quest:', quest.rows[0]);

const objectives = await db.execute({
  sql: 'SELECT * FROM quest_objectives WHERE quest_id = ?',
  args: [questId]
});
console.log('Objectives:', objectives.rows);

const rewards = await db.execute({
  sql: 'SELECT * FROM quest_rewards WHERE quest_id = ?',
  args: [questId]
});
console.log('Rewards:', rewards.rows);

const loot = await db.execute({
  sql: 'SELECT * FROM mob_crafting_loot WHERE material_id = ?',
  args: [wolfPeltId]
});
console.log('Loot drops:', loot.rows);

console.log('\n✅ Done! Quest "Pelt Collection" created successfully!');
console.log('   - Region: Darkwood Forest (2)');
console.log('   - Objective: Collect 5 Wolf Pelts');
console.log('   - Rewards: 200 XP, 40 Gold');
console.log('   - Drops from: Wolf (60% chance)');
