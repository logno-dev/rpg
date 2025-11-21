-- Nerf equipment to balance early game

-- Weapons - reduce damage
UPDATE items SET damage_min = 2, damage_max = 5 WHERE name = 'Rusty Sword';
UPDATE items SET damage_min = 5, damage_max = 10 WHERE name = 'Iron Sword';
UPDATE items SET damage_min = 10, damage_max = 18 WHERE name = 'Steel Sword';

-- Armor - reduce armor values and stat bonuses
UPDATE items SET armor = 1, constitution_bonus = 0 WHERE name = 'Cloth Armor';
UPDATE items SET armor = 3, constitution_bonus = 1 WHERE name = 'Leather Armor';
UPDATE items SET armor = 6, constitution_bonus = 2 WHERE name = 'Chainmail';

UPDATE items SET armor = 1, constitution_bonus = 0 WHERE name = 'Leather Helmet';
UPDATE items SET armor = 3, constitution_bonus = 1 WHERE name = 'Iron Helmet';

-- Boots and Gloves - reduce to no bonuses for common tier
UPDATE items SET dexterity_bonus = 0 WHERE name = 'Leather Boots';
UPDATE items SET dexterity_bonus = 0 WHERE name = 'Leather Gloves';
