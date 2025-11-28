# Quest System Implementation Summary

## Overview
A comprehensive quest system has been implemented for the RPG, supporting single and multi-objective quests, quest chains, repeatable quests, and quest items.

## Database Schema

### Tables Created

1. **quests**
   - Main quest data (name, description, region, level requirement)
   - Support for repeatable quests with cooldowns
   - Quest chain support (chain_id, chain_order)

2. **quest_objectives**
   - Multiple objectives per quest
   - Types: 'kill', 'collect', 'talk'
   - Can target specific mobs, items, regions, or sub-areas
   - Auto-complete option for automatic progression

3. **quest_rewards**
   - Multiple rewards per quest
   - Types: 'xp', 'gold', 'item', 'crafting_material'

4. **character_quests**
   - Track quest status per character: 'available', 'active', 'completed', 'failed'
   - Track current objective and completion times

5. **character_quest_objectives**
   - Track progress on individual objectives (current_count, completed)

6. **crafting_materials** (modified)
   - Added `is_quest_item` flag
   - Added `quest_id` reference for quest-specific items

## API Endpoints

- **GET /api/game/quests?regionId={id}** - Get quests in a region
- **GET /api/game/quests?active=true** - Get active quests
- **GET /api/game/quest/[id]** - Get quest details with progress
- **POST /api/game/quest/accept** - Accept a quest
- **POST /api/game/quest/turnin** - Turn in completed quest

## Quest Helper Functions (src/lib/game.ts)

- `getQuestsInRegion(regionId, characterId)` - List quests in a region with character's status
- `getQuestDetails(questId, characterId)` - Full quest details with objectives and rewards
- `acceptQuest(characterId, questId)` - Accept a quest (validates level, checks existing status)
- `updateQuestProgress(characterId, type, targetId, count)` - Update kill/collect progress
- `turnInQuest(characterId, questId)` - Complete quest and award rewards
- `getActiveQuests(characterId)` - Get all active quests for a character

## Quest Features

### Quest Types Supported

1. **Simple Kill Quests**
   - Kill X of a specific mob
   - Auto-completes when count reached

2. **Multi-Objective Quests**
   - Multiple sequential objectives
   - Mix of kill and collect objectives
   - Must complete in order

3. **Repeatable Quests**
   - Can be completed multiple times
   - Configurable cooldown period (in hours)
   - Tracks last completion time

4. **Regional Quests**
   - Kill any mobs in a specific region
   - Useful for daily/patrol quests

5. **Sub-Area Specific Quests**
   - Target mobs in a specific sub-area
   - More focused hunting grounds

### Quest Items (Crafting Materials)

Quest items are crafting_materials marked with `is_quest_item = 1`:
- Only obtainable during quest
- Automatically removed when quest is turned in
- Can be used as quest objectives

## Sample Quests Created

1. **Fox Hunter** (Region 1, Level 1)
   - Kill 5 Wild Foxes
   - Rewards: 100 XP, 25 Gold

2. **Bandit Menace** (Region 2, Level 5)
   - Kill 6 Bandits
   - Rewards: 250 XP, 50 Gold

3. **Harpy Hunter** (Region 3, Level 10)
   - Kill 5 Harpies
   - Rewards: 500 XP, 100 Gold

4. **Daily Patrol** (Region 1, Level 3, Repeatable)
   - Kill any 10 creatures in Greenfield Plains
   - Cooldown: 24 hours
   - Rewards: 150 XP, 30 Gold

## Quest Progress Tracking

Progress is automatically tracked when:
- Mobs are defeated (kill objectives)
- Quest items are collected (collect objectives)

Auto-completion:
- If `auto_complete = 1`, objective advances automatically when count reached
- Otherwise, player must manually advance or turn in

## Next Steps (Pending)

1. **Combat Integration**
   - Hook `updateQuestProgress()` into combat victory
   - Add quest item drops from mobs
   - Display quest progress in combat log

2. **UI Implementation**
   - Quest log panel
   - Quest details modal
   - Active quest tracker
   - Quest rewards display

3. **Additional Features**
   - Quest chains (prerequisites)
   - Quest givers/NPCs
   - Quest markers on map
   - Quest item inventory management

## Technical Notes

- Quest system uses foreign keys extensively - ensure referential integrity
- Character quest state persists across sessions
- Repeatable quests track completion history
- Quest items are automatically cleaned up on quest completion
- All quest operations are transactional for data consistency
