import { json } from '@solidjs/router';
import { getRequestEvent } from 'solid-js/web';
import { db } from '~/lib/db';
import { getInventory } from '~/lib/game';

export async function POST() {
  'use server';
  
  const event = getRequestEvent();
  if (!event) {
    return json({ error: 'No request event' }, { status: 400 });
  }

  const body = await event.request.json();
  const { characterId, inventoryItemId, quantity } = body;

  if (!characterId || !inventoryItemId) {
    return json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    // Get the inventory item
    const inventoryResult = await db.execute({
      sql: 'SELECT * FROM character_inventory WHERE id = ? AND character_id = ?',
      args: [inventoryItemId, characterId],
    });

    if (inventoryResult.rows.length === 0) {
      return json({ error: 'Item not found in inventory' }, { status: 404 });
    }

    const inventoryItem = inventoryResult.rows[0] as any;
    const itemQuantity = inventoryItem.quantity ?? 1;
    const quantityToDrop = quantity || itemQuantity;

    // Don't allow dropping equipped items
    if (inventoryItem.equipped === 1) {
      return json({ error: 'Cannot drop equipped items. Unequip first.' }, { status: 400 });
    }

    // If dropping partial quantity, update the quantity
    if (quantityToDrop < itemQuantity) {
      await db.execute({
        sql: 'UPDATE character_inventory SET quantity = quantity - ? WHERE id = ?',
        args: [quantityToDrop, inventoryItemId],
      });
    } else {
      // Otherwise, delete the inventory entry
      await db.execute({
        sql: 'DELETE FROM character_inventory WHERE id = ?',
        args: [inventoryItemId],
      });
    }

    // Get updated inventory
    const updatedInventory = await getInventory(characterId);

    return json({
      success: true,
      inventory: updatedInventory,
      message: `Dropped ${quantityToDrop}x item`,
    });
  } catch (error: any) {
    console.error('Drop item error:', error);
    return json({ error: error.message || 'Failed to drop item' }, { status: 500 });
  }
}
