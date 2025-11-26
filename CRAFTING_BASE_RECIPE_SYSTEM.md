# Base Recipe System Design

## Overview
Instead of having separate recipes for each quality tier, we use **base recipes** that output items with quality-based stat scaling.

## Current System
```
Recipe: Iron Sword
├── Produces: Iron Sword (fixed stats)
└── Quality: Success/Fail only
```

## New System
```
Recipe: Iron Sword (Base)
├── Produces: Iron Sword
└── Quality determines stats:
    ├── Failed: No item, 25% XP
    ├── Common: Base stats (100%), full XP
    ├── Fine: Base stats × 1.05 (+5%), +25% XP
    ├── Superior: Base stats × 1.10 (+10%), +50% XP
    └── Masterwork: Base stats × 1.15 (+15%), +100% XP
```

## Crafting Level = Half Item Level

**Formula**: `crafting_level_required = Math.ceil(item_level / 2)`

**Examples**:
- Level 2 item (e.g., Cloth Robe) → Crafting Level 1
- Level 8 item (e.g., Iron Sword) → Crafting Level 4
- Level 16 item (e.g., Steel Plate) → Crafting Level 8
- Level 30 item (e.g., Mithril Armor) → Crafting Level 15

This means:
- Crafting level 1 can make level 1-2 items
- Crafting level 5 can make level 9-10 items
- Crafting level 10 can make level 19-20 items

## Database Changes

### Option 1: Store Quality in Inventory (Recommended)
```sql
ALTER TABLE character_inventory 
ADD COLUMN quality TEXT DEFAULT 'common' 
CHECK(quality IN ('common', 'fine', 'superior', 'masterwork'));
```

**Pros**:
- Each crafted item can have different quality
- Allows trading/selling quality items
- Quality persists through inventory management

**Cons**:
- Need to calculate stats on-the-fly when displaying/equipping
- Slightly more complex queries

### Option 2: Create Quality Item Variants
```sql
-- Create separate items for each quality
INSERT INTO items (name, ...) VALUES ('Iron Sword', ...);  -- common
INSERT INTO items (name, ...) VALUES ('Fine Iron Sword', ...);  -- fine
INSERT INTO items (name, ...) VALUES ('Superior Iron Sword', ...);  -- superior
INSERT INTO items (name, ...) VALUES ('Masterwork Iron Sword', ...);  -- masterwork
```

**Pros**:
- Simple queries, stats are pre-calculated
- No runtime calculations needed

**Cons**:
- 4x the number of items in database
- Harder to add new quality tiers
- More maintenance

**Decision**: Use Option 1 (quality in inventory)

## Implementation Steps

### 1. Add Quality Column to Inventory
```sql
-- Migration: Add quality to character_inventory
ALTER TABLE character_inventory 
ADD COLUMN quality TEXT DEFAULT 'common';
```

### 2. Update Crafting Complete API
```typescript
// Store quality when crafting succeeds
await db.execute({
  sql: `INSERT INTO character_inventory (character_id, item_id, quantity, quality) 
        VALUES (?, ?, 1, ?)`,
  args: [characterId, itemId, quality] // quality from minigame score
});
```

### 3. Calculate Stats with Quality Multiplier
```typescript
function getItemStats(item: Item, quality: string) {
  const multipliers = {
    'common': 1.0,
    'fine': 1.05,
    'superior': 1.10,
    'masterwork': 1.15
  };
  
  const mult = multipliers[quality] || 1.0;
  
  return {
    ...item,
    strength_bonus: Math.floor(item.strength_bonus * mult),
    dexterity_bonus: Math.floor(item.dexterity_bonus * mult),
    constitution_bonus: Math.floor(item.constitution_bonus * mult),
    intelligence_bonus: Math.floor(item.intelligence_bonus * mult),
    wisdom_bonus: Math.floor(item.wisdom_bonus * mult),
    charisma_bonus: Math.floor(item.charisma_bonus * mult),
    damage_min: Math.floor(item.damage_min * mult),
    damage_max: Math.floor(item.damage_max * mult),
    armor: Math.floor(item.armor * mult)
  };
}
```

### 4. Display Quality in UI
```tsx
// Item display shows quality
<div class="item-card" data-quality={quality}>
  <h4>
    {quality !== 'common' && <span class={`quality-${quality}`}>{quality} </span>}
    {item.name}
  </h4>
  <div>Damage: {stats.damage_min}-{stats.damage_max}</div>
</div>
```

### 5. Update Recipe Levels
```sql
-- Update recipes to use half-level formula
-- For a level 8 Iron Sword, crafting level should be 4
UPDATE recipes 
SET level_required = CEIL((SELECT required_level FROM items WHERE id = recipes.item_id) / 2.0)
WHERE item_id IS NOT NULL;
```

## Quality Display

### Colors
```css
.quality-common { color: var(--common); }      /* gray */
.quality-fine { color: var(--rare); }          /* blue */
.quality-superior { color: var(--epic); }      /* purple */
.quality-masterwork { color: var(--legendary); } /* gold */
```

### Item Name Format
```
Common: Iron Sword
Fine: Fine Iron Sword (blue)
Superior: Superior Iron Sword (purple)
Masterwork: Masterwork Iron Sword (gold)
```

## Minigame Integration

The minigame already calculates quality based on score:
```typescript
const quality = 
  totalScore >= 100 ? "masterwork" :
  totalScore >= 86 ? "superior" :
  totalScore >= 61 ? "fine" : "common";
```

Just need to pass this to the complete API and store it.

## Migration Path

1. Add quality column to character_inventory
2. Update crafting/complete API to store quality
3. Update inventory queries to include quality
4. Add quality display to item components
5. Add quality stat calculation helper
6. Update equipment stats calculation
7. Update recipe levels based on item levels

## Example Recipe Level Adjustments

Assuming items have required_level set:

```
Blacksmithing:
- Iron Dagger (Lv 4) → Recipe Lv 2
- Iron Sword (Lv 8) → Recipe Lv 4
- Steel Sword (Lv 16) → Recipe Lv 8
- Mithril Sword (Lv 30) → Recipe Lv 15

Tailoring:
- Linen Robe (Lv 2) → Recipe Lv 1
- Silk Robe (Lv 14) → Recipe Lv 7
- Enchanted Robe (Lv 28) → Recipe Lv 14

Alchemy:
- Minor Health Potion (Lv 1) → Recipe Lv 1
- Health Potion (Lv 10) → Recipe Lv 5
- Greater Health Potion (Lv 20) → Recipe Lv 10
```

## Benefits

1. **Cleaner database**: One recipe per item type, not 4
2. **Player agency**: Skill in minigame = better rewards
3. **Progression feels meaningful**: Masterwork items are earned, not lucked
4. **Flexible system**: Easy to add new quality tiers or adjust multipliers
5. **Economy potential**: Quality items could be more valuable to sell/trade
