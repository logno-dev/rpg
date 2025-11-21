import { json } from '@solidjs/router';
import type { APIEvent } from '@solidjs/start/server';
import { db } from '~/lib/db';

export async function POST(event: APIEvent) {
  try {
    const body = await event.request.json();
    const { characterId, health, mana } = body;

    await db.execute({
      sql: 'UPDATE characters SET current_health = ?, current_mana = ? WHERE id = ?',
      args: [health, mana, characterId],
    });

    return json({ success: true });
  } catch (error: any) {
    console.error('Update health error:', error);
    return json({ error: error.message }, { status: 400 });
  }
}
