import { APIEvent } from '@solidjs/start/server';
import { requireGM } from '~/lib/gm';
import { db } from '~/lib/db';

export async function GET(event: APIEvent) {
  try {
    await requireGM();
    
    const questId = event.params.id;
    
    // Get quest details
    const questResult = await db.execute({
      sql: `SELECT 
              q.id,
              q.name,
              q.description,
              q.region_id,
              q.min_level,
              q.repeatable,
              q.cooldown_hours,
              q.chain_id,
              q.chain_order
            FROM quests q
            WHERE q.id = ?`,
      args: [questId],
    });
    
    if (questResult.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Quest not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Get objectives
    const objectivesResult = await db.execute({
      sql: `SELECT *
            FROM quest_objectives
            WHERE quest_id = ?
            ORDER BY objective_order`,
      args: [questId],
    });
    
    // Get rewards
    const rewardsResult = await db.execute({
      sql: `SELECT *
            FROM quest_rewards
            WHERE quest_id = ?`,
      args: [questId],
    });
    
    return new Response(JSON.stringify({ 
      quest: questResult.rows[0],
      objectives: objectivesResult.rows,
      rewards: rewardsResult.rows
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: err.message.includes('Unauthorized') ? 403 : 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PUT(event: APIEvent) {
  try {
    await requireGM();
    
    const questId = event.params.id;
    const body = await event.request.json();
    const { quest, objectives, rewards } = body;
    
    // Update quest
    await db.execute({
      sql: `UPDATE quests 
            SET name = ?, description = ?, region_id = ?, min_level = ?, repeatable = ?, cooldown_hours = ?, chain_id = ?, chain_order = ?
            WHERE id = ?`,
      args: [
        quest.name,
        quest.description,
        quest.region_id,
        quest.min_level,
        quest.repeatable || 0,
        quest.cooldown_hours || 0,
        quest.chain_id || null,
        quest.chain_order || null,
        questId,
      ],
    });
    
    // Delete existing objectives
    await db.execute({
      sql: `DELETE FROM quest_objectives WHERE quest_id = ?`,
      args: [questId],
    });
    
    // Insert new objectives
    if (objectives && objectives.length > 0) {
      for (const obj of objectives) {
        await db.execute({
          sql: `INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_mob_id, target_item_id, target_region_id, target_sub_area_id, required_count, auto_complete)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            questId,
            obj.objective_order,
            obj.type,
            obj.description,
            obj.target_mob_id || null,
            obj.target_item_id || null,
            obj.target_region_id || null,
            obj.target_sub_area_id || null,
            obj.required_count,
            obj.auto_complete !== undefined ? obj.auto_complete : 1,
          ],
        });
      }
    }
    
    // Delete existing rewards
    await db.execute({
      sql: `DELETE FROM quest_rewards WHERE quest_id = ?`,
      args: [questId],
    });
    
    // Insert new rewards
    if (rewards && rewards.length > 0) {
      for (const reward of rewards) {
        await db.execute({
          sql: `INSERT INTO quest_rewards (quest_id, reward_type, reward_item_id, reward_material_id, reward_amount)
                VALUES (?, ?, ?, ?, ?)`,
          args: [
            questId,
            reward.reward_type,
            reward.reward_item_id || null,
            reward.reward_material_id || null,
            reward.reward_amount,
          ],
        });
      }
    }
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Error updating quest:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: err.message.includes('Unauthorized') ? 403 : 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE(event: APIEvent) {
  try {
    await requireGM();
    
    const questId = event.params.id;
    
    // Delete objectives first (foreign key)
    await db.execute({
      sql: `DELETE FROM quest_objectives WHERE quest_id = ?`,
      args: [questId],
    });
    
    // Delete rewards
    await db.execute({
      sql: `DELETE FROM quest_rewards WHERE quest_id = ?`,
      args: [questId],
    });
    
    // Delete quest progress
    await db.execute({
      sql: `DELETE FROM character_quest_progress WHERE quest_id = ?`,
      args: [questId],
    });
    
    // Delete active quests
    await db.execute({
      sql: `DELETE FROM character_quests WHERE quest_id = ?`,
      args: [questId],
    });
    
    // Delete quest history
    await db.execute({
      sql: `DELETE FROM quest_history WHERE quest_id = ?`,
      args: [questId],
    });
    
    // Finally delete the quest
    await db.execute({
      sql: `DELETE FROM quests WHERE id = ?`,
      args: [questId],
    });
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Error deleting quest:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: err.message.includes('Unauthorized') ? 403 : 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
