-- Sample Quests for Testing

BEGIN TRANSACTION;

-- First, create quest items (without quest_id, we'll update them later)
INSERT INTO crafting_materials (name, description, rarity, is_quest_item) VALUES
('Wolf Pelt', 'A pristine pelt from a dire wolf.', 'common', 1),
('Goblin Ear', 'Proof of a goblin''s defeat.', 'common', 1),
('Ancient Artifact Fragment', 'A piece of a mysterious ancient artifact.', 'rare', 1);

-- Quest 1: Simple Kill Quest - Greenfield Plains (Region 1)
INSERT INTO quests (name, description, region_id, min_level, repeatable, cooldown_hours) VALUES
('Fox Hunter', 'Wild foxes are raiding hen houses. Help reduce their numbers.', 1, 1, 0, 0);

INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_mob_id, target_region_id, required_count, auto_complete) VALUES
(1, 1, 'kill', 'Defeat 5 Wild Foxes', 124, 1, 5, 1); -- Wild Fox is mob_id 124, Region 1

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount) VALUES
(1, 'xp', 100),
(1, 'gold', 25);

-- Quest 2: Kill + Collect Quest - Darkwood Forest (Region 2)
INSERT INTO quests (name, description, region_id, min_level, repeatable, cooldown_hours) VALUES
('Bandit Menace', 'Bandits have been raiding travelers. Defeat them and bring back proof of your victories.', 2, 5, 0, 0);

-- Get the crafting_material IDs we just created
INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_mob_id, target_region_id, required_count, auto_complete) VALUES
(2, 1, 'kill', 'Defeat 6 Bandits', 126, 2, 6, 0); -- Bandit is mob_id 126, Region 2

INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_item_id, target_region_id, required_count, auto_complete) VALUES
(2, 2, 'collect', 'Collect 6 Bandit Ears', (SELECT id FROM crafting_materials WHERE name = 'Goblin Ear'), 2, 6, 0);

-- Update quest_id for Bandit Ear (was Goblin Ear)
UPDATE crafting_materials SET quest_id = 2, name = 'Bandit Ear', description = 'Proof of a bandit''s defeat.' WHERE name = 'Goblin Ear';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount) VALUES
(2, 'xp', 250),
(2, 'gold', 50);

-- Quest 3: Multi-Step Quest Chain - Ironpeak Mountains (Region 3)
INSERT INTO quests (name, description, region_id, min_level, repeatable, cooldown_hours) VALUES
('Mountain Mysteries', 'Strange magical energy has been detected in the mountains. Investigate its source.', 3, 10, 0, 0);

INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_mob_id, target_region_id, required_count, auto_complete) VALUES
(3, 1, 'kill', 'Defeat Harpies to search for clues', 132, 3, 3, 0); -- Harpy is mob_id 132, Region 3

INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_item_id, target_region_id, required_count, auto_complete) VALUES
(3, 2, 'collect', 'Collect 3 Ancient Artifact Fragments', (SELECT id FROM crafting_materials WHERE name = 'Ancient Artifact Fragment'), 3, 3, 0);

INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_mob_id, target_region_id, required_count, auto_complete) VALUES
(3, 3, 'kill', 'Defeat the corrupted Stone Golem', 131, 3, 1, 1); -- Stone Golem is mob_id 131, Region 3

-- Update quest_id for Ancient Artifact Fragment
UPDATE crafting_materials SET quest_id = 3 WHERE name = 'Ancient Artifact Fragment';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount) VALUES
(3, 'xp', 500),
(3, 'gold', 100);

-- Quest 4: Repeatable Daily Quest - Greenfield Plains
INSERT INTO quests (name, description, region_id, min_level, repeatable, cooldown_hours) VALUES
('Daily Patrol', 'Help keep the plains safe by culling the local wildlife.', 1, 3, 1, 24);

INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_region_id, required_count, auto_complete) VALUES
(4, 1, 'kill', 'Defeat any 10 creatures in Greenfield Plains', 1, 10, 1); -- Region 1, no specific mob

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount) VALUES
(4, 'xp', 150),
(4, 'gold', 30);

-- Quest 5: Specific Sub-Area Quest - Darkwood Forest
INSERT INTO quests (name, description, region_id, min_level, repeatable, cooldown_hours) VALUES
('Ancient Grove Cleansing', 'The Ancient Grove is overrun with forest wraiths. Clear them out.', 2, 7, 0, 0);

INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_region_id, target_sub_area_id, required_count, auto_complete) VALUES
(5, 1, 'kill', 'Defeat 6 enemies in the Ancient Grove', 2, (SELECT id FROM sub_areas WHERE name = 'Ancient Grove' AND region_id = 2), 6, 1);

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount) VALUES
(5, 'xp', 300),
(5, 'gold', 60);

COMMIT;
