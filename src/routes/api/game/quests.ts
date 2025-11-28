import { json } from '@solidjs/router';
import type { APIEvent } from '@solidjs/start/server';
import { getQuestsInRegion, getActiveQuests } from '~/lib/game';

export async function GET(event: APIEvent) {
  const characterId = parseInt(event.request.headers.get('x-character-id') || '0');
  if (!characterId) {
    return json({ error: 'Character ID required' }, { status: 400 });
  }

  const url = new URL(event.request.url);
  const regionId = url.searchParams.get('regionId');
  const activeOnly = url.searchParams.get('active') === 'true';

  try {
    if (activeOnly) {
      const quests = await getActiveQuests(characterId);
      return json({ quests });
    } else if (regionId) {
      const quests = await getQuestsInRegion(parseInt(regionId), characterId);
      return json({ quests });
    } else {
      return json({ error: 'regionId or active parameter required' }, { status: 400 });
    }
  } catch (error: any) {
    return json({ error: error.message }, { status: 400 });
  }
}
