-- Increase scroll drop rates to make them more common
-- Also reduce some equipment drops to balance

-- Remove some low-value equipment drops to make room for scrolls
DELETE FROM mob_loot WHERE mob_id = 1 AND item_id = 1; -- Rat no longer drops rusty sword
DELETE FROM mob_loot WHERE mob_id = 2 AND item_id = 1; -- Goblin no longer drops rusty sword

-- Increase scroll drop rates
UPDATE mob_loot SET drop_chance = 0.25 WHERE mob_id = 1 AND item_id = 16; -- Rat: Kick I 5% -> 25%
UPDATE mob_loot SET drop_chance = 0.30 WHERE mob_id = 2 AND item_id = 16; -- Goblin: Kick I 10% -> 30%
UPDATE mob_loot SET drop_chance = 0.25 WHERE mob_id = 2 AND item_id = 19; -- Goblin: Dodge I 10% -> 25%
UPDATE mob_loot SET drop_chance = 0.20 WHERE mob_id = 2 AND item_id = 25; -- Goblin: Fireball I 8% -> 20%

UPDATE mob_loot SET drop_chance = 0.30 WHERE mob_id = 3 AND item_id = 19; -- Wolf: Dodge I 12% -> 30%
UPDATE mob_loot SET drop_chance = 0.20 WHERE mob_id = 3 AND item_id = 22; -- Wolf: Taunt I 8% -> 20%

UPDATE mob_loot SET drop_chance = 0.25 WHERE mob_id = 4 AND item_id = 28; -- Skeleton: Heal I 10% -> 25%
UPDATE mob_loot SET drop_chance = 0.20 WHERE mob_id = 4 AND item_id = 17; -- Skeleton: Kick II 8% -> 20%

UPDATE mob_loot SET drop_chance = 0.20 WHERE mob_id = 6 AND item_id = 16; -- Boar: Kick I 8% -> 20%

UPDATE mob_loot SET drop_chance = 0.25 WHERE mob_id = 7 AND item_id = 22; -- Spider: Taunt I 10% -> 25%
UPDATE mob_loot SET drop_chance = 0.20 WHERE mob_id = 7 AND item_id = 28; -- Spider: Heal I 8% -> 20%

-- Give all existing characters a starter scroll (Kick I) if they don't have it
-- First, get the item ID for Scroll: Kick I
INSERT INTO character_inventory (character_id, item_id, quantity)
SELECT c.id, 16, 1
FROM characters c
WHERE NOT EXISTS (
  SELECT 1 FROM character_inventory ci 
  WHERE ci.character_id = c.id AND ci.item_id = 16
);
