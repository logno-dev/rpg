-- Add regions system

-- Add current_region to characters table
ALTER TABLE characters ADD COLUMN current_region INTEGER DEFAULT 1;

-- Create regions table
CREATE TABLE IF NOT EXISTS regions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  min_level INTEGER NOT NULL DEFAULT 1,
  max_level INTEGER NOT NULL DEFAULT 5,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create region_mobs junction table (which mobs appear in which regions)
CREATE TABLE IF NOT EXISTS region_mobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  region_id INTEGER NOT NULL,
  mob_id INTEGER NOT NULL,
  spawn_weight INTEGER DEFAULT 1, -- Higher weight = more common
  FOREIGN KEY (region_id) REFERENCES regions(id),
  FOREIGN KEY (mob_id) REFERENCES mobs(id),
  UNIQUE(region_id, mob_id)
);

-- Create region_merchants table (for future use)
CREATE TABLE IF NOT EXISTS region_merchants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  region_id INTEGER NOT NULL,
  merchant_name TEXT NOT NULL,
  merchant_type TEXT, -- 'general', 'weaponsmith', 'armorsmith', 'alchemist', etc.
  FOREIGN KEY (region_id) REFERENCES regions(id)
);
