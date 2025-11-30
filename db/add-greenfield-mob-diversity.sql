-- ============================================
-- Add Mob Diversity to Greenfield Plains
-- ============================================
-- Adds new low-level mobs to the starter zone for variety

-- Level 1 mobs
INSERT INTO mobs (name, level, area, max_health, damage_min, damage_max, defense, experience_reward, gold_min, gold_max, aggressive, attack_speed, region_id, evasiveness, created_at)
VALUES 
  ('Chicken', 1, 'plains', 8, 1, 2, 0, 5, 0, 1, 0, 1.2, 1, 5, unixepoch()),
  ('Stray Cat', 1, 'plains', 10, 1, 3, 1, 6, 0, 2, 0, 1.3, 1, 12, unixepoch());

-- Level 2 mobs
INSERT INTO mobs (name, level, area, max_health, damage_min, damage_max, defense, experience_reward, gold_min, gold_max, aggressive, attack_speed, region_id, evasiveness, created_at)
VALUES 
  ('Wild Turkey', 2, 'plains', 18, 2, 4, 1, 12, 1, 3, 0, 1.1, 1, 8, unixepoch()),
  ('Prairie Dog', 2, 'plains', 15, 2, 3, 2, 11, 1, 2, 0, 1.0, 1, 15, unixepoch());

-- Level 3 mobs
INSERT INTO mobs (name, level, area, max_health, damage_min, damage_max, defense, experience_reward, gold_min, gold_max, aggressive, attack_speed, region_id, evasiveness, created_at)
VALUES 
  ('Farm Goat', 3, 'plains', 25, 3, 5, 2, 18, 2, 5, 0, 0.9, 1, 10, unixepoch()),
  ('Scavenger Crow', 3, 'plains', 20, 3, 6, 1, 17, 1, 4, 0, 1.4, 1, 18, unixepoch());

-- Level 4 mobs
INSERT INTO mobs (name, level, area, max_health, damage_min, damage_max, defense, experience_reward, gold_min, gold_max, aggressive, attack_speed, region_id, evasiveness, created_at)
VALUES 
  ('Stray Hound', 4, 'plains', 35, 4, 7, 3, 25, 3, 7, 0, 1.1, 1, 12, unixepoch()),
  ('Barn Owl', 4, 'plains', 28, 4, 8, 2, 24, 2, 6, 0, 1.3, 1, 20, unixepoch());

-- Add these mobs to appropriate sub-areas
-- Village Outskirts (1-2)
INSERT INTO sub_area_mobs (sub_area_id, mob_id)
SELECT 1, id FROM mobs WHERE name IN ('Chicken', 'Stray Cat', 'Wild Turkey');

-- Open Meadow (2-3)
INSERT INTO sub_area_mobs (sub_area_id, mob_id)
SELECT 2, id FROM mobs WHERE name IN ('Wild Turkey', 'Prairie Dog', 'Scavenger Crow');

-- Farmland (3-4)
INSERT INTO sub_area_mobs (sub_area_id, mob_id)
SELECT 3, id FROM mobs WHERE name IN ('Farm Goat', 'Scavenger Crow', 'Stray Hound', 'Barn Owl');

-- Also ensure existing diversity mobs are set to passive
UPDATE mobs SET aggressive = 0 WHERE name IN ('Feral Hound', 'Meadow Sprite', 'Crop Blight');
