import { json } from '@solidjs/router';
import type { APIEvent } from '@solidjs/start/server';
import { sellItem, getInventory } from '~/lib/game';

export async function POST(event: APIEvent) {
  try {
    const body = await event.request.json();
    const { characterId, inventoryItemId, quantity = 1 } = body;

    const result = await sellItem(characterId, inventoryItemId, quantity);
    
    // Get updated inventory
    const inventory = await getInventory(characterId);

    return json({ 
      success: true, 
      goldGained: result.goldGained,
      character: result.character,
      inventory 
    });
  } catch (error: any) {
    console.error('Sell error:', error);
    return json({ error: error.message }, { status: 400 });
  }
}
