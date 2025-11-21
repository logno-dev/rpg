-- Fix loot quantities - items should drop 1 at a time
-- The issue: some items drop with quantity_max > 1, causing "5 health potions" drops

-- Set all loot to drop exactly 1 item (not 1-2 or 1-3)
UPDATE mob_loot SET quantity_min = 1, quantity_max = 1;

-- Exception: Bread can drop 1-2 since it's a cheap consumable
UPDATE mob_loot SET quantity_min = 1, quantity_max = 2 WHERE item_id = 15; -- Bread
