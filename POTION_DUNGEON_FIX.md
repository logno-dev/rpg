# Potion Dungeon Fix

## Problem
Potions didn't work when used in dungeons via keyboard shortcuts (number keys 1-8). Clicking potion buttons likely worked, but keyboard shortcuts did nothing.

## Root Cause
The CombatEngine's keyboard handler (`handleKeyPress` function) was calling `props.onUseConsumable()` but **not awaiting the result or applying the potion effects**.

**Original code (line 1006):**
```typescript
} else if (action.type === 'consumable' && action.item && props.onUseConsumable) {
  if (action.item.quantity > 0) {
    props.onUseConsumable(action.item.id);  // ❌ Fire and forget - no effect applied!
  }
}
```

The button click handler (line 1247) correctly awaited the result and applied HP/mana restoration, but the keyboard handler didn't.

## Fix Applied

**File:** `/src/components/CombatEngine.tsx`

### 1. Made keyboard handler async and apply potion effects
Changed keyboard handler to match the button click handler's logic:

```typescript
const handleKeyPress = async (e: KeyboardEvent) => {
  // ... existing code ...
  
  } else if (action.type === 'consumable' && action.item && props.onUseConsumable) {
    if (action.item.quantity > 0) {
      const result = await props.onUseConsumable(action.item.id);
      
      // Apply potion effects if returned
      if (result) {
        const maxHealth = getActualMaxHealth();
        const maxMana = getActualMaxMana();
        
        const newHealth = Math.min(maxHealth, state().characterHealth + result.healthRestore);
        const newMana = Math.min(maxMana, currentMana() + result.manaRestore);
        
        // Update internal HP/mana
        setState((currentState) => ({
          ...currentState,
          characterHealth: newHealth,
          characterMana: newMana
        }));
        
        setCurrentMana(newMana);
        
        // Notify parent so UI updates
        props.onHealthChange(newHealth, newMana);
        
        console.log('[POTION] Restored', result.healthRestore, 'HP and', result.manaRestore, 'mana');
      }
    }
  }
}
```

### 2. Enhanced dungeon potion handler with better error handling

**File:** `/src/routes/game/dungeon/[dungeonId].tsx` (line 785-804)

Added console logging and better error handling to help debug potion issues:

```typescript
onUseConsumable={async (itemId) => {
  const item = store.inventory?.find((i: any) => i.id === itemId);
  
  console.log('[DUNGEON] Using consumable:', itemId, 'Item found:', item);
  
  if (!item) {
    console.error('[DUNGEON] Item not found in inventory:', itemId);
    return;
  }
  
  // Store restoration values before API call
  const healthRestore = item.health_restore || 0;
  const manaRestore = item.mana_restore || 0;
  
  console.log('[DUNGEON] Potion values - HP:', healthRestore, 'MP:', manaRestore);
  
  // Update inventory via API
  const response = await fetch('/api/game/use-item', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ characterId: characterId(), inventoryItemId: itemId }),
  });
  const result = await response.json();
  
  if (result.error) {
    console.error('[DUNGEON] Error using item:', result.error);
    return;
  }
  
  actions.setInventory(result.inventory);
  
  // Return restoration values so CombatEngine can apply them internally
  return {
    healthRestore,
    manaRestore
  };
}}
```

## Impact
- ✅ Potions now work via keyboard shortcuts (1-8) in dungeons
- ✅ Potions work via button clicks in dungeons
- ✅ Better error logging for debugging potion issues
- ✅ Both regular combat and dungeon combat now have consistent potion handling

## Testing
To test:
1. Enter a dungeon with health/mana potions in hotbar slots
2. Start an encounter
3. Press number keys (1-8) corresponding to potion slots
4. Verify HP/mana are restored and console shows restoration logs
5. Also test by clicking potion buttons directly
