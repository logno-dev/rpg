import { json } from '@solidjs/router';
import type { APIEvent } from '@solidjs/start/server';
import { getUser } from '~/lib/auth';
import { db } from '~/lib/db';

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

    // Close any active combat
    await db.execute({
      sql: 'UPDATE combat_sessions SET status = ? WHERE character_id = ? AND status = ?',
      args: ['defeat', characterId, 'active'],
    });

    // Mark dungeon as failed
    const result = await db.execute({
      sql: 'UPDATE character_dungeon_progress SET status = ?, updated_at = unixepoch() WHERE character_id = ? AND status = ?',
      args: ['failed', characterId, 'active'],
    });

    console.log('[ABANDON DUNGEON] Updated rows:', result.rowsAffected);

    return json({ success: true });
  } catch (error: any) {
    console.error('Abandon dungeon error:', error);
    return json({ error: error.message || 'Failed to abandon dungeon' }, { status: 500 });
  }
}
