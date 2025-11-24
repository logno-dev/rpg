import { json } from '@solidjs/router';
import type { APIEvent } from '@solidjs/start/server';
import { db } from '~/lib/db';

export async function GET(event: APIEvent) {
  try {
    const url = new URL(event.request.url);
    const dungeonId = url.searchParams.get('dungeonId');
    
    if (!dungeonId) {
      return json({ error: 'Dungeon ID required' }, { status: 400 });
    }

    // Get dungeon info
    const dungeonResult = await db.execute({
      sql: 'SELECT * FROM dungeons WHERE id = ?',
      args: [parseInt(dungeonId)],
    });

    const dungeon = dungeonResult.rows[0];
    if (!dungeon) {
      return json({ error: 'Dungeon not found' }, { status: 404 });
    }

    // Get total encounters
    const encountersResult = await db.execute({
      sql: 'SELECT COUNT(*) as total FROM dungeon_encounters WHERE dungeon_id = ?',
      args: [parseInt(dungeonId)],
    });

    const totalEncounters = (encountersResult.rows[0] as any).total;

    return json({
      ...dungeon,
      total_encounters: totalEncounters
    });
  } catch (error: any) {
    console.error('Get dungeon info error:', error);
    return json({ error: error.message }, { status: 500 });
  }
}
