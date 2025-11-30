# Ranger Abilities System - Complete

## Overview
A complete ranger class ability system has been implemented with 5 unique abilities, each with 5 tiers (levels I-V). All abilities require a bow and quiver, scale with dexterity, and follow the same progression pattern as other class abilities.

## Abilities Created

### 1. Aimed Shot (Physical Damage - High Precision)
**Description:** A carefully aimed arrow that deals devastating damage

**Weapon Requirements:** Bow  
**Primary Stat:** Dexterity  
**Mana Cost:** 0  
**Cooldown:** 6 seconds

| Tier | Level Req | Dex Req | Damage | Stat Scaling |
|------|-----------|---------|--------|--------------|
| I    | 3         | 16      | 15-25  | 0.8          |
| II   | 16        | 32      | 28-42  | 1.0          |
| III  | 23        | 40      | 45-65  | 1.2          |
| IV   | 36        | 58      | 70-95  | 1.4          |
| V    | 49        | 71      | 105-140| 1.6          |

### 2. Multi-Shot (Physical Damage - AoE)
**Description:** Fire arrows at multiple targets in quick succession

**Weapon Requirements:** Bow + Quiver  
**Primary Stat:** Dexterity  
**Mana Cost:** 0  
**Cooldown:** 10 seconds

| Tier | Level Req | Dex Req | Damage  | Targets | Stat Scaling |
|------|-----------|---------|---------|---------|--------------|
| I    | 3         | 16      | 8-14    | 2       | 0.5          |
| II   | 16        | 32      | 15-23   | 3       | 0.6          |
| III  | 23        | 40      | 24-35   | 3       | 0.7          |
| IV   | 36        | 58      | 38-52   | 4       | 0.8          |
| V    | 49        | 71      | 58-78   | 5       | 0.9          |

### 3. Poison Arrow (Magic - DoT)
**Description:** An arrow coated with deadly poison that deals damage over time

**Weapon Requirements:** Bow  
**Primary Stat:** Dexterity  
**Type:** Spell  
**Cooldown:** 8 seconds

| Tier | Level Req | Dex Req | Mana Cost | Initial Damage | DoT Damage | Ticks | Duration | Stat Scaling |
|------|-----------|---------|-----------|----------------|------------|-------|----------|--------------|
| I    | 3         | 16      | 10        | 5-8            | 3/tick     | 5     | 10s      | 0.4/0.2      |
| II   | 16        | 32      | 15        | 10-15          | 5/tick     | 6     | 12s      | 0.5/0.25     |
| III  | 23        | 40      | 22        | 16-24          | 8/tick     | 6     | 12s      | 0.6/0.3      |
| IV   | 36        | 58      | 32        | 26-38          | 12/tick    | 7     | 14s      | 0.7/0.35     |
| V    | 49        | 71      | 45        | 40-58          | 18/tick    | 8     | 16s      | 0.8/0.4      |

### 4. Explosive Arrow (Magic - High Burst AoE)
**Description:** A magically charged arrow that explodes on impact

**Weapon Requirements:** Bow  
**Primary Stat:** Dexterity  
**Type:** Spell  
**Cooldown:** 12 seconds

| Tier | Level Req | Dex Req | Mana Cost | Damage   | Stat Scaling |
|------|-----------|---------|-----------|----------|--------------|
| I    | 3         | 16      | 20        | 18-28    | 0.9          |
| II   | 16        | 32      | 30        | 32-48    | 1.1          |
| III  | 23        | 40      | 42        | 52-72    | 1.3          |
| IV   | 36        | 58      | 58        | 80-110   | 1.5          |
| V    | 49        | 71      | 78        | 120-160  | 1.7          |

### 5. Rapid Fire (Physical - Multi-Hit)
**Description:** Unleash a flurry of rapid shots at your target

**Weapon Requirements:** Bow + Quiver  
**Primary Stat:** Dexterity  
**Mana Cost:** 0  
**Cooldown:** 5 seconds (Fastest)

| Tier | Level Req | Dex Req | Damage  | Hits | Stat Scaling |
|------|-----------|---------|---------|------|--------------|
| I    | 3         | 16      | 6-10    | 3    | 0.4          |
| II   | 16        | 32      | 11-17   | 3    | 0.5          |
| III  | 23        | 40      | 18-26   | 4    | 0.6          |
| IV   | 36        | 58      | 28-40   | 4    | 0.7          |
| V    | 49        | 71      | 42-60   | 5    | 0.8          |

## Scrolls Created

All 25 abilities have corresponding scrolls (5 abilities × 5 tiers = 25 scrolls) that teach the abilities when used.

**Scroll Naming Convention:** `Scroll: [Ability Name] [Tier]`

**Rarity by Tier:**
- Tier I: Common (75 gold)
- Tier II: Uncommon (200 gold)
- Tier III: Rare (500 gold)
- Tier IV: Epic (1200 gold)
- Tier V: Legendary (3000 gold)

**Requirements:** Level and Dexterity requirements are on the scrolls (not the abilities themselves)

## Distribution

### New Ranger-Themed Quests
- **25 brand new ranger quests** created specifically for teaching ranger abilities
- Each quest is themed around archery training or ranger mastery
- Quests distributed across 4 regions matching tier progression:

**Tier I Quests (Level 3) - Darkwood Forest:**
1. Archery Training: Precision Shots → Aimed Shot I
2. Archery Training: Multiple Targets → Multi-Shot I
3. Archery Training: Rapid Fire → Rapid Fire I
4. Ranger Secrets: Poison Arrows → Poison Arrow I
5. Ranger Secrets: Explosive Arrows → Explosive Arrow I

**Tier II Quests (Level 16) - Frostpeak Glaciers:**
6. Advanced Archery: Deadly Precision → Aimed Shot II
7. Advanced Archery: Area Suppression → Multi-Shot II
8. Advanced Archery: Blinding Speed → Rapid Fire II
9. Ranger Mastery: Deadly Venom → Poison Arrow II
10. Ranger Mastery: Devastating Blasts → Explosive Arrow II

**Tier III Quests (Level 23) - Elven Sanctum:**
11. Expert Archery: Elven Precision → Aimed Shot III
12. Expert Archery: Elven Barrage → Multi-Shot III
13. Expert Archery: Lightning Draw → Rapid Fire III
14. Ranger Excellence: Lethal Toxins → Poison Arrow III
15. Ranger Excellence: Cataclysmic Arrows → Explosive Arrow III

**Tier IV Quests (Level 36) - Demon Citadel:**
16. Master Archery: Demon Hunter → Aimed Shot IV
17. Master Archery: Demon Slayer Volley → Multi-Shot IV
18. Master Archery: Demon Piercer → Rapid Fire IV
19. Ranger Mastery: Infernal Toxins → Poison Arrow IV
20. Ranger Mastery: Hellfire Arrows → Explosive Arrow IV

**Tier V Quests (Level 49) - Elemental Chaos:**
21. Legendary Archery: Chaos Marksman → Aimed Shot V
22. Legendary Archery: Storm of Arrows → Multi-Shot V
23. Legendary Archery: Divine Velocity → Rapid Fire V
24. Legendary Ranger: Primordial Toxins → Poison Arrow V
25. Legendary Ranger: Apocalypse Arrows → Explosive Arrow V

Each quest includes:
- Thematic description related to ranger training
- Kill objectives against appropriate enemies
- XP and gold rewards scaling with level
- The corresponding ranger scroll as quest reward

### Mob Loot Tables
- **496 mob loot entries** added across appropriate level ranges
- Drop rates decrease with tier (more common at lower tiers)
- Level-appropriate distribution:
  - Tier I: Level 3-10 mobs (0.3-0.4% drop chance)
  - Tier II: Level 16-25 mobs (0.25-0.35% drop chance)
  - Tier III: Level 23-35 mobs (0.2-0.3% drop chance)
  - Tier IV: Level 36-48 mobs (0.15-0.25% drop chance)
  - Tier V: Level 49+ mobs (0.1-0.2% drop chance)

### Named Mob Loot
- **21 named mob loot entries** with higher drop rates (5-15%)
- Tier-appropriate bosses and elite enemies
- Better drop rates than regular mobs to incentivize challenging content

## Technical Implementation

### Database Tables
1. **abilities** - 25 new ranger abilities
2. **ability_effects** - Damage, DoT, and multi-target effects
3. **items** - 25 ranger ability scrolls
4. **quest_rewards** - Quest reward entries
5. **mob_loot** - Regular mob drop entries
6. **named_mob_loot** - Boss/elite mob drop entries

### Files Created
- `db/add-ranger-abilities.sql` - Main ability and scroll creation (25 abilities, 25 scrolls)
- `db/add-ranger-quests.sql` - 25 ranger-themed quests with scroll rewards
- `db/add-ranger-scroll-rewards.sql` - Additional loot table distribution (mob and named mob loot)

## Design Philosophy

1. **Physical vs Magic:** Three physical abilities (Aimed Shot, Multi-Shot, Rapid Fire) and two magic abilities (Poison Arrow, Explosive Arrow)
2. **Resource Management:** Magic abilities require mana; physical abilities are free but have longer cooldowns
3. **Playstyle Variety:** 
   - Single-target burst (Aimed Shot)
   - AoE damage (Multi-Shot, Explosive Arrow)
   - Sustained DPS (Rapid Fire)
   - DoT pressure (Poison Arrow)
4. **Dexterity Scaling:** All abilities scale with dexterity, making DEX the primary stat for rangers
5. **Progressive Power:** Clear power progression across tiers following established patterns

## Usage

### Equipment Requirements
Rangers will need:
- **A bow (weapon slot)** - Required for all ranger abilities
- **A quiver (offhand slot)** - Only required for Multi-Shot and Rapid Fire
- Sufficient dexterity to meet ability requirements
- Appropriate character level

### Design Notes
- **Aimed Shot, Poison Arrow, and Explosive Arrow** can be used with just a bow, allowing for shield or other offhand items
- **Multi-Shot and Rapid Fire** require a quiver, representing the need for quick arrow access when firing multiple shots
- This provides tactical choice: use a quiver for multi-target DPS, or use a different offhand (like a shield) for single-target abilities with more defense

The abilities provide a complete ranger archetype focusing on ranged physical damage with some magical options for variety.
