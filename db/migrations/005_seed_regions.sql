-- Seed regions
INSERT INTO regions (id, name, description, min_level, max_level) VALUES
(1, 'Greenfield Plains', 'Peaceful grasslands perfect for beginners. Home to rats and boars.', 1, 2),
(2, 'Darkwood Forest', 'A dense forest teeming with goblins, wolves, and giant spiders.', 2, 3),
(3, 'Ironpeak Mountains', 'Treacherous mountain passes where savage orcs roam.', 4, 5),
(4, 'Shadowdeep Dungeon', 'Ancient ruins filled with undead and fearsome trolls.', 4, 6);

-- Map mobs to regions
-- Greenfield Plains (Levels 1-2)
INSERT INTO region_mobs (region_id, mob_id, spawn_weight) VALUES
(1, 1, 3), -- Giant Rat (common)
(1, 6, 2); -- Wild Boar (less common)

-- Darkwood Forest (Levels 2-3)
INSERT INTO region_mobs (region_id, mob_id, spawn_weight) VALUES
(2, 2, 3), -- Goblin (common)
(2, 3, 2), -- Wolf (less common)
(2, 7, 2); -- Forest Spider (less common)

-- Ironpeak Mountains (Levels 4-5)
INSERT INTO region_mobs (region_id, mob_id, spawn_weight) VALUES
(3, 5, 1); -- Orc (only mob here for now)

-- Shadowdeep Dungeon (Levels 4-6)
INSERT INTO region_mobs (region_id, mob_id, spawn_weight) VALUES
(4, 4, 2), -- Skeleton (common)
(4, 8, 1); -- Cave Troll (rare, tough)

-- Set all existing characters to start in Greenfield Plains
UPDATE characters SET current_region = 1 WHERE current_region IS NULL;
