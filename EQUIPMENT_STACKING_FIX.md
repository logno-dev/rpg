# Equipment Stacking & Sell Prompt Fixes ✅

## Issues Fixed

### 1. Equipment Items Stacking (Bug)
**Problem:** Non-stackable equipment items (weapons, armor) were being added to inventory with quantity > 1, causing them to stack incorrectly.

**Root Cause:** In `finish-combat.ts`, the loot distribution code was inserting equipment with `quantity` parameter even though equipment should never stack. Each piece of equipment should be a separate inventory entry.

**Fix Applied:**
- Modified `src/routes/api/game/finish-combat.ts` line 147-159
- Now checks if item is stackable before deciding how to add it
- Non-stackable items are inserted as separate entries with quantity=1 each
- Stackable items continue to work as before (single entry with quantity)

**Database Cleanup:**
- Found 1 inventory entry with stacked equipment (3x Shadowfang Blade)
- Split into 3 separate inventory entries with quantity=1 each
- Verified no other incorrectly stacked equipment exists

### 2. Sell Quantity Prompt Not Showing (Bug)
**Problem:** When clicking "Sell" in the item detail modal for stackable items, the quantity selection modal wasn't appearing.

**Root Cause:** The item detail modal was closing immediately when sell was clicked, preventing the sell modal from opening. Additionally, both modals had the same z-index (1000).

**Fix Applied:**
- Modified `src/components/ItemDetailModal.tsx` - Item detail modal now stays open when sell button is clicked
- Modified `src/routes/game/index.tsx`:
  - Increased sell modal z-index to 1001 (appears above item detail modal)
  - Both modals now close when sell is confirmed or cancelled
- Ensures sell modal appears on top and functions correctly

## Code Changes

### src/routes/api/game/finish-combat.ts
```typescript
// OLD: Always inserted with quantity, even for equipment
} else {
  await db.execute({
    sql: 'INSERT INTO character_inventory (character_id, item_id, quantity) VALUES (?, ?, ?)',
    args: [characterId, item.id, quantity],
  });
}

// NEW: Checks stackable property
} else if (item.stackable) {
  // Add new stackable item
  await db.execute({
    sql: 'INSERT INTO character_inventory (character_id, item_id, quantity) VALUES (?, ?, ?)',
    args: [characterId, item.id, quantity],
  });
} else {
  // For non-stackable items (equipment), add each as a separate entry
  for (let i = 0; i < quantity; i++) {
    await db.execute({
      sql: 'INSERT INTO character_inventory (character_id, item_id, quantity) VALUES (?, ?, 1)',
      args: [characterId, item.id],
    });
  }
}
```

### src/components/ItemDetailModal.tsx
```typescript
// OLD: Closed modal immediately
onClick={() => {
  props.onSell?.(item.id, item.name, item.value, item.quantity);
  props.onClose();
}}

// NEW: Keep modal open, let sell modal appear on top
onClick={() => {
  props.onSell?.(item.id, item.name, item.value, item.quantity);
  // Don't close - sell modal appears on top
}}
```

### src/routes/game/index.tsx
```typescript
// Changed sell modal z-index from 1000 to 1001
"z-index": 1001,

// Added modal cleanup on confirm
setSellItemData(null);
setSellQuantity(1);
setShowItemDetailModal(false);
setSelectedItem(null);

// Added modal cleanup on cancel
setShowSellModal(false);
setSellItemData(null);
setShowItemDetailModal(false);
setSelectedItem(null);
```

## Testing

### Equipment Stacking:
✅ Loot multiple equipment pieces from combat
✅ Each piece should appear as separate inventory entry
✅ Equipment should not have quantity > 1

### Sell Quantity:
✅ Open item detail for stackable item (potion, material, etc.)
✅ Click "Sell" button
✅ Quantity selection modal should appear on top
✅ Item detail modal stays visible underneath
✅ Adjust quantity and confirm sale
✅ Both modals close after confirm/cancel

## Related Files
- `src/routes/api/game/finish-combat.ts` - Combat loot distribution
- `src/components/ItemDetailModal.tsx` - Item detail modal UI
- `src/routes/game/index.tsx` - Sell modal logic

Both issues are now resolved!
