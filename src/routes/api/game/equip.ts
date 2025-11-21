import { json } from '@solidjs/router';
import type { APIEvent } from '@solidjs/start/server';
import { equipItem, unequipItem, getInventory } from '~/lib/game';

export async function POST(event: APIEvent) {
  try {
    const body = await event.request.json();
    const { characterId, inventoryItemId, equipped } = body;

    if (equipped) {
      await unequipItem(inventoryItemId);
    } else {
      await equipItem(characterId, inventoryItemId);
    }

    // Get the updated inventory to return
    const updatedInventory = await getInventory(characterId);

    return json({ success: true, inventory: updatedInventory });
  } catch (error: any) {
    console.error('Equip error:', error);
    return json({ error: error.message }, { status: 400 });
  }
}
