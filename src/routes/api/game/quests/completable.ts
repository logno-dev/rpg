import { json } from '@solidjs/router';
import type { APIEvent } from '@solidjs/start/server';
import { hasCompletableQuests } from '~/lib/game';

export async function GET(event: APIEvent) {
  const characterId = parseInt(event.request.headers.get('x-character-id') || '0');
  if (!characterId) {
    return json({ error: 'Character ID required' }, { status: 400 });
  }

  try {
    const hasCompletable = await hasCompletableQuests(characterId);
    return json({ hasCompletable });
  } catch (error: any) {
    return json({ error: error.message }, { status: 400 });
  }
}
