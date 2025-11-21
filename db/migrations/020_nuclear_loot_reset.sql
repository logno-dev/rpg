-- NUCLEAR RESET: Clear and rebuild mob_loot table with UNIQUE constraint
-- This prevents duplicate entries forever

-- Delete all existing data
DELETE FROM mob_loot;

-- Add unique constraint (if it doesn't exist already, this will error but that's ok)
CREATE UNIQUE INDEX IF NOT EXISTS idx_mob_loot_unique ON mob_loot(mob_id, item_id);

-- Insert FINAL, CLEAN loot tables
-- RAT (mob_id: 1)
INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max) VALUES
(1, 15, 0.25, 1, 2), -- Bread
(1, 16, 0.15, 1, 1); -- Kick I scroll

-- GOBLIN (mob_id: 2)  
INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max) VALUES
(2, 2, 0.12, 1, 1),  -- Iron Sword
(2, 13, 0.20, 1, 1), -- Health Potion
(2, 16, 0.15, 1, 1); -- Kick I scroll

-- WOLF (mob_id: 3)
INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max) VALUES
(3, 7, 0.12, 1, 1),  -- Leather Armor
(3, 13, 0.20, 1, 1), -- Health Potion
(3, 19, 0.15, 1, 1); -- Dodge I scroll

-- SKELETON (mob_id: 4)
INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max) VALUES
(4, 2, 0.15, 1, 1),  -- Iron Sword
(4, 13, 0.25, 1, 1), -- Health Potion
(4, 28, 0.12, 1, 1); -- Heal I scroll

-- ORC (mob_id: 5)
INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max) VALUES
(5, 3, 0.15, 1, 1),  -- Steel Sword
(5, 13, 0.30, 1, 1), -- Health Potion
(5, 17, 0.12, 1, 1); -- Kick II scroll

-- WILD BOAR (mob_id: 6)
INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max) VALUES
(6, 15, 0.30, 1, 2), -- Bread
(6, 16, 0.12, 1, 1); -- Kick I scroll

-- FOREST SPIDER (mob_id: 7)
INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max) VALUES
(7, 14, 0.20, 1, 1), -- Mana Potion
(7, 22, 0.15, 1, 1); -- Taunt I scroll

-- CAVE TROLL (mob_id: 8)
INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max) VALUES
(8, 18, 0.15, 1, 1), -- Kick III scroll
(8, 27, 0.12, 1, 1), -- Fireball III scroll
(8, 29, 0.10, 1, 1); -- Heal II scroll
