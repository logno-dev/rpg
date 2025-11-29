import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function deleteConsumableQuests() {
  console.log('🗑️  Deleting consumable collection quests...\n');

  try {
    // Quest IDs to delete
    const questsToDelete = [172, 232]; // "Gather Bread" and "Gather Health Potion"
    
    for (const questId of questsToDelete) {
      // Get quest name first
      const quest = await db.execute({
        sql: 'SELECT name FROM quests WHERE id = ?',
        args: [questId],
      });
      
      if (quest.rows.length === 0) {
        console.log(`  ⚠️  Quest ${questId} not found, skipping...`);
        continue;
      }
      
      const questName = quest.rows[0].name;
      console.log(`\n📋 Deleting quest: "${questName}" (ID: ${questId})`);
      
      // Delete character quest objectives progress
      const charQuestObjResult = await db.execute({
        sql: `DELETE FROM character_quest_objectives 
              WHERE character_quest_id IN (SELECT id FROM character_quests WHERE quest_id = ?)`,
        args: [questId],
      });
      console.log(`  ✓ Deleted ${charQuestObjResult.rowsAffected} character quest objective progress entries`);
      
      // Delete character quests
      const charQuestResult = await db.execute({
        sql: 'DELETE FROM character_quests WHERE quest_id = ?',
        args: [questId],
      });
      console.log(`  ✓ Deleted ${charQuestResult.rowsAffected} character quest entries`);
      
      // Delete quest rewards
      const rewardsResult = await db.execute({
        sql: 'DELETE FROM quest_rewards WHERE quest_id = ?',
        args: [questId],
      });
      console.log(`  ✓ Deleted ${rewardsResult.rowsAffected} quest rewards`);
      
      // Delete quest objectives
      const objectivesResult = await db.execute({
        sql: 'DELETE FROM quest_objectives WHERE quest_id = ?',
        args: [questId],
      });
      console.log(`  ✓ Deleted ${objectivesResult.rowsAffected} quest objectives`);
      
      // Delete the quest itself
      const questResult = await db.execute({
        sql: 'DELETE FROM quests WHERE id = ?',
        args: [questId],
      });
      console.log(`  ✓ Deleted quest "${questName}"`);
    }
    
    console.log('\n✅ Consumable collection quests deleted!\n');
    console.log('Summary:');
    console.log('  • Deleted "Gather Bread" quest');
    console.log('  • Deleted "Gather Health Potion" quest');
    console.log('  • Cleaned up all related quest data (objectives, rewards, character progress)\n');
    console.log('Reason: These quests asked players to collect consumables (Bread, Health Potions)');
    console.log('        which doesn\'t make thematic sense for quest objectives.\n');

  } catch (error) {
    console.error('❌ Error deleting quests:', error);
    throw error;
  }
}

deleteConsumableQuests();
