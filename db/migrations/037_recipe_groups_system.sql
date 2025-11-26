-- Restructure crafting to use recipe groups with probability-based outputs
-- This replaces the 1-recipe-1-item system with recipe groups that can produce multiple items

-- New: Recipe Groups (what players see in the UI)
CREATE TABLE IF NOT EXISTS recipe_groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL, -- e.g., "Simple Sword", "Moderate Robe", "Advanced Potion"
  description TEXT,
  profession_type TEXT NOT NULL CHECK(profession_type IN ('blacksmithing', 'leatherworking', 'tailoring', 'fletching', 'alchemy')),
  category TEXT NOT NULL CHECK(category IN ('weapon', 'armor', 'offhand', 'consumable', 'material')),
  min_level INTEGER NOT NULL DEFAULT 1, -- Minimum profession level to see this recipe
  max_level INTEGER, -- Optional: max level this recipe is relevant (NULL = always relevant)
  craft_time_seconds INTEGER NOT NULL DEFAULT 12,
  base_experience INTEGER NOT NULL DEFAULT 100,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- New: Possible outputs for each recipe group
CREATE TABLE IF NOT EXISTS recipe_outputs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_group_id INTEGER NOT NULL,
  item_id INTEGER NOT NULL, -- The item that can be crafted
  min_profession_level INTEGER NOT NULL DEFAULT 1, -- Minimum profession level to have a chance at this item
  base_weight INTEGER NOT NULL DEFAULT 100, -- Base probability weight (higher = more common at min level)
  weight_per_level INTEGER NOT NULL DEFAULT 10, -- Additional weight per profession level above minimum
  quality_bonus_weight INTEGER NOT NULL DEFAULT 50, -- Additional weight for high quality crafts (Superior/Masterwork)
  FOREIGN KEY (recipe_group_id) REFERENCES recipe_groups(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

-- Material requirements for recipe groups
CREATE TABLE IF NOT EXISTS recipe_group_materials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_group_id INTEGER NOT NULL,
  material_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (recipe_group_id) REFERENCES recipe_groups(id) ON DELETE CASCADE,
  FOREIGN KEY (material_id) REFERENCES crafting_materials(id) ON DELETE CASCADE
);

-- Update crafting sessions to reference recipe_groups instead of recipes
-- We'll keep the old table and add a new column, then migrate data
-- Only alter if table exists
-- ALTER TABLE crafting_sessions ADD COLUMN recipe_group_id INTEGER REFERENCES recipe_groups(id) ON DELETE CASCADE;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_recipe_groups_profession ON recipe_groups(profession_type, category, min_level);
CREATE INDEX IF NOT EXISTS idx_recipe_outputs_group ON recipe_outputs(recipe_group_id);
CREATE INDEX IF NOT EXISTS idx_recipe_outputs_level ON recipe_outputs(min_profession_level);
CREATE INDEX IF NOT EXISTS idx_recipe_group_materials ON recipe_group_materials(recipe_group_id);

-- Note: We'll keep the old 'recipes' table for now to avoid breaking existing data
-- A follow-up migration can drop it after we've migrated all data to the new system
