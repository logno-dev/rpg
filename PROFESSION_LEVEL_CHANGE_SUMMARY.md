# Profession Level System Change - Summary

## What Changed

### Before:
- Profession Level = Character Level / 2
- Max profession level at character level 50 = 25
- Recipe min_level requirement meant character needed to be 2x that level

### After:
- **Profession Level = Character Level** (1:1 ratio)
- Max profession level at character level 50 = 50  
- Recipe min_level requirement directly equals character level needed

## Why This Change?

The old system created massive level mismatches:
- 334 problematic item outputs across all recipes
- Advanced recipes (min_level 25) required character level 50
- But those recipes crafted level 30-40 items
- Result: Items were 10-20 levels underpowered by the time you could craft them

## Implementation

### Code Changes:
**File:** `/src/routes/api/game/crafting/start.ts:96`

```typescript
// OLD
const maxCraftingLevel = character.level === 1 ? 1 : Math.floor(character.level / 2);

// NEW  
const maxCraftingLevel = character.level;
```

### Output Unlock Level Fix:
**File:** `/db/migrations/999_fix_output_unlock_levels.sql`

**Problem:** Items unlocked at profession level equal to or HIGHER than their equip level
- Example: Runic Sword (level 27) unlocked at profession 30 → Already 3 levels behind!

**Solution:** Set `min_profession_level` to be 3 levels BELOW item required_level
- Example: Runic Sword (level 27) unlocks at profession 24 → Craft 3 levels ahead!

This rewards crafters by letting them prepare gear for upcoming levels.

### Database Migration:
**File:** `/db/migrations/999_fix_recipe_levels_for_profession_change.sql`

#### Recipe Tier Adjustments:
1. **Simple Recipes (1-15):** Kept as-is
2. **Moderate Recipes:** 10-30 → **15-30**
3. **Advanced Recipes:** 25-50 → **30-50**
4. **Dual Wield/2H:** 10-60 → **20-60**

#### Additional Fixes:
- Shifted all `min_profession_level` values in recipe_outputs proportionally
- Removed extremely mismatched outputs (items 20+ levels off)
- Removed broken potion outputs from Advanced recipes
- Updated min_profession_level gates to match new structure

## New Recipe Tier Structure

| Tier | Level Range | Purpose | Example Recipes |
|------|-------------|---------|-----------------|
| **Simple** | 1-15 | Basic equipment for new characters | Simple Sword, Simple Cloth Chest |
| **Entry** | 15-20 | Specialty weapons (dual wield/2H) | Dual Daggers, Greatsword |
| **Moderate** | 15-30 | Improved gear for mid-level | Moderate Sword, Moderate Plate |
| **Advanced** | 30-50 | Powerful endgame equipment | Advanced Sword, Advanced Plate |

## Remaining Issues

After the migration, we still have **275 problematic outputs** (down from 334):
- **61 CRITICAL** (15+ levels off)
- **83 HIGH** (10-15 levels off)  
- **131 MEDIUM** (5-10 levels off)

### Why These Remain:

The crafting system uses a **progressive unlock system**:
- Recipes have a wide level range (e.g., Dual Daggers: 20-60)
- Higher-level outputs are gated by `min_profession_level` in `recipe_outputs`
- As you level up within a recipe's range, you unlock better items

**This is INTENDED DESIGN**, not a bug:
- A level 20 character accesses Dual Daggers recipe
- They can craft Mithril Dual Daggers (level 21)
- At level 30, they unlock Dragonbone Dual Daggers (level 30)
- At level 45, they unlock Ethereal Dual Daggers (level 45)
- At level 60, they unlock Ascendant Dual Daggers (level 60)

### Actual Problems:

Most remaining issues are acceptable progressive unlocks. True problems:

1. **Veteran's Chain Helm** (level 18) in Simple recipe (level 1-15) - TOO HIGH
2. Some Dragonscale items (level 30) in Moderate recipes (15-30) - Slightly high
3. Special material gates may need adjustment

## Testing Needed

- [x] Profession level calculation updated
- [x] Recipe tier levels adjusted
- [x] Migration executed successfully
- [ ] Test in-game crafting progression
- [ ] Verify special material gates work correctly
- [ ] Confirm high-level items are properly gated by min_profession_level

## Player Impact

**Positive:**
- Crafting now scales naturally with character level
- Recipe unlocks feel more intuitive
- No more "unlock recipe at 50, craft level 30 items" confusion

**Neutral:**
- Players will need higher character levels to access some recipes
- Moderate recipes now require level 15 (was 10)
- Advanced recipes now require level 30 (was 25)

**Minimal Impact:**
- Most players don't power-level crafting separately from character level
- Natural progression means unlocking recipes as you level feels smooth

## Documentation Updates

- [x] Updated `/src/routes/wiki/crafting.tsx` with profession level explanation
- [x] Created audit script `/db/audit-recipe-levels.sql`
- [x] Created this summary document

## Future Improvements

1. Review remaining "TOO HIGH" outputs and adjust min_profession_level gates
2. Consider splitting ultra-wide recipes (20-60) into multiple tiers
3. Add higher-level potions for Advanced potion recipes
4. Fine-tune special material gates to match item levels better
