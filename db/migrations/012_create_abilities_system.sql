-- Update existing abilities table to support new ability system
-- Add new columns to abilities table
ALTER TABLE abilities ADD COLUMN category TEXT DEFAULT 'damage';
ALTER TABLE abilities ADD COLUMN level INTEGER DEFAULT 1;
ALTER TABLE abilities ADD COLUMN base_id INTEGER DEFAULT NULL;
ALTER TABLE abilities ADD COLUMN primary_stat TEXT DEFAULT NULL;
ALTER TABLE abilities ADD COLUMN stat_scaling REAL DEFAULT 0;
ALTER TABLE abilities ADD COLUMN buff_stat TEXT DEFAULT NULL;
ALTER TABLE abilities ADD COLUMN buff_amount INTEGER DEFAULT 0;
ALTER TABLE abilities ADD COLUMN buff_duration INTEGER DEFAULT 0;

-- Add last_used_at to character_abilities for cooldown tracking
ALTER TABLE character_abilities ADD COLUMN last_used_at INTEGER DEFAULT 0;

-- Add ability scrolls to items table as consumables
-- These will be loot that teaches abilities when used
ALTER TABLE items ADD COLUMN teaches_ability_id INTEGER DEFAULT NULL;
