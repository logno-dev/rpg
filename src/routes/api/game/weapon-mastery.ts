import { json } from '@solidjs/router';
import type { APIEvent } from '@solidjs/start/server';
import { getSelectedCharacter } from '~/lib/auth';
import { getAllWeaponMasteries } from '~/lib/game';

export async function GET(event: APIEvent) {
  try {
    const characterId = await getSelectedCharacter();
    
    if (!characterId) {
      return json({ error: 'No character selected' }, { status: 401 });
    }

    const masteries = await getAllWeaponMasteries(characterId);
    
    return json(masteries);
  } catch (error: any) {
    console.error('Get weapon mastery error:', error);
    return json({ error: error.message }, { status: 400 });
  }
}
