# Ranger Abilities Stat Scaling Bug Fix

## The Problem

Ranger abilities were doing significantly less damage to lower-level mobs than expected. For example:
- **Aimed Shot** against level 5 mob: ~2 damage
- **Aimed Shot** against level 11 mob: ~18 damage

This was backwards - abilities should be doing MORE damage against weaker enemies (less defense).

## Root Cause

The bug was in how ability effects were inserted into the database. The SQL was confusing two different columns:

### Database Schema
```typescript
ability_effects {
  stat_scaling: string | null;    // Should be stat NAME like "dexterity"
  scaling_factor: number;          // Should be scaling MULTIPLIER like 0.8
}
```

### Buggy SQL (from add-ranger-abilities.sql)
```sql
INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, value_min, value_max,
  is_periodic, tick_interval, tick_count, tick_value, stat_scaling, duration, chance, stacks_max, created_at)
SELECT id, 0, 'damage', 'enemy', 15, 25, 0, 2, 0, 0, 0.8, 0, 1, 1, unixepoch()
```

**The problem:** 
- The `scaling_factor` column was missing from the column list
- The value `0.8` (scaling factor) was being inserted into `stat_scaling` 
- `stat_scaling` should have been `'dexterity'`

### How This Broke Damage Calculations

In `EffectProcessor.ts` line 20:
```typescript
const statValue = character[effect.stat_scaling as keyof Character] as number || 10;
```

This tried to look up `character['0.8']` instead of `character['dexterity']`, which:
1. Returned `undefined`, defaulting to 10
2. With `scaling_factor = 0` (not set), stat scaling was completely broken
3. Damage was only the base amount minus mob defense

## The Fix

Updated ALL Ranger ability effects in the database to:
1. Set `stat_scaling = 'dexterity'`
2. Set `scaling_factor` to the correct value (0.4, 0.5, 0.8, etc.)

### Affected Abilities
- **Aimed Shot** (I-V): scaling_factor 0.8, 1.0, 1.2, 1.4, 1.6
- **Multi-Shot** (I-V): scaling_factor 0.5, 0.6, 0.7, 0.8, 0.9
- **Poison Arrow** (I-V): initial + DoT effects, various scaling factors
- **Evasion** (I-V): buff ability, scaling_factor 0.3-0.7
- **Rapid Fire** (I-V): scaling_factor 0.4-0.8
- **Crippling Shot** (I-V): damage + debuff effects, various scaling factors

## Fix Script

Executed: `db/fix-all-ranger-ability-stat-scaling.sql`

## Expected Result

After this fix, with a Dexterity stat of (for example) 30:
- **Base damage**: 15-25 (Aimed Shot I)
- **Stat bonus**: (30 - 10) × 0.8 = 16
- **Total before defense**: 31-41 damage
- **After mob defense** (5 defense): 26-36 damage

This should now scale properly regardless of mob level - the damage reduction comes from defense, not from broken stat scaling.
