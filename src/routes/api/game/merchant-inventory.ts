import { json } from '@solidjs/router';
import { getRequestEvent } from 'solid-js/web';
import { getMerchantInventory, getCharacter } from '~/lib/game';

export async function GET() {
  'use server';
  
  const event = getRequestEvent();
  if (!event) {
    return json({ error: 'No request event' }, { status: 400 });
  }

  const url = new URL(event.request.url);
  const merchantId = url.searchParams.get('merchantId');
  const characterId = url.searchParams.get('characterId');

  if (!merchantId || !characterId) {
    return json({ error: 'Missing merchantId or characterId' }, { status: 400 });
  }

  try {
    const inventory = await getMerchantInventory(parseInt(merchantId));
    const character = await getCharacter(parseInt(characterId));
    
    if (!character) {
      return json({ error: 'Character not found' }, { status: 404 });
    }
    
    // Calculate charisma discount
    const charismaBonus = character.charisma - 10;
    const discountPercent = Math.min(20, Math.max(0, charismaBonus));
    const discountMultiplier = 1 - (discountPercent / 100);
    
    // Add calculated prices to each item
    const inventoryWithPrices = inventory.map((item: any) => {
      const baseBuyPrice = Math.floor(item.value * 2.5 * item.price_multiplier);
      const discountedPrice = Math.floor(baseBuyPrice * discountMultiplier);
      
      return {
        ...item,
        merchant_price: discountedPrice,
        base_price: baseBuyPrice,
        discount_percent: discountPercent,
      };
    });
    
    return json({ 
      inventory: inventoryWithPrices,
      discountPercent 
    });
  } catch (error: any) {
    console.error('Get merchant inventory error:', error);
    return json({ error: error.message || 'Failed to get merchant inventory' }, { status: 500 });
  }
}
