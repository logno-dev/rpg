import { json } from '@solidjs/router';
import type { APIEvent } from '@solidjs/start/server';
import { acceptQuest } from '~/lib/game';

export async function POST(event: APIEvent) {
  const characterId = parseInt(event.request.headers.get('x-character-id') || '0');
  if (!characterId) {
    return json({ error: 'Character ID required' }, { status: 400 });
  }

  try {
    const body = await event.request.json();
    const { questId } = body;

    if (!questId) {
      return json({ error: 'Quest ID required' }, { status: 400 });
    }

    await acceptQuest(characterId, questId);
    return json({ success: true });
  } catch (error: any) {
    return json({ error: error.message }, { status: 400 });
  }
}
