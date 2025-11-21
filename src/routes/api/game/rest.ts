import { json } from '@solidjs/router';
import type { APIEvent } from '@solidjs/start/server';
import { restCharacter } from '~/lib/game';

export async function POST(event: APIEvent) {
  try {
    const body = await event.request.json();
    const { characterId } = body;

    const result = await restCharacter(characterId);
    return json(result);
  } catch (error: any) {
    console.error('Rest error:', error);
    return json({ error: error.message }, { status: 400 });
  }
}
