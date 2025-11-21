-- Migration 032: Add region_id to mobs table
-- Allows mobs to be associated with specific regions

ALTER TABLE mobs ADD COLUMN region_id INTEGER REFERENCES regions(id);

-- Update existing mobs with region IDs based on their area
-- Region 1: Greenfield Plains
UPDATE mobs SET region_id = 1 WHERE area = 'Greenfield Plains';

-- Region 2: Darkwood Forest
UPDATE mobs SET region_id = 2 WHERE area = 'Dark Forest' OR area = 'Darkwood Forest';

-- Region 3: Ironpeak Mountains
UPDATE mobs SET region_id = 3 WHERE area = 'Mountain Pass' OR area = 'Ironpeak Mountains';

-- Region 4: Shadowdeep Dungeon
UPDATE mobs SET region_id = 4 WHERE area = 'Shadowdeep Ruins' OR area = 'Shadowdeep Dungeon';

CREATE INDEX idx_mobs_region ON mobs(region_id);
