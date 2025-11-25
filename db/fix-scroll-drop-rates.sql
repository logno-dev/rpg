-- Increase drop rates for higher tier scrolls
-- Tier I: 1-2% (keep as is, already good)
-- Tier II: 1.5% -> 3%
-- Tier III: 0.5% -> 2%  
-- Tier IV: 0.15% -> 1.5%
-- Tier V: 0.25% -> 1.2%
-- Tier VI: 0.4% -> 1%

-- Update Tier II scrolls (currently 0.8-1%)
UPDATE mob_loot 
SET drop_chance = 0.03
WHERE item_id IN (
  SELECT i.id FROM items i
  JOIN abilities a ON i.teaches_ability_id = a.id
  WHERE i.type = 'scroll' 
  AND a.level = 2
  AND a.base_id IS NOT NULL
)
AND drop_chance < 0.03;

-- Update Tier III scrolls (currently 0.3-0.8%)
UPDATE mob_loot
SET drop_chance = 0.02
WHERE item_id IN (
  SELECT i.id FROM items i
  JOIN abilities a ON i.teaches_ability_id = a.id
  WHERE i.type = 'scroll'
  AND a.level = 3
  AND a.base_id IS NOT NULL
)
AND drop_chance < 0.02;

-- Update Tier IV scrolls (currently 0.15-0.3%)
UPDATE mob_loot
SET drop_chance = 0.015
WHERE item_id IN (
  SELECT i.id FROM items i
  JOIN abilities a ON i.teaches_ability_id = a.id
  WHERE i.type = 'scroll'
  AND a.level = 4
  AND a.base_id IS NOT NULL
)
AND drop_chance < 0.015;

-- Update Tier V scrolls (currently 0.24-0.45%)
UPDATE mob_loot
SET drop_chance = 0.012
WHERE item_id IN (
  SELECT i.id FROM items i
  JOIN abilities a ON i.teaches_ability_id = a.id
  WHERE i.type = 'scroll'
  AND a.level = 5
  AND a.base_id IS NOT NULL
)
AND drop_chance < 0.012;

-- Update Tier VI scrolls (currently 0.4%)
UPDATE mob_loot
SET drop_chance = 0.01
WHERE item_id IN (
  SELECT i.id FROM items i
  JOIN abilities a ON i.teaches_ability_id = a.id
  WHERE i.type = 'scroll'
  AND a.level = 6
  AND a.base_id IS NOT NULL
)
AND drop_chance < 0.01;

