-- ============================================
-- Ranger-Themed Quests
-- ============================================
-- Creates new quests specifically for teaching ranger abilities
-- Each tier has quests that reward the corresponding ranger scrolls

-- ============================================
-- TIER I QUESTS (Level 3-10)
-- ============================================

-- Quest 1: Learn the Basics of Archery (Aimed Shot I)
INSERT INTO quests (name, description, region_id, min_level, repeatable, cooldown_hours, created_at)
VALUES (
  'Archery Training: Precision Shots',
  'The ranger instructor wants you to practice your aim by hunting wolves in Darkwood Forest. Prove your precision by taking down several wolves cleanly.',
  2, -- Darkwood Forest
  3,
  0,
  0,
  unixepoch()
);

INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_mob_id, required_count, auto_complete)
SELECT id, 1, 'kill', 'Hunt Wolves in Darkwood Forest', 3, 8, 1
FROM quests WHERE name = 'Archery Training: Precision Shots';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'xp', 150
FROM quests WHERE name = 'Archery Training: Precision Shots';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'gold', 50
FROM quests WHERE name = 'Archery Training: Precision Shots';

INSERT INTO quest_rewards (quest_id, reward_type, reward_item_id, reward_amount)
SELECT q.id, 'item', 1910, 1
FROM quests q WHERE q.name = 'Archery Training: Precision Shots';

-- Quest 2: Multi-Target Practice (Multi-Shot I)
INSERT INTO quests (name, description, region_id, min_level, repeatable, cooldown_hours, created_at)
VALUES (
  'Archery Training: Multiple Targets',
  'Learn to strike multiple foes at once by clearing out groups of goblins and spiders in Darkwood Forest.',
  2, -- Darkwood Forest
  3,
  0,
  0,
  unixepoch()
);

INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_mob_id, required_count, auto_complete)
SELECT id, 1, 'kill', 'Defeat Goblins', 2, 10, 1
FROM quests WHERE name = 'Archery Training: Multiple Targets';

INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_mob_id, required_count, auto_complete)
SELECT id, 2, 'kill', 'Defeat Forest Spiders', 7, 6, 1
FROM quests WHERE name = 'Archery Training: Multiple Targets';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'xp', 150
FROM quests WHERE name = 'Archery Training: Multiple Targets';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'gold', 50
FROM quests WHERE name = 'Archery Training: Multiple Targets';

INSERT INTO quest_rewards (quest_id, reward_type, reward_item_id, reward_amount)
SELECT q.id, 'item', 1915, 1
FROM quests q WHERE q.name = 'Archery Training: Multiple Targets';

-- Quest 3: Speed and Agility (Rapid Fire I)
INSERT INTO quests (name, description, region_id, min_level, repeatable, cooldown_hours, created_at)
VALUES (
  'Archery Training: Rapid Fire',
  'Master the art of rapid shooting by hunting fast-moving bandits and dire bats in Darkwood Forest.',
  2, -- Darkwood Forest
  3,
  0,
  0,
  unixepoch()
);

INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_mob_id, required_count, auto_complete)
SELECT id, 1, 'kill', 'Defeat Bandits', 126, 8, 1
FROM quests WHERE name = 'Archery Training: Rapid Fire';

INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_mob_id, required_count, auto_complete)
SELECT id, 2, 'kill', 'Defeat Dire Bats', 127, 8, 1
FROM quests WHERE name = 'Archery Training: Rapid Fire';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'xp', 150
FROM quests WHERE name = 'Archery Training: Rapid Fire';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'gold', 50
FROM quests WHERE name = 'Archery Training: Rapid Fire';

INSERT INTO quest_rewards (quest_id, reward_type, reward_item_id, reward_amount)
SELECT q.id, 'item', 1930, 1
FROM quests q WHERE q.name = 'Archery Training: Rapid Fire';

-- Quest 4: Poison Craft (Poison Arrow I)
INSERT INTO quests (name, description, region_id, min_level, repeatable, cooldown_hours, created_at)
VALUES (
  'Ranger Secrets: Poison Arrows',
  'A ranger mentor will teach you to craft poison arrows, but first you must prove yourself by hunting forest spiders for their venom sacs.',
  2, -- Darkwood Forest
  3,
  0,
  0,
  unixepoch()
);

INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_mob_id, required_count, auto_complete)
SELECT id, 1, 'kill', 'Collect venom from Forest Spiders', 7, 12, 1
FROM quests WHERE name = 'Ranger Secrets: Poison Arrows';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'xp', 180
FROM quests WHERE name = 'Ranger Secrets: Poison Arrows';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'gold', 65
FROM quests WHERE name = 'Ranger Secrets: Poison Arrows';

INSERT INTO quest_rewards (quest_id, reward_type, reward_item_id, reward_amount)
SELECT q.id, 'item', 1920, 1
FROM quests q WHERE q.name = 'Ranger Secrets: Poison Arrows';

-- Quest 5: Explosive Techniques (Explosive Arrow I)
INSERT INTO quests (name, description, region_id, min_level, repeatable, cooldown_hours, created_at)
VALUES (
  'Ranger Secrets: Explosive Arrows',
  'Learn to imbue your arrows with explosive magic. Defeat bandits to prove you can handle the power responsibly.',
  2, -- Darkwood Forest
  3,
  0,
  0,
  unixepoch()
);

INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_mob_id, required_count, auto_complete)
SELECT id, 1, 'kill', 'Defeat Bandits to prove your worth', 126, 15, 1
FROM quests WHERE name = 'Ranger Secrets: Explosive Arrows';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'xp', 180
FROM quests WHERE name = 'Ranger Secrets: Explosive Arrows';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'gold', 65
FROM quests WHERE name = 'Ranger Secrets: Explosive Arrows';

INSERT INTO quest_rewards (quest_id, reward_type, reward_item_id, reward_amount)
SELECT q.id, 'item', 1925, 1
FROM quests q WHERE q.name = 'Ranger Secrets: Explosive Arrows';

-- ============================================
-- TIER II QUESTS (Level 16-22)
-- ============================================

-- Quest 6: Advanced Marksmanship (Aimed Shot II)
INSERT INTO quests (name, description, region_id, min_level, repeatable, cooldown_hours, created_at)
VALUES (
  'Advanced Archery: Deadly Precision',
  'Your aim must be perfect against the toughest foes. Hunt yetis in the Frostpeak Glaciers to refine your precision.',
  6, -- Frostpeak Glaciers
  16,
  0,
  0,
  unixepoch()
);

INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_mob_id, required_count, auto_complete)
SELECT id, 1, 'kill', 'Hunt Yetis in Frostpeak Glaciers', 163, 12, 1
FROM quests WHERE name = 'Advanced Archery: Deadly Precision';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'xp', 800
FROM quests WHERE name = 'Advanced Archery: Deadly Precision';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'gold', 200
FROM quests WHERE name = 'Advanced Archery: Deadly Precision';

INSERT INTO quest_rewards (quest_id, reward_type, reward_item_id, reward_amount)
SELECT q.id, 'item', 1911, 1
FROM quests q WHERE q.name = 'Advanced Archery: Deadly Precision';

-- Quest 7: Multi-Shot Mastery (Multi-Shot II)
INSERT INTO quests (name, description, region_id, min_level, repeatable, cooldown_hours, created_at)
VALUES (
  'Advanced Archery: Area Suppression',
  'Master hitting multiple targets by taking on packs of ice wolves and ice elementals simultaneously.',
  6, -- Frostpeak Glaciers
  16,
  0,
  0,
  unixepoch()
);

INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_mob_id, required_count, auto_complete)
SELECT id, 1, 'kill', 'Defeat Ice Wolves', 164, 10, 1
FROM quests WHERE name = 'Advanced Archery: Area Suppression';

INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_mob_id, required_count, auto_complete)
SELECT id, 2, 'kill', 'Defeat Ice Elementals', 165, 8, 1
FROM quests WHERE name = 'Advanced Archery: Area Suppression';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'xp', 800
FROM quests WHERE name = 'Advanced Archery: Area Suppression';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'gold', 200
FROM quests WHERE name = 'Advanced Archery: Area Suppression';

INSERT INTO quest_rewards (quest_id, reward_type, reward_item_id, reward_amount)
SELECT q.id, 'item', 1916, 1
FROM quests q WHERE q.name = 'Advanced Archery: Area Suppression';

-- Quest 8: Enhanced Rapid Fire (Rapid Fire II)
INSERT INTO quests (name, description, region_id, min_level, repeatable, cooldown_hours, created_at)
VALUES (
  'Advanced Archery: Blinding Speed',
  'Push your firing speed to the limit by hunting swift snow trolls in the frozen peaks.',
  6, -- Frostpeak Glaciers
  16,
  0,
  0,
  unixepoch()
);

INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_mob_id, required_count, auto_complete)
SELECT id, 1, 'kill', 'Hunt Snow Trolls', 166, 12, 1
FROM quests WHERE name = 'Advanced Archery: Blinding Speed';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'xp', 800
FROM quests WHERE name = 'Advanced Archery: Blinding Speed';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'gold', 200
FROM quests WHERE name = 'Advanced Archery: Blinding Speed';

INSERT INTO quest_rewards (quest_id, reward_type, reward_item_id, reward_amount)
SELECT q.id, 'item', 1931, 1
FROM quests q WHERE q.name = 'Advanced Archery: Blinding Speed';

-- Quest 9: Potent Poison (Poison Arrow II)
INSERT INTO quests (name, description, region_id, min_level, repeatable, cooldown_hours, created_at)
VALUES (
  'Ranger Mastery: Deadly Venom',
  'Create more potent poison arrows by defeating ice elementals and extracting their essence.',
  6, -- Frostpeak Glaciers
  16,
  0,
  0,
  unixepoch()
);

INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_mob_id, required_count, auto_complete)
SELECT id, 1, 'kill', 'Extract essence from Ice Elementals', 165, 15, 1
FROM quests WHERE name = 'Ranger Mastery: Deadly Venom';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'xp', 900
FROM quests WHERE name = 'Ranger Mastery: Deadly Venom';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'gold', 250
FROM quests WHERE name = 'Ranger Mastery: Deadly Venom';

INSERT INTO quest_rewards (quest_id, reward_type, reward_item_id, reward_amount)
SELECT q.id, 'item', 1921, 1
FROM quests q WHERE q.name = 'Ranger Mastery: Deadly Venom';

-- Quest 10: Greater Explosions (Explosive Arrow II)
INSERT INTO quests (name, description, region_id, min_level, repeatable, cooldown_hours, created_at)
VALUES (
  'Ranger Mastery: Devastating Blasts',
  'Enhance your explosive arrows by defeating frost giants and harnessing their primal energy.',
  6, -- Frostpeak Glaciers
  16,
  0,
  0,
  unixepoch()
);

INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_mob_id, required_count, auto_complete)
SELECT id, 1, 'kill', 'Defeat Frost Giants', 167, 10, 1
FROM quests WHERE name = 'Ranger Mastery: Devastating Blasts';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'xp', 900
FROM quests WHERE name = 'Ranger Mastery: Devastating Blasts';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'gold', 250
FROM quests WHERE name = 'Ranger Mastery: Devastating Blasts';

INSERT INTO quest_rewards (quest_id, reward_type, reward_item_id, reward_amount)
SELECT q.id, 'item', 1926, 1
FROM quests q WHERE q.name = 'Ranger Mastery: Devastating Blasts';

-- ============================================
-- TIER III QUESTS (Level 23-30) - In Elven Sanctum
-- ============================================

-- Quest 11: Expert Archery (Aimed Shot III)
INSERT INTO quests (name, description, region_id, min_level, repeatable, cooldown_hours, created_at)
VALUES (
  'Expert Archery: Elven Precision',
  'Learn precision techniques from the elven rangers. They require you to hunt corrupted treants to prove your skill.',
  7, -- Elven Sanctum
  23,
  0,
  0,
  unixepoch()
);

INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_mob_id, required_count, auto_complete)
SELECT id, 1, 'kill', 'Hunt enemies in Elven Sanctum', (SELECT id FROM mobs WHERE region_id = 7 LIMIT 1), 15, 1
FROM quests WHERE name = 'Expert Archery: Elven Precision';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'xp', 2000
FROM quests WHERE name = 'Expert Archery: Elven Precision';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'gold', 500
FROM quests WHERE name = 'Expert Archery: Elven Precision';

INSERT INTO quest_rewards (quest_id, reward_type, reward_item_id, reward_amount)
SELECT q.id, 'item', 1912, 1
FROM quests q WHERE q.name = 'Expert Archery: Elven Precision';

-- Quest 12: Multi-Shot Excellence (Multi-Shot III)
INSERT INTO quests (name, description, region_id, min_level, repeatable, cooldown_hours, created_at)
VALUES (
  'Expert Archery: Elven Barrage',
  'The elves will teach you to strike many foes at once. Prove yourself worthy by clearing corrupted areas.',
  7, -- Elven Sanctum
  23,
  0,
  0,
  unixepoch()
);

INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_mob_id, required_count, auto_complete)
SELECT id, 1, 'kill', 'Clear corruption from Elven Sanctum', (SELECT id FROM mobs WHERE region_id = 7 LIMIT 1 OFFSET 1), 18, 1
FROM quests WHERE name = 'Expert Archery: Elven Barrage';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'xp', 2000
FROM quests WHERE name = 'Expert Archery: Elven Barrage';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'gold', 500
FROM quests WHERE name = 'Expert Archery: Elven Barrage';

INSERT INTO quest_rewards (quest_id, reward_type, reward_item_id, reward_amount)
SELECT q.id, 'item', 1917, 1
FROM quests q WHERE q.name = 'Expert Archery: Elven Barrage';

-- Quest 13: Lightning Reflexes (Rapid Fire III)
INSERT INTO quests (name, description, region_id, min_level, repeatable, cooldown_hours, created_at)
VALUES (
  'Expert Archery: Lightning Draw',
  'Master the rapid fire technique by training with elven masters and hunting swift foes.',
  7, -- Elven Sanctum
  23,
  0,
  0,
  unixepoch()
);

INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_mob_id, required_count, auto_complete)
SELECT id, 1, 'kill', 'Hunt swift enemies in Elven Sanctum', (SELECT id FROM mobs WHERE region_id = 7 LIMIT 1 OFFSET 2), 15, 1
FROM quests WHERE name = 'Expert Archery: Lightning Draw';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'xp', 2000
FROM quests WHERE name = 'Expert Archery: Lightning Draw';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'gold', 500
FROM quests WHERE name = 'Expert Archery: Lightning Draw';

INSERT INTO quest_rewards (quest_id, reward_type, reward_item_id, reward_amount)
SELECT q.id, 'item', 1932, 1
FROM quests q WHERE q.name = 'Expert Archery: Lightning Draw';

-- Quest 14: Lethal Poison (Poison Arrow III)
INSERT INTO quests (name, description, region_id, min_level, repeatable, cooldown_hours, created_at)
VALUES (
  'Ranger Excellence: Lethal Toxins',
  'The elven alchemists will share their poison secrets if you gather rare ingredients from dangerous creatures.',
  7, -- Elven Sanctum
  23,
  0,
  0,
  unixepoch()
);

INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_mob_id, required_count, auto_complete)
SELECT id, 1, 'kill', 'Gather toxins from Elven Sanctum creatures', (SELECT id FROM mobs WHERE region_id = 7 LIMIT 1 OFFSET 3), 20, 1
FROM quests WHERE name = 'Ranger Excellence: Lethal Toxins';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'xp', 2200
FROM quests WHERE name = 'Ranger Excellence: Lethal Toxins';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'gold', 550
FROM quests WHERE name = 'Ranger Excellence: Lethal Toxins';

INSERT INTO quest_rewards (quest_id, reward_type, reward_item_id, reward_amount)
SELECT q.id, 'item', 1922, 1
FROM quests q WHERE q.name = 'Ranger Excellence: Lethal Toxins';

-- Quest 15: Massive Detonations (Explosive Arrow III)
INSERT INTO quests (name, description, region_id, min_level, repeatable, cooldown_hours, created_at)
VALUES (
  'Ranger Excellence: Cataclysmic Arrows',
  'Learn to create devastating explosive arrows from elven war masters. Prove your strength in battle.',
  7, -- Elven Sanctum
  23,
  0,
  0,
  unixepoch()
);

INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_mob_id, required_count, auto_complete)
SELECT id, 1, 'kill', 'Defeat powerful foes in Elven Sanctum', (SELECT id FROM mobs WHERE region_id = 7 LIMIT 1 OFFSET 4), 12, 1
FROM quests WHERE name = 'Ranger Excellence: Cataclysmic Arrows';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'xp', 2200
FROM quests WHERE name = 'Ranger Excellence: Cataclysmic Arrows';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'gold', 550
FROM quests WHERE name = 'Ranger Excellence: Cataclysmic Arrows';

INSERT INTO quest_rewards (quest_id, reward_type, reward_item_id, reward_amount)
SELECT q.id, 'item', 1927, 1
FROM quests q WHERE q.name = 'Ranger Excellence: Cataclysmic Arrows';

-- ============================================
-- TIER IV QUESTS (Level 36-42) - Demon Citadel
-- ============================================

-- Quest 16: Master Marksmanship (Aimed Shot IV)
INSERT INTO quests (name, description, region_id, min_level, repeatable, cooldown_hours, created_at)
VALUES (
  'Master Archery: Demon Hunter',
  'Prove your mastery by hunting demons in the Demon Citadel. Only perfect precision will suffice.',
  11, -- Demon Citadel
  36,
  0,
  0,
  unixepoch()
);

INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_mob_id, required_count, auto_complete)
SELECT id, 1, 'kill', 'Hunt demons in the Demon Citadel', (SELECT id FROM mobs WHERE region_id = 11 LIMIT 1), 20, 1
FROM quests WHERE name = 'Master Archery: Demon Hunter';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'xp', 5000
FROM quests WHERE name = 'Master Archery: Demon Hunter';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'gold', 1200
FROM quests WHERE name = 'Master Archery: Demon Hunter';

INSERT INTO quest_rewards (quest_id, reward_type, reward_item_id, reward_amount)
SELECT q.id, 'item', 1913, 1
FROM quests q WHERE q.name = 'Master Archery: Demon Hunter';

-- Quest 17: Perfect Multi-Shot (Multi-Shot IV)
INSERT INTO quests (name, description, region_id, min_level, repeatable, cooldown_hours, created_at)
VALUES (
  'Master Archery: Demon Slayer Volley',
  'Strike down hordes of demons with perfect multi-shot technique.',
  11, -- Demon Citadel
  36,
  0,
  0,
  unixepoch()
);

INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_mob_id, required_count, auto_complete)
SELECT id, 1, 'kill', 'Slay demon hordes', (SELECT id FROM mobs WHERE region_id = 11 LIMIT 1 OFFSET 1), 25, 1
FROM quests WHERE name = 'Master Archery: Demon Slayer Volley';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'xp', 5000
FROM quests WHERE name = 'Master Archery: Demon Slayer Volley';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'gold', 1200
FROM quests WHERE name = 'Master Archery: Demon Slayer Volley';

INSERT INTO quest_rewards (quest_id, reward_type, reward_item_id, reward_amount)
SELECT q.id, 'item', 1918, 1
FROM quests q WHERE q.name = 'Master Archery: Demon Slayer Volley';

-- Quest 18: Supreme Rapid Fire (Rapid Fire IV)
INSERT INTO quests (name, description, region_id, min_level, repeatable, cooldown_hours, created_at)
VALUES (
  'Master Archery: Demon Piercer',
  'Achieve supreme firing speed by battling the fastest demons in the citadel.',
  11, -- Demon Citadel
  36,
  0,
  0,
  unixepoch()
);

INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_mob_id, required_count, auto_complete)
SELECT id, 1, 'kill', 'Hunt swift demons', (SELECT id FROM mobs WHERE region_id = 11 LIMIT 1 OFFSET 2), 20, 1
FROM quests WHERE name = 'Master Archery: Demon Piercer';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'xp', 5000
FROM quests WHERE name = 'Master Archery: Demon Piercer';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'gold', 1200
FROM quests WHERE name = 'Master Archery: Demon Piercer';

INSERT INTO quest_rewards (quest_id, reward_type, reward_item_id, reward_amount)
SELECT q.id, 'item', 1933, 1
FROM quests q WHERE q.name = 'Master Archery: Demon Piercer';

-- Quest 19: Demonic Poison (Poison Arrow IV)
INSERT INTO quests (name, description, region_id, min_level, repeatable, cooldown_hours, created_at)
VALUES (
  'Ranger Mastery: Infernal Toxins',
  'Extract demonic essence to create the most potent poison arrows known to rangers.',
  11, -- Demon Citadel
  36,
  0,
  0,
  unixepoch()
);

INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_mob_id, required_count, auto_complete)
SELECT id, 1, 'kill', 'Extract demonic essence', (SELECT id FROM mobs WHERE region_id = 11 LIMIT 1 OFFSET 3), 25, 1
FROM quests WHERE name = 'Ranger Mastery: Infernal Toxins';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'xp', 5500
FROM quests WHERE name = 'Ranger Mastery: Infernal Toxins';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'gold', 1400
FROM quests WHERE name = 'Ranger Mastery: Infernal Toxins';

INSERT INTO quest_rewards (quest_id, reward_type, reward_item_id, reward_amount)
SELECT q.id, 'item', 1923, 1
FROM quests q WHERE q.name = 'Ranger Mastery: Infernal Toxins';

-- Quest 20: Apocalyptic Explosions (Explosive Arrow IV)
INSERT INTO quests (name, description, region_id, min_level, repeatable, cooldown_hours, created_at)
VALUES (
  'Ranger Mastery: Hellfire Arrows',
  'Create arrows of pure destruction by harnessing infernal power from the mightiest demons.',
  11, -- Demon Citadel
  36,
  0,
  0,
  unixepoch()
);

INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_mob_id, required_count, auto_complete)
SELECT id, 1, 'kill', 'Defeat powerful demons', (SELECT id FROM mobs WHERE region_id = 11 LIMIT 1 OFFSET 4), 18, 1
FROM quests WHERE name = 'Ranger Mastery: Hellfire Arrows';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'xp', 5500
FROM quests WHERE name = 'Ranger Mastery: Hellfire Arrows';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'gold', 1400
FROM quests WHERE name = 'Ranger Mastery: Hellfire Arrows';

INSERT INTO quest_rewards (quest_id, reward_type, reward_item_id, reward_amount)
SELECT q.id, 'item', 1928, 1
FROM quests q WHERE q.name = 'Ranger Mastery: Hellfire Arrows';

-- ============================================
-- TIER V QUESTS (Level 49+) - Elemental Chaos
-- ============================================

-- Quest 21: Legendary Precision (Aimed Shot V)
INSERT INTO quests (name, description, region_id, min_level, repeatable, cooldown_hours, created_at)
VALUES (
  'Legendary Archery: Chaos Marksman',
  'Achieve legendary precision by hunting the most chaotic and unpredictable elementals.',
  13, -- Elemental Chaos
  49,
  0,
  0,
  unixepoch()
);

INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_mob_id, required_count, auto_complete)
SELECT id, 1, 'kill', 'Hunt Chaos Elementals', 212, 20, 1
FROM quests WHERE name = 'Legendary Archery: Chaos Marksman';

INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_mob_id, required_count, auto_complete)
SELECT id, 2, 'kill', 'Hunt Primordial Flames', 213, 15, 1
FROM quests WHERE name = 'Legendary Archery: Chaos Marksman';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'xp', 12000
FROM quests WHERE name = 'Legendary Archery: Chaos Marksman';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'gold', 3000
FROM quests WHERE name = 'Legendary Archery: Chaos Marksman';

INSERT INTO quest_rewards (quest_id, reward_type, reward_item_id, reward_amount)
SELECT q.id, 'item', 1914, 1
FROM quests q WHERE q.name = 'Legendary Archery: Chaos Marksman';

-- Quest 22: Ultimate Multi-Shot (Multi-Shot V)
INSERT INTO quests (name, description, region_id, min_level, repeatable, cooldown_hours, created_at)
VALUES (
  'Legendary Archery: Storm of Arrows',
  'Master the ultimate multi-shot technique by facing overwhelming numbers of elemental foes.',
  13, -- Elemental Chaos
  49,
  0,
  0,
  unixepoch()
);

INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_mob_id, required_count, auto_complete)
SELECT id, 1, 'kill', 'Defeat Storm Titans', 214, 18, 1
FROM quests WHERE name = 'Legendary Archery: Storm of Arrows';

INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_mob_id, required_count, auto_complete)
SELECT id, 2, 'kill', 'Defeat Earth Colossi', 215, 18, 1
FROM quests WHERE name = 'Legendary Archery: Storm of Arrows';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'xp', 12000
FROM quests WHERE name = 'Legendary Archery: Storm of Arrows';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'gold', 3000
FROM quests WHERE name = 'Legendary Archery: Storm of Arrows';

INSERT INTO quest_rewards (quest_id, reward_type, reward_item_id, reward_amount)
SELECT q.id, 'item', 1919, 1
FROM quests q WHERE q.name = 'Legendary Archery: Storm of Arrows';

-- Quest 23: Godlike Speed (Rapid Fire V)
INSERT INTO quests (name, description, region_id, min_level, repeatable, cooldown_hours, created_at)
VALUES (
  'Legendary Archery: Divine Velocity',
  'Achieve firing speeds thought impossible by mortal rangers. Face the fastest elementals.',
  13, -- Elemental Chaos
  49,
  0,
  0,
  unixepoch()
);

INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_mob_id, required_count, auto_complete)
SELECT id, 1, 'kill', 'Hunt Primordial Flames', 213, 25, 1
FROM quests WHERE name = 'Legendary Archery: Divine Velocity';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'xp', 12000
FROM quests WHERE name = 'Legendary Archery: Divine Velocity';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'gold', 3000
FROM quests WHERE name = 'Legendary Archery: Divine Velocity';

INSERT INTO quest_rewards (quest_id, reward_type, reward_item_id, reward_amount)
SELECT q.id, 'item', 1934, 1
FROM quests q WHERE q.name = 'Legendary Archery: Divine Velocity';

-- Quest 24: Elemental Poison (Poison Arrow V)
INSERT INTO quests (name, description, region_id, min_level, repeatable, cooldown_hours, created_at)
VALUES (
  'Legendary Ranger: Primordial Toxins',
  'Create poison arrows infused with primordial chaos, the deadliest toxin in existence.',
  13, -- Elemental Chaos
  49,
  0,
  0,
  unixepoch()
);

INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_mob_id, required_count, auto_complete)
SELECT id, 1, 'kill', 'Extract essence from Chaos Elementals', 212, 30, 1
FROM quests WHERE name = 'Legendary Ranger: Primordial Toxins';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'xp', 13000
FROM quests WHERE name = 'Legendary Ranger: Primordial Toxins';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'gold', 3500
FROM quests WHERE name = 'Legendary Ranger: Primordial Toxins';

INSERT INTO quest_rewards (quest_id, reward_type, reward_item_id, reward_amount)
SELECT q.id, 'item', 1924, 1
FROM quests q WHERE q.name = 'Legendary Ranger: Primordial Toxins';

-- Quest 25: World-Ending Explosions (Explosive Arrow V)
INSERT INTO quests (name, description, region_id, min_level, repeatable, cooldown_hours, created_at)
VALUES (
  'Legendary Ranger: Apocalypse Arrows',
  'Forge arrows of pure elemental destruction capable of leveling mountains. Face the Magma Behemoths.',
  13, -- Elemental Chaos
  49,
  0,
  0,
  unixepoch()
);

INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_mob_id, required_count, auto_complete)
SELECT id, 1, 'kill', 'Defeat Magma Behemoths', 216, 20, 1
FROM quests WHERE name = 'Legendary Ranger: Apocalypse Arrows';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'xp', 13000
FROM quests WHERE name = 'Legendary Ranger: Apocalypse Arrows';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'gold', 3500
FROM quests WHERE name = 'Legendary Ranger: Apocalypse Arrows';

INSERT INTO quest_rewards (quest_id, reward_type, reward_item_id, reward_amount)
SELECT q.id, 'item', 1929, 1
FROM quests q WHERE q.name = 'Legendary Ranger: Apocalypse Arrows';
