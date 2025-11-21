-- SQLite doesn't support ALTER COLUMN, so we need to recreate the table
-- First, create a new table with the correct schema
CREATE TABLE IF NOT EXISTS combat_sessions_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id INTEGER NOT NULL,
    mob_id INTEGER, -- Made nullable for named mob combat
    named_mob_id INTEGER,
    is_dungeon INTEGER NOT NULL DEFAULT 0,
    
    -- Combat state
    character_health INTEGER NOT NULL,
    mob_health INTEGER NOT NULL,
    status TEXT DEFAULT 'active', -- 'active', 'victory', 'defeat'
    
    -- Timestamps
    started_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch()),
    
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
    FOREIGN KEY (mob_id) REFERENCES mobs(id),
    FOREIGN KEY (named_mob_id) REFERENCES named_mobs(id)
);

-- Copy data from old table
INSERT INTO combat_sessions_new 
SELECT id, character_id, mob_id, named_mob_id, is_dungeon, character_health, mob_health, status, started_at, updated_at
FROM combat_sessions;

-- Drop old table
DROP TABLE combat_sessions;

-- Rename new table
ALTER TABLE combat_sessions_new RENAME TO combat_sessions;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_combat_sessions_named_mob ON combat_sessions(named_mob_id);
