-- Fix Recipe Output Unlock Levels
-- Problem: min_profession_level is equal or HIGHER than item required_level
-- Solution: Set min_profession_level to be 2-5 levels BELOW item required_level
-- This allows crafters to make gear slightly ahead of their character level

-- ================================================================================
-- PHILOSOPHY:
-- A level 25 crafter should be able to craft level 27-30 items
-- This rewards crafters by letting them prepare gear for upcoming levels
-- ================================================================================

BEGIN TRANSACTION;

-- ================================================================================
-- Update all recipe outputs to unlock 3 levels before the item can be equipped
-- ================================================================================

UPDATE recipe_outputs
SET min_profession_level = (
  SELECT MAX(
    rg.min_level,  -- Can't go below recipe min_level
    i.required_level - 3  -- Ideally 3 levels before item level
  )
  FROM items i
  JOIN recipe_groups rg ON recipe_outputs.recipe_group_id = rg.id
  WHERE i.id = recipe_outputs.item_id
)
WHERE EXISTS (
  SELECT 1 FROM items i WHERE i.id = recipe_outputs.item_id
);

-- ================================================================================
-- Special case: Very low level items (1-5) should unlock immediately
-- ================================================================================

UPDATE recipe_outputs
SET min_profession_level = (
  SELECT rg.min_level
  FROM recipe_groups rg
  WHERE rg.id = recipe_outputs.recipe_group_id
)
WHERE item_id IN (
  SELECT id FROM items WHERE required_level <= 5
);

COMMIT;

-- ================================================================================
-- VERIFICATION: Show examples of the new unlock pattern
-- ================================================================================

SELECT 'Advanced Sword Example (Level 30-50 recipe):' as '';
SELECT 
  i.name as item_name,
  i.required_level as item_level,
  ro.min_profession_level as unlocks_at,
  (i.required_level - ro.min_profession_level) as levels_ahead
FROM recipe_outputs ro
JOIN items i ON ro.item_id = i.id
JOIN recipe_groups rg ON ro.recipe_group_id = rg.id
WHERE rg.name = 'Advanced Sword'
ORDER BY ro.min_profession_level
LIMIT 8;

SELECT '' as '';
SELECT 'Dual Daggers Example (Level 20-60 recipe):' as '';
SELECT 
  i.name as item_name,
  i.required_level as item_level,
  ro.min_profession_level as unlocks_at,
  (i.required_level - ro.min_profession_level) as levels_ahead
FROM recipe_outputs ro
JOIN items i ON ro.item_id = i.id
JOIN recipe_groups rg ON ro.recipe_group_id = rg.id
WHERE rg.name = 'Dual Daggers'
ORDER BY ro.min_profession_level
LIMIT 8;

SELECT '' as '';
SELECT 'Expected Pattern: levels_ahead should be positive (craft items 2-5 levels above you)' as '';
