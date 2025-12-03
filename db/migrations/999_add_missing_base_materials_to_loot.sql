-- Add missing base crafting materials to mob loot tables
-- These are NOT special materials (those come from quests only)
-- These are regular base materials needed for recipes

-- Rare Herbs (ID 17) - uncommon, for alchemy
-- Drop from nature/forest mobs level 6+
INSERT INTO mob_crafting_loot (mob_id, material_id, drop_chance, min_quantity, max_quantity)
SELECT id, 17, 0.25, 1, 2
FROM mobs 
WHERE level >= 6 
AND (
  name LIKE '%Treant%' OR 
  name LIKE '%Spider%' OR 
  name LIKE '%Wraith%' OR
  name LIKE '%Sprite%' OR
  name LIKE '%Dryad%' OR
  name LIKE '%Unicorn%' OR
  name LIKE '%Treeant%'
);

-- Adamantite Ore (ID 19) - rare, for high-level blacksmithing/fletching
-- Drop from high-level mobs (25+) that could have ore
INSERT INTO mob_crafting_loot (mob_id, material_id, drop_chance, min_quantity, max_quantity)
SELECT id, 19, 0.15, 1, 2
FROM mobs 
WHERE level >= 25
AND (
  name LIKE '%Golem%' OR
  name LIKE '%Elemental%' OR
  name LIKE '%Titan%' OR
  name LIKE '%Guardian%' OR
  name LIKE '%Colossus%' OR
  name LIKE '%Dragon%' OR
  name LIKE '%Drake%' OR
  name LIKE '%Wyrm%'
);

-- Ethereal Silk (ID 20) - rare, for high-level tailoring
-- Drop from magical/ethereal creatures level 25+
INSERT INTO mob_crafting_loot (mob_id, material_id, drop_chance, min_quantity, max_quantity)
SELECT id, 20, 0.15, 1, 2
FROM mobs 
WHERE level >= 25
AND (
  name LIKE '%Sprite%' OR
  name LIKE '%Seraph%' OR
  name LIKE '%Angel%' OR
  name LIKE '%Avatar%' OR
  name LIKE '%Celestial%' OR
  name LIKE '%Astral%' OR
  name LIKE '%Reality%' OR
  name LIKE '%Phase%' OR
  name LIKE '%Void%' OR
  name LIKE '%Dimension%' OR
  name LIKE '%Planar%'
);

-- Reinforced Leather (ID 48) - rare, for Advanced leather recipes
-- Drop from tough beast-type mobs level 25+
INSERT INTO mob_crafting_loot (mob_id, material_id, drop_chance, min_quantity, max_quantity)
SELECT id, 48, 0.15, 1, 2
FROM mobs 
WHERE level >= 25
AND (
  name LIKE '%Dragon%' OR
  name LIKE '%Wyvern%' OR
  name LIKE '%Behemoth%' OR
  name LIKE '%Mammoth%' OR
  name LIKE '%Kraken%' OR
  name LIKE '%Leviathan%' OR
  name LIKE '%Serpent%' OR
  name LIKE '%Beast%' OR
  name LIKE '%Horror%'
);
