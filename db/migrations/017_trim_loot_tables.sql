-- Remove most items from loot tables to prevent loot explosions
-- Strategy: Each mob should have 2-3 items max in their loot table
-- This makes drops more focused and prevents the "roll 10 items" problem

-- GIANT RAT (mob_id: 1) - Keep only bread and scroll
-- Already minimal: Bread, Kick I scroll

-- GOBLIN (mob_id: 2) - Keep 3 items: 1 equipment, 1 consumable, 1 scroll
DELETE FROM mob_loot WHERE mob_id = 2 AND item_id = 9; -- Remove Leather Helmet
DELETE FROM mob_loot WHERE mob_id = 2 AND item_id = 19; -- Remove Dodge I scroll
DELETE FROM mob_loot WHERE mob_id = 2 AND item_id = 25; -- Remove Fireball I scroll
-- Keeps: Iron Sword, Health Potion, Kick I scroll

-- WOLF (mob_id: 3) - Keep 3 items
DELETE FROM mob_loot WHERE mob_id = 3 AND item_id = 11; -- Remove Leather Boots
DELETE FROM mob_loot WHERE mob_id = 3 AND item_id = 22; -- Remove Taunt I scroll
-- Keeps: Leather Armor, Health Potion, Dodge I scroll

-- SKELETON (mob_id: 4) - Keep 3 items
DELETE FROM mob_loot WHERE mob_id = 4 AND item_id = 10; -- Remove Iron Helmet
DELETE FROM mob_loot WHERE mob_id = 4 AND item_id = 14; -- Remove Mana Potion
DELETE FROM mob_loot WHERE mob_id = 4 AND item_id = 17; -- Remove Kick II scroll
-- Keeps: Iron Sword, Health Potion, Heal I scroll

-- ORC (mob_id: 5) - Keep 3 items
DELETE FROM mob_loot WHERE mob_id = 5 AND item_id = 8; -- Remove Chainmail
DELETE FROM mob_loot WHERE mob_id = 5 AND item_id = 14; -- Remove Mana Potion
DELETE FROM mob_loot WHERE mob_id = 5 AND item_id = 20; -- Remove Dodge II scroll
DELETE FROM mob_loot WHERE mob_id = 5 AND item_id = 26; -- Remove Fireball II scroll
-- Keeps: Steel Sword, Health Potion, Kick II scroll

-- WILD BOAR (mob_id: 6) - Keep 2 items
DELETE FROM mob_loot WHERE mob_id = 6 AND item_id = 7; -- Remove Leather Armor
-- Keeps: Bread, Kick I scroll

-- FOREST SPIDER (mob_id: 7) - Keep 2 items
DELETE FROM mob_loot WHERE mob_id = 7 AND item_id = 28; -- Remove Heal I scroll
-- Keeps: Mana Potion, Taunt I scroll

-- Now increase the drop rates for remaining items since there are fewer total items
UPDATE mob_loot SET drop_chance = 0.25 WHERE mob_id = 1 AND item_id = 15; -- Rat: Bread 25%
UPDATE mob_loot SET drop_chance = 0.15 WHERE mob_id = 1 AND item_id = 16; -- Rat: Kick I 15%

UPDATE mob_loot SET drop_chance = 0.12 WHERE mob_id = 2 AND item_id = 2; -- Goblin: Iron Sword 12%
UPDATE mob_loot SET drop_chance = 0.20 WHERE mob_id = 2 AND item_id = 13; -- Goblin: Health Potion 20%
UPDATE mob_loot SET drop_chance = 0.15 WHERE mob_id = 2 AND item_id = 16; -- Goblin: Kick I 15%

UPDATE mob_loot SET drop_chance = 0.12 WHERE mob_id = 3 AND item_id = 7; -- Wolf: Leather Armor 12%
UPDATE mob_loot SET drop_chance = 0.20 WHERE mob_id = 3 AND item_id = 13; -- Wolf: Health Potion 20%
UPDATE mob_loot SET drop_chance = 0.15 WHERE mob_id = 3 AND item_id = 19; -- Wolf: Dodge I 15%

UPDATE mob_loot SET drop_chance = 0.15 WHERE mob_id = 4 AND item_id = 2; -- Skeleton: Iron Sword 15%
UPDATE mob_loot SET drop_chance = 0.25 WHERE mob_id = 4 AND item_id = 13; -- Skeleton: Health Potion 25%
UPDATE mob_loot SET drop_chance = 0.12 WHERE mob_id = 4 AND item_id = 28; -- Skeleton: Heal I 12%

UPDATE mob_loot SET drop_chance = 0.15 WHERE mob_id = 5 AND item_id = 3; -- Orc: Steel Sword 15%
UPDATE mob_loot SET drop_chance = 0.30 WHERE mob_id = 5 AND item_id = 13; -- Orc: Health Potion 30%
UPDATE mob_loot SET drop_chance = 0.12 WHERE mob_id = 5 AND item_id = 17; -- Orc: Kick II 12%

UPDATE mob_loot SET drop_chance = 0.30 WHERE mob_id = 6 AND item_id = 15; -- Boar: Bread 30%
UPDATE mob_loot SET drop_chance = 0.12 WHERE mob_id = 6 AND item_id = 16; -- Boar: Kick I 12%

UPDATE mob_loot SET drop_chance = 0.20 WHERE mob_id = 7 AND item_id = 14; -- Spider: Mana Potion 20%
UPDATE mob_loot SET drop_chance = 0.15 WHERE mob_id = 7 AND item_id = 22; -- Spider: Taunt I 15%
