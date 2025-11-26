# Crafting Difficulty Scaling System

## Overview
Crafting difficulty now scales based on the difference between your profession level and the recipe's required level. Higher-level crafters have better success rates when making lower-level items.

## The Formula

### Level Bonus Calculation
```
levelDiff = professionLevel - recipeLevel
levelBonus = min(40, max(0, levelDiff × 5))
```

**Translation**: +5% base success per level above recipe requirement, capped at +40%

### Total Score Calculation
```
baseScore = 30% + levelBonus
totalScore = baseScore + perfectHits × 25% + goodHits × 15%
```

## Practical Examples

### Level 8 Crafter Making Level 1 Item
```
Level Diff: 8 - 1 = 7 levels over
Level Bonus: 7 × 5% = +35%
Base Score: 30% + 35% = 65%

3 Perfect: 65 + 75 = 140% → Masterwork (guaranteed!)
2 Perfect + 1 Miss: 65 + 50 = 115% → Masterwork
1 Perfect + 2 Miss: 65 + 25 = 90% → Superior
3 Good: 65 + 45 = 110% → Masterwork
3 Miss: 65% → Fine (success guaranteed even with all misses!)
```

### Level 8 Crafter Making Level 8 Item (At-Level)
```
Level Diff: 8 - 8 = 0 (no bonus)
Level Bonus: 0%
Base Score: 30%

3 Perfect: 30 + 75 = 105% → Masterwork
2 Perfect + 1 Good: 30 + 65 = 95% → Superior
2 Perfect + 1 Miss: 30 + 50 = 80% → Fine
3 Good: 30 + 45 = 75% → Fine
2 Good + 1 Miss: 30 + 30 = 60% → Common
3 Miss: 30% → Failed
```

### Level 10 Crafter Making Level 2 Item
```
Level Diff: 10 - 2 = 8 levels over
Level Bonus: 8 × 5% = 40% (capped at max)
Base Score: 30% + 40% = 70%

3 Perfect: 70 + 75 = 145% → Masterwork
Any 2 hits: 70+ → At least Masterwork
1 Perfect: 70 + 25 = 95% → Superior
3 Miss: 70% → Fine (guaranteed success!)
```

### Level 5 Crafter Making Level 8 Item (Under-leveled)
```
Level Diff: 5 - 8 = -3 (can't craft - level requirement not met)
This scenario is prevented by the UI (recipe locked)
```

## Quality Thresholds (Unchanged)

```
Score >= 100% → Masterwork (+15% stats, +100% XP)
Score >= 86%  → Superior (+10% stats, +50% XP)
Score >= 61%  → Fine (+5% stats, +25% XP)
Score >= 31%  → Common (base stats, full XP)
Score < 31%   → Failed (no item, 25% XP)
```

## Bonus Cap Rationale

**Why cap at +40%?**
- Prevents trivializing low-level crafts (still need some attention)
- 8+ levels over = you're a master, but not infallible
- Maintains some engagement even for easy recipes

**Why +5% per level?**
- Noticeable improvement per level gained
- Makes leveling feel rewarding
- Smooth difficulty curve

## Progression Examples

### Blacksmithing Progression

**Level 1 Blacksmith**:
- Making Level 1 items: 30% base (standard difficulty)
- Making Level 2 items: Can't craft yet

**Level 5 Blacksmith**:
- Making Level 1 items: 50% base (+20% easier)
- Making Level 5 items: 30% base (standard)
- Making Level 10 items: Can't craft yet

**Level 10 Blacksmith**:
- Making Level 1 items: 70% base (+40% easier, capped)
- Making Level 5 items: 55% base (+25% easier)
- Making Level 10 items: 30% base (standard)
- Making Level 20 items: Can't craft yet

**Level 15 Blacksmith**:
- Making Level 1 items: 70% base (at cap)
- Making Level 10 items: 55% base
- Making Level 15 items: 30% base
- Making Level 20 items: Can't craft yet

## Practical Impact

### For New Crafters (Level 1-5):
- Making at-level items is challenging but fair
- 3 perfect hits = guaranteed success
- Encourages learning the minigame

### For Mid-Level Crafters (Level 6-10):
- Low-level items become reliable to craft
- At-level items still require skill
- Progression feels rewarding

### For High-Level Crafters (Level 11+):
- Low-level items are easy (good for bulk crafting)
- Mid-level items are comfortable
- Max-level items still require focus
- Masterwork becomes more achievable with skill

## Design Goals Achieved

✅ **Skill Progression**: Higher level = easier time with old recipes
✅ **Engagement**: Even easy recipes require some attention
✅ **Reward Skilled Play**: Perfect hits always matter
✅ **Accessible**: New players can still succeed with practice
✅ **Balanced**: Cap prevents total trivialization
✅ **Intuitive**: Makes logical sense (experienced = better results)

## Testing Scenarios

### Scenario 1: Leveling Up
- Level 4 crafter makes Level 3 item: 35% base
- Level up to 5
- Same Level 3 item now: 40% base (+5% easier)
- **Feel**: Immediate improvement, leveling matters

### Scenario 2: Bulk Crafting
- Level 10 crafter needs 20 Level 2 potions
- Base 70% means 3 misses still succeed
- Can craft quickly without stress
- **Feel**: Comfortable, not tedious

### Scenario 3: Challenge Content
- Level 10 crafter attempts Level 10 legendary recipe
- Base 30%, needs skill to succeed
- 3 perfect = Masterwork achievement
- **Feel**: Engaging, rewarding mastery

---

**Status**: ✅ Implemented and working
**Build**: ✅ Passing
**Formula**: levelBonus = min(40, max(0, (professionLevel - recipeLevel) × 5))
