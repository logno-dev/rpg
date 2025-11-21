import { json } from '@solidjs/router';
import type { APIEvent } from '@solidjs/start/server';
import { processCombatRound } from '~/lib/game';

export async function POST(event: APIEvent) {
  try {
    const body = await event.request.json();
    const { combatId, abilityId } = body;

    const result = await processCombatRound(combatId, abilityId);
    return json(result);
  } catch (error: any) {
    console.error('Attack error:', error);
    return json({ error: error.message }, { status: 400 });
  }
}
