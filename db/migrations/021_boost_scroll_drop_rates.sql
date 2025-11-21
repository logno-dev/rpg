-- Increase scroll drop rates to make abilities more accessible for testing and gameplay
-- Scrolls are now 40-50% drop chance instead of 10-15%

-- Update all scroll drop rates
-- RAT - Kick I scroll (was 0.15, now 0.45)
UPDATE mob_loot SET drop_chance = 0.45 WHERE mob_id = 1 AND item_id = 16;

-- GOBLIN - Kick I scroll (was 0.15, now 0.45)
UPDATE mob_loot SET drop_chance = 0.45 WHERE mob_id = 2 AND item_id = 16;

-- WOLF - Dodge I scroll (was 0.15, now 0.45)
UPDATE mob_loot SET drop_chance = 0.45 WHERE mob_id = 3 AND item_id = 19;

-- SKELETON - Heal I scroll (was 0.12, now 0.40)
UPDATE mob_loot SET drop_chance = 0.40 WHERE mob_id = 4 AND item_id = 28;

-- ORC - Kick II scroll (was 0.12, now 0.40)
UPDATE mob_loot SET drop_chance = 0.40 WHERE mob_id = 5 AND item_id = 17;

-- WILD BOAR - Kick I scroll (was 0.12, now 0.45)
UPDATE mob_loot SET drop_chance = 0.45 WHERE mob_id = 6 AND item_id = 16;

-- FOREST SPIDER - Taunt I scroll (was 0.15, now 0.45)
UPDATE mob_loot SET drop_chance = 0.45 WHERE mob_id = 7 AND item_id = 22;

-- CAVE TROLL - All scrolls (were 0.10-0.15, now 0.40-0.45)
UPDATE mob_loot SET drop_chance = 0.45 WHERE mob_id = 8 AND item_id = 18; -- Kick III
UPDATE mob_loot SET drop_chance = 0.40 WHERE mob_id = 8 AND item_id = 27; -- Fireball III
UPDATE mob_loot SET drop_chance = 0.40 WHERE mob_id = 8 AND item_id = 29; -- Heal II

-- Summary: Scrolls now have 40-45% drop chance (was 10-15%)
-- Players should get roughly 1 scroll every 2-3 kills
