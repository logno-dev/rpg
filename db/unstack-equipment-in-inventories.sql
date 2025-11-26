-- Unstack equipment items in character inventories
-- This script will split stacked equipment into individual inventory entries

-- For each stacked equipment item (quantity > 1), we need to:
-- 1. Keep one in the existing inventory slot
-- 2. Create new inventory entries for the remaining quantity

-- Create new inventory entries for stacked equipment (quantity - 1 copies)
-- We'll do this by inserting new rows for each extra item

-- First, let's see what we're dealing with
SELECT 
    ci.id,
    ci.character_id,
    ci.item_id,
    ci.quantity,
    ci.equipped,
    i.name,
    i.type
FROM character_inventory ci
JOIN items i ON ci.item_id = i.id
WHERE i.type IN ('armor', 'weapon') 
  AND ci.quantity > 1
ORDER BY ci.character_id, ci.item_id;

-- Now unstack them
-- For each stacked item, we'll:
-- 1. Set the original stack to quantity = 1
-- 2. Insert (quantity - 1) new inventory entries

-- Insert duplicate entries for the extra items
INSERT INTO character_inventory (character_id, item_id, quantity, equipped)
SELECT 
    ci.character_id,
    ci.item_id,
    1,
    0  -- Extra items are never equipped
FROM character_inventory ci
JOIN items i ON ci.item_id = i.id
-- We need to generate multiple rows, so we'll cross join with a numbers table
-- SQLite doesn't have a built-in generate_series, so we'll use a recursive CTE
CROSS JOIN (
    WITH RECURSIVE numbers(n) AS (
        SELECT 1
        UNION ALL
        SELECT n + 1 FROM numbers WHERE n < 100
    )
    SELECT n FROM numbers
) num
WHERE i.type IN ('armor', 'weapon')
  AND ci.quantity > 1
  AND num.n < ci.quantity;  -- Generate (quantity - 1) copies

-- Now set all the original stacked items to quantity = 1
UPDATE character_inventory
SET quantity = 1
WHERE id IN (
    SELECT ci.id
    FROM character_inventory ci
    JOIN items i ON ci.item_id = i.id
    WHERE i.type IN ('armor', 'weapon')
      AND ci.quantity > 1
);

-- Verify no more stacked equipment
SELECT COUNT(*) as stacked_equipment_count
FROM character_inventory ci
JOIN items i ON ci.item_id = i.id
WHERE i.type IN ('armor', 'weapon') 
  AND ci.quantity > 1;
