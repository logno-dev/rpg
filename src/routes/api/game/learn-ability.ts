import { json } from '@solidjs/router';
import type { APIEvent } from '@solidjs/start/server';
import { db } from '~/lib/db';
import { upgradeHotbarAbilities } from '~/lib/game';

export async function POST(event: APIEvent) {
  try {
    const body = await event.request.json();
    const { characterId, inventoryItemId } = body;

    // Get the inventory item
    const invResult = await db.execute({
      sql: `SELECT character_inventory.*, items.* 
            FROM character_inventory 
            JOIN items ON character_inventory.item_id = items.id 
            WHERE character_inventory.id = ? AND character_inventory.character_id = ?`,
      args: [inventoryItemId, characterId],
    });

    const invItem = invResult.rows[0] as any;
    if (!invItem) throw new Error('Item not found in inventory');
    
    // Check if it teaches an ability
    if (!invItem.teaches_ability_id) throw new Error('This item does not teach an ability');
    
    // Get the ability details
    const abilityResult = await db.execute({
      sql: 'SELECT * FROM abilities WHERE id = ?',
      args: [invItem.teaches_ability_id],
    });
    
    const ability = abilityResult.rows[0] as any;
    if (!ability) throw new Error('Ability not found');
    
    // Get character's base stats (not including equipment)
    const charResult = await db.execute({
      sql: 'SELECT * FROM characters WHERE id = ?',
      args: [characterId],
    });
    const character = charResult.rows[0] as any;
    if (!character) throw new Error('Character not found');
    
    // Check stat requirements (uses BASE stats, not including equipment)
    const requirements = [];
    if (ability.required_strength > 0 && character.strength < ability.required_strength) {
      requirements.push(`${ability.required_strength} Strength`);
    }
    if (ability.required_dexterity > 0 && character.dexterity < ability.required_dexterity) {
      requirements.push(`${ability.required_dexterity} Dexterity`);
    }
    if (ability.required_constitution > 0 && character.constitution < ability.required_constitution) {
      requirements.push(`${ability.required_constitution} Constitution`);
    }
    if (ability.required_intelligence > 0 && character.intelligence < ability.required_intelligence) {
      requirements.push(`${ability.required_intelligence} Intelligence`);
    }
    if (ability.required_wisdom > 0 && character.wisdom < ability.required_wisdom) {
      requirements.push(`${ability.required_wisdom} Wisdom`);
    }
    if (ability.required_charisma > 0 && character.charisma < ability.required_charisma) {
      requirements.push(`${ability.required_charisma} Charisma`);
    }
    if (ability.required_level > 0 && character.level < ability.required_level) {
      requirements.push(`Level ${ability.required_level}`);
    }
    
    if (requirements.length > 0) {
      throw new Error(`Requirements not met: ${requirements.join(', ')}`);
    }
    
    // Check if character already knows this ability
    const existingResult = await db.execute({
      sql: 'SELECT * FROM character_abilities WHERE character_id = ? AND ability_id = ?',
      args: [characterId, invItem.teaches_ability_id],
    });
    
    if (existingResult.rows.length > 0) {
      throw new Error(`You already know ${ability.name}`);
    }
    
    // If this is an upgraded ability (level > 1), remove lower tier versions
    if (ability.level > 1 && ability.base_id) {
      // Get all abilities with the same base_id but lower level
      const lowerTiersResult = await db.execute({
        sql: 'SELECT id FROM abilities WHERE base_id = ? AND level < ?',
        args: [ability.base_id, ability.level],
      });
      
      // Remove lower tier abilities from character
      for (const lowerTier of lowerTiersResult.rows as any[]) {
        await db.execute({
          sql: 'DELETE FROM character_abilities WHERE character_id = ? AND ability_id = ?',
          args: [characterId, lowerTier.id],
        });
      }
      
      // Auto-upgrade hotbar slots that have lower tier versions
      await upgradeHotbarAbilities(characterId, invItem.teaches_ability_id, ability.base_id, ability.level);
    }
    
    // Learn the ability
    await db.execute({
      sql: 'INSERT INTO character_abilities (character_id, ability_id) VALUES (?, ?)',
      args: [characterId, invItem.teaches_ability_id],
    });
    
    // Remove the scroll from inventory
    if (invItem.quantity > 1) {
      await db.execute({
        sql: 'UPDATE character_inventory SET quantity = quantity - 1 WHERE id = ?',
        args: [inventoryItemId],
      });
    } else {
      await db.execute({
        sql: 'DELETE FROM character_inventory WHERE id = ?',
        args: [inventoryItemId],
      });
    }
    
    // Get updated inventory
    const inventoryResult = await db.execute({
      sql: `SELECT 
            character_inventory.id, 
            character_inventory.quantity, 
            character_inventory.equipped,
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

    // Map the ability_ prefixed columns back to required_ for scrolls
    const inventory = inventoryResult.rows.map((row: any) => ({
      ...row,
      required_level: row.ability_required_level || row.required_level,
      required_strength: row.ability_required_strength || row.required_strength,
      required_dexterity: row.ability_required_dexterity || row.required_dexterity,
      required_intelligence: row.ability_required_intelligence || row.required_intelligence,
      required_wisdom: row.ability_required_wisdom || row.required_wisdom,
      required_charisma: row.ability_required_charisma || row.required_charisma,
    }));

    // Get updated abilities list
    const abilitiesResult = await db.execute({
      sql: `SELECT abilities.*, 0 as last_used_at
            FROM character_abilities
            JOIN abilities ON character_abilities.ability_id = abilities.id
            WHERE character_abilities.character_id = ?
            ORDER BY abilities.name`,
      args: [characterId],
    });

    return json({ 
      success: true, 
      ability,
      inventory,
      abilities: abilitiesResult.rows,
      message: `Learned ${ability.name}!`
    });
  } catch (error: any) {
    console.error('Learn ability error:', error);
    return json({ error: error.message }, { status: 400 });
  }
}
