import { json } from '@solidjs/router';
import type { APIEvent } from '@solidjs/start/server';
import { getQuestDetails } from '~/lib/game';

export async function GET(event: APIEvent) {
  const characterId = parseInt(event.request.headers.get('x-character-id') || '0');
  if (!characterId) {
    return json({ error: 'Character ID required' }, { status: 400 });
  }

  const questId = parseInt(event.params.id);
  
  try {
    const quest = await getQuestDetails(questId, characterId);
    if (!quest) {
      return json({ error: 'Quest not found' }, { status: 404 });
    }
    return json({ quest });
  } catch (error: any) {
    return json({ error: error.message }, { status: 400 });
  }
}
