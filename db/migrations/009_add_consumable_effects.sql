-- Add consumable item effect columns
ALTER TABLE items ADD COLUMN health_restore INTEGER DEFAULT 0;
ALTER TABLE items ADD COLUMN mana_restore INTEGER DEFAULT 0;

-- Update existing potions
UPDATE items SET health_restore = 50 WHERE name = 'Health Potion';
UPDATE items SET mana_restore = 30 WHERE name = 'Mana Potion';
