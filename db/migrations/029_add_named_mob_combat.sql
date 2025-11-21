-- Add named_mob_id to combat_sessions to support boss fights
ALTER TABLE combat_sessions ADD COLUMN named_mob_id INTEGER REFERENCES named_mobs(id);

-- Add is_dungeon flag to track dungeon combat
ALTER TABLE combat_sessions ADD COLUMN is_dungeon INTEGER NOT NULL DEFAULT 0;

-- Create index for named mob combat
CREATE INDEX IF NOT EXISTS idx_combat_sessions_named_mob ON combat_sessions(named_mob_id);
