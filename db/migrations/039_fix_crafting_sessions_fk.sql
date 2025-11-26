-- Fix crafting_sessions foreign key constraint
-- The recipe_id column now holds recipe_group_id values, not recipes table references

-- Save existing sessions
CREATE TABLE IF NOT EXISTS crafting_sessions_backup AS SELECT * FROM crafting_sessions;

-- Drop old table
DROP TABLE IF EXISTS crafting_sessions;

-- Recreate without the recipes FK constraint
CREATE TABLE crafting_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  character_id INTEGER NOT NULL,
  recipe_id INTEGER NOT NULL, -- Now holds recipe_group_id, no FK constraint to recipes table
  profession_type TEXT NOT NULL,
  pin_x INTEGER NOT NULL DEFAULT 0,
  pin_y INTEGER NOT NULL DEFAULT 0,
  target_x INTEGER NOT NULL,
  target_y INTEGER NOT NULL,
  target_radius INTEGER NOT NULL,
  start_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_action_time DATETIME,
  actions_taken INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);

-- Restore data if backup exists
INSERT OR IGNORE INTO crafting_sessions 
SELECT * FROM crafting_sessions_backup 
WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='crafting_sessions_backup');

-- Drop backup
DROP TABLE IF EXISTS crafting_sessions_backup;

-- Recreate index
CREATE INDEX IF NOT EXISTS idx_crafting_sessions_character ON crafting_sessions(character_id);
