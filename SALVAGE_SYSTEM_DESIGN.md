# Salvage System Design

## Overview
Allow players to break down equipment into crafting materials for use in crafting recipes.

---

## Salvage Mechanics

### What Can Be Salvaged?
- ✅ Weapons (armor, weapon types)
- ✅ Armor (all slots: head, chest, hands, feet, offhand)
- ❌ Consumables (potions, food) - cannot be salvaged
- ❌ Scrolls - cannot be salvaged
- ❌ Equipped items - must unequip first

### Material Yield Formula

**Recipe-Based Yield** (if item has a recipe):
- Look up item in `recipes` table
- Get crafting materials from `crafting_materials` table (NOT items)
- Return 10-25% of each material (rounded down, minimum 1)
- Materials added to `character_crafting_materials` table

Example:
```
Recipe: Iron Helm
  - Iron Ore x4
  
Salvage Yield (20%):
  - Iron Ore x1 (4 * 0.2 = 0.8 → rounded to 1)
```

**Fallback System** (if item has NO recipe):
All items can be salvaged even without a recipe. Returns generic materials based on type and rarity:

| Item Type | Common Mat | Uncommon Mat | Rare Mat |
|-----------|-----------|--------------|----------|
| Weapon | Iron Ore | Steel Ingot | Adamantite Ore |
| Armor | Rough Leather | Silk Cloth | Dragon Scale |

**Fallback Quantity by Rarity**:
- **Common**: 1-2 of common material
- **Uncommon**: 2-4 of common material
- **Rare**: 1-2 of uncommon material
- **Epic**: 2-4 of uncommon material
- **Legendary**: 1-2 of rare material

Example:
```
Epic Sword (no recipe):
  → Steel Ingot x2-4 (uncommon material)

Legendary Armor (no recipe):
  → Dragon Scale x1-2 (rare material)
```

**Crafting Material Types**:
- **Common**: Iron Ore, Copper Ore, Rough Leather, Linen Cloth, Wooden Planks, Feathers
- **Uncommon**: Steel Ingot, Mithril Ore, Silk Cloth, Ancient Wood, Major Gemstone
- **Rare**: Dragon Scale, Adamantite Ore, Ethereal Silk, Void Crystal
- **Epic/Legendary**: Phoenix Feather, Celestial Essence, Godsteel Ore

---

## API Endpoint Design

### Single Salvage
**Endpoint**: `POST /api/game/salvage`

**Request**:
```json
{
  "characterId": 123,
  "inventoryItemId": 456
}
```

**Response**:
```json
{
  "success": true,
  "materialsGained": [
    { "name": "Steel Ingot", "quantity": 2 },
    { "name": "Leather", "quantity": 1 }
  ],
  "inventory": [...updated inventory...]
}
```

### Bulk Salvage
**Endpoint**: `POST /api/game/bulk-salvage`

**Request**:
```json
{
  "characterId": 123,
  "itemIds": [456, 457, 458]
}
```

**Response**:
```json
{
  "success": true,
  "totalSalvaged": 3,
  "materialsGained": [
    { "name": "Steel Ingot", "quantity": 8 },
    { "name": "Leather", "quantity": 5 }
  ],
  "inventory": [...updated inventory...]
}
```

---

## UI Components

### Item Detail Modal
Add "Salvage" button next to "Sell" button:
```
[Equip] [Sell for 100g] [Salvage]
```

Show salvage preview:
```
Salvage this item to receive:
  - Steel Ingot (1-2)
  - Leather (1)
  
⚠️ This action cannot be undone
```

### Inventory Bulk Actions
Add to selection mode actions:
```
[Sell Selected] [Salvage Selected] [Drop Selected]
```

### Salvage Result Modal
```
✅ Salvaged 5 items!

Materials Gained:
  +12 Steel Ingot
  +8 Leather
  +3 Cloth
```

---

## Database Queries

### Check if item has recipe:
```sql
SELECT r.id, rm.material_id, rm.quantity, i.name as material_name
FROM recipes r
JOIN items output ON r.output_item_id = output.id
JOIN recipe_materials rm ON r.id = rm.recipe_id
JOIN items i ON rm.material_id = i.id
WHERE output.id = ?
```

### Add materials to inventory:
```sql
-- Check if material already in inventory
SELECT id, quantity FROM character_inventory 
WHERE character_id = ? AND item_id = ?

-- If exists: Update
UPDATE character_inventory SET quantity = quantity + ?
WHERE id = ?

-- If not exists: Insert
INSERT INTO character_inventory (character_id, item_id, quantity)
VALUES (?, ?, ?)
```

### Remove salvaged item:
```sql
-- If quantity > 1: Decrease
UPDATE character_inventory SET quantity = quantity - 1
WHERE id = ?

-- If quantity = 1: Delete
DELETE FROM character_inventory WHERE id = ?
```

---

## Implementation Checklist

- [ ] Create `/api/game/salvage` endpoint (single item)
- [ ] Create `/api/game/bulk-salvage` endpoint (multiple items)
- [ ] Add salvage button to `ItemDetailModal`
- [ ] Add salvage preview to modal
- [ ] Add "Salvage Selected" to bulk actions
- [ ] Create salvage result modal
- [ ] Add salvage confirmation dialog
- [ ] Test with recipe-based items
- [ ] Test with generic items (no recipe)
- [ ] Test bulk salvage

---

## Edge Cases

1. **Equipped items**: Must unequip before salvaging (show error)
2. **Stackable items**: Salvage entire stack or ask quantity?
   - Decision: Salvage one at a time from stack
3. **No materials available**: Return generic material for rarity
4. **Material already at max stack**: Create new stack if item is stackable
5. **Scrolls/Consumables**: Show disabled salvage button with tooltip

---

## Future Enhancements

- **Salvage Kit System**: Require salvage kits to break down items
  - Basic Kit: 25% material return
  - Advanced Kit: 40% material return
  - Master Kit: 50% material return
- **Skill System**: Higher salvaging skill = better material return
- **Rare Materials**: Small chance to get bonus rare materials
- **Bulk Salvage Filters**: "Salvage all common", "Salvage all below level X"
