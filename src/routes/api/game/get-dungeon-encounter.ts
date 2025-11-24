import { json } from '@solidjs/router';
import type { APIEvent } from '@solidjs/start/server';
import { getUser } from '~/lib/auth';
import { db } from '~/lib/db';
import { getNamedMob } from '~/lib/game';

export async function POST(event: APIEvent) {
  try {
    const user = await getUser();
    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await event.request.json();
    const { characterId } = body;

    if (!characterId) {
      return json({ error: 'Missing characterId' }, { status: 400 });
    }

    // Get active dungeon progress
    const progressResult = await db.execute({
      sql: `SELECT 
              character_dungeon_progress.*, 
              dungeons.name as dungeon_name,
              dungeons.boss_mob_id,
              (SELECT COUNT(*) FROM dungeon_encounters WHERE dungeon_id = character_dungeon_progress.dungeon_id) as total_encounters
            FROM character_dungeon_progress
            JOIN dungeons ON character_dungeon_progress.dungeon_id = dungeons.id
            WHERE character_dungeon_progress.character_id = ? AND character_dungeon_progress.status = ?`,
      args: [characterId, 'active'],
    });

    if (progressResult.rows.length === 0) {
      return json({ error: 'No active dungeon' }, { status: 400 });
    }

    const progress = progressResult.rows[0] as any;

    // Get the current encounter
    const encounterResult = await db.execute({
      sql: 'SELECT * FROM dungeon_encounters WHERE dungeon_id = ? AND encounter_order = ?',
      args: [progress.dungeon_id, progress.current_encounter],
    });

    if (encounterResult.rows.length === 0) {
      return json({ error: 'Encounter not found' }, { status: 400 });
    }

    const encounter = encounterResult.rows[0] as any;

    // Check if this is a boss encounter
    if (encounter.is_boss) {
      const namedMob = await getNamedMob(progress.boss_mob_id);
      if (!namedMob) {
        return json({ error: 'Boss not found' }, { status: 400 });
      }

      return json({
        mob: namedMob,
        namedMob,
        isBoss: true,
        progress: {
          current: progress.current_encounter,
          total: progress.total_encounters
        }
      });
    } else {
      // Regular mob
      const mobResult = await db.execute({
        sql: 'SELECT * FROM mobs WHERE id = ?',
        args: [encounter.mob_id],
      });

      const mob = mobResult.rows[0];
      if (!mob) {
        return json({ error: 'Mob not found' }, { status: 400 });
      }

      return json({
        mob,
        isBoss: false,
        progress: {
          current: progress.current_encounter,
          total: progress.total_encounters
        }
      });
    }
  } catch (error: any) {
    console.error('Get dungeon encounter error:', error);
    return json({ error: error.message || 'Failed to get encounter' }, { status: 500 });
  }
}
