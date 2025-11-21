import { json } from '@solidjs/router';
import { getRequestEvent } from 'solid-js/web';
import { getUser } from '~/lib/auth';
import { db } from '~/lib/db';
import { getCharacter, getInventory } from '~/lib/game';

export async function POST() {
  'use server';
  
  const event = getRequestEvent();
  if (!event) {
    return json({ error: 'No request event' }, { status: 400 });
  }

  const user = await getUser();
  if (!user) {
    return json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = await new Response(event.request.body).json();
  const { characterId, merchantId, itemId } = body;

  if (!characterId || !merchantId || !itemId) {
    return json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    // Get character and verify ownership
    const character = await getCharacter(characterId);
    if (!character || character.user_id !== user.id) {
      return json({ error: 'Character not found' }, { status: 404 });
    }

    // Get merchant inventory item (includes price)
    const merchantItemResult = await db.execute({
      sql: `SELECT 
              items.*,
              merchant_inventory.stock,
              merchant_inventory.price_multiplier,
              merchants.region_id
            FROM merchant_inventory
            JOIN items ON merchant_inventory.item_id = items.id
            JOIN merchants ON merchant_inventory.merchant_id = merchants.id
            WHERE merchant_inventory.merchant_id = ? AND merchant_inventory.item_id = ?`,
      args: [merchantId, itemId],
    });

    const merchantItem = merchantItemResult.rows[0] as any;
    if (!merchantItem) {
      return json({ error: 'Item not available from this merchant' }, { status: 404 });
    }

    // Verify character is in the same region as the merchant
    if (character.current_region !== merchantItem.region_id) {
      return json({ error: 'You must be in the same region as the merchant' }, { status: 400 });
    }

    // Calculate merchant buy price with markup
    // Base merchant markup is 2.5x (merchants buy low, sell high)
    // Then apply merchant's price_multiplier (regional pricing)
    const baseBuyPrice = Math.floor(merchantItem.value * 2.5 * merchantItem.price_multiplier);
    
    // Calculate charisma discount
    // Base charisma (10) = no discount
    // Each point above 10 = 1% discount (max 20% at 30 charisma)
    const charismaBonus = character.charisma - 10;
    const discountPercent = Math.min(20, Math.max(0, charismaBonus)); // 0% to 20% discount
    const discountMultiplier = 1 - (discountPercent / 100);
    
    const price = Math.floor(baseBuyPrice * discountMultiplier);
    const savedGold = baseBuyPrice - price;

    // Check if character has enough gold
    if (character.gold < price) {
      return json({ error: `Not enough gold. Need ${price}g, have ${character.gold}g` }, { status: 400 });
    }

    // Check stock (if not infinite)
    if (merchantItem.stock !== -1 && merchantItem.stock < 1) {
      return json({ error: 'Item out of stock' }, { status: 400 });
    }

    // Start transaction
    // 1. Deduct gold
    await db.execute({
      sql: 'UPDATE characters SET gold = gold - ? WHERE id = ?',
      args: [price, characterId],
    });

    // 2. Add item to inventory
    if (merchantItem.stackable) {
      // Check if item already exists in inventory
      const existingResult = await db.execute({
        sql: 'SELECT id, quantity FROM character_inventory WHERE character_id = ? AND item_id = ? AND equipped = 0',
        args: [characterId, itemId],
      });

      if (existingResult.rows.length > 0) {
        // Stack with existing
        const existing = existingResult.rows[0] as any;
        await db.execute({
          sql: 'UPDATE character_inventory SET quantity = quantity + 1 WHERE id = ?',
          args: [existing.id],
        });
      } else {
        // Create new stack
        await db.execute({
          sql: 'INSERT INTO character_inventory (character_id, item_id, quantity, equipped) VALUES (?, ?, 1, 0)',
          args: [characterId, itemId],
        });
      }
    } else {
      // Non-stackable item
      await db.execute({
        sql: 'INSERT INTO character_inventory (character_id, item_id, quantity, equipped) VALUES (?, ?, 1, 0)',
        args: [characterId, itemId],
      });
    }

    // 3. Update merchant stock (if not infinite)
    if (merchantItem.stock !== -1) {
      await db.execute({
        sql: 'UPDATE merchant_inventory SET stock = stock - 1 WHERE merchant_id = ? AND item_id = ?',
        args: [merchantId, itemId],
      });
    }

    // Get updated data
    const updatedCharacter = await getCharacter(characterId);
    const updatedInventory = await getInventory(characterId);

    return json({
      success: true,
      message: `Purchased ${merchantItem.name} for ${price} gold${savedGold > 0 ? ` (saved ${savedGold}g with charisma!)` : ''}`,
      character: updatedCharacter,
      inventory: updatedInventory,
      itemName: merchantItem.name,
      price,
      savedGold,
      discountPercent,
    });

  } catch (error: any) {
    console.error('Buy item error:', error);
    return json({ error: error.message || 'Failed to purchase item' }, { status: 500 });
  }
}
