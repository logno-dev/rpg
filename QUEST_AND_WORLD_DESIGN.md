# Quest and World Design Considerations

## UI/UX Design Decisions

### Character Menu Restructuring
**Current**: Direct "Character" button → Character stats page
**Planned**: "Character" button → Submenu modal with:
- **Stats & Equipment** - View/manage character stats and gear
- **Hotbar Management** - Configure ability/item hotbar
- **Character Select** - Switch between characters

**Benefits**:
- Cleaner navigation bar
- Logical grouping of character-related functions
- Room for additional character features (achievements, titles, etc.)

### Quest Tracker Implementation
**Design**: Standalone modal accessible from nav bar
**Technical**: Managed in `characterContext` for global access

**Features to Include**:
- Active quest list with progress bars
- Quest objective checklist
- Quick "Turn In" button for completed quests
- Quest details on click
- Visual indicators (new, in-progress, ready to turn in)

**Benefits**:
- Available on all routes without route changes
- Character-specific state management
- Can show real-time progress updates during combat
- Doesn't require navigation away from current activity

---

## World Design: Non-Linear Sub-Area System

### Philosophy
**Regions are containers, not linear progression paths.**

Sub-areas within a region can have **vastly different difficulty levels**, allowing:
- Low-level players to access high-level regions (safe sub-areas)
- High-level players to revisit starter regions (elite sub-areas)
- Quests that span multiple regions while maintaining level consistency

### Examples

#### Greenfield Plains (Region 1)
- **Sunny Meadows** (Levels 1-3) - Starter area
- **Rolling Hills** (Levels 2-4) - Slightly harder
- **Old Farm Ruins** (Levels 3-5) - Original max level
- **Bandit Encampment** (Levels 8-12) - **Elite area in starter zone!**

#### Darkwood Forest (Region 2)
- **Forest Outskirts** (Levels 3-6) - **Newbie-friendly area in mid-level zone!**
- **Forest Edge** (Levels 5-7) - Easy
- **Dense Thicket** (Levels 7-9) - Medium
- **Ancient Grove** (Levels 9-12) - Hard
- **Cursed Depths** (Levels 14-18) - **Elite area**

### Quest Design Implications

#### Quest Example: "The Bandit Network"
```
Objective 1: Investigate bandit activity
  - Location: Forest Outskirts (Darkwood, Levels 3-6)
  - Kill 5 Bandit Scouts

Objective 2: Find the bandit camp
  - Location: Bandit Encampment (Greenfield, Levels 8-12)
  - Discover hidden camp entrance

Objective 3: Defeat the bandit leader
  - Location: Bandit Encampment
  - Kill Bandit Captain (Level 12 elite)
```

This quest:
- Starts in a "safe" area of Darkwood (level 3-6)
- Sends players to an "elite" area of Greenfield (level 8-12)
- Creates logical narrative flow (scouts → camp)
- Maintains consistent difficulty through sub-area selection

#### Quest Example: "Gathering Resources"
```
A level 15 player needs rare herbs that only grow in:
  - Forest Outskirts (Darkwood) - Low risk, level 3-6
  - Sunny Meadows (Greenfield) - Low risk, level 1-3
  - Mountain Foothills (Ironpeak) - Medium risk, level 8-10
```

Player can choose risk vs. reward based on sub-area selection.

### Implementation Already Supports This

The current sub-area system **already fully supports** non-linear design:
- Sub-areas have independent `min_level` and `max_level`
- Not constrained by parent region level ranges
- Quest objectives can target specific sub-areas
- Mob spawns use level variance for additional flexibility

**Example from current data**:
```sql
-- Greenfield Plains is normally levels 1-5
-- But we can add:
INSERT INTO sub_areas (region_id, name, min_level, max_level) VALUES
  (1, 'Bandit Encampment', 8, 12);  -- Elite sub-area!
```

### Benefits for Quest Design

1. **Narrative Flexibility**
   - Quests follow story logic, not level brackets
   - "Return to hometown to defend from attack" makes sense even at high level

2. **Varied Gameplay**
   - Players revisit familiar regions for new challenges
   - No region becomes "obsolete" after leveling past it

3. **Natural Quest Chains**
   - Quest chains can span multiple regions organically
   - Follow clues/trails regardless of region boundaries

4. **Player Choice**
   - Multiple sub-areas at appropriate level across different regions
   - Choose based on theme, rewards, or preference

5. **Scalable Content**
   - Add new sub-areas to existing regions without disrupting world structure
   - "Secret areas" or "hidden challenges" can be added anywhere

---

## Quest Design Best Practices

### Level Consistency Through Sub-Areas
- Quest objectives should target sub-areas with consistent level ranges
- Use `target_sub_area_id` to ensure appropriate difficulty

### Multi-Region Quests
```sql
-- Quest: "Hunt the Escaped Prisoner"
Objective 1: Forest Outskirts (Darkwood, 3-6) - Find tracks
Objective 2: Sunny Meadows (Greenfield, 1-3) - Question witnesses  
Objective 3: Cave Entrance (Ironpeak, 4-7) - Locate hideout
Objective 4: Dark Cave (Ironpeak, 8-12) - Defeat prisoner
```

All objectives are level-appropriate despite spanning 3 regions!

### Dynamic Quest Difficulty
With mixed-level sub-areas, you can create:
- **Easy Mode**: Target low-level sub-areas across multiple regions
- **Hard Mode**: Target elite sub-areas for better rewards
- **Scaling Quests**: Same quest, different sub-areas based on player level

---

## Implementation Notes

### Current Status
✅ Sub-area system fully supports non-linear design
✅ Quest system can target specific sub-areas
✅ Mob level variance adds granularity
✅ No code changes needed to support this

### Recommended Next Steps
1. Populate regions with mixed-level sub-areas
2. Create quest chains that demonstrate cross-region, level-consistent progression
3. Add "elite" sub-areas to starter zones for endgame farming
4. Add "safe" sub-areas to high-level zones for resource gathering

### Example Content Expansion
Each region should have:
- 2-3 sub-areas at "normal" difficulty for the region
- 1-2 "safe" sub-areas (lower level than region average)
- 1-2 "elite" sub-areas (higher level than region average)

This creates 5-7 sub-areas per region with varied difficulty, supporting diverse quest design.
