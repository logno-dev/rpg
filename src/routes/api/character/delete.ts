import { json } from '@solidjs/router';
import type { APIEvent } from '@solidjs/start/server';
import { getUser } from '~/lib/auth';
import { db } from '~/lib/db';

export async function POST(event: APIEvent) {
  try {
    const user = await getUser();
    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await event.request.json();
    const { characterId } = body;

    if (!characterId) {
      return json({ error: 'Character ID is required' }, { status: 400 });
    }

    // Verify the character belongs to the user
    const characterResult = await db.execute({
      sql: 'SELECT id, user_id FROM characters WHERE id = ?',
      args: [characterId],
    });

    const character = characterResult.rows[0] as any;
    
    if (!character) {
      return json({ error: 'Character not found' }, { status: 404 });
    }

    if (character.user_id !== user.id) {
      return json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete related records that don't have CASCADE
    // These need to be deleted manually in the correct order
    
    // Delete quest objectives first (references character_quests)
    await db.execute({
      sql: 'DELETE FROM character_quest_objectives WHERE character_quest_id IN (SELECT id FROM character_quests WHERE character_id = ?)',
      args: [characterId],
    });
    
    // Delete character quests
    await db.execute({
      sql: 'DELETE FROM character_quests WHERE character_id = ?',
      args: [characterId],
    });
    
    // Delete dungeon progress
    await db.execute({
      sql: 'DELETE FROM character_dungeon_progress WHERE character_id = ?',
      args: [characterId],
    });
    
    // Delete named mob defeats
    await db.execute({
      sql: 'DELETE FROM character_named_mob_defeats WHERE character_id = ?',
      args: [characterId],
    });
    
    // Delete combat sessions (if any)
    await db.execute({
      sql: 'DELETE FROM combat_sessions WHERE character_id = ?',
      args: [characterId],
    });

    // Now delete the character (CASCADE will handle the rest)
    await db.execute({
      sql: 'DELETE FROM characters WHERE id = ?',
      args: [characterId],
    });

    return json({ success: true });
  } catch (error: any) {
    console.error('Delete character error:', error);
    return json({ error: error.message }, { status: 500 });
  }
}
