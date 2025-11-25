import { json } from '@solidjs/router';
import type { APIEvent } from '@solidjs/start/server';
import { db } from "~/lib/db";

export async function POST(event: APIEvent) {
  const request = event.request;
  try {
    const { characterId, itemIds } = await request.json();

    if (!characterId || !itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return json({ error: "Invalid request" }, { status: 400 });
    }

    // Get character's current gold
    const charResult = await db.execute({
      sql: "SELECT gold FROM characters WHERE id = ?",
      args: [characterId]
    });

    if (charResult.rows.length === 0) {
      return json({ error: "Character not found" }, { status: 404 });
    }

    let currentGold = Number(charResult.rows[0].gold);

    // Get all items to sell
    const placeholders = itemIds.map(() => '?').join(',');
    const itemsResult = await db.execute({
      sql: `SELECT character_inventory.id, items.value, character_inventory.quantity 
            FROM character_inventory 
            JOIN items ON character_inventory.item_id = items.id 
            WHERE character_inventory.character_id = ? 
            AND character_inventory.id IN (${placeholders}) 
            AND character_inventory.equipped = 0`,
      args: [characterId, ...itemIds]
    });

    if (itemsResult.rows.length === 0) {
      return json({ error: "No valid items to sell" }, { status: 400 });
    }

    // Calculate total gold from all items
    let totalGold = 0;
    const itemsToDelete: number[] = [];

    for (const row of itemsResult.rows) {
      const itemValue = Number(row.value) || 0;
      const quantity = Number(row.quantity) || 1;
      
      if (itemValue > 0) {
        // Sell at 40% of value
        totalGold += Math.floor(itemValue * 0.4) * quantity;
        itemsToDelete.push(Number(row.id));
      }
    }

    if (totalGold === 0) {
      return json({ error: "No items with value to sell" }, { status: 400 });
    }

    // Delete all sold items
    const deletePlaceholders = itemsToDelete.map(() => '?').join(',');
    await db.execute({
      sql: `DELETE FROM character_inventory WHERE id IN (${deletePlaceholders})`,
      args: itemsToDelete
    });

    // Update character's gold
    const newGold = currentGold + totalGold;
    await db.execute({
      sql: "UPDATE characters SET gold = ? WHERE id = ?",
      args: [newGold, characterId]
    });

    return json({
      success: true,
      goldEarned: totalGold,
      newGold: newGold,
      itemsSold: itemsToDelete.length
    });
  } catch (error) {
    console.error("Bulk sell error:", error);
    return json({ error: "Failed to sell items" }, { status: 500 });
  }
}
