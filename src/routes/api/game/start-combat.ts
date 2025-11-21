import { json } from '@solidjs/router';
import type { APIEvent } from '@solidjs/start/server';
import { startCombat, startNamedMobCombat } from '~/lib/game';

export async function POST(event: APIEvent) {
  try {
    const body = await event.request.json();
    const { characterId, mobId, namedMobId } = body;

    // If namedMobId is provided, start named mob combat
    if (namedMobId) {
      const result = await startNamedMobCombat(characterId, namedMobId, false);
      return json(result);
    }

    // Otherwise start regular mob combat
    const result = await startCombat(characterId, mobId);
    return json(result);
  } catch (error: any) {
    console.error('Start combat error:', error);
    return json({ error: error.message }, { status: 400 });
  }
}
