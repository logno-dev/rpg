-- Add Missing Base Materials to Loot Tables
-- These materials are required for recipes but have no loot source

BEGIN TRANSACTION;

-- ================================================================================
-- Add Reinforced Leather (ID 48) - Rare, for Advanced leather recipes
-- ================================================================================
-- Add to high-level beasts and demons (level 40+)

INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
VALUES
  (202, 48, 0.20, 1, 2),  -- Balrog
  (203, 48, 0.20, 1, 2),  -- Archdevil  
  (204, 48, 0.20, 1, 2),  -- Greater Demon
  (205, 48, 0.15, 1, 3),  -- Astral Wanderer
  (206, 48, 0.15, 1, 3),  -- Phase Beast
  (207, 48, 0.15, 1, 3),  -- Dimension Hopper
  (210, 48, 0.25, 2, 4);  -- Planar Guardian (better drop)

-- ================================================================================
-- Add Rare Herbs (ID 17) - Uncommon, for alchemy recipes
-- ================================================================================
-- Add to mid-high level nature/forest mobs (level 25-40)

INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT 
  m.id,
  17,  -- Rare Herbs
  0.25,  -- 25% drop chance
  1,
  3
FROM mobs m
WHERE m.level >= 25 AND m.level < 40
  AND (m.name LIKE '%Treant%' OR m.name LIKE '%Plant%' OR m.name LIKE '%Nature%' OR m.name LIKE '%Forest%')
LIMIT 5;

-- ================================================================================
-- Add Adamantite Ore (ID 19) - Rare, for blacksmithing recipes
-- ================================================================================
-- Add to high-level golems and elementals (level 35+)

INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT 
  m.id,
  19,  -- Adamantite Ore
  0.18,  -- 18% drop chance
  1,
  2
FROM mobs m
WHERE m.level >= 35
  AND (m.name LIKE '%Golem%' OR m.name LIKE '%Elemental%' OR m.name LIKE '%Titan%')
LIMIT 8;

-- ================================================================================
-- Add Ethereal Silk (ID 20) - Rare, for tailoring recipes
-- ================================================================================
-- Add to high-level astral/ethereal mobs (level 40+)

INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
VALUES
  (205, 20, 0.22, 1, 2),  -- Astral Wanderer
  (206, 20, 0.22, 1, 2),  -- Phase Beast
  (207, 20, 0.22, 1, 2),  -- Dimension Hopper
  (208, 20, 0.25, 1, 3),  -- Reality Weaver
  (209, 20, 0.20, 1, 3);  -- Astral Dragon

COMMIT;

-- ================================================================================
-- VERIFICATION
-- ================================================================================

SELECT 'Materials added to loot tables:' as '';
SELECT DISTINCT cm.id, cm.name, cm.rarity, 'Now in loot' as status
FROM crafting_materials cm
WHERE cm.id IN (17, 19, 20, 48)
ORDER BY cm.id;

SELECT '' as '';
SELECT 'Sample loot entries:' as '';
SELECT m.name as mob_name, m.level, cm.name as material, ml.drop_chance, ml.quantity_min, ml.quantity_max
FROM mob_loot ml
JOIN mobs m ON ml.mob_id = m.id
JOIN crafting_materials cm ON ml.item_id = cm.id
WHERE ml.item_id IN (17, 19, 20, 48)
ORDER BY cm.id, m.level
LIMIT 15;
