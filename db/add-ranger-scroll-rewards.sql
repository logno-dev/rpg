-- ============================================
-- Ranger Scroll Quest Rewards & Loot Tables
-- ============================================
-- Adds ranger ability scrolls to quest rewards and mob loot tables

-- ============================================
-- QUEST REWARDS
-- ============================================
-- Add Tier 1 scrolls (Level 3) to low-level quests

-- Aimed Shot I - Daily Patrol
INSERT INTO quest_rewards (quest_id, reward_type, reward_item_id, reward_amount)
VALUES (6, 'item', 1910, 1);

-- Multi-Shot I - Clear the Dire Wolfs (Region 2)
INSERT INTO quest_rewards (quest_id, reward_type, reward_item_id, reward_amount)
VALUES (60, 'item', 1915, 1);

-- Rapid Fire I - Clear the Dire Wolfs (Region 4)
INSERT INTO quest_rewards (quest_id, reward_type, reward_item_id, reward_amount)
VALUES (109, 'item', 1930, 1);

-- Poison Arrow I - Shadowdeep Dungeon bounty
INSERT INTO quest_rewards (quest_id, reward_type, reward_item_id, reward_amount)
VALUES (114, 'item', 1920, 1);

-- Explosive Arrow I - Learn War Cry quest
INSERT INTO quest_rewards (quest_id, reward_type, reward_item_id, reward_amount)
VALUES (454, 'item', 1925, 1);

-- Add a few Tier 2 scrolls (Level 16) if quests exist
INSERT INTO quest_rewards (quest_id, reward_type, reward_item_id, reward_amount)
SELECT id, 'item', 1911, 1 
FROM quests 
WHERE min_level = 16 AND region_id <= 3
LIMIT 1;

INSERT INTO quest_rewards (quest_id, reward_type, reward_item_id, reward_amount)
SELECT id, 'item', 1916, 1 
FROM quests 
WHERE min_level = 16 AND region_id BETWEEN 4 AND 6
LIMIT 1;

-- Add Tier 3 scroll (Level 23)
INSERT INTO quest_rewards (quest_id, reward_type, reward_item_id, reward_amount)
VALUES (230, 'item', 1922, 1); -- Poison Arrow III

-- ============================================
-- MOB LOOT TABLES
-- ============================================
-- Add scrolls to appropriate level mob drops

-- Tier 1 scrolls (Level 1-10 mobs) - Very low drop rate (0.3-0.5%)
-- Add to early game mobs
INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT id, 1910, 0.004, 1, 1
FROM mobs
WHERE level BETWEEN 3 AND 10
LIMIT 5;

INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT id, 1915, 0.004, 1, 1
FROM mobs
WHERE level BETWEEN 3 AND 10 AND id NOT IN (
  SELECT mob_id FROM mob_loot WHERE item_id = 1910
)
LIMIT 5;

INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT id, 1930, 0.004, 1, 1
FROM mobs
WHERE level BETWEEN 3 AND 10 AND id NOT IN (
  SELECT mob_id FROM mob_loot WHERE item_id IN (1910, 1915)
)
LIMIT 5;

INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT id, 1920, 0.003, 1, 1
FROM mobs
WHERE level BETWEEN 5 AND 12
LIMIT 4;

INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT id, 1925, 0.003, 1, 1
FROM mobs
WHERE level BETWEEN 5 AND 12 AND id NOT IN (
  SELECT mob_id FROM mob_loot WHERE item_id = 1920
)
LIMIT 4;

-- Tier 2 scrolls (Level 15-25 mobs) - Low drop rate (0.25-0.35%)
INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT id, 1911, 0.003, 1, 1
FROM mobs
WHERE level BETWEEN 16 AND 25
LIMIT 6;

INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT id, 1916, 0.003, 1, 1
FROM mobs
WHERE level BETWEEN 16 AND 25 AND id NOT IN (
  SELECT mob_id FROM mob_loot WHERE item_id = 1911
)
LIMIT 6;

INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT id, 1931, 0.003, 1, 1
FROM mobs
WHERE level BETWEEN 16 AND 25 AND id NOT IN (
  SELECT mob_id FROM mob_loot WHERE item_id IN (1911, 1916)
)
LIMIT 6;

INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT id, 1921, 0.0025, 1, 1
FROM mobs
WHERE level BETWEEN 18 AND 26
LIMIT 5;

INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT id, 1926, 0.0025, 1, 1
FROM mobs
WHERE level BETWEEN 18 AND 26 AND id NOT IN (
  SELECT mob_id FROM mob_loot WHERE item_id = 1921
)
LIMIT 5;

-- Tier 3 scrolls (Level 23-35 mobs) - Low drop rate (0.2-0.3%)
INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT id, 1912, 0.0025, 1, 1
FROM mobs
WHERE level BETWEEN 23 AND 35
LIMIT 6;

INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT id, 1917, 0.0025, 1, 1
FROM mobs
WHERE level BETWEEN 23 AND 35 AND id NOT IN (
  SELECT mob_id FROM mob_loot WHERE item_id = 1912
)
LIMIT 6;

INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT id, 1932, 0.0025, 1, 1
FROM mobs
WHERE level BETWEEN 23 AND 35 AND id NOT IN (
  SELECT mob_id FROM mob_loot WHERE item_id IN (1912, 1917)
)
LIMIT 6;

INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT id, 1922, 0.002, 1, 1
FROM mobs
WHERE level BETWEEN 25 AND 36
LIMIT 5;

INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT id, 1927, 0.002, 1, 1
FROM mobs
WHERE level BETWEEN 25 AND 36 AND id NOT IN (
  SELECT mob_id FROM mob_loot WHERE item_id = 1922
)
LIMIT 5;

-- Tier 4 scrolls (Level 36-48 mobs) - Very low drop rate (0.15-0.25%)
INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT id, 1913, 0.002, 1, 1
FROM mobs
WHERE level BETWEEN 36 AND 48
LIMIT 6;

INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT id, 1918, 0.002, 1, 1
FROM mobs
WHERE level BETWEEN 36 AND 48 AND id NOT IN (
  SELECT mob_id FROM mob_loot WHERE item_id = 1913
)
LIMIT 6;

INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT id, 1933, 0.002, 1, 1
FROM mobs
WHERE level BETWEEN 36 AND 48 AND id NOT IN (
  SELECT mob_id FROM mob_loot WHERE item_id IN (1913, 1918)
)
LIMIT 6;

INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT id, 1923, 0.0015, 1, 1
FROM mobs
WHERE level BETWEEN 38 AND 50
LIMIT 5;

INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT id, 1928, 0.0015, 1, 1
FROM mobs
WHERE level BETWEEN 38 AND 50 AND id NOT IN (
  SELECT mob_id FROM mob_loot WHERE item_id = 1923
)
LIMIT 5;

-- Tier 5 scrolls (Level 49+ mobs) - Very rare (0.1-0.2%)
INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT id, 1914, 0.0015, 1, 1
FROM mobs
WHERE level >= 49
LIMIT 6;

INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT id, 1919, 0.0015, 1, 1
FROM mobs
WHERE level >= 49 AND id NOT IN (
  SELECT mob_id FROM mob_loot WHERE item_id = 1914
)
LIMIT 6;

INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT id, 1934, 0.0015, 1, 1
FROM mobs
WHERE level >= 49 AND id NOT IN (
  SELECT mob_id FROM mob_loot WHERE item_id IN (1914, 1919)
)
LIMIT 6;

INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT id, 1924, 0.001, 1, 1
FROM mobs
WHERE level >= 51
LIMIT 5;

INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT id, 1929, 0.001, 1, 1
FROM mobs
WHERE level >= 51 AND id NOT IN (
  SELECT mob_id FROM mob_loot WHERE item_id = 1924
)
LIMIT 5;

-- ============================================
-- NAMED MOB LOOT (Higher drop rates)
-- ============================================
-- Add scrolls to named/elite mobs with better drop rates

-- Tier 1-2 scrolls on low-level named mobs
INSERT INTO named_mob_loot (named_mob_id, item_id, drop_chance, min_quantity, max_quantity)
SELECT id, 1910, 0.15, 1, 1
FROM named_mobs
WHERE level BETWEEN 3 AND 12
LIMIT 3;

INSERT INTO named_mob_loot (named_mob_id, item_id, drop_chance, min_quantity, max_quantity)
SELECT id, 1915, 0.15, 1, 1
FROM named_mobs
WHERE level BETWEEN 3 AND 12 AND id NOT IN (
  SELECT named_mob_id FROM named_mob_loot WHERE item_id = 1910
)
LIMIT 3;

INSERT INTO named_mob_loot (named_mob_id, item_id, drop_chance, min_quantity, max_quantity)
SELECT id, 1911, 0.12, 1, 1
FROM named_mobs
WHERE level BETWEEN 16 AND 25
LIMIT 3;

INSERT INTO named_mob_loot (named_mob_id, item_id, drop_chance, min_quantity, max_quantity)
SELECT id, 1916, 0.12, 1, 1
FROM named_mobs
WHERE level BETWEEN 16 AND 25 AND id NOT IN (
  SELECT named_mob_id FROM named_mob_loot WHERE item_id = 1911
)
LIMIT 3;

-- Tier 3 scrolls on mid-level named mobs
INSERT INTO named_mob_loot (named_mob_id, item_id, drop_chance, min_quantity, max_quantity)
SELECT id, 1912, 0.10, 1, 1
FROM named_mobs
WHERE level BETWEEN 23 AND 35
LIMIT 3;

INSERT INTO named_mob_loot (named_mob_id, item_id, drop_chance, min_quantity, max_quantity)
SELECT id, 1917, 0.10, 1, 1
FROM named_mobs
WHERE level BETWEEN 23 AND 35 AND id NOT IN (
  SELECT named_mob_id FROM named_mob_loot WHERE item_id = 1912
)
LIMIT 3;

-- Tier 4 scrolls on high-level named mobs
INSERT INTO named_mob_loot (named_mob_id, item_id, drop_chance, min_quantity, max_quantity)
SELECT id, 1913, 0.08, 1, 1
FROM named_mobs
WHERE level BETWEEN 36 AND 48
LIMIT 3;

INSERT INTO named_mob_loot (named_mob_id, item_id, drop_chance, min_quantity, max_quantity)
SELECT id, 1918, 0.08, 1, 1
FROM named_mobs
WHERE level BETWEEN 36 AND 48 AND id NOT IN (
  SELECT named_mob_id FROM named_mob_loot WHERE item_id = 1913
)
LIMIT 3;

-- Tier 5 scrolls on endgame named mobs
INSERT INTO named_mob_loot (named_mob_id, item_id, drop_chance, min_quantity, max_quantity)
SELECT id, 1914, 0.06, 1, 1
FROM named_mobs
WHERE level >= 49
LIMIT 3;

INSERT INTO named_mob_loot (named_mob_id, item_id, drop_chance, min_quantity, max_quantity)
SELECT id, 1919, 0.06, 1, 1
FROM named_mobs
WHERE level >= 49 AND id NOT IN (
  SELECT named_mob_id FROM named_mob_loot WHERE item_id = 1914
)
LIMIT 3;

INSERT INTO named_mob_loot (named_mob_id, item_id, drop_chance, min_quantity, max_quantity)
SELECT id, 1924, 0.05, 1, 1
FROM named_mobs
WHERE level >= 51
LIMIT 2;

INSERT INTO named_mob_loot (named_mob_id, item_id, drop_chance, min_quantity, max_quantity)
SELECT id, 1929, 0.05, 1, 1
FROM named_mobs
WHERE level >= 51 AND id NOT IN (
  SELECT named_mob_id FROM named_mob_loot WHERE item_id = 1924
)
LIMIT 2;
