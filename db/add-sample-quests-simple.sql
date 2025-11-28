-- Simple Sample Quests (no collect objectives for now)

BEGIN TRANSACTION;

-- Clean up
DELETE FROM quest_rewards;
DELETE FROM quest_objectives;
DELETE FROM quests;
DELETE FROM crafting_materials WHERE is_quest_item = 1;

-- Quest 1: Simple Kill Quest - Greenfield Plains (Region 1)
INSERT INTO quests (name, description, region_id, min_level, repeatable, cooldown_hours) VALUES
('Fox Hunter', 'Wild foxes are raiding hen houses. Help reduce their numbers.', 1, 1, 0, 0);

INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_mob_id, target_region_id, required_count, auto_complete) VALUES
((SELECT id FROM quests WHERE name = 'Fox Hunter'), 1, 'kill', 'Defeat 5 Wild Foxes', 124, 1, 5, 1);

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount) VALUES
((SELECT id FROM quests WHERE name = 'Fox Hunter'), 'xp', 100),
((SELECT id FROM quests WHERE name = 'Fox Hunter'), 'gold', 25);

-- Quest 2: Bandit Hunt - Darkwood Forest (Region 2)
INSERT INTO quests (name, description, region_id, min_level, repeatable, cooldown_hours) VALUES
('Bandit Menace', 'Bandits have been raiding travelers. Defeat them.', 2, 5, 0, 0);

INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_mob_id, target_region_id, required_count, auto_complete) VALUES
((SELECT id FROM quests WHERE name = 'Bandit Menace'), 1, 'kill', 'Defeat 6 Bandits', 126, 2, 6, 1);

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount) VALUES
((SELECT id FROM quests WHERE name = 'Bandit Menace'), 'xp', 250),
((SELECT id FROM quests WHERE name = 'Bandit Menace'), 'gold', 50);

-- Quest 3: Mountain Hunt - Ironpeak Mountains (Region 3)
INSERT INTO quests (name, description, region_id, min_level, repeatable, cooldown_hours) VALUES
('Harpy Hunter', 'Harpies are attacking mountain travelers. Hunt them down.', 3, 10, 0, 0);

INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_mob_id, target_region_id, required_count, auto_complete) VALUES
((SELECT id FROM quests WHERE name = 'Harpy Hunter'), 1, 'kill', 'Defeat 5 Harpies', 132, 3, 5, 1);

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount) VALUES
((SELECT id FROM quests WHERE name = 'Harpy Hunter'), 'xp', 500),
((SELECT id FROM quests WHERE name = 'Harpy Hunter'), 'gold', 100);

-- Quest 4: Repeatable Daily Quest - Greenfield Plains
INSERT INTO quests (name, description, region_id, min_level, repeatable, cooldown_hours) VALUES
('Daily Patrol', 'Help keep the plains safe by culling the local wildlife.', 1, 3, 1, 24);

INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_region_id, required_count, auto_complete) VALUES
((SELECT id FROM quests WHERE name = 'Daily Patrol'), 1, 'kill', 'Defeat any 10 creatures in Greenfield Plains', 1, 10, 1);

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount) VALUES
((SELECT id FROM quests WHERE name = 'Daily Patrol'), 'xp', 150),
((SELECT id FROM quests WHERE name = 'Daily Patrol'), 'gold', 30);

COMMIT;
