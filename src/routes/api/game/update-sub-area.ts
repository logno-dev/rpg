import { json } from '@solidjs/router';
import type { APIEvent } from '@solidjs/start/server';
import { setCharacterSubArea } from '~/lib/game';

export async function POST(event: APIEvent) {
  try {
    const body = await event.request.json();
    const { characterId, subAreaId } = body;

    if (!characterId) {
      return json({ error: 'Character ID is required' }, { status: 400 });
    }

    // Update character's current sub-area
    await setCharacterSubArea(characterId, subAreaId);
    
    return json({ success: true });
  } catch (error: any) {
    console.error('Update sub-area error:', error);
    return json({ error: error.message }, { status: 400 });
  }
}
