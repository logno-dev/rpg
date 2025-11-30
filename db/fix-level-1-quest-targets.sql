-- ============================================
-- Fix Level 1 Quest Targets
-- ============================================
-- Updates level 1 quests to target level 1 mobs in Village Outskirts
-- This ensures brand new players aren't fighting level 3 goblins

-- First, let's see which quests need fixing
-- Level 1 quests currently targeting Goblins (level 3):
-- - Learn Kick I
-- - Learn Dodge I  
-- - Path to Whirlwind Strike

-- Available level 1 mobs in Village Outskirts:
-- - Giant Rat (already used by "Clear the Giant Rats")
-- - Feral Hound (good aggressive-sounding mob)
-- - Chicken (too easy/silly for combat training)
-- - Stray Cat (too easy)

-- Strategy: Use Feral Hound for combat training quests, keep Goblin for one advanced quest

-- Get the Feral Hound mob ID
-- Update Learn Kick I to use Feral Hound instead of Goblin
UPDATE quest_objectives 
SET target_mob_id = (SELECT id FROM mobs WHERE name = 'Feral Hound' AND region_id = 1 LIMIT 1)
WHERE quest_id = (SELECT id FROM quests WHERE name = 'Learn Kick I')
AND target_mob_id = (SELECT id FROM mobs WHERE name = 'Goblin' AND level = 3 LIMIT 1);

-- Update Learn Dodge I to use Giant Rat (teaches dodging smaller, faster enemies)
UPDATE quest_objectives 
SET target_mob_id = (SELECT id FROM mobs WHERE name = 'Giant Rat' AND region_id = 1 LIMIT 1),
    required_count = 8  -- Increase count since they're easier
WHERE quest_id = (SELECT id FROM quests WHERE name = 'Learn Dodge I')
AND target_mob_id = (SELECT id FROM mobs WHERE name = 'Goblin' AND level = 3 LIMIT 1);

-- Keep "Path to Whirlwind Strike" using Goblin as it's meant to be challenging
-- (This is fine as an advanced level 1 quest)

-- Add some new level 1 quests for the new mobs to give players variety

-- Quest: Farmyard Menace (hunt chickens and turkeys - easy intro quest)
INSERT INTO quests (name, description, region_id, min_level, repeatable, cooldown_hours, created_at)
VALUES (
  'Farmyard Menace',
  'The local farms are overrun with wild chickens and turkeys. Help clear them out for the farmers.',
  1, -- Greenfield Plains
  1,
  0,
  0,
  unixepoch()
);

INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_mob_id, required_count, auto_complete)
SELECT id, 1, 'kill', 'Hunt Wild Chickens', 
  (SELECT id FROM mobs WHERE name = 'Chicken' AND region_id = 1 LIMIT 1), 
  10, 1
FROM quests WHERE name = 'Farmyard Menace';

INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_mob_id, required_count, auto_complete)
SELECT id, 2, 'kill', 'Hunt Wild Turkeys',
  (SELECT id FROM mobs WHERE name = 'Wild Turkey' AND region_id = 1 LIMIT 1),
  6, 1
FROM quests WHERE name = 'Farmyard Menace';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'xp', 50
FROM quests WHERE name = 'Farmyard Menace';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'gold', 15
FROM quests WHERE name = 'Farmyard Menace';

-- Quest: Stray Problem (deal with stray cats and hounds)
INSERT INTO quests (name, description, region_id, min_level, repeatable, cooldown_hours, created_at)
VALUES (
  'Stray Problem',
  'Stray animals have been causing trouble around the village. Deal with the cats and hounds prowling the outskirts.',
  1, -- Greenfield Plains
  1,
  0,
  0,
  unixepoch()
);

INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_mob_id, required_count, auto_complete)
SELECT id, 1, 'kill', 'Deal with Stray Cats',
  (SELECT id FROM mobs WHERE name = 'Stray Cat' AND region_id = 1 LIMIT 1),
  8, 1
FROM quests WHERE name = 'Stray Problem';

INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_mob_id, required_count, auto_complete)
SELECT id, 2, 'kill', 'Deal with Feral Hounds',
  (SELECT id FROM mobs WHERE name = 'Feral Hound' AND region_id = 1 LIMIT 1),
  6, 1
FROM quests WHERE name = 'Stray Problem';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'xp', 75
FROM quests WHERE name = 'Stray Problem';

INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
SELECT id, 'gold', 25
FROM quests WHERE name = 'Stray Problem';

-- Also update "Learn Strike I" description to clarify it's for slightly higher level
UPDATE quests 
SET description = 'Practice your strike technique on wild foxes near the village. These agile creatures will test your accuracy.'
WHERE name = 'Learn Strike I';
