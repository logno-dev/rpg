-- Add armor_type column to items table to categorize armor

ALTER TABLE items ADD COLUMN armor_type TEXT DEFAULT NULL;

-- Categorize existing armor based on name patterns

-- Plate armor
UPDATE items SET armor_type = 'plate' 
WHERE type = 'armor' AND (
  name LIKE '%Plate%' OR 
  name LIKE '%Steel%' OR 
  name LIKE '%Iron%' OR
  name LIKE '%Adamant%' OR
  name LIKE '%Dragonscale%' OR
  name LIKE '%Helm' OR
  name LIKE '%Gauntlet%' OR
  name LIKE '%Shadowplate%'
);

-- Leather armor
UPDATE items SET armor_type = 'leather' 
WHERE type = 'armor' AND armor_type IS NULL AND (
  name LIKE '%Leather%' OR 
  name LIKE '%Studded%' OR
  name LIKE '%Ranger%' OR
  name LIKE '%Hide%'
);

-- Cloth armor
UPDATE items SET armor_type = 'cloth' 
WHERE type = 'armor' AND armor_type IS NULL AND (
  name LIKE '%Robe%' OR 
  name LIKE '%Cloth%' OR 
  name LIKE '%Vestment%' OR
  name LIKE '%Mage%' OR
  name LIKE '%Magus%' OR
  name LIKE '%Apprentice%' OR
  name LIKE '%Archmage%' OR
  name LIKE '%Adept%' OR
  name LIKE '%Sorcerer%' OR
  name LIKE '%Warlock%' OR
  name LIKE '%Sage%'
);

-- Chain armor
UPDATE items SET armor_type = 'chain' 
WHERE type = 'armor' AND armor_type IS NULL AND (
  name LIKE '%Chain%' OR
  name LIKE '%Mail%'
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_items_armor_type ON items(armor_type);
