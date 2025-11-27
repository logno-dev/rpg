-- Add named equipment system to recipe outputs
-- Allows recipes to produce epic/legendary items when special materials are used

ALTER TABLE recipe_outputs ADD COLUMN requires_rare_material_id INTEGER DEFAULT NULL;
ALTER TABLE recipe_outputs ADD COLUMN is_named BOOLEAN DEFAULT 0;

-- Add foreign key reference to crafting_materials (for rare materials)
-- Note: SQLite doesn't enforce FKs unless PRAGMA foreign_keys = ON, but we document it here

-- Create index for performance when filtering by rare materials
CREATE INDEX IF NOT EXISTS idx_recipe_outputs_rare_material ON recipe_outputs(requires_rare_material_id);
CREATE INDEX IF NOT EXISTS idx_recipe_outputs_named ON recipe_outputs(is_named);
