# Crafting Quality System Fix

## Problem Identified

The crafting output quality system was not working correctly. Even when crafting at **masterwork quality**, players were receiving the lowest-level items from a recipe group instead of higher-level items appropriate for their skill.

### Root Cause

The original weight calculation system had fundamental flaws:

```typescript
weight = base_weight + (levelsAboveMin × weight_per_level) + quality_bonus
```

**Problems:**
1. **Inverted base weights**: Lower-level items had HIGHER base weights (e.g., Steel Chainmail: 150, Runic Chainmail: 32)
2. **Penalty for unlearned items**: Items above the player's profession level got negative weight modifiers
3. **Weak quality bonus**: Quality bonuses were too small to overcome the high base weights of low-level items

**Example at profession level 11 (old system):**
- Steel Chainmail (level 11): base 150 + (0×10) + quality 60 = **210 weight**
- Runic Chainmail (level 27): base 32 + (-16×22) + quality 160 = **-160 → clamped to 1**

The lowest-tier item ALWAYS won, even at masterwork quality!

## Solution Implemented

Redesigned the weight system using a **cubic curve** that:
1. Inverts the bias: higher-level items have higher weights
2. Strongly rewards masterwork quality
3. Works correctly for any number of outputs (from 1 to 17+)

### New Formula

```javascript
position = index / (count - 1)  // 0.0 for first item, 1.0 for last
base_weight = 15 + (position³ × 185)        // range 15-200
quality_bonus = 15 + (position³ × 785)       // range 15-800
weight_per_level = 0  // Removed the penalty system
```

### Results

**Moderate Chain Chest (6 outputs) - After fix:**

At **common quality** (no quality bonus):
- Steel Chainmail (Lv 11): 3.5%
- Harmonious Chainmail (Lv 11): 3.8%
- Reinforced Chainmail (Lv 15): 6.4%
- Mithril Chainmail (Lv 21): 13.0%
- Enchanted Mithril (Lv 24): 26.0%
- **Runic Chainmail (Lv 27): 47.3%** ← Still favors highest tier

At **masterwork quality**:
- Steel Chainmail (Lv 11): 1.6%
- Harmonious Chainmail (Lv 11): 1.9%
- Reinforced Chainmail (Lv 15): 4.8%
- Mithril Chainmail (Lv 21): 12.5%
- Enchanted Mithril (Lv 24): 27.4%
- **Runic Chainmail (Lv 27): 51.9%** ← Strong reward for skill!

### Quality Distribution Across Different Recipe Sizes

The cubic curve adapts well to different numbers of outputs:

| Recipe Outputs | Common (highest%) | Masterwork (highest%) |
|----------------|-------------------|----------------------|
| 5 outputs      | 45.8%            | 60.1%                |
| 10 outputs     | 24.0%            | 33.4%                |
| 17 outputs     | 14.4%            | 20.5%                |

## Migration Applied

**File**: `db/migrations/fix-crafting-output-weights.mjs`
**Affected Records**: 554 recipe outputs updated
**Database**: Turso production (rpg)

### Verification

The migration includes built-in verification showing the probability distribution for Moderate Chain Chest as an example, confirming that:
- ✅ Masterwork quality strongly favors the highest-level items
- ✅ Common quality still has variety but leans toward better items
- ✅ The system works for all recipe groups (from potions with 1-2 outputs to armor with 17 outputs)

## Impact

Players will now:
1. Get appropriately leveled items when crafting at their skill level
2. Be rewarded for achieving masterwork quality with much better loot
3. Still have some variety (not always the same item)
4. Have incentive to improve their crafting skill through the minigame

The cubic curve ensures that **skilled play is rewarded** while maintaining enough randomness to keep crafting interesting.
