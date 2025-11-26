# Chain Armor System - STR/DEX Hybrid Build

## Overview
Chain armor has been successfully added to the game as a hybrid equipment option for players building STR/DEX characters. This fills a critical gap in the equipment system, providing balanced offensive and defensive capabilities.

## Equipment Added

### Total Items: 89 Chain Armor Pieces
- **Head**: 18 pieces (levels 1-60)
- **Chest**: 35 pieces (levels 1-60)  
- **Hands**: 18 pieces (levels 1-60)
- **Feet**: 18 pieces (levels 1-60)

### Rarity Distribution
- **Common** (Levels 1-10): 12 pieces
  - Rusty Chain Coif, Chain Coif, Reinforced Chain Coif
  - Rusty Chainmail, Chainmail Hauberk, Reinforced Chainmail
  - Chain Gloves, Chain Gauntlets, Reinforced Chain Gauntlets
  - Chain Boots, Chain Sabatons, Reinforced Chain Sabatons

- **Uncommon** (Levels 11-20): 12 pieces
  - Steel Chain Coif, Linked Chain Helm, Veteran's Chain Helm
  - Steel Chainmail, Linked Chainmail, Veteran's Chainmail
  - Steel Chain Gauntlets, Linked Chain Gauntlets, Veteran's Chain Gauntlets
  - Steel Chain Sabatons, Linked Chain Sabatons, Veteran's Chain Sabatons

- **Rare** (Levels 21-30): 12 pieces
  - Knight's Chain Helm, Dragonscale Chain Helm, Tempest Chain Helm
  - Knight's Chainmail, Dragonscale Chainmail, Tempest Chainmail
  - Knight's Chain Gauntlets, Dragonscale Chain Gauntlets, Tempest Chain Gauntlets
  - Knight's Chain Sabatons, Dragonscale Chain Sabatons, Tempest Chain Sabatons

- **Epic** (Levels 31-50): 24 pieces
  - Warlord's, Titanforged, Stormbringer sets (31-38)
  - Dreadnought, Vanguard, Adamant sets (41-48)

- **Legendary** (Levels 51-60): 12 pieces
  - Mythril Chain set (level 51)
  - Godforged Chain set (level 55)
  - Eternal Warlord's Chain set (level 60)

## Stats & Balance

### Armor Values
Chain armor provides **moderate armor** - positioned between leather (low) and plate (high):
- Level 1: 2-5 armor
- Level 10: 5-11 armor
- Level 20: 11-22 armor
- Level 30: 19-38 armor
- Level 40: 30-60 armor
- Level 50: 44-88 armor
- Level 60: 65-130 armor

### Stat Bonuses
All chain armor provides **balanced STR and DEX bonuses**:
- **Strength**: Primary stat for damage and melee attacks
- **Dexterity**: Secondary stat for critical chance and dodge

Example progression:
- Level 1: +1 STR, +1 DEX (head/hands/feet), +2 STR, +1 DEX (chest)
- Level 20: +7 STR, +6 DEX (head/hands/feet), +9 STR, +7 DEX (chest)
- Level 40: +21 STR, +17 DEX (head/hands/feet), +26 STR, +21 DEX (chest)
- Level 60: +50 STR, +38 DEX (head/hands/feet), +62 STR, +48 DEX (chest)

## Loot Tables

### Total Loot Entries: 2,940
Chain armor drops have been added to mobs across all level ranges with appropriate drop rates:

- **Common** (Levels 1-10): 12% drop rate
- **Uncommon** (Levels 11-20): 8% drop rate
- **Rare** (Levels 21-30): 5% drop rate
- **Epic** (Levels 31-40): 3% drop rate
- **Epic** (Levels 41-50): 2.5% drop rate
- **Legendary** (Levels 51-60): 1.5% drop rate

All chain items drop from mobs in their appropriate level range, ensuring players can find upgrades as they progress.

## Build Synergies

### Ideal For
1. **Melee DPS/Evasion Hybrid**: Players who want to deal strong melee damage while maintaining mobility
2. **Dual-Wield Builds**: DEX improves attack speed and crit, STR boosts damage
3. **Versatile Warriors**: Players who want balanced stats without committing fully to tank or DPS

### Comparison to Other Armor Types

| Armor Type | Primary Stats | Armor Value | Best For |
|------------|---------------|-------------|----------|
| **Plate** | STR, CON | Highest | Pure tanks, survivability |
| **Chain** | STR, DEX | Moderate | Hybrid melee DPS |
| **Leather** | DEX, AGI | Low | Pure DPS, rogues, rangers |
| **Cloth** | INT, WIS | Lowest | Casters, mages |

### Full Set Example (Level 60 Legendary)
- **Eternal Warlord's Chain Helm**: 85 armor, +50 STR, +38 DEX
- **Eternal Warlord's Chainmail**: 130 armor, +62 STR, +48 DEX
- **Eternal Warlord's Chain Gauntlets**: 65 armor, +50 STR, +38 DEX
- **Eternal Warlord's Chain Sabatons**: 65 armor, +50 STR, +38 DEX

**Full Set Totals**: 345 armor, +212 STR, +162 DEX

## Crafting Recipes

### Total Recipes: 72
All chain armor pieces (except pre-existing duplicates) now have crafting recipes via Blacksmithing:

**Recipe Materials by Level:**
- **Level 1-10 (Common)**: Copper Ore (4-8) + Rough Leather (2)
- **Level 11-20 (Uncommon)**: Iron Ore (5-10) + Cured Leather (3)
- **Level 21-30 (Rare)**: Steel Ingot (6-12) + Cured Leather (4) + Minor Gemstone (2)
- **Level 31-40 (Epic)**: Mithril Ore (7-14) + Cured Leather (6) + Minor Gemstone (4) + Rare Herbs (2)
- **Level 41-50 (Epic)**: Adamantite Ore (8-16) + Cured Leather (6) + Major Gemstone (4) + Rare Herbs (3)
- **Level 51-60 (Legendary)**: Adamantite Ore (10-20) + Cured Leather (8) + Major Gemstone (6) + Dragon Scale (3)

**Note**: Chest pieces require ~2x more ore/metal than other slots

### Recipe Materials Entries: 228

Example (Level 60 Legendary):
```
Craft Eternal Warlord's Chainmail
- 20x Adamantite Ore
- 8x Cured Leather
- 6x Major Gemstone
- 3x Dragon Scale
- Craft Time: 205 seconds
- Experience: 1,650 XP
```

## Files Created
1. `db/chain-armor.sql` - Item definitions (89 pieces)
2. `db/chain-loot-only.sql` - Loot table entries (2,940 entries)
3. `db/chain-armor-recipes.sql` - Crafting recipes (72 recipes, 228 material requirements)

## Database State
- **Total Chain Armor**: 89 items
- **Loot Entries**: 2,940
- **Crafting Recipes**: 72 recipes
- **Recipe Materials**: 228 material requirements
- **Level Range**: 1-60 (full progression)
- **All Slots Covered**: head, chest, hands, feet ✓

## Notes
- Chain armor fills the STR/DEX hybrid niche that was previously missing
- Provides a viable alternative to pure tank (plate) or pure DPS (leather) builds
- Balanced stat allocation makes it versatile for multiple playstyles
- Loot tables ensure chain armor drops are available throughout the leveling experience
- All new chain armor pieces have blacksmithing recipes with appropriate materials
- Recipe complexity and material requirements scale with item rarity and level

## Integration
Chain armor is fully integrated into:
- ✅ Item database
- ✅ Mob loot tables
- ✅ Crafting recipes (blacksmithing)
- ✅ Recipe materials
- ✅ Inventory UI (offhand filter now includes all offhand items)

## Testing Recommendations
1. Verify chain armor appears in mob loot drops
2. Test equipping full chain sets on STR/DEX characters
3. Compare damage output vs plate/leather armor builds
4. Verify item tooltips show correct stats
5. Test that chain armor appears in inventory filters correctly
