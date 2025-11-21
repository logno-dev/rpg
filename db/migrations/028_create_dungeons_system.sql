-- Create named mobs table (special boss mobs)
CREATE TABLE IF NOT EXISTS named_mobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  title TEXT, -- e.g., "The Cursed", "Bane of Adventurers"
  region_id INTEGER NOT NULL,
  level INTEGER NOT NULL,
  max_health INTEGER NOT NULL,
  damage_min INTEGER NOT NULL,
  damage_max INTEGER NOT NULL,
  defense INTEGER NOT NULL,
  attack_speed REAL NOT NULL DEFAULT 2.0,
  experience_reward INTEGER NOT NULL,
  gold_min INTEGER NOT NULL,
  gold_max INTEGER NOT NULL,
  spawn_chance REAL NOT NULL DEFAULT 0.01, -- 1% chance to spawn while roaming
  aggressive INTEGER NOT NULL DEFAULT 0, -- Named mobs never aggro while roaming
  description TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (region_id) REFERENCES regions(id)
);

-- Create dungeons table
CREATE TABLE IF NOT EXISTS dungeons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  region_id INTEGER NOT NULL,
  description TEXT,
  boss_mob_id INTEGER NOT NULL, -- The named mob at the end
  required_level INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (region_id) REFERENCES regions(id),
  FOREIGN KEY (boss_mob_id) REFERENCES named_mobs(id)
);

-- Create dungeon encounters table (the progressive mob waves)
CREATE TABLE IF NOT EXISTS dungeon_encounters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dungeon_id INTEGER NOT NULL,
  encounter_order INTEGER NOT NULL, -- 1, 2, 3, etc. (boss is always last)
  mob_id INTEGER, -- Regular mob (NULL if it's the boss encounter)
  is_boss INTEGER NOT NULL DEFAULT 0, -- 1 if this is the final boss encounter
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (dungeon_id) REFERENCES dungeons(id),
  FOREIGN KEY (mob_id) REFERENCES mobs(id)
);

-- Track character's current dungeon progress
CREATE TABLE IF NOT EXISTS character_dungeon_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  character_id INTEGER NOT NULL,
  dungeon_id INTEGER NOT NULL,
  current_encounter INTEGER NOT NULL DEFAULT 1, -- Which encounter they're on
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed', 'failed'
  started_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (character_id) REFERENCES characters(id),
  FOREIGN KEY (dungeon_id) REFERENCES dungeons(id)
);

-- Track which named mobs a character has defeated
CREATE TABLE IF NOT EXISTS character_named_mob_defeats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  character_id INTEGER NOT NULL,
  named_mob_id INTEGER NOT NULL,
  defeated_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (character_id) REFERENCES characters(id),
  FOREIGN KEY (named_mob_id) REFERENCES named_mobs(id),
  UNIQUE(character_id, named_mob_id) -- Can only record each defeat once
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_named_mobs_region ON named_mobs(region_id);
CREATE INDEX IF NOT EXISTS idx_dungeons_region ON dungeons(region_id);
CREATE INDEX IF NOT EXISTS idx_dungeon_encounters_dungeon ON dungeon_encounters(dungeon_id, encounter_order);
CREATE INDEX IF NOT EXISTS idx_character_dungeon_progress_character ON character_dungeon_progress(character_id);
CREATE INDEX IF NOT EXISTS idx_character_named_mob_defeats_character ON character_named_mob_defeats(character_id);
