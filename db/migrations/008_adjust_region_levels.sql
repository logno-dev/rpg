-- Adjust region level ranges to be wider with overlap

-- Greenfield Plains: 1-4 (beginner area)
UPDATE regions SET min_level = 1, max_level = 4 WHERE id = 1;

-- Darkwood Forest: 3-7 (overlaps with plains and mountains)
UPDATE regions SET min_level = 3, max_level = 7 WHERE id = 2;

-- Ironpeak Mountains: 5-11 (mid-level area)
UPDATE regions SET min_level = 5, max_level = 11 WHERE id = 3;

-- Shadowdeep Dungeon: 8-15 (high-level area)
UPDATE regions SET min_level = 8, max_level = 15 WHERE id = 4;
