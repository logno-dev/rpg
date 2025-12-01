-- Create character_region_unlocks table to track per-character region access
CREATE TABLE IF NOT EXISTS character_region_unlocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id INTEGER NOT NULL,
    region_id INTEGER NOT NULL,
    unlocked_at INTEGER DEFAULT (unixepoch()),
    
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
    FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE CASCADE,
    UNIQUE(character_id, region_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_character_region_unlocks_character 
ON character_region_unlocks(character_id);

-- Unlock the first region (Greenfield Plains, id=1) for all existing characters
INSERT OR IGNORE INTO character_region_unlocks (character_id, region_id)
SELECT id, 1 FROM characters;

-- Update regions table to remove global locked field (we'll use character_region_unlocks instead)
-- We'll keep the locked and unlock_requirement columns for reference but they won't be used globally
UPDATE regions SET locked = 0 WHERE id = 1; -- Greenfield Plains always available
UPDATE regions SET locked = 1 WHERE id > 1; -- All other regions locked by default

-- Set unlock requirements for regions
UPDATE regions SET unlock_requirement = 'Complete tutorial' WHERE id = 2;
UPDATE regions SET unlock_requirement = 'Defeat Silverwood Guardian' WHERE id = 3;
UPDATE regions SET unlock_requirement = 'Reach level 25' WHERE id = 4;
UPDATE regions SET unlock_requirement = 'Complete Ancient Ruins dungeon' WHERE id = 5;
