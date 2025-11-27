# Named Equipment System Implementation

## Overview
Implemented a special materials system that allows players to craft epic and legendary named items by using rare materials like Dragon Scale, Adamantite Ore, and Ethereal Silk.

## Implementation Summary

### 1. Database Changes

#### Migration 040: Named Equipment System
- Added `requires_rare_material_id` column to `recipe_outputs`
- Added `is_named` boolean flag to `recipe_outputs`
- Created indexes for performance

#### Migration 041: Rare Material Tracking
- Added `rare_material_id` column to `crafting_sessions`
- Tracks which rare material was used during crafting

### 2. Rare Materials
Three rare materials available in the game:
- **Dragon Scale** (ID: 18)
- **Adamantite Ore** (ID: 19)
- **Ethereal Silk** (ID: 20)

### 3. API Changes

#### `/api/game/crafting/start` (Modified)
**New Parameters:**
- `rareMaterialId` (optional) - ID of rare material to use

**Flow:**
1. Check if recipe has named outputs requiring rare materials
2. Check which rare materials player has in inventory
3. If player has rare materials and none selected:
   - Return `{ needsRareMaterialChoice: true, availableRareMaterials: [...] }`
4. If rare material is selected:
   - Validate player has the material
   - Consume 1 rare material
   - Store `rare_material_id` in crafting session
5. Proceed with normal crafting flow

#### `/api/game/crafting/complete` (Modified)
**Output Selection Logic:**
1. Read `rare_material_id` from crafting session
2. If rare material was used:
   - Include items with `requires_rare_material_id = session.rare_material_id`
   - Include normal items (`requires_rare_material_id IS NULL`)
   - Named items have low `base_weight` but huge `quality_bonus_weight` (300-500)
3. If no rare material:
   - Exclude all named items (`is_named = 0`)
4. Apply probability weighting as normal

### 4. UI Changes

#### Rare Material Selection Modal
When player clicks "Craft" and has rare materials available:
1. Modal appears showing available rare materials
2. Each material shows quantity owned
3. Options:
   - **Use [Material Name]** - Crafts with special material
   - **Use Normal Materials** - Crafts normally

**Modal Features:**
- Shows material name and quantity
- Highlights rare materials in accent color
- Clear "Use Normal Materials" fallback option

### 5. Example: Simple Sword Recipe

**Normal Outputs (no rare material):**
- Rusty Sword (common)
- Iron Sword (common)
- Steel Sword (uncommon)
- Quality Steel Longsword (uncommon)
- etc.

**Named Outputs (with Dragon Scale):**
- **Forest Blade** (uncommon) - Low chance, higher with quality craft
  - `base_weight: 10`
  - `quality_bonus_weight: 300`
- **Shadowblade** (epic) - Very rare, requires high quality
  - `base_weight: 5`
  - `quality_bonus_weight: 500`

## Probability System

### Weight Calculation Formula
```
weight = base_weight + (profession_level - min_level) * weight_per_level + quality_bonus
```

### Named Item Strategy
- **Low base_weight** (5-10) - Rare by default
- **High quality_bonus_weight** (300-500) - Heavily favor high quality crafts
- Only available when rare material is used
- Require superior/masterwork quality to have reasonable chance

### Example Probabilities (Level 10 Blacksmith, Masterwork Quality)

**Normal Outputs:**
- Rusty Sword: 200 + 30 = 230 (lowest priority)
- Iron Sword: 100 + 50 = 150
- Steel Sword: 80 + 60 = 140
- Quality Steel: 30 + 100 = 130 (highest priority normal)

**Named Outputs (with Dragon Scale + Masterwork):**
- Forest Blade: 10 + 300 = 310 (good chance!)
- Shadowblade: 5 + 500 = 505 (highest priority!)

## Testing Setup

Test character (ID: 4) has been given:
- 5× Dragon Scale (material_id: 18)
- 50× Iron Ore (material_id: 1)
- Blacksmithing Level 10

Test by:
1. Navigate to Crafting page
2. Select Blacksmithing
3. Click craft on "Simple Sword"
4. Modal should appear offering Dragon Scale
5. Choose to use Dragon Scale or normal materials
6. Complete minigame
7. High quality crafts should have good chance at named items

## Files Modified

**Database:**
- `db/migrations/040_add_named_equipment_system.sql`
- `db/migrations/041_add_rare_material_to_crafting_session.sql`
- `db/migrate.mjs`

**API Routes:**
- `src/routes/api/game/crafting/start.ts`
- `src/routes/api/game/crafting/complete.ts`

**UI:**
- `src/routes/game/crafting/index.tsx`

## Build Status
✅ Build successful - No TypeScript errors

## Future Enhancements

1. **Add more named items** to other recipe groups
2. **Different rare materials** for different professions
   - Dragon Scale → Blacksmithing weapons
   - Adamantite Ore → Blacksmithing armor
   - Ethereal Silk → Tailoring/Alchemy
3. **Loot drops** - Add rare materials to boss/dungeon loot tables
4. **Visual indicators** - Show sparkle/glow on named items in inventory
5. **Crafting log** - Track which named items player has crafted
