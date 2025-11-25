# Scroll & Ability Audit Report

**Date:** November 24, 2025  
**Database:** rpg (via Turso CLI)

---

## Executive Summary

### ✅ **Good News**
- **All 121 mobs drop scrolls** (100% coverage)
- **105 scrolls exist** for teaching abilities
- Good variety of scroll types: **78 spell scrolls** and **27 ability scrolls**
- Decent tier progression system in place (I, II, III, IV, V tiers)

### ⚠️ **Issues Identified**

1. **Drop rates decrease dramatically at higher levels** (from 12% to 0.8%)
2. **Dungeon bosses have SAME drop rates as regular mobs** (not higher as intended)
3. **20 abilities have NO scrolls at all** (missing from loot tables)
4. **Very limited scroll variety at levels 45+** (only 4-6 unique scrolls)
5. **High-tier scrolls (V-VI) are extremely rare** (only 8-14 mobs drop them)

---

## Detailed Findings

### 1. Abilities Without Scrolls (Missing)

The following **20 abilities** cannot be learned because no scrolls exist:

| Ability Name | Type | Min Level | Notes |
|-------------|------|-----------|-------|
| Kick I, II, III | Physical | 1 | Basic physical attacks |
| Dodge I, II, III | Buff | 1 | Defensive abilities |
| Taunt I, II, III | Ability | 1 | Tank abilities |
| Mend I | Ability | 1 | Basic self-heal |
| Blessing I, II, III | Spell | 1 | Support buffs |
| Fireball I, II, III | Spell | 1 | Basic fire spells |
| Heal | Heal | 1 | Basic heal |
| Heal II, III | Spell | 1 | Mid-tier heals |
| Lightning Bolt | Magical | 4 | Electric damage |

**Impact:** Players cannot learn these 20 abilities, limiting build diversity.

---

### 2. Drop Rate Analysis by Level

#### Drop Rates Decline Severely

| Level Range | Avg Drop Rate | Unique Scrolls | Assessment |
|-------------|---------------|----------------|------------|
| 1-10 | **8-12%** | 4-14 | ✅ Good |
| 11-20 | **4-9%** | 7-13 | ⚠️ Declining |
| 21-30 | **2.4-3%** | 6-10 | ⚠️ Low |
| 31-40 | **1.5-2%** | 5-9 | ❌ Very Low |
| 41-50 | **0.8-1.5%** | 5-9 | ❌ Extremely Low |
| 51-60 | **0.8%** | 4-10 | ❌ Critically Low |

**Problem:** At level 60, players have only a **0.8% chance** to get a scroll drop. This is **15x lower** than level 1 mobs.

---

### 3. Dungeon Boss Analysis

#### Current Boss Drop Rates

| Boss | Level | Scrolls | Avg Drop Rate | Max Drop Rate |
|------|-------|---------|---------------|---------------|
| Giant Rat | 1 | 4 | 12% | 12% |
| Goblin | 3 | 6 | 11.3% | 12% |
| Wild Boar | 3 | 6 | 11.3% | 12% |
| Wolf | 5 | 8 | 10.5% | 12% |
| Forest Spider | 6 | 9 | 9.9% | 12% |
| Orc | 8 | 12 | 9.4% | 12% |
| Skeleton | 10 | 13 | 9% | 12% |
| Cave Troll | 13 | 13 | 7.2% | 12% |

#### Regular Mob Comparison (Same Level Range)

| Regular Mob | Level | Scrolls | Avg Drop Rate | Max Drop Rate |
|------------|-------|---------|---------------|---------------|
| Grass Snake | 1 | 4 | 12% | 12% |
| Giant Beetle | 2 | 5 | 12% | 12% |
| Wild Fox | 3 | 6 | 11.3% | 12% |
| Bandit | 4 | 7 | 10.9% | 12% |

**Problem:** Dungeon bosses have **identical drop rates** to regular mobs of the same level. No incentive to fight bosses for scrolls.

---

### 4. High-Level Scroll Scarcity

#### Levels 55-60 Scroll Availability

| Level | Unique Scrolls Available | Notes |
|-------|-------------------------|-------|
| 55 | 10 | Decent variety |
| 56 | 9 | Good |
| 57 | 8 | Acceptable |
| 58 | **5** | ⚠️ Very limited |
| 59 | **4** | ❌ Extremely limited |
| 60 | **4** | ❌ Extremely limited |

**Rarest High-Tier Scrolls:**
- **Fireball VI** - Only 8 mobs drop it (levels 56-60)
- **Life Drain V** - Only 9 mobs drop it (levels 55-60)
- **Heal VI** - Only 11 mobs drop it (levels 54-60)
- **Blizzard IV** - Only 13 mobs drop it (levels 53-60)

---

### 5. Scroll Distribution by Ability Type

| Type | Scroll Count | Coverage |
|------|-------------|----------|
| Spell | 78 | ✅ Excellent |
| Ability | 27 | ✅ Good |
| **Buff** | **0** | ❌ None (Dodge, Thorns buffs exist) |
| **Heal** | **0** | ❌ None (separate from spell heals) |
| **Damage** | **0** | ❌ None (Kick missing) |

---

## Recommendations

### Priority 1: Fix Missing Scrolls (Critical)

Create scrolls for the 20 missing abilities:
- Kick I, II, III (basic physical DPS)
- Dodge I, II, III (defensive)
- Taunt I, II, III (tank)
- Blessing I, II, III (support)
- Fireball I, II, III (basic mage)
- Heal, Heal II, III (basic healing)
- Mend I (self-heal)
- Lightning Bolt (electric damage)

### Priority 2: Increase Boss Drop Rates (High)

**Recommended Boss Drop Rates:**
- Regular mob base rate: Keep current formula
- **Boss multiplier: 2.5-3x regular mob rate**
- Example: Level 10 boss should have **25-30% scroll drop rate** vs 9% for regular mobs

**Implementation:**
```sql
UPDATE mob_loot 
SET drop_chance = drop_chance * 2.5
WHERE mob_id IN (
  SELECT mob_id FROM dungeon_encounters WHERE is_boss = 1
)
AND item_id IN (SELECT id FROM items WHERE type = 'scroll');
```

### Priority 3: Rebalance High-Level Drop Rates (High)

**Current issue:** Drop rates fall from 12% to 0.8% (15x decrease)

**Recommended formula:**
- Levels 1-20: 8-12% (keep current)
- Levels 21-40: 5-8% (increase from 1.5-3%)
- Levels 41-60: 3-6% (increase from 0.8-1.5%)

**Target:** Make high-level scrolls **3-4x more common** than current rates.

### Priority 4: Add More High-Tier Scroll Variety (Medium)

For levels 55-60:
- Currently: Only 4-10 unique scrolls per level
- Target: **15-20 unique scrolls per level**
- Add tier V and VI scrolls to more mob loot tables

### Priority 5: Guarantee Boss Scroll Drops (Medium)

**Recommendation:** Bosses should drop **1-2 guaranteed scrolls** appropriate to their level.

**Implementation:**
- Keep current % chance rolls
- **Add guaranteed scroll drop** with `drop_chance = 1.0`
- Scroll tier should match boss level (e.g., level 50 boss drops tier IV-V scrolls)

---

## SQL Queries for Quick Fixes

### 1. Boost Boss Scroll Drop Rates by 2.5x

```sql
UPDATE mob_loot 
SET drop_chance = ROUND(drop_chance * 2.5, 4)
WHERE mob_id IN (
  SELECT DISTINCT mob_id FROM dungeon_encounters WHERE is_boss = 1
)
AND item_id IN (SELECT id FROM items WHERE type = 'scroll');
```

### 2. Increase High-Level Scroll Drops (Levels 40+)

```sql
UPDATE mob_loot
SET drop_chance = ROUND(
  CASE 
    WHEN m.level BETWEEN 40 AND 50 THEN drop_chance * 3
    WHEN m.level > 50 THEN drop_chance * 5
    ELSE drop_chance
  END, 4
)
FROM mobs m
WHERE mob_loot.mob_id = m.id
AND mob_loot.item_id IN (SELECT id FROM items WHERE type = 'scroll')
AND m.level >= 40;
```

### 3. Create Missing Basic Scrolls

```sql
-- Example: Create Kick I scroll
INSERT INTO items (name, description, type, value, stackable, teaches_ability_id, required_level)
SELECT 
  'Scroll: ' || name,
  'Teaches the ability: ' || name,
  'scroll',
  50,
  0,
  id,
  1
FROM abilities
WHERE name IN ('Kick I', 'Dodge I', 'Taunt I', 'Mend I', 'Blessing I', 'Fireball I', 'Heal', 'Lightning Bolt');
```

---

## Game Balance Impact

### Current Player Experience (Negative)
- ❌ Players struggle to find scrolls past level 20
- ❌ Bosses feel unrewarding (same drops as trash mobs)
- ❌ Build diversity limited (20 abilities unavailable)
- ❌ High-level content has no incentive (0.8% drop rates)

### After Fixes (Positive)
- ✅ Boss fights become rewarding scroll sources
- ✅ All 125+ abilities learnable via scrolls
- ✅ High-level grinding becomes viable
- ✅ Better progression curve (smooth 3-12% rates)
- ✅ Tier V-VI abilities accessible to dedicated players

---

## Summary Statistics

| Metric | Current | Recommended |
|--------|---------|-------------|
| Abilities with scrolls | 105 / 125 (84%) | 125 / 125 (100%) |
| Boss scroll multiplier | 1x | 2.5-3x |
| Level 60 drop rate | 0.8% | 4-6% |
| Guaranteed boss drops | 0 | 1-2 per boss |
| High-tier scroll variety (L55+) | 4-10 | 15-20 |

---

## Next Steps

1. **Immediate:** Create the 20 missing scrolls and add to loot tables
2. **Quick win:** Multiply boss drop rates by 2.5-3x
3. **Balance pass:** Adjust drop rates for levels 40-60
4. **Content expansion:** Add tier V-VI scrolls to more high-level mobs
5. **Polish:** Add guaranteed scroll drops to bosses

**Estimated Implementation Time:** 2-3 hours for full fixes
