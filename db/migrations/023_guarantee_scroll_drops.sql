-- GUARANTEE scroll drops for testing - 80-90% drop chance
-- You should get scrolls almost every kill now!

-- Update all scroll drop rates to 80-90%
-- RAT - Kick I scroll (was 0.45, now 0.85)
UPDATE mob_loot SET drop_chance = 0.85 WHERE mob_id = 1 AND item_id = 16;

-- GOBLIN - Kick I scroll (was 0.45, now 0.85)
UPDATE mob_loot SET drop_chance = 0.85 WHERE mob_id = 2 AND item_id = 16;

-- GOBLIN - Fireball I scroll (was 0.40, now 0.80)
UPDATE mob_loot SET drop_chance = 0.80 WHERE mob_id = 2 AND item_id = 25;

-- WOLF - Dodge I scroll (was 0.45, now 0.85)
UPDATE mob_loot SET drop_chance = 0.85 WHERE mob_id = 3 AND item_id = 19;

-- WOLF - Fireball I scroll (was 0.35, now 0.80)
UPDATE mob_loot SET drop_chance = 0.80 WHERE mob_id = 3 AND item_id = 25;

-- SKELETON - Heal I scroll (was 0.40, now 0.85)
UPDATE mob_loot SET drop_chance = 0.85 WHERE mob_id = 4 AND item_id = 28;

-- SKELETON - Fireball I scroll (was 0.40, now 0.80)
UPDATE mob_loot SET drop_chance = 0.80 WHERE mob_id = 4 AND item_id = 25;

-- SKELETON - Blessing I scroll (was 0.35, now 0.80)
UPDATE mob_loot SET drop_chance = 0.80 WHERE mob_id = 4 AND item_id = 31;

-- ORC - Kick II scroll (was 0.40, now 0.85)
UPDATE mob_loot SET drop_chance = 0.85 WHERE mob_id = 5 AND item_id = 17;

-- ORC - Blessing I scroll (was 0.35, now 0.80)
UPDATE mob_loot SET drop_chance = 0.80 WHERE mob_id = 5 AND item_id = 31;

-- WILD BOAR - Kick I scroll (was 0.45, now 0.85)
UPDATE mob_loot SET drop_chance = 0.85 WHERE mob_id = 6 AND item_id = 16;

-- FOREST SPIDER - Taunt I scroll (was 0.45, now 0.85)
UPDATE mob_loot SET drop_chance = 0.85 WHERE mob_id = 7 AND item_id = 22;

-- CAVE TROLL - All scrolls (were 0.40-0.45, now 0.85-0.90)
UPDATE mob_loot SET drop_chance = 0.90 WHERE mob_id = 8 AND item_id = 18; -- Kick III
UPDATE mob_loot SET drop_chance = 0.85 WHERE mob_id = 8 AND item_id = 27; -- Fireball III
UPDATE mob_loot SET drop_chance = 0.85 WHERE mob_id = 8 AND item_id = 29; -- Heal II

-- Summary: 
-- Scrolls now have 80-90% drop chance!
-- You should get scrolls on almost every single kill
-- This is perfect for testing the abilities system
