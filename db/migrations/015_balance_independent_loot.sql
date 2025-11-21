-- Rebalance loot drops for independent probability system
-- Goal: Average 0-2 items per kill, with nothing being common

-- EQUIPMENT DROPS - Make these rare (5-15%)
UPDATE mob_loot SET drop_chance = 0.10 WHERE mob_id = 2 AND item_id = 2; -- Goblin: Iron Sword 10%
UPDATE mob_loot SET drop_chance = 0.08 WHERE mob_id = 2 AND item_id = 9; -- Goblin: Leather Helmet 8%

UPDATE mob_loot SET drop_chance = 0.10 WHERE mob_id = 3 AND item_id = 7; -- Wolf: Leather Armor 10%
UPDATE mob_loot SET drop_chance = 0.12 WHERE mob_id = 3 AND item_id = 11; -- Wolf: Leather Boots 12%

UPDATE mob_loot SET drop_chance = 0.15 WHERE mob_id = 4 AND item_id = 2; -- Skeleton: Iron Sword 15%
UPDATE mob_loot SET drop_chance = 0.08 WHERE mob_id = 4 AND item_id = 10; -- Skeleton: Iron Helmet 8%

UPDATE mob_loot SET drop_chance = 0.12 WHERE mob_id = 5 AND item_id = 3; -- Orc: Steel Sword 12%
UPDATE mob_loot SET drop_chance = 0.08 WHERE mob_id = 5 AND item_id = 8; -- Orc: Chainmail 8%

UPDATE mob_loot SET drop_chance = 0.05 WHERE mob_id = 6 AND item_id = 7; -- Boar: Leather Armor 5%

-- CONSUMABLES - Common drops (15-30%)
UPDATE mob_loot SET drop_chance = 0.20 WHERE mob_id = 1 AND item_id = 15; -- Rat: Bread 20%

UPDATE mob_loot SET drop_chance = 0.15 WHERE mob_id = 2 AND item_id = 13; -- Goblin: Health Potion 15%

UPDATE mob_loot SET drop_chance = 0.18 WHERE mob_id = 3 AND item_id = 13; -- Wolf: Health Potion 18%

UPDATE mob_loot SET drop_chance = 0.20 WHERE mob_id = 4 AND item_id = 13; -- Skeleton: Health Potion 20%
UPDATE mob_loot SET drop_chance = 0.15 WHERE mob_id = 4 AND item_id = 14; -- Skeleton: Mana Potion 15%

UPDATE mob_loot SET drop_chance = 0.25 WHERE mob_id = 5 AND item_id = 13; -- Orc: Health Potion 25%
UPDATE mob_loot SET drop_chance = 0.20 WHERE mob_id = 5 AND item_id = 14; -- Orc: Mana Potion 20%

UPDATE mob_loot SET drop_chance = 0.30 WHERE mob_id = 6 AND item_id = 15; -- Boar: Bread 30%

UPDATE mob_loot SET drop_chance = 0.20 WHERE mob_id = 7 AND item_id = 14; -- Spider: Mana Potion 20%

-- SCROLLS - Moderate rarity (10-20%)
UPDATE mob_loot SET drop_chance = 0.15 WHERE mob_id = 1 AND item_id = 16; -- Rat: Kick I 15%

UPDATE mob_loot SET drop_chance = 0.18 WHERE mob_id = 2 AND item_id = 16; -- Goblin: Kick I 18%
UPDATE mob_loot SET drop_chance = 0.15 WHERE mob_id = 2 AND item_id = 19; -- Goblin: Dodge I 15%
UPDATE mob_loot SET drop_chance = 0.12 WHERE mob_id = 2 AND item_id = 25; -- Goblin: Fireball I 12%

UPDATE mob_loot SET drop_chance = 0.18 WHERE mob_id = 3 AND item_id = 19; -- Wolf: Dodge I 18%
UPDATE mob_loot SET drop_chance = 0.12 WHERE mob_id = 3 AND item_id = 22; -- Wolf: Taunt I 12%

UPDATE mob_loot SET drop_chance = 0.15 WHERE mob_id = 4 AND item_id = 28; -- Skeleton: Heal I 15%
UPDATE mob_loot SET drop_chance = 0.10 WHERE mob_id = 4 AND item_id = 17; -- Skeleton: Kick II 10%

UPDATE mob_loot SET drop_chance = 0.12 WHERE mob_id = 5 AND item_id = 17; -- Orc: Kick II 12%
UPDATE mob_loot SET drop_chance = 0.10 WHERE mob_id = 5 AND item_id = 20; -- Orc: Dodge II 10%
UPDATE mob_loot SET drop_chance = 0.10 WHERE mob_id = 5 AND item_id = 26; -- Orc: Fireball II 10%

UPDATE mob_loot SET drop_chance = 0.12 WHERE mob_id = 6 AND item_id = 16; -- Boar: Kick I 12%

UPDATE mob_loot SET drop_chance = 0.15 WHERE mob_id = 7 AND item_id = 22; -- Spider: Taunt I 15%
UPDATE mob_loot SET drop_chance = 0.12 WHERE mob_id = 7 AND item_id = 28; -- Spider: Heal I 12%
