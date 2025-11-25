-- Add tier 4-6 scrolls to more mobs
-- These are advanced spells, so add to higher level mobs

-- Tier IV scrolls (level 4 abilities) - add to level 25+ mobs
INSERT OR IGNORE INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT m.id, i.id, 0.015, 1, 1
FROM mobs m, items i
JOIN abilities a ON i.teaches_ability_id = a.id
WHERE i.type = 'scroll'
AND a.level = 4
AND a.base_id IS NOT NULL
AND m.level >= 25
AND m.id % 2 = 0;

-- Tier V scrolls (level 5 abilities) - add to level 35+ mobs
INSERT OR IGNORE INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT m.id, i.id, 0.012, 1, 1
FROM mobs m, items i
JOIN abilities a ON i.teaches_ability_id = a.id
WHERE i.type = 'scroll'
AND a.level = 5
AND a.base_id IS NOT NULL
AND m.level >= 35
AND m.id % 2 = 1;

-- Tier VI scrolls (level 6 abilities) - add to level 45+ mobs
INSERT OR IGNORE INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT m.id, i.id, 0.01, 1, 1
FROM mobs m, items i
JOIN abilities a ON i.teaches_ability_id = a.id
WHERE i.type = 'scroll'
AND a.level = 6
AND a.base_id IS NOT NULL
AND m.level >= 45;

