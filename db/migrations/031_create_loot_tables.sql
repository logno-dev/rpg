-- Migration 031: Create loot tables for mob drops
-- Creates a system for defining what items mobs can drop and their drop rates

-- Loot table for regular mobs
CREATE TABLE IF NOT EXISTS mob_loot (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mob_id INTEGER NOT NULL,
  item_id INTEGER NOT NULL,
  drop_chance REAL NOT NULL, -- 0.0 to 1.0 (e.g., 0.05 = 5% chance)
  min_quantity INTEGER DEFAULT 1,
  max_quantity INTEGER DEFAULT 1,
  FOREIGN KEY (mob_id) REFERENCES mobs(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

-- Loot table for named mobs (bosses)
CREATE TABLE IF NOT EXISTS named_mob_loot (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  named_mob_id INTEGER NOT NULL,
  item_id INTEGER NOT NULL,
  drop_chance REAL NOT NULL, -- Typically 1.0 for guaranteed boss drops
  min_quantity INTEGER DEFAULT 1,
  max_quantity INTEGER DEFAULT 1,
  FOREIGN KEY (named_mob_id) REFERENCES named_mobs(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

-- Ultra-rare world drops that can drop from any mob in a region
CREATE TABLE IF NOT EXISTS region_rare_loot (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  region_id INTEGER NOT NULL,
  item_id INTEGER NOT NULL,
  drop_chance REAL NOT NULL, -- Very low (e.g., 0.001 = 0.1%)
  min_level INTEGER NOT NULL, -- Minimum mob level required
  FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

CREATE INDEX idx_mob_loot_mob ON mob_loot(mob_id);
CREATE INDEX idx_named_mob_loot_named_mob ON named_mob_loot(named_mob_id);
CREATE INDEX idx_region_rare_loot_region ON region_rare_loot(region_id);
