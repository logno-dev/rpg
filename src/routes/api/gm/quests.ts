import { APIEvent } from '@solidjs/start/server';
import { requireGM } from '~/lib/gm';
import { db } from '~/lib/db';

export async function GET() {
  try {
    await requireGM();
    
    const result = await db.execute({
      sql: `SELECT 
              q.id,
              q.name,
              q.description,
              q.region_id,
              q.min_level,
              q.repeatable,
              q.cooldown_hours,
              q.chain_id,
              q.chain_order,
              r.name as region_name
            FROM quests q
            LEFT JOIN regions r ON q.region_id = r.id
            ORDER BY q.region_id, q.min_level, q.name`,
      args: [],
    });
    
    // Fetch rewards for all quests
    const questsWithRewards = await Promise.all(
      result.rows.map(async (quest: any) => {
        const rewardsResult = await db.execute({
          sql: `SELECT * FROM quest_rewards WHERE quest_id = ?`,
          args: [quest.id],
        });
        return {
          ...quest,
          rewards: rewardsResult.rows,
        };
      })
    );
    
    return new Response(JSON.stringify({ quests: questsWithRewards }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: err.message.includes('Unauthorized') ? 403 : 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(event: APIEvent) {
  try {
    await requireGM();
    
    const body = await event.request.json();
    const { quest, objectives, rewards } = body;
    
    // Insert quest
    const questResult = await db.execute({
      sql: `INSERT INTO quests (name, description, region_id, min_level, repeatable, cooldown_hours, chain_id, chain_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        quest.name,
        quest.description,
        quest.region_id,
        quest.min_level,
        quest.repeatable || 0,
        quest.cooldown_hours || 0,
        quest.chain_id || null,
        quest.chain_order || null,
      ],
    });
    
    const questId = questResult.lastInsertRowid;
    
    // Insert objectives
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
    
    // Insert rewards
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
    
    return new Response(JSON.stringify({ success: true, questId }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Error creating quest:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: err.message.includes('Unauthorized') ? 403 : 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
