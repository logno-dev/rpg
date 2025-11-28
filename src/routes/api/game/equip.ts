import { json } from '@solidjs/router';
import type { APIEvent } from '@solidjs/start/server';
import { equipItem, unequipItem, getInventory, checkEquipConflict } from '~/lib/game';

export async function POST(event: APIEvent) {
  try {
    const body = await event.request.json();
    const { characterId, inventoryItemId, equipped, confirm } = body;

    if (equipped) {
      // Unequipping - no confirmation needed
      await unequipItem(inventoryItemId);
    } else {
      // Check if this would cause a conflict
      const conflict = await checkEquipConflict(characterId, inventoryItemId);
      
      // If there's a conflict and user hasn't confirmed, ask for confirmation
      if (conflict && !confirm) {
        return json({ 
          requiresConfirmation: true, 
          conflict,
          message: `Equipping this item will unequip your ${conflict.name}. Continue?`
        });
      }

      // Equip the item (with or without conflict, user has confirmed)
      const result = await equipItem(characterId, inventoryItemId);
      
      // Get the updated inventory to return
      const updatedInventory = await getInventory(characterId);

      return json({ 
        success: true, 
        inventory: updatedInventory,
        unequippedItem: result.unequippedItem 
      });
    }

    // For unequip, also return updated inventory
    const updatedInventory = await getInventory(characterId);
    return json({ success: true, inventory: updatedInventory });
    
  } catch (error: any) {
    console.error('Equip error:', error);
    return json({ error: error.message }, { status: 400 });
  }
}
