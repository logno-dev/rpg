import { json } from '@solidjs/router';
import type { APIEvent } from '@solidjs/start/server';
import { getUser } from '~/lib/auth';
import { advanceDungeonEncounter } from '~/lib/game';

export async function POST({ request }: APIEvent) {
  try {
    const user = await getUser(request);
    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { characterId } = body;

    if (!characterId) {
      return json({ error: 'Missing characterId' }, { status: 400 });
    }

    const result = await advanceDungeonEncounter(characterId);

    return json(result);
  } catch (error: any) {
    console.error('Advance dungeon error:', error);
    return json({ error: error.message || 'Failed to advance dungeon' }, { status: 500 });
  }
}
