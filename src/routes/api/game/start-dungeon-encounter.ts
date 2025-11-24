import { json } from '@solidjs/router';
import type { APIEvent } from '@solidjs/start/server';
import { db } from '~/lib/db';
import { getNamedMob, startCombat, startNamedMobCombat } from '~/lib/game';

export async function POST(event: APIEvent) {
  try {
    const body = await event.request.json();
    const { characterId, dungeonId, currentHealth, currentMana } = body;

    // Get active dungeon progress
    const progressResult = await db.execute({
      sql: 'SELECT * FROM character_dungeon_progress WHERE character_id = ? AND dungeon_id = ? AND status = ?',
      args: [characterId, dungeonId, 'active'],
    });

    const progress = progressResult.rows[0] as any;
    if (!progress) {
      return json({ error: 'No active dungeon progress' }, { status: 404 });
    }

    // Clean up any stale combat sessions before starting new encounter
    await db.execute({
      sql: 'DELETE FROM combat_sessions WHERE character_id = ? AND status = ?',
      args: [characterId, 'active'],
    });

    // Update session HP/mana before starting encounter
    await db.execute({
      sql: 'UPDATE character_dungeon_progress SET session_health = ?, session_mana = ? WHERE id = ?',
      args: [currentHealth, currentMana, progress.id],
    });

    // Get the current encounter
    const encounterResult = await db.execute({
      sql: 'SELECT * FROM dungeon_encounters WHERE dungeon_id = ? AND encounter_order = ?',
      args: [dungeonId, progress.current_encounter],
    });

    const encounter = encounterResult.rows[0] as any;
    if (!encounter) {
      return json({ error: 'Encounter not found' }, { status: 404 });
    }

    // Start combat based on encounter type
    if (encounter.is_boss) {
      // Boss encounter
      const namedMob = await getNamedMob(progress.boss_mob_id);
      if (!namedMob) {
        return json({ error: 'Boss not found' }, { status: 404 });
      }

      const combat = await startNamedMobCombat(characterId, progress.boss_mob_id, true);

      return json({
        encounter,
        combat,
        mob: namedMob,
        namedMob,
        isBoss: true
      });
    } else {
      // Regular mob encounter
      const mobResult = await db.execute({
        sql: 'SELECT * FROM mobs WHERE id = ?',
        args: [encounter.mob_id],
      });

      const mob = mobResult.rows[0];
      if (!mob) {
        return json({ error: 'Mob not found' }, { status: 404 });
      }

      const combat = await startCombat(characterId, encounter.mob_id, true);

      return json({
        encounter,
        combat,
        mob,
        isBoss: false
      });
    }
  } catch (error: any) {
    console.error('Start dungeon encounter error:', error);
    return json({ error: error.message }, { status: 500 });
  }
}
