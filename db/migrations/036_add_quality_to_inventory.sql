-- Add quality column to character_inventory for crafted items
ALTER TABLE character_inventory 
ADD COLUMN quality TEXT DEFAULT 'common';

-- Index for filtering by quality
CREATE INDEX IF NOT EXISTS idx_inventory_quality ON character_inventory(quality);
