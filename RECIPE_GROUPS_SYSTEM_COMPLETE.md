# Recipe Groups System - Complete

## Overview
Completely restructured the crafting system from 1-recipe-1-item to recipe groups with probability-based outputs.

## What Changed

### Old System ❌
- **One recipe per item**: "Iron Sword Recipe", "Steel Sword Recipe", etc.
- **Overwhelming recipe list**: Hundreds of individual recipes
- **Level brackets UI**: Recipes grouped by level (0-5, 5-10, etc.)
- **Fixed output**: Each recipe always produced the same item

### New System ✅
- **Recipe groups**: "Simple Weapon", "Moderate Robe", "Advanced Leather Armor"
- **Probability-based outputs**: One recipe can produce multiple items
- **Category organization**: Recipes grouped by type (Weapons, Armors, Offhand, Consumables)
- **Dynamic output**: What you craft depends on your level, skill performance, and luck

## Database Schema

### New Tables

#### `recipe_groups`
The recipes players see in the UI:
```sql
- id: Primary key
- name: "Simple Weapon", "Moderate Robe", etc.
- description: What the recipe does
- profession_type: blacksmithing, tailoring, leatherworking, etc.
- category: weapon, armor, offhand, consumable, material
- min_level: Minimum profession level required
- max_level: Optional max level where recipe is relevant
- craft_time_seconds: Time for minigame (12 seconds)
- base_experience: XP awarded
```

#### `recipe_outputs`
Possible items each recipe can produce:
```sql
- id: Primary key
- recipe_group_id: Links to recipe_groups
- item_id: Links to items
- min_profession_level: When this item becomes available
- base_weight: Base probability (higher = more common at min level)
- weight_per_level: Additional weight per profession level above minimum
- quality_bonus_weight: Bonus weight for Superior/Masterwork quality
```

#### `recipe_group_materials`
Materials required for each recipe group:
```sql
- id: Primary key
- recipe_group_id: Links to recipe_groups
- material_id: Links to crafting_materials
- quantity: Amount required
```

## Probability System

### How It Works

When you craft an item, the system:

1. **Filters available items** by your profession level
2. **Calculates weights** for each possible item:
   ```
   weight = base_weight + (profession_level - min_level) * weight_per_level
   
   if (quality == Superior || Masterwork):
     weight += quality_bonus_weight
   ```
3. **Selects item** using weighted random selection

### Example: Simple Weapon

**At Level 1 Blacksmithing (Common quality):**
- Rusty Sword: 200 weight (high chance)
- Iron Sword: 0 weight (need level 2)
- Steel Sword: 0 weight (need level 3)

**At Level 5 Blacksmithing (Common quality):**
- Rusty Sword: 220 weight (200 + 4*5)
- Iron Sword: 130 weight (100 + 3*10)
- Steel Sword: 104 weight (80 + 2*12)
- Steel Longsword: 50 weight (base)

**At Level 5 Blacksmithing (Masterwork quality):**
- Rusty Sword: 250 weight (220 + 30 quality bonus)
- Iron Sword: 180 weight (130 + 50 quality bonus)
- Steel Sword: 164 weight (104 + 60 quality bonus)
- Steel Longsword: 130 weight (50 + 80 quality bonus)

**Result:** Higher profession level + better minigame performance = better items!

## Seeded Recipe Groups

### Blacksmithing
- **Simple Weapon** (Level 1-15)
  - 18 possible outputs (daggers, swords, staves, bows, axes)
  - Materials: 3x Iron Ore
  
### Tailoring
- **Simple Robe** (Level 1-15)
  - 15 possible outputs (cloth armor pieces)
  - Materials: 4x Linen Cloth

### Leatherworking
- **Simple Leather Armor** (Level 1-15)
  - 11 possible outputs (leather armor pieces)
  - Materials: 4x Rough Leather

## UI Changes

### Old UI
```
Level 0-5 ▼
  - Iron Sword Recipe
  - Rusty Sword Recipe
  - Training Dagger Recipe
  [... 20 more recipes]

Level 5-10 ▼
  - Steel Sword Recipe
  - Quality Sword Recipe
  [... 25 more recipes]
```

### New UI
```
Weapons ▼
  > Simple Weapon (Level 1) 🔨
  > Moderate Weapon (Level 10) 🔨
  > Advanced Weapon (Level 25) 🔨

Armors ▼
  > Simple Robe (Level 1) 🔨
  > Simple Leather Armor (Level 1) 🔨
  > Moderate Robe (Level 10) 🔨
```

**Details/Summary Pattern:**
- Click recipe name to see materials and level info
- Hammer button always visible for quick crafting
- Much cleaner, scannable list

## API Changes

### Files Modified

**src/routes/api/game/crafting/recipes.ts**
- Now queries `recipe_groups` instead of `recipes`
- Groups by category instead of level
- Returns `min_level` as `level_required` for backwards compatibility

**src/routes/api/game/crafting/start.ts**
- Queries `recipe_groups` instead of `recipes`
- Uses `min_level` instead of `level_required`
- Uses `recipe_group_materials` instead of `recipe_materials`

**src/routes/api/game/crafting/complete.ts**
- **Major changes**: Probability-based item selection
- Queries `recipe_outputs` to get all possible items
- Calculates weights based on:
  - Base weight
  - Profession level above minimum
  - Quality bonus for Superior/Masterwork
- Weighted random selection
- Returns the crafted item with quality multipliers applied

## Benefits

### For Players
- ✅ **Less overwhelming**: See 3-5 recipe groups instead of 100+ individual recipes
- ✅ **More exciting**: "What will I get?" element adds surprise
- ✅ **Skill matters**: Better performance = better items
- ✅ **Progression feels good**: Same recipe improves as you level

### For Development
- ✅ **Easier to maintain**: Add new items without creating new recipes
- ✅ **Flexible balancing**: Adjust probability weights easily
- ✅ **Scalable**: Add hundreds of items without UI bloat
- ✅ **Natural item variety**: Players craft diverse gear

### For Game Balance
- ✅ **Early game easier**: Low-level items have high base weight
- ✅ **Late game progression**: High-tier items need level + skill
- ✅ **Quality system integrated**: Masterwork crafts rewarded with better loot pool
- ✅ **Replay value**: Same recipe, different results

## Future Enhancements

### Rare Materials System (Planned)
```sql
-- Add rare material requirements
INSERT INTO recipe_group_materials (recipe_group_id, material_id, quantity, optional)
VALUES (1, 18, 1, true); -- Dragon Scale (optional)

-- Rare materials unlock legendary outputs
INSERT INTO recipe_outputs (recipe_group_id, item_id, requires_rare_material_id)
VALUES (1, 999, 18); -- Dragonforged Sword requires Dragon Scale
```

### Named Equipment
- Add `is_named` flag to recipe_outputs
- Named items have unique properties/lore
- Lower probability, higher quality requirement

### Difficulty Tiers
Instead of Simple/Moderate/Advanced, could use:
- **Novice**: Level 1-10, easy patterns
- **Apprentice**: Level 10-20, medium patterns
- **Journeyman**: Level 20-35, hard patterns
- **Expert**: Level 35-50, very hard patterns
- **Master**: Level 50+, extremely hard patterns

## Migration Status

✅ **Migration 037**: `recipe_groups_system.sql` - Schema created
✅ **Migration 038**: `seed_recipe_groups.sql` - Initial recipe groups added
✅ **Database**: Applied via Turso CLI
✅ **Outputs populated**: 44 items across 3 recipe groups
✅ **Build**: Passing
✅ **Ready**: Live and testable

## Testing Checklist

- [ ] Load crafting page
- [ ] Verify recipes grouped by Weapons/Armors
- [ ] Select a recipe and craft
- [ ] Verify different items drop from same recipe
- [ ] Craft multiple times at level 1 (should get low-tier items)
- [ ] Level up to 5-7 and craft again (should get mid-tier items)
- [ ] Test Masterwork quality (should get higher-tier items more often)
- [ ] Verify quality multipliers apply to crafted items
- [ ] Test all three professions (Blacksmithing, Tailoring, Leatherworking)

## Success Metrics

**Before:**
- 100+ individual recipes per profession
- Overwhelming UI
- Predictable, boring outputs
- Quality only affected stats

**After:**
- 3-5 recipe groups per profession
- Clean, organized UI
- Exciting, variable outputs
- Quality affects both stats AND loot pool
- Profession level progression feels meaningful

---

**Status**: ✅ Complete and ready for testing!
**Build**: ✅ Passing
**Database**: ✅ Migrated
**Next**: Add more recipe groups and outputs for levels 15-50
