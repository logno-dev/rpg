# Region Unlock System - Character-Specific

## Overview
The region unlock system has been updated to be **character-specific** rather than global. Each character independently unlocks regions based on their achievements and progress.

## Database Changes

### New Table: `character_region_unlocks`
```sql
CREATE TABLE character_region_unlocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id INTEGER NOT NULL,
    region_id INTEGER NOT NULL,
    unlocked_at INTEGER DEFAULT (unixepoch()),
    
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
    FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE CASCADE,
    UNIQUE(character_id, region_id)
);
```

This table tracks which regions each character has unlocked.

## Unlock Requirements

Regions can have various unlock requirements specified in the `regions.unlock_requirement` field:

1. **Level-based**: `"Reach level 25"`
   - Automatically checked when character levels up or travels
   
2. **Boss Defeat**: `"Defeat Silverwood Guardian"`
   - Checks if character has defeated the named mob
   
3. **Dungeon Completion**: `"Complete Ancient Ruins dungeon"`
   - Checks if character has completed the specified dungeon

## API Functions

### `hasUnlockedRegion(characterId, regionId)`
Checks if a character has unlocked a specific region.

### `unlockRegion(characterId, regionId)`
Unlocks a region for a specific character.

### `getAllRegions(characterLevel, characterId)`
Returns all regions with unlock status specific to the character. Automatically checks and unlocks regions if requirements are met.

## Automatic Unlocking

Regions are automatically unlocked when:

1. **On Character Creation**: Region 1 (Greenfield Plains) is unlocked
2. **On Travel**: When trying to travel, if requirements are met, region is unlocked
3. **On Region List Fetch**: When fetching regions, requirements are checked and auto-unlocking occurs

## Migration

The migration file `add-character-region-unlocks.sql` performs:
- Creates the new table
- Unlocks Region 1 for all existing characters
- Sets up unlock requirements for regions 2-5

## Testing

To verify the system:
1. Create a new character - should start with only Region 1 unlocked
2. Level up to meet requirements - regions should auto-unlock
3. Defeat required bosses - corresponding regions should unlock
4. Different characters should have independent unlock progress
