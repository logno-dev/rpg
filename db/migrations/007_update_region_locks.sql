-- Set initial lock states
-- Greenfield Plains (unlocked)
UPDATE regions SET locked = 0 WHERE id = 1;

-- Darkwood Forest (unlocked)
UPDATE regions SET locked = 0 WHERE id = 2;

-- Ironpeak Mountains (locked - can unlock later based on level or quest)
UPDATE regions SET locked = 1, unlock_requirement = 'Reach level 4' WHERE id = 3;

-- Shadowdeep Dungeon (locked - can unlock later)
UPDATE regions SET locked = 1, unlock_requirement = 'Defeat the Orc Chieftain' WHERE id = 4;
