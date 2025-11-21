import { json } from '@solidjs/router';
import type { APIEvent } from '@solidjs/start/server';
import { roamField } from '~/lib/game';

export async function POST(event: APIEvent) {
  try {
    const body = await event.request.json();
    const { characterId } = body;

    const result = await roamField(characterId);
    
    // Return the mobs array and aggro info
    return json({
      mobs: result.mobs,
      initiated: result.initiated,
      aggroMob: result.aggroMob,
    });
  } catch (error: any) {
    console.error('Roam error:', error);
    return json({ error: error.message }, { status: 400 });
  }
}
