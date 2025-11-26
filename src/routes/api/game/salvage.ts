import { json } from '@solidjs/router';
import type { APIEvent } from '@solidjs/start/server';
import { db } from '~/lib/db';

export async function POST(event: APIEvent) {
  try {
    const body = await event.request.json();
    const { characterId, inventoryItemId } = body;

    if (!characterId || !inventoryItemId) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the inventory item
    const invResult = await db.execute({
      sql: `SELECT ci.*, i.* 
            FROM character_inventory ci
            JOIN items i ON ci.item_id = i.id
            WHERE ci.id = ? AND ci.character_id = ?`,
      args: [inventoryItemId, characterId],
    });

    const invItem = invResult.rows[0] as any;
    if (!invItem) {
      return json({ error: 'Item not found in inventory' }, { status: 404 });
    }

    // Cannot salvage equipped items
    if (invItem.equipped) {
      return json({ error: 'Cannot salvage equipped items. Unequip first.' }, { status: 400 });
    }

    // Cannot salvage consumables or scrolls
    if (invItem.type === 'consumable' || invItem.type === 'scroll') {
      return json({ error: 'Cannot salvage consumables or scrolls' }, { status: 400 });
    }

    // Only armor and weapons can be salvaged
    if (invItem.type !== 'armor' && invItem.type !== 'weapon') {
      return json({ error: 'Only weapons and armor can be salvaged' }, { status: 400 });
    }

    // Look up recipe for this item
    const recipeResult = await db.execute({
      sql: `SELECT r.id as recipe_id, rm.material_id, rm.quantity, cm.name as material_name
            FROM recipes r
            JOIN recipe_materials rm ON r.id = rm.recipe_id
            JOIN crafting_materials cm ON rm.material_id = cm.id
            WHERE r.item_id = ?`,
      args: [invItem.item_id],
    });

    const materials: { id: number; name: string; quantity: number }[] = [];

    if (recipeResult.rows.length > 0) {
      // Item has a recipe - return 10-25% of materials (much less than crafting cost)
      const salvagePercent = 0.10 + Math.random() * 0.15; // 10-25%
      
      for (const row of recipeResult.rows as any[]) {
        const materialQuantity = Math.max(1, Math.floor(row.quantity * salvagePercent));
        materials.push({
          id: row.material_id,
          name: row.material_name,
          quantity: materialQuantity,
        });
      }
    } else {
      // No recipe found - use fallback system based on item type and rarity
      // Define material mappings based on item type
      const materialMap: { [key: string]: { common: number; uncommon: number; rare: number } } = {
        weapon: { common: 1, uncommon: 11, rare: 19 },  // Iron Ore, Steel Ingot, Adamantite Ore
        armor: { common: 3, uncommon: 13, rare: 18 },   // Rough Leather, Silk Cloth, Dragon Scale
      };

      const typeMapping = materialMap[invItem.type];
      if (!typeMapping) {
        return json({ 
          error: 'This item type cannot be salvaged' 
        }, { status: 400 });
      }

      // Determine quantity based on rarity
      let quantity = 1;
      let materialId = typeMapping.common;

      switch (invItem.rarity) {
        case 'common':
          quantity = 1 + Math.floor(Math.random() * 2); // 1-2
          materialId = typeMapping.common;
          break;
        case 'uncommon':
          quantity = 2 + Math.floor(Math.random() * 3); // 2-4
          materialId = typeMapping.common;
          break;
        case 'rare':
          quantity = 1 + Math.floor(Math.random() * 2); // 1-2
          materialId = typeMapping.uncommon;
          break;
        case 'epic':
          quantity = 2 + Math.floor(Math.random() * 3); // 2-4
          materialId = typeMapping.uncommon;
          break;
        case 'legendary':
          quantity = 1 + Math.floor(Math.random() * 2); // 1-2
          materialId = typeMapping.rare;
          break;
        default:
          quantity = 1;
          materialId = typeMapping.common;
      }

      // Get material name
      const materialResult = await db.execute({
        sql: `SELECT name FROM crafting_materials WHERE id = ?`,
        args: [materialId],
      });

      if (materialResult.rows.length > 0) {
        materials.push({
          id: materialId,
          name: (materialResult.rows[0] as any).name,
          quantity: quantity,
        });
      }
    }

    // Add materials to character_crafting_materials
    for (const material of materials) {
      // Check if material already exists
      const existingResult = await db.execute({
        sql: `SELECT id, quantity FROM character_crafting_materials
              WHERE character_id = ? AND material_id = ?`,
        args: [characterId, material.id],
      });

      if (existingResult.rows.length > 0) {
        // Update existing stack
        const existing = existingResult.rows[0] as any;
        await db.execute({
          sql: `UPDATE character_crafting_materials 
                SET quantity = quantity + ? 
                WHERE id = ?`,
          args: [material.quantity, existing.id],
        });
      } else {
        // Create new entry
        await db.execute({
          sql: `INSERT INTO character_crafting_materials (character_id, material_id, quantity)
                VALUES (?, ?, ?)`,
          args: [characterId, material.id, material.quantity],
        });
      }
    }

    // Remove the salvaged item
    if (invItem.quantity > 1) {
      // Decrease quantity
      await db.execute({
        sql: `UPDATE character_inventory 
              SET quantity = quantity - 1 
              WHERE id = ?`,
        args: [inventoryItemId],
      });
    } else {
      // Delete item
      await db.execute({
        sql: `DELETE FROM character_inventory WHERE id = ?`,
        args: [inventoryItemId],
      });
    }

    // Get updated inventory
    const updatedInventoryResult = await db.execute({
      sql: `SELECT 
              character_inventory.*, 
              items.*,
              abilities.required_level as ability_required_level,
              abilities.required_strength as ability_required_strength,
              abilities.required_dexterity as ability_required_dexterity,
              abilities.required_intelligence as ability_required_intelligence,
              abilities.required_wisdom as ability_required_wisdom,
              abilities.required_charisma as ability_required_charisma
            FROM character_inventory 
            JOIN items ON character_inventory.item_id = items.id 
            LEFT JOIN abilities ON items.teaches_ability_id = abilities.id
            WHERE character_inventory.character_id = ?
            ORDER BY items.type, items.name`,
      args: [characterId],
    });

    const updatedInventory = updatedInventoryResult.rows.map((row: any) => ({
      ...row,
      required_level: row.ability_required_level || row.required_level,
      required_strength: row.ability_required_strength || row.required_strength,
      required_dexterity: row.ability_required_dexterity || row.required_dexterity,
      required_intelligence: row.ability_required_intelligence || row.required_intelligence,
      required_wisdom: row.ability_required_wisdom || row.required_wisdom,
      required_charisma: row.ability_required_charisma || row.required_charisma,
    }));

    return json({
      success: true,
      materialsGained: materials,
      inventory: updatedInventory,
    });
  } catch (error: any) {
    console.error('Salvage error:', error);
    return json({ error: error.message || 'Failed to salvage item' }, { status: 500 });
  }
}
