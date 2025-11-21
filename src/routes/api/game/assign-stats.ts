import { json } from '@solidjs/router';
import type { APIEvent } from '@solidjs/start/server';
import { assignStatPoints } from '~/lib/game';

export async function POST(event: APIEvent) {
  try {
    const body = await event.request.json();
    const { characterId, stats } = body;

    const character = await assignStatPoints(characterId, stats);

    return json({ success: true, character });
  } catch (error: any) {
    console.error('Assign stats error:', error);
    return json({ error: error.message }, { status: 400 });
  }
}
