import { json } from '@solidjs/router';
import type { APIEvent } from '@solidjs/start/server';
import { turnInQuest, getCharacter } from '~/lib/game';

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

    const result = await turnInQuest(characterId, questId);
    
    // Get updated character to return to frontend
    const character = await getCharacter(characterId);
    
    return json({ 
      success: true, 
      rewards: result.rewards, 
      repeatable: result.repeatable,
      character: character
    });
  } catch (error: any) {
    return json({ error: error.message }, { status: 400 });
  }
}
