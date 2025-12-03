-- Assign mobs to regions based on their level and area type
-- This ensures all mobs have a region for wiki display

-- Greenfield Plains (1-4) - plains, village outskirts
UPDATE mobs 
SET region_id = 1 
WHERE region_id IS NULL 
  AND level BETWEEN 1 AND 4 
  AND (area IN ('plains', 'Village Outskirts'));

-- Darkwood Forest (3-7) - forest
UPDATE mobs 
SET region_id = 2 
WHERE region_id IS NULL 
  AND level BETWEEN 3 AND 7 
  AND area = 'forest';

-- Ironpeak Mountains (5-11) - mountains
UPDATE mobs 
SET region_id = 3 
WHERE region_id IS NULL 
  AND level BETWEEN 5 AND 11 
  AND area = 'mountains';

-- Shadowdeep Dungeon (8-15) - dungeon
UPDATE mobs 
SET region_id = 4 
WHERE region_id IS NULL 
  AND level BETWEEN 8 AND 15 
  AND area = 'dungeon';

-- Scorched Badlands (13-18) - desert
UPDATE mobs 
SET region_id = 5 
WHERE region_id IS NULL 
  AND level BETWEEN 13 AND 18 
  AND area = 'desert';

-- Frostpeak Glaciers (16-22) - tundra, ice
UPDATE mobs 
SET region_id = 6 
WHERE region_id IS NULL 
  AND level BETWEEN 16 AND 22 
  AND area IN ('tundra', 'ice');

-- Elven Sanctum (20-26) - forest (higher level)
UPDATE mobs 
SET region_id = 7 
WHERE region_id IS NULL 
  AND level BETWEEN 20 AND 26 
  AND area = 'forest';

-- Dragon Aerie (24-30) - mountains (higher level)
UPDATE mobs 
SET region_id = 8 
WHERE region_id IS NULL 
  AND level BETWEEN 24 AND 30 
  AND area = 'mountains';

-- Abyssal Depths (28-34) - dungeon, underwater, abyss
UPDATE mobs 
SET region_id = 9 
WHERE region_id IS NULL 
  AND level BETWEEN 28 AND 34 
  AND area IN ('dungeon', 'underwater', 'abyss');

-- Celestial Spire (32-38) - celestial, sky
UPDATE mobs 
SET region_id = 10 
WHERE region_id IS NULL 
  AND level BETWEEN 32 AND 38 
  AND area IN ('celestial', 'sky', 'plains');

-- Demon Citadel (36-42) - dungeon, infernal
UPDATE mobs 
SET region_id = 11 
WHERE region_id IS NULL 
  AND level BETWEEN 36 AND 42 
  AND area IN ('dungeon', 'infernal');

-- Astral Plane (40-46) - astral, void
UPDATE mobs 
SET region_id = 12 
WHERE region_id IS NULL 
  AND level BETWEEN 40 AND 46 
  AND area IN ('astral', 'void', 'dungeon');

-- Elemental Chaos (44-50) - elemental
UPDATE mobs 
SET region_id = 13 
WHERE region_id IS NULL 
  AND level BETWEEN 44 AND 50 
  AND area IN ('elemental', 'dungeon');

-- Void Nexus (48-54) - void, dungeon
UPDATE mobs 
SET region_id = 14 
WHERE region_id IS NULL 
  AND level BETWEEN 48 AND 54 
  AND area IN ('void', 'dungeon');

-- Titan Halls (52-58) - dungeon
UPDATE mobs 
SET region_id = 15 
WHERE region_id IS NULL 
  AND level BETWEEN 52 AND 58 
  AND area = 'dungeon';

-- Eternity's End (56-60) - dungeon, void, any high level
UPDATE mobs 
SET region_id = 16 
WHERE region_id IS NULL 
  AND level >= 56;

-- Catch-all: Assign remaining low-level mobs to Greenfield Plains
UPDATE mobs 
SET region_id = 1 
WHERE region_id IS NULL 
  AND level <= 5;

-- Catch-all: Assign remaining mid-level mobs based on level range
UPDATE mobs 
SET region_id = CASE 
  WHEN level BETWEEN 6 AND 10 THEN 3  -- Ironpeak Mountains
  WHEN level BETWEEN 11 AND 15 THEN 4  -- Shadowdeep Dungeon
  WHEN level BETWEEN 16 AND 20 THEN 6  -- Frostpeak Glaciers
  WHEN level BETWEEN 21 AND 25 THEN 7  -- Elven Sanctum
  WHEN level BETWEEN 26 AND 30 THEN 8  -- Dragon Aerie
  WHEN level BETWEEN 31 AND 35 THEN 9  -- Abyssal Depths
  WHEN level BETWEEN 36 AND 40 THEN 10  -- Celestial Spire
  WHEN level BETWEEN 41 AND 45 THEN 11  -- Demon Citadel
  WHEN level BETWEEN 46 AND 50 THEN 12  -- Astral Plane
  WHEN level BETWEEN 51 AND 55 THEN 14  -- Void Nexus
  WHEN level >= 56 THEN 16  -- Eternity's End
END
WHERE region_id IS NULL;
