-- Create crafting system tables

-- Crafting materials (the items players collect)
CREATE TABLE IF NOT EXISTS crafting_materials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  rarity TEXT CHECK(rarity IN ('common', 'uncommon', 'rare')) DEFAULT 'common',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Character's material inventory (separate from regular inventory)
CREATE TABLE IF NOT EXISTS character_crafting_materials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  character_id INTEGER NOT NULL,
  material_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
  FOREIGN KEY (material_id) REFERENCES crafting_materials(id) ON DELETE CASCADE,
  UNIQUE(character_id, material_id)
);

-- Character's profession levels
CREATE TABLE IF NOT EXISTS character_professions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  character_id INTEGER NOT NULL,
  profession_type TEXT NOT NULL CHECK(profession_type IN ('blacksmithing', 'leatherworking', 'tailoring', 'fletching', 'alchemy')),
  level INTEGER NOT NULL DEFAULT 1,
  experience INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
  UNIQUE(character_id, profession_type)
);

-- Recipes (what can be crafted)
CREATE TABLE IF NOT EXISTS recipes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  profession_type TEXT NOT NULL CHECK(profession_type IN ('blacksmithing', 'leatherworking', 'tailoring', 'fletching', 'alchemy')),
  level_required INTEGER NOT NULL,
  item_id INTEGER, -- Item this recipe produces (NULL for consumables that don't exist in items table yet)
  craft_time_seconds INTEGER NOT NULL DEFAULT 45, -- Total time to complete the minigame
  base_experience INTEGER NOT NULL DEFAULT 100, -- XP awarded on success
  item_type TEXT, -- For non-equipment items: 'consumable', etc.
  item_data TEXT, -- JSON data for consumables/custom items
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE SET NULL
);

-- Recipe material requirements
CREATE TABLE IF NOT EXISTS recipe_materials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_id INTEGER NOT NULL,
  material_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (material_id) REFERENCES crafting_materials(id) ON DELETE CASCADE
);

-- Active crafting sessions (for the minigame)
CREATE TABLE IF NOT EXISTS crafting_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  character_id INTEGER NOT NULL,
  recipe_id INTEGER NOT NULL,
  profession_type TEXT NOT NULL,
  pin_x INTEGER NOT NULL DEFAULT 0, -- Current pin position X
  pin_y INTEGER NOT NULL DEFAULT 0, -- Current pin position Y
  target_x INTEGER NOT NULL, -- Target circle center X
  target_y INTEGER NOT NULL, -- Target circle center Y
  target_radius INTEGER NOT NULL, -- Target circle radius
  start_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_action_time DATETIME, -- For cooldown enforcement
  actions_taken INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

-- Add crafting materials to mob loot (extends existing loot system)
CREATE TABLE IF NOT EXISTS mob_crafting_loot (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mob_id INTEGER NOT NULL,
  material_id INTEGER NOT NULL,
  drop_chance REAL NOT NULL DEFAULT 0.3, -- 30% base drop rate
  min_quantity INTEGER NOT NULL DEFAULT 1,
  max_quantity INTEGER NOT NULL DEFAULT 3,
  FOREIGN KEY (mob_id) REFERENCES mobs(id) ON DELETE CASCADE,
  FOREIGN KEY (material_id) REFERENCES crafting_materials(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_character_materials ON character_crafting_materials(character_id);
CREATE INDEX IF NOT EXISTS idx_character_professions ON character_professions(character_id);
CREATE INDEX IF NOT EXISTS idx_recipes_profession ON recipes(profession_type, level_required);
CREATE INDEX IF NOT EXISTS idx_recipe_materials ON recipe_materials(recipe_id);
CREATE INDEX IF NOT EXISTS idx_crafting_sessions_character ON crafting_sessions(character_id);
CREATE INDEX IF NOT EXISTS idx_mob_crafting_loot ON mob_crafting_loot(mob_id);
