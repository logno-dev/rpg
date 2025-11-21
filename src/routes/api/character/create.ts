import { json } from '@solidjs/router';
import type { APIEvent } from '@solidjs/start/server';
import { getUser } from '~/lib/auth';
import { createCharacter } from '~/lib/game';

export async function POST(event: APIEvent) {
  try {
    const user = await getUser();
    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await event.request.json();
    const { name, strength, dexterity, constitution, intelligence, wisdom, charisma } = body;

    if (!name || !strength || !dexterity || !constitution || !intelligence || !wisdom || !charisma) {
      return json({ error: 'All fields are required' }, { status: 400 });
    }

    const character = await createCharacter(user.id, name, {
      strength: parseInt(strength),
      dexterity: parseInt(dexterity),
      constitution: parseInt(constitution),
      intelligence: parseInt(intelligence),
      wisdom: parseInt(wisdom),
      charisma: parseInt(charisma),
    });

    return json({ success: true, characterId: character.id });
  } catch (error: any) {
    console.error('Create character error:', error);
    return json({ error: error.message }, { status: 400 });
  }
}
