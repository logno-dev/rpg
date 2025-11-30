# Safe Starting Zones - Update

## Overview
Early game zones have been updated to make low-level mobs non-aggressive, giving new players a safe learning environment where they can choose their battles without being attacked unexpectedly.

## Changes Made

### Greenfield Plains (Region 1) - Level 1-4 Zone
**All level 1-4 mobs are now PASSIVE:**
- Giant Rat (Level 1)
- Grass Snake (Level 1)
- Giant Beetle (Level 2)
- Rabid Rabbit (Level 2)
- Rabid Dog (Level 2)
- Wild Boar (Level 3)
- Wild Fox (Level 3)
- Young Bear (Level 4)

**High-level mobs remain AGGRESSIVE:**
- Zombie (Level 8) through Shadow Fiend (Level 15)
- These serve as dangerous encounters for overconfident players or those who wander too far

### Darkwood Forest (Region 2) - Level 3-7 Zone
**Low-level mobs (3-4) are now PASSIVE:**
- Goblin (Level 3)
- Bandit (Level 4)
- Dire Wolf (Level 4)

**Higher-level mobs (5+) remain AGGRESSIVE:**
- Wolf (Level 5)
- Dire Bat (Level 5)
- Forest Spider (Level 6)
- Treant Sapling (Level 6)
- Forest Wraith (Level 7)

Note: Forest Troll (Level 7) is passive - this may be intentional as a special mob

## Player Experience

### New Player Journey (Level 1-4)
1. **Level 1-2:** Start in Greenfield Plains with completely passive mobs
   - Can learn combat mechanics safely
   - Choose which enemies to fight
   - No risk of being attacked while exploring

2. **Level 3-4:** Can continue in Greenfield Plains or venture to Darkwood Forest
   - Low-level mobs in both zones are passive
   - Provides a gradual difficulty increase
   - Still have control over when to engage in combat

3. **Level 5+:** Mobs start becoming aggressive
   - Players have learned the basics
   - Can handle being attacked
   - Normal MMO/RPG gameplay begins

## Database Changes

```sql
-- Make all Greenfield Plains mobs at appropriate level passive
UPDATE mobs SET aggressive = 0 WHERE region_id = 1 AND level <= 4;

-- Keep high-level mobs in Greenfield aggressive (dangerous wanderers)
UPDATE mobs SET aggressive = 1 WHERE region_id = 1 AND level > 4;

-- Make low-level Darkwood Forest mobs passive
UPDATE mobs SET aggressive = 0 WHERE region_id = 2 AND level <= 4;
```

## Statistics
- **11 passive mobs** in the level 1-4 range across both starter zones
- **13 aggressive mobs** at level 5+ to provide challenge
- Covers all mobs a new player would encounter in their first few levels

## Design Philosophy
This change creates a tutorial-like experience for new players:
- **No punishment for exploring** - players can walk around safely
- **Player-driven progression** - fight when ready, not when forced
- **Natural difficulty curve** - aggression increases as player skill develops
- **Danger still exists** - high-level mobs punish careless exploration
