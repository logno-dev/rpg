import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function analyzeQuests() {
  console.log('📊 Analyzing Quest Rewards...\n');

  // Get all quests with their rewards
  const quests = await db.execute(`
    SELECT 
      q.id,
      q.name,
      q.region_id,
      q.min_level,
      q.repeatable,
      qo.type as objective_type,
      qo.required_count,
      i.name as reward_item,
      i.type as item_type,
      i.rarity,
      i.teaches_ability_id,
      qr_xp.reward_amount as xp_reward,
      qr_gold.reward_amount as gold_reward
    FROM quests q
    JOIN quest_objectives qo ON q.id = qo.quest_id
    LEFT JOIN quest_rewards qr ON q.id = qr.quest_id AND qr.reward_type = 'item'
    LEFT JOIN items i ON qr.reward_item_id = i.id
    LEFT JOIN quest_rewards qr_xp ON q.id = qr_xp.quest_id AND qr_xp.reward_type IN ('xp', 'experience')
    LEFT JOIN quest_rewards qr_gold ON q.id = qr_gold.quest_id AND qr_gold.reward_type = 'gold'
    ORDER BY q.region_id, q.id
  `);

  // Categorize quests
  const categories = {
    scroll_quests: [],
    legendary_rare_quests: [],
    epic_quests: [],
    uncommon_common_quests: [],
    consumable_quests: [],
    no_item_reward_quests: [],
    repeatable_dailies: []
  };

  const seenQuests = new Set();

  for (const row of quests.rows) {
    if (seenQuests.has(row.id)) continue;
    seenQuests.add(row.id);

    const quest = {
      id: row.id,
      name: row.name,
      region: row.region_id,
      level: row.min_level,
      repeatable: row.repeatable,
      objective: row.objective_type,
      count: row.required_count,
      reward_item: row.reward_item,
      item_type: row.item_type,
      rarity: row.rarity,
      teaches_ability: row.teaches_ability_id,
      xp: row.xp_reward,
      gold: row.gold_reward
    };

    // Categorize
    if (quest.teaches_ability) {
      categories.scroll_quests.push(quest);
    } else if (quest.rarity === 'legendary' || quest.rarity === 'rare') {
      categories.legendary_rare_quests.push(quest);
    } else if (quest.rarity === 'epic') {
      categories.epic_quests.push(quest);
    } else if (quest.rarity === 'uncommon' || quest.rarity === 'common') {
      if (quest.item_type === 'consumable') {
        categories.consumable_quests.push(quest);
      } else {
        categories.uncommon_common_quests.push(quest);
      }
    } else if (!quest.reward_item) {
      if (quest.repeatable) {
        categories.repeatable_dailies.push(quest);
      } else {
        categories.no_item_reward_quests.push(quest);
      }
    }
  }

  console.log('='.repeat(80));
  console.log('QUEST CATEGORIZATION');
  console.log('='.repeat(80));
  console.log(`\nTotal Unique Quests: ${seenQuests.size}`);
  console.log(`\n📜 SCROLL QUESTS (Teach Abilities): ${categories.scroll_quests.length}`);
  console.log(`🏆 LEGENDARY/RARE EQUIPMENT: ${categories.legendary_rare_quests.length}`);
  console.log(`💎 EPIC EQUIPMENT: ${categories.epic_quests.length}`);
  console.log(`⚔️  UNCOMMON/COMMON EQUIPMENT: ${categories.uncommon_common_quests.length}`);
  console.log(`🧪 CONSUMABLE REWARDS: ${categories.consumable_quests.length}`);
  console.log(`💰 XP/GOLD ONLY (Repeatable Dailies): ${categories.repeatable_dailies.length}`);
  console.log(`❌ NO ITEM REWARD (Non-Repeatable): ${categories.no_item_reward_quests.length}`);

  // Show samples
  console.log('\n' + '='.repeat(80));
  console.log('LOW-VALUE QUESTS TO DELETE');
  console.log('='.repeat(80));
  
  console.log('\n🧪 Consumable Reward Quests (${categories.consumable_quests.length}):');
  categories.consumable_quests.slice(0, 10).forEach(q => {
    console.log(`  [R${q.region} L${q.level}] ${q.name} → ${q.reward_item} (${q.rarity})`);
  });

  console.log('\n⚔️  Common/Uncommon Equipment Quests (sample of ${categories.uncommon_common_quests.length}):');
  categories.uncommon_common_quests.slice(0, 15).forEach(q => {
    console.log(`  [R${q.region} L${q.level}] ${q.name} → ${q.reward_item} (${q.rarity})`);
  });

  console.log('\n' + '='.repeat(80));
  console.log('QUESTS TO KEEP');
  console.log('='.repeat(80));

  console.log('\n📜 Scroll Quests (sample):');
  categories.scroll_quests.slice(0, 10).forEach(q => {
    console.log(`  [R${q.region} L${q.level}] ${q.name} → ${q.reward_item}`);
  });

  console.log('\n🏆 Legendary/Rare Quests (sample):');
  categories.legendary_rare_quests.slice(0, 10).forEach(q => {
    console.log(`  [R${q.region} L${q.level}] ${q.name} → ${q.reward_item} (${q.rarity})`);
  });

  console.log('\n💰 Repeatable Dailies (sample):');
  categories.repeatable_dailies.slice(0, 10).forEach(q => {
    console.log(`  [R${q.region} L${q.level}] ${q.name} → ${q.xp} XP, ${q.gold} Gold`);
  });

  console.log('\n' + '='.repeat(80));
  console.log('RECOMMENDATION');
  console.log('='.repeat(80));
  
  const toDelete = categories.consumable_quests.length + categories.uncommon_common_quests.length + categories.no_item_reward_quests.length;
  const toKeep = categories.scroll_quests.length + categories.legendary_rare_quests.length + categories.epic_quests.length + categories.repeatable_dailies.length;
  
  console.log(`\n✅ KEEP: ${toKeep} quests`);
  console.log(`   - ${categories.scroll_quests.length} scroll quests (ability rewards)`);
  console.log(`   - ${categories.legendary_rare_quests.length} legendary/rare equipment quests`);
  console.log(`   - ${categories.epic_quests.length} epic equipment quests`);
  console.log(`   - ${categories.repeatable_dailies.length} repeatable daily quests (XP/Gold)`);
  
  console.log(`\n🗑️  DELETE: ${toDelete} quests`);
  console.log(`   - ${categories.consumable_quests.length} consumable reward quests`);
  console.log(`   - ${categories.uncommon_common_quests.length} common/uncommon equipment quests`);
  console.log(`   - ${categories.no_item_reward_quests.length} non-repeatable quests with no item reward`);
  
  console.log(`\n📊 FINAL COUNT: ${toKeep} quests (from ${seenQuests.size})`);
  console.log(`📉 REDUCTION: ${((toDelete / seenQuests.size) * 100).toFixed(1)}%\n`);

  // Save IDs to delete
  const deleteIds = [
    ...categories.consumable_quests.map(q => q.id),
    ...categories.uncommon_common_quests.map(q => q.id),
    ...categories.no_item_reward_quests.map(q => q.id)
  ];

  console.log(`\n💾 Quest IDs to delete: ${deleteIds.length} total`);
  console.log(`   Sample IDs: ${deleteIds.slice(0, 20).join(', ')}...\n`);

  return {
    categories,
    deleteIds,
    stats: { total: seenQuests.size, toKeep, toDelete }
  };
}

analyzeQuests().catch(console.error);
