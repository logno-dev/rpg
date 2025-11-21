-- Add spell scrolls to early-game mobs so players can test magic abilities sooner
-- Fireball I (item_id: 25) and Blessing I (item_id: 31)

-- GOBLIN - Add Fireball I scroll (40% chance)
INSERT OR IGNORE INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max) VALUES
(2, 25, 0.40, 1, 1);

-- SKELETON - Add Fireball I scroll (40% chance) and Blessing I (35% chance)
INSERT OR IGNORE INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max) VALUES
(4, 25, 0.40, 1, 1),
(4, 31, 0.35, 1, 1);

-- ORC - Add Blessing I scroll (35% chance)
INSERT OR IGNORE INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max) VALUES
(5, 31, 0.35, 1, 1);

-- WOLF - Add Fireball I scroll (35% chance)
INSERT OR IGNORE INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max) VALUES
(3, 25, 0.35, 1, 1);

-- Summary: 
-- - Early mobs now drop Fireball I and Blessing I scrolls
-- - Players can test both physical abilities and spells early in the game
-- - All scrolls have 35-45% drop rate for good testing/gameplay
