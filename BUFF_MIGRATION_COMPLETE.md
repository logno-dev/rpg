# Buff System Migration - Complete ✅

## Summary
Successfully migrated all buff abilities from the legacy column-based system to the new `ability_effects` table with proper stat scaling support.

## What Was Changed

### 1. Database Updates
**Converted all Song abilities to ability_effects:**
- Song of Courage I-V (5 abilities) - Strength buff, scales with Charisma
- Song of Fortitude I-V (5 abilities) - Constitution buff, scales with Charisma  
- Song of Swiftness I-V (5 abilities) - Dexterity buff, scales with Charisma

**Updated Blessing abilities to include stat scaling:**
- Blessing I-III now scale with Wisdom (0.3, 0.6, 0.8 factors respectively)

**Total conversions:** 18 abilities now properly using ability_effects system

### 2. Code Changes
**src/routes/gm.tsx:**
- Removed old buff field inputs (buff_stat, buff_amount, buff_duration) from ability edit modal
- Added info message directing users to use Ability Effects system instead
- Removed deprecated field initialization

**src/lib/EffectProcessor.ts:**
- Fixed DOT/HOT stat scaling to work even when tick_value is set
- Added debug logging for buff calculations

**src/components/CombatEngine.tsx:**
- Added debug logging to track ability effect loading

## How Stat Scaling Works Now

### Formula
```
Final Buff Amount = Base Value + ((Caster Stat - 10) × Scaling Factor)
```

### Example: Song of Fortitude I
- **Base Value:** 5 constitution
- **Stat Scaling:** Charisma
- **Scaling Factor:** 1.0
- **Your Charisma:** 20

**Calculation:**
```
Buff Amount = 5 + ((20 - 10) × 1.0)
           = 5 + 10
           = +15 Constitution
```

### Example: Blessing I
- **Base Value:** 3 constitution
- **Stat Scaling:** Wisdom
- **Scaling Factor:** 0.3
- **Caster's Wisdom:** 25

**Calculation:**
```
Buff Amount = 3 + ((25 - 10) × 0.3)
           = 3 + 4.5
           = 3 + 4  (rounded down)
           = +7 Constitution
```

## Ability Effects Table Structure

For buff abilities, set these fields:
- `effect_type`: 'buff'
- `target`: 'self' (or 'enemy' for debuffs)
- `stat_affected`: Which stat to buff ('strength', 'constitution', etc.)
- `value_min`/`value_max`: Base buff amount (set both equal for fixed value)
- `stat_scaling`: Which caster stat affects buff strength ('wisdom', 'charisma', etc.)
- `scaling_factor`: How much each stat point adds (0.3-1.0 typical)
- `duration`: How long the buff lasts in seconds
- `chance`: 1.0 for 100%
- `effect_order`: 1 (or higher for multi-effect abilities)
- `is_periodic`: 0 (buffs are not periodic)

## Testing
Test your Song abilities in combat - they should now show higher buff values based on your Charisma stat!

## Deprecated Fields
These columns still exist in the `abilities` table but are no longer used:
- `buff_stat`
- `buff_amount`
- `buff_duration`

They can be removed in a future schema cleanup migration.

## Database Schema Cleanup - COMPLETE ✅

### Removed Legacy Columns from `abilities` Table:
- ❌ `damage_min` - Now use `ability_effects.value_min`
- ❌ `damage_max` - Now use `ability_effects.value_max`
- ❌ `healing` - Now use `ability_effects` with `effect_type='heal'`
- ❌ `buff_stat` - Now use `ability_effects.stat_affected`
- ❌ `buff_amount` - Now use `ability_effects.value_min/value_max`
- ❌ `buff_duration` - Now use `ability_effects.duration`

### Migration Stats:
- ✅ All 183 abilities verified intact after column removal
- ✅ All abilities using legacy fields now have effects in `ability_effects` table
- ✅ Foreign key constraints maintained
- ✅ Indexes recreated successfully

### GM Interface Updated:
- Removed input fields for all legacy columns
- Added info messages directing users to Ability Effects system
- Cleaned up ability initialization code

### Migration Safety:
Before removing columns, we ensured:
1. All abilities using `damage_min/max` → migrated to damage effects
2. All abilities using `healing` → migrated to heal effects  
3. All abilities using `buff_*` → migrated to buff effects
4. Zero abilities left without corresponding effects

**Result:** The abilities table is now clean and all ability behavior is defined through the flexible `ability_effects` system!
