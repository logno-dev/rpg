import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function aggressiveQuestCleanup() {
  console.log('🗑️  AGGRESSIVE QUEST CLEANUP\n');
  console.log('Strategy:');
  console.log('  ✅ KEEP: Scroll quests (abilities)');
  console.log('  ✅ KEEP: Legendary equipment quests');
  console.log('  ✅ KEEP: Repeatable daily quests');
  console.log('  ❌ DELETE: Common/Uncommon/Rare/Epic equipment quests');
  console.log('  ❌ DELETE: Consumable reward quests');
  console.log('  ❌ DELETE: Quests with no item rewards (non-repeatable)\n');

  try {
    // Get all quests and categorize them
    const quests = await db.execute(`
      SELECT 
        q.id,
        q.name,
        q.region_id,
        q.min_level,
        q.repeatable,
        i.name as reward_item,
        i.type as item_type,
        i.rarity,
        i.teaches_ability_id,
        (SELECT COUNT(*) FROM quest_rewards WHERE quest_id = q.id AND reward_type = 'item') as has_item_reward
      FROM quests q
      LEFT JOIN quest_rewards qr ON q.id = qr.quest_id AND qr.reward_type = 'item'
      LEFT JOIN items i ON qr.reward_item_id = i.id
      ORDER BY q.id
    `);

    const questsToKeep = new Set();
    const questsToDelete = new Set();
    const seenQuests = new Set();

    for (const row of quests.rows) {
      if (seenQuests.has(row.id)) continue;
      seenQuests.add(row.id);

      const questId = row.id;
      const isScroll = row.teaches_ability_id !== null;
      const isLegendary = row.rarity === 'legendary';
      const isRepeatable = row.repeatable === 1;
      const hasItemReward = row.has_item_reward > 0;

      // Decision logic
      if (isScroll) {
        // KEEP: All scroll quests (teach abilities)
        questsToKeep.add(questId);
      } else if (isLegendary) {
        // KEEP: Legendary equipment quests
        questsToKeep.add(questId);
      } else if (isRepeatable && !hasItemReward) {
        // KEEP: Repeatable dailies (XP/Gold only)
        questsToKeep.add(questId);
      } else {
        // DELETE: Everything else (common/uncommon/rare/epic/consumable)
        questsToDelete.add(questId);
      }
    }

    console.log('📊 Analysis Complete:\n');
    console.log(`  Total quests analyzed: ${seenQuests.size}`);
    console.log(`  ✅ Quests to KEEP: ${questsToKeep.size}`);
    console.log(`  🗑️  Quests to DELETE: ${questsToDelete.size}`);
    console.log(`  📉 Reduction: ${((questsToDelete.size / seenQuests.size) * 100).toFixed(1)}%\n`);

    // Show breakdown of what we're keeping
    const keepBreakdown = await db.execute(`
      SELECT 
        CASE
          WHEN i.teaches_ability_id IS NOT NULL THEN 'Scroll'
          WHEN i.rarity = 'legendary' THEN 'Legendary'
          WHEN q.repeatable = 1 AND qr_item.id IS NULL THEN 'Daily'
          ELSE 'Other'
        END as category,
        COUNT(DISTINCT q.id) as count
      FROM quests q
      LEFT JOIN quest_rewards qr ON q.id = qr.quest_id AND qr.reward_type = 'item'
      LEFT JOIN items i ON qr.reward_item_id = i.id
      LEFT JOIN quest_rewards qr_item ON q.id = qr_item.quest_id AND qr_item.reward_type = 'item'
      WHERE q.id IN (${Array.from(questsToKeep).join(',')})
      GROUP BY category
    `);

    console.log('✅ Keeping:');
    for (const row of keepBreakdown.rows) {
      console.log(`  ${row.category}: ${row.count} quests`);
    }

    // Confirm before deletion
    console.log('\n⚠️  Ready to delete ' + questsToDelete.size + ' quests...\n');

    let deletedCount = 0;
    const deleteArray = Array.from(questsToDelete);
    
    // Delete in batches
    for (let i = 0; i < deleteArray.length; i += 50) {
      const batch = deleteArray.slice(i, i + 50);
      const placeholders = batch.map(() => '?').join(',');

      // Delete character quest objectives
      await db.execute({
        sql: `DELETE FROM character_quest_objectives 
              WHERE character_quest_id IN (
                SELECT id FROM character_quests WHERE quest_id IN (${placeholders})
              )`,
        args: batch
      });

      // Delete character quests
      await db.execute({
        sql: `DELETE FROM character_quests WHERE quest_id IN (${placeholders})`,
        args: batch
      });

      // Delete quest rewards
      await db.execute({
        sql: `DELETE FROM quest_rewards WHERE quest_id IN (${placeholders})`,
        args: batch
      });

      // Delete quest objectives
      await db.execute({
        sql: `DELETE FROM quest_objectives WHERE quest_id IN (${placeholders})`,
        args: batch
      });

      // Delete quests
      await db.execute({
        sql: `DELETE FROM quests WHERE id IN (${placeholders})`,
        args: batch
      });

      deletedCount += batch.length;
      console.log(`  Deleted ${deletedCount}/${questsToDelete.size} quests...`);
    }

    console.log('\n✅ Deletion complete!\n');

    // Verify final counts
    const finalCount = await db.execute('SELECT COUNT(*) as count FROM quests');
    const scrollCount = await db.execute(`
      SELECT COUNT(DISTINCT q.id) as count 
      FROM quests q 
      JOIN quest_rewards qr ON q.id = qr.quest_id 
      JOIN items i ON qr.reward_item_id = i.id 
      WHERE i.teaches_ability_id IS NOT NULL
    `);
    const legendaryCount = await db.execute(`
      SELECT COUNT(DISTINCT q.id) as count 
      FROM quests q 
      JOIN quest_rewards qr ON q.id = qr.quest_id 
      JOIN items i ON qr.reward_item_id = i.id 
      WHERE i.rarity = 'legendary'
    `);
    const dailyCount = await db.execute(`
      SELECT COUNT(*) as count 
      FROM quests 
      WHERE repeatable = 1
    `);

    console.log('='.repeat(80));
    console.log('FINAL QUEST COUNTS');
    console.log('='.repeat(80));
    console.log(`\n📊 Total quests remaining: ${finalCount.rows[0].count}`);
    console.log(`  📜 Scroll quests: ${scrollCount.rows[0].count}`);
    console.log(`  🏆 Legendary equipment: ${legendaryCount.rows[0].count}`);
    console.log(`  💰 Repeatable dailies: ${dailyCount.rows[0].count}`);
    console.log(`\n✅ Cleanup successful!\n`);

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

aggressiveQuestCleanup();
