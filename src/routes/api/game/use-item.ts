import { json } from '@solidjs/router';
import type { APIEvent } from '@solidjs/start/server';
import { useItem, getInventory } from '~/lib/game';

export async function POST(event: APIEvent) {
  try {
    const body = await event.request.json();
    const { characterId, inventoryItemId } = body;

    const result = await useItem(characterId, inventoryItemId);
    
    // Get updated inventory
    const inventory = await getInventory(characterId);

    return json({ 
      success: true, 
      character: result.character,
      healthRestored: result.healthRestored,
      manaRestored: result.manaRestored,
      inventory 
    });
  } catch (error: any) {
    console.error('Use item error:', error);
    return json({ error: error.message }, { status: 400 });
  }
}
