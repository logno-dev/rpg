-- Drastically reduce drop rates to prevent loot explosions
-- Target: ~40% chance nothing, ~40% chance 1 item, ~15% chance 2 items, ~5% chance 3+ items

-- EQUIPMENT DROPS - Very rare (2-8%)
UPDATE mob_loot SET drop_chance = 0.05 WHERE mob_id = 2 AND item_id = 2; -- Goblin: Iron Sword 5%
UPDATE mob_loot SET drop_chance = 0.03 WHERE mob_id = 2 AND item_id = 9; -- Goblin: Leather Helmet 3%

UPDATE mob_loot SET drop_chance = 0.05 WHERE mob_id = 3 AND item_id = 7; -- Wolf: Leather Armor 5%
UPDATE mob_loot SET drop_chance = 0.05 WHERE mob_id = 3 AND item_id = 11; -- Wolf: Leather Boots 5%

UPDATE mob_loot SET drop_chance = 0.08 WHERE mob_id = 4 AND item_id = 2; -- Skeleton: Iron Sword 8%
UPDATE mob_loot SET drop_chance = 0.04 WHERE mob_id = 4 AND item_id = 10; -- Skeleton: Iron Helmet 4%

UPDATE mob_loot SET drop_chance = 0.06 WHERE mob_id = 5 AND item_id = 3; -- Orc: Steel Sword 6%
UPDATE mob_loot SET drop_chance = 0.04 WHERE mob_id = 5 AND item_id = 8; -- Orc: Chainmail 4%

UPDATE mob_loot SET drop_chance = 0.02 WHERE mob_id = 6 AND item_id = 7; -- Boar: Leather Armor 2%

-- CONSUMABLES - Moderate (8-15%)
UPDATE mob_loot SET drop_chance = 0.10 WHERE mob_id = 1 AND item_id = 15; -- Rat: Bread 10%

UPDATE mob_loot SET drop_chance = 0.08 WHERE mob_id = 2 AND item_id = 13; -- Goblin: Health Potion 8%

UPDATE mob_loot SET drop_chance = 0.10 WHERE mob_id = 3 AND item_id = 13; -- Wolf: Health Potion 10%

UPDATE mob_loot SET drop_chance = 0.12 WHERE mob_id = 4 AND item_id = 13; -- Skeleton: Health Potion 12%
UPDATE mob_loot SET drop_chance = 0.08 WHERE mob_id = 4 AND item_id = 14; -- Skeleton: Mana Potion 8%

UPDATE mob_loot SET drop_chance = 0.15 WHERE mob_id = 5 AND item_id = 13; -- Orc: Health Potion 15%
UPDATE mob_loot SET drop_chance = 0.10 WHERE mob_id = 5 AND item_id = 14; -- Orc: Mana Potion 10%

UPDATE mob_loot SET drop_chance = 0.15 WHERE mob_id = 6 AND item_id = 15; -- Boar: Bread 15%

UPDATE mob_loot SET drop_chance = 0.10 WHERE mob_id = 7 AND item_id = 14; -- Spider: Mana Potion 10%

-- SCROLLS - Rare but valuable (5-10%)
UPDATE mob_loot SET drop_chance = 0.08 WHERE mob_id = 1 AND item_id = 16; -- Rat: Kick I 8%

UPDATE mob_loot SET drop_chance = 0.10 WHERE mob_id = 2 AND item_id = 16; -- Goblin: Kick I 10%
UPDATE mob_loot SET drop_chance = 0.08 WHERE mob_id = 2 AND item_id = 19; -- Goblin: Dodge I 8%
UPDATE mob_loot SET drop_chance = 0.06 WHERE mob_id = 2 AND item_id = 25; -- Goblin: Fireball I 6%

UPDATE mob_loot SET drop_chance = 0.10 WHERE mob_id = 3 AND item_id = 19; -- Wolf: Dodge I 10%
UPDATE mob_loot SET drop_chance = 0.06 WHERE mob_id = 3 AND item_id = 22; -- Wolf: Taunt I 6%

UPDATE mob_loot SET drop_chance = 0.08 WHERE mob_id = 4 AND item_id = 28; -- Skeleton: Heal I 8%
UPDATE mob_loot SET drop_chance = 0.05 WHERE mob_id = 4 AND item_id = 17; -- Skeleton: Kick II 5%

UPDATE mob_loot SET drop_chance = 0.06 WHERE mob_id = 5 AND item_id = 17; -- Orc: Kick II 6%
UPDATE mob_loot SET drop_chance = 0.05 WHERE mob_id = 5 AND item_id = 20; -- Orc: Dodge II 5%
UPDATE mob_loot SET drop_chance = 0.05 WHERE mob_id = 5 AND item_id = 26; -- Orc: Fireball II 5%

UPDATE mob_loot SET drop_chance = 0.06 WHERE mob_id = 6 AND item_id = 16; -- Boar: Kick I 6%

UPDATE mob_loot SET drop_chance = 0.08 WHERE mob_id = 7 AND item_id = 22; -- Spider: Taunt I 8%
UPDATE mob_loot SET drop_chance = 0.06 WHERE mob_id = 7 AND item_id = 28; -- Spider: Heal I 6%
