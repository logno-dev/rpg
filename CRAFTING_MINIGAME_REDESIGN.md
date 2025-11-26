# Crafting Minigame Redesign

## Overview
The crafting minigame has been completely redesigned to be faster (15 seconds or less), more engaging, and visually unique to each profession.

## New Minigame Mechanics

### Timing Bar System
- **Duration**: 10-15 seconds total (3 stages × 3-5 seconds each)
- **Interaction**: Click or press SPACEBAR when the moving marker is in the target zone
- **Stages**: Each profession has 3 themed stages to complete

### Zone System
- **Perfect Zone** (center, green): 20% of bar width
  - Awards +25% success chance
  - Shows "Perfect!" feedback
  
- **Good Zone** (wider, blue): 50% of bar width
  - Awards +15% success chance
  - Shows "Good" feedback
  
- **Miss** (outside zones):
  - Awards +0% success chance
  - Shows "Miss" feedback

### Success Calculation
- **Base Success Rate**: 30%
- **Perfect Hit**: +25% per stage
- **Good Hit**: +15% per stage
- **Miss**: +0% per stage

**Examples**:
- 3 Perfect hits: 30% + 75% = 105% → Guaranteed success + Masterwork quality
- 3 Good hits: 30% + 45% = 75% → Guaranteed success + Fine quality
- 2 Perfect + 1 Miss: 30% + 50% = 80% → Success + Superior quality
- 2 Good + 1 Miss: 30% + 30% = 60% → Success + Common quality
- 3 Misses: 30% + 0% = 30% → Failed craft

## Quality Tiers

Based on final score percentage:

| Score Range | Quality | Stats Bonus | XP Bonus |
|-------------|---------|-------------|----------|
| 0-30% | Failed | - | +25% XP |
| 31-60% | Common | Base stats | +100% XP |
| 61-85% | Fine | +5% stats | +125% XP |
| 86-99% | Superior | +10% stats | +150% XP |
| 100%+ | Masterwork | +15% stats | +200% XP |

## Profession Themes

### Blacksmithing 🔨
**Color**: Red/Orange (fire and metal)
**Stages**:
1. Heat - Bring metal to temperature
2. Shape - Hammer into form
3. Temper - Cool and harden

### Leatherworking 🦌
**Color**: Brown/Amber (leather and hide)
**Stages**:
1. Cut - Slice the leather
2. Soften - Work the material
3. Stitch - Bind it together

### Tailoring 🧵
**Color**: Purple (cloth and dye)
**Stages**:
1. Measure - Size the pattern
2. Weave - Work the fabric
3. Sew - Stitch the seams

### Fletching 🏹
**Color**: Green (wood and nature)
**Stages**:
1. Carve - Shape the shaft
2. Align - Balance the pieces
3. Fletch - Attach the feathers

### Alchemy ⚗️
**Color**: Purple/Violet (magic and potions)
**Stages**:
1. Measure - Portion ingredients
2. Mix - Combine reagents
3. Infuse - Add essence

## Visual Design

### Key Features
- **Profession-themed colors**: Each profession has unique color scheme
- **Glowing effects**: Marker glows with profession color
- **Hit feedback**: Immediate visual feedback on hit quality (green/blue/red)
- **Progress indicators**: Circular badges show completed stages with star/checkmark/X
- **Animated marker**: Smooth bouncing animation across the bar
- **Zone highlighting**: Clear visual distinction between perfect and good zones

### UI Layout
```
┌─────────────────────────────────┐
│     Crafting: Iron Sword        │
│  Click when marker is in zone!  │
├─────────────────────────────────┤
│   Progress: [★] [2] [3]         │  ← Stage indicators
│                                 │
│   Current Stage: HEAT           │
│   Bring metal to temperature    │
│                                 │
│  ░░░[GOOD░░PERFECT░░GOOD]░░░   │  ← The bar
│         ▲ Moving marker         │
│                                 │
│  Press SPACE or Click to hit    │
└─────────────────────────────────┘
```

## Player Experience

### What Makes It Better
1. **Fast**: Complete in 10-15 seconds vs 45 seconds
2. **Simple**: Just watch and click/press spacebar
3. **Skill-based**: Player timing directly affects outcome
4. **Still has RNG**: Base 30% chance means luck still matters
5. **Immediate feedback**: Instant visual response to actions
6. **Themed**: Each profession feels unique visually
7. **Quality matters**: Better performance = better items

### Skill vs Luck Balance
- **New players**: Can still succeed with 30% base chance on misses
- **Skilled players**: Can guarantee success and high quality with perfect timing
- **Average players**: 60-80% success rate with good/perfect mix

## Implementation Files

### New Component
- `src/components/CraftingMinigameNew.tsx` - New minigame implementation

### Updated Files
- `src/routes/game/crafting/index.tsx` - Uses new minigame component
- `src/routes/api/game/crafting/start.ts` - Includes recipeId in response
- `src/routes/api/game/crafting/complete.ts` - (Ready for quality tier support)

### Old Component (Can be removed)
- `src/components/CraftingMinigame.tsx` - Old pin-based minigame

## Future Enhancements

### Potential Additions
1. **Quality-based item stats**: Apply stat bonuses to crafted items based on quality
2. **Difficulty scaling**: Faster bars or smaller zones for higher-level recipes
3. **Profession passive bonuses**: Higher profession level = larger perfect zone
4. **Sound effects**: Audio feedback for hits and misses
5. **Particle effects**: Sparks, dust, or glow effects on perfect hits
6. **Combo system**: Consecutive perfect hits grant bonus quality

### Database Schema for Quality
To implement quality-based stats, we would need to:
1. Add `quality` column to `character_inventory` table
2. Calculate stats on-the-fly in item display based on quality multiplier
3. Store quality tier in crafting result

## Testing Checklist
- [x] Build compiles without errors
- [ ] All professions show correct colors and stages
- [ ] Timing bar animates smoothly
- [ ] Spacebar and click both work
- [ ] Hit detection accurate for perfect/good/miss
- [ ] Quality tiers calculate correctly
- [ ] Result screen shows correct quality
- [ ] Materials consumed on craft start
- [ ] Items awarded on successful craft
- [ ] XP awarded correctly
- [ ] Profession levels up when appropriate
