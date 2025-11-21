import { json } from '@solidjs/router';
import type { APIEvent } from '@solidjs/start/server';
import { getUser } from '~/lib/auth';
import { startDungeon } from '~/lib/game';

export async function POST({ request }: APIEvent) {
  try {
    const user = await getUser(request);
    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { characterId, dungeonId } = body;

    if (!characterId || !dungeonId) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await startDungeon(characterId, dungeonId);

    return json(result);
  } catch (error: any) {
    console.error('Start dungeon error:', error);
    return json({ error: error.message || 'Failed to start dungeon' }, { status: 500 });
  }
}
