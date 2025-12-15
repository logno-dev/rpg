import { json } from '@solidjs/router';
import type { APIEvent } from '@solidjs/start/server';
import { getActiveCombat } from '~/lib/game';
import { db } from '~/lib/db';

export async function GET(event: APIEvent) {
  try {
    const url = new URL(event.request.url);
    const characterId = url.searchParams.get('characterId');

    if (!characterId) {
      return json({ error: 'Character ID required' }, { status: 400 });
    }

    const combatSession = await getActiveCombat(parseInt(characterId));
    
    if (!combatSession) {
      return json({ hasActiveCombat: false });
    }

    // Additional validation: If this is dungeon combat, verify the dungeon is still active
    if (combatSession.is_dungeon) {
      const dungeonProgressResult = await db.execute({
        sql: 'SELECT * FROM character_dungeon_progress WHERE character_id = ? AND status = ?',
        args: [parseInt(characterId), 'active'],
      });
      
      if (dungeonProgressResult.rows.length === 0) {
        // Dungeon is no longer active, clean up the stale combat session
        await db.execute({
          sql: 'UPDATE combat_sessions SET status = ? WHERE id = ?',
          args: ['stale', combatSession.id],
        });
        return json({ hasActiveCombat: false });
      }
    }

    // Get the mob or named mob details
    let mob = null;
    if (combatSession.named_mob_id) {
      const namedMobResult = await db.execute({
        sql: 'SELECT * FROM named_mobs WHERE id = ?',
        args: [combatSession.named_mob_id],
      });
      mob = namedMobResult.rows[0];
    } else if (combatSession.mob_id) {
      const mobResult = await db.execute({
        sql: 'SELECT * FROM mobs WHERE id = ?',
        args: [combatSession.mob_id],
      });
      mob = mobResult.rows[0];
    }

    if (!mob) {
      // Mob not found, clean up stale session
      await db.execute({
        sql: 'UPDATE combat_sessions SET status = ? WHERE id = ?',
        args: ['stale', combatSession.id],
      });
      return json({ hasActiveCombat: false });
    }

    return json({
      hasActiveCombat: true,
      session: combatSession,
      mob,
    });
  } catch (error: any) {
    console.error('Get active combat error:', error);
    return json({ error: error.message }, { status: 500 });
  }
}
