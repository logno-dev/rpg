-- Remove Mismatched Recipe Outputs
-- Remove items from recipes where the item level is significantly below the recipe min_level
-- These create impossible-to-fix unlock issues

BEGIN TRANSACTION;

-- Remove outputs where item required_level is more than 5 levels below recipe min_level
-- Example: Level 1 potions in Level 15 recipes
DELETE FROM recipe_outputs
WHERE id IN (
  SELECT ro.id
  FROM recipe_outputs ro
  JOIN items i ON ro.item_id = i.id
  JOIN recipe_groups rg ON ro.recipe_group_id = rg.id
  WHERE i.required_level < (rg.min_level - 5)
);

COMMIT;

SELECT 'Removed outputs where item level was 5+ levels below recipe requirement' as '';
SELECT 'This prevents level 1 potions appearing in level 15+ recipes' as '';
