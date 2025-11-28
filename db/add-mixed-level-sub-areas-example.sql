-- Example: Adding mixed-level sub-areas to demonstrate non-linear progression
-- This shows how a single region can have sub-areas with varying difficulty

BEGIN TRANSACTION;

-- Add a low-level sub-area to Darkwood Forest (normally 5-10)
-- This creates a "newbie-friendly" area in what's otherwise a mid-level zone
INSERT INTO sub_areas (region_id, name, description, min_level, max_level) VALUES
(2, 'Forest Outskirts', 'The safer edge of Darkwood Forest, suitable for less experienced adventurers.', 3, 6);

-- Add mobs to the low-level area
INSERT INTO sub_area_mobs (sub_area_id, mob_id, spawn_weight, level_variance) VALUES
((SELECT id FROM sub_areas WHERE name = 'Forest Outskirts' AND region_id = 2), 121, 40, 1), -- Grass Snake
((SELECT id FROM sub_areas WHERE name = 'Forest Outskirts' AND region_id = 2), 122, 35, 1), -- Giant Beetle
((SELECT id FROM sub_areas WHERE name = 'Forest Outskirts' AND region_id = 2), 123, 25, 1); -- Rabid Rabbit

-- Add a high-level sub-area to Greenfield Plains (normally 1-5)
-- This creates an "elite" area in what's otherwise a starter zone
INSERT INTO sub_areas (region_id, name, description, min_level, max_level) VALUES
(1, 'Bandit Encampment', 'A fortified camp where dangerous bandits have set up operations.', 8, 12);

-- Since we don't have level 8-12 mobs in region 1, we can spawn higher-level bandits
-- For now, let's use Young Bears (level 3) but note they would spawn at levels 7-9 due to level_variance
INSERT INTO sub_area_mobs (sub_area_id, mob_id, spawn_weight, level_variance) VALUES
((SELECT id FROM sub_areas WHERE name = 'Bandit Encampment' AND region_id = 1), 125, 50, 3), -- Young Bear (with +3 variance)
((SELECT id FROM sub_areas WHERE name = 'Bandit Encampment' AND region_id = 1), 124, 50, 2); -- Wild Fox (with +2 variance)

-- Note: The above demonstrates concept but would need properly leveled mobs
-- In practice, you'd want to add mobs that are actually level 8-12 to region 1

COMMIT;

-- This demonstrates how quests can now:
-- 1. Send low-level players to "Forest Outskirts" in Darkwood (level 3-6) instead of dangerous areas
-- 2. Send mid-level players to "Bandit Encampment" in Greenfield for a challenge
-- 3. Create quest chains that move between regions based on sub-area difficulty, not region difficulty
