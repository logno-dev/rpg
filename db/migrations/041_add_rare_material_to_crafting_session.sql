-- Add rare_material_id to crafting sessions
-- Tracks which rare material was used for this craft (for named item selection)

ALTER TABLE crafting_sessions ADD COLUMN rare_material_id INTEGER DEFAULT NULL;
