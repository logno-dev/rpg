# Greenfield Plains - Starter Zone Cleanup

## Overview
Greenfield Plains has been cleaned up to serve as a proper starter zone (levels 1-4) with all mobs being passive and high-level content moved to appropriate regions.

## Changes Made

### 1. Moved High-Level Mobs Out
**8 high-level mobs moved from Greenfield Plains (Region 1) to Shadowdeep Dungeon (Region 4):**
- Zombie (Level 8)
- Ghoul (Level 9)
- Skeleton (Level 10)
- Wraith (Level 11)
- Dark Cultist (Level 12)
- Cave Troll (Level 13)
- Gargoyle (Level 14)
- Shadow Fiend (Level 15)

These mobs remain aggressive and are now in appropriate high-level areas.

### 2. Moved Affected Quests
**3 quests updated to match mob locations:**
- Quest 139: "Clear the Skeletons" → Moved to Shadowdeep Dungeon
- Quest 75: "Clear the Dark Cultists" → Moved to Shadowdeep Dungeon
- Quest 100: "Clear the Skeletons" → Moved to Shadowdeep Dungeon

### 3. Added Mob Diversity
**8 new peaceful creature types added to Greenfield Plains:**

**Level 1:**
- Chicken - Very weak farmyard bird
- Stray Cat - Agile stray cat

**Level 2:**
- Wild Turkey - Larger bird
- Prairie Dog - Burrowing rodent

**Level 3:**
- Farm Goat - Escaped farm animal
- Scavenger Crow - Clever bird

**Level 4:**
- Stray Hound - Wild dog
- Barn Owl - Nocturnal predator

### 4. Fixed Existing Diversity Mobs
**3 mobs already in sub-areas, now properly assigned:**
- Feral Hound (Level 1) - Now in Greenfield Plains, passive
- Meadow Sprite (Level 2) - Now in Greenfield Plains, passive
- Crop Blight (Level 3) - Now in Greenfield Plains, passive

## Final Greenfield Plains Mob Roster

### By Level
- **Level 1:** 5 mob types (Chicken, Stray Cat, Feral Hound, Giant Rat, Grass Snake)
- **Level 2:** 6 mob types (Wild Turkey, Prairie Dog, Meadow Sprite, Giant Beetle, Rabid Dog, Rabid Rabbit)
- **Level 3:** 5 mob types (Farm Goat, Scavenger Crow, Crop Blight, Wild Boar, Wild Fox)
- **Level 4:** 3 mob types (Stray Hound, Barn Owl, Young Bear)

**Total: 19 unique passive mobs** across the starter zone

### Sub-Area Distribution
Mobs are distributed across three starter sub-areas:

**Village Outskirts (Level 1-2):**
- Giant Rat, Feral Hound, Rabid Dog, Goblin, Wild Fox
- Chicken, Stray Cat, Wild Turkey

**Open Meadow (Level 2-3):**
- Giant Rat, Rabid Dog, Meadow Sprite, Wild Fox
- Wild Turkey, Prairie Dog, Scavenger Crow

**Farmland (Level 3-4):**
- Rabid Dog, Wild Boar, Wild Fox, Crop Blight
- Farm Goat, Scavenger Crow, Stray Hound, Barn Owl

## Benefits

### For New Players
- **19 different mob types** to learn combat on safely
- All passive - no risk of being attacked while exploring
- Natural progression from level 1-4
- Thematic variety (wild animals, farm creatures, magical sprites)

### For Game Balance
- Clear zone level range (1-4)
- High-level content moved to appropriate dungeons
- Quests match their target region
- Sub-areas provide gradual difficulty increase

## Database Changes Summary

```sql
-- Move high-level mobs to Shadowdeep Dungeon
UPDATE mobs SET region_id = 4 WHERE region_id = 1 AND level >= 8;

-- Move quests to appropriate regions
UPDATE quests SET region_id = 4 WHERE id IN (139, 75, 100);

-- Add new peaceful creatures
-- (8 new mob types added - see add-greenfield-mob-diversity.sql)

-- Fix existing diversity mobs
UPDATE mobs SET region_id = 1, aggressive = 0 
WHERE name IN ('Feral Hound', 'Meadow Sprite', 'Crop Blight');
```

## Result
Greenfield Plains is now a complete, safe starter zone with:
- ✓ Appropriate level range (1-4)
- ✓ All mobs passive
- ✓ Good mob variety (19 types)
- ✓ Thematic consistency
- ✓ No misplaced high-level content
- ✓ Quests match zone difficulty
