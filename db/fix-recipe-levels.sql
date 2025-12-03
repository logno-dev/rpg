-- Fix Recipe Group Levels to Match New Profession System
-- Profession level now equals character level (changed from char_level / 2)
-- This means recipe min_level directly corresponds to character level requirement

-- ================================================================================
-- STRATEGY:
-- 1. Keep Simple recipes as is (1-15): They craft level 1-15 items (acceptable)
-- 2. Adjust Moderate recipes (currently 10-30) to (15-30): Better alignment
-- 3. Adjust Advanced recipes (currently 25-50) to (30-50): Better alignment  
-- 4. Fix dual wield/2H weapons which have massive range (10-60)
-- ================================================================================

BEGIN TRANSACTION;

-- Fix Moderate tier: Change min_level from 10 to 15
UPDATE recipe_groups 
SET min_level = 15
WHERE min_level = 10 
  AND max_level = 30
  AND name LIKE 'Moderate%';

-- Fix Advanced tier: Change min_level from 25 to 30
UPDATE recipe_groups 
SET min_level = 30
WHERE min_level = 25 
  AND max_level = 50
  AND name LIKE 'Advanced%';

-- Fix Dual Wield / 2H Weapons - these currently span 10-60 which is too broad
-- Split them into proper tiers

-- Simple tier dual wield/2H (level 1-15)
UPDATE recipe_groups
SET min_level = 1, max_level = 15
WHERE name IN ('Dual Daggers', 'Dual Swords', 'Greatsword', 'Greataxe')
  AND min_level = 10
  AND max_level = 60;

-- Now we need to update the recipe_outputs for these to only show appropriate items
-- Remove high-level items from Simple dual wield/2H recipes
DELETE FROM recipe_outputs
WHERE recipe_group_id IN (
  SELECT id FROM recipe_groups 
  WHERE name IN ('Dual Daggers', 'Dual Swords', 'Greatsword', 'Greataxe')
    AND min_level = 1
    AND max_level = 15
)
AND item_id IN (
  SELECT id FROM items WHERE required_level > 20
);

-- ================================================================================
-- POTIONS: Fix Advanced Potions (they craft level 1 items!)
-- ================================================================================

-- Advanced potions should craft higher-level potions
-- First, let's check if there ARE higher level potions in the items table
-- If not, we need to create them OR adjust the recipe to craft appropriate items

-- For now, remove the broken potion outputs from Advanced recipes
DELETE FROM recipe_outputs
WHERE recipe_group_id IN (
  SELECT id FROM recipe_groups 
  WHERE name IN ('Advanced Health Potion', 'Advanced Mana Potion', 'Advanced Rejuvenation Potion')
)
AND item_id IN (
  SELECT id FROM items 
  WHERE name IN ('Superior Health Potion', 'Supreme Health Potion', 'Superior Mana Potion', 'Supreme Mana Potion', 'Greater Rejuvenation Potion')
    AND required_level = 1
);

COMMIT;

-- ================================================================================
-- VERIFICATION QUERY
-- ================================================================================
SELECT 'Updated Recipe Tiers:' as '';
SELECT 
  CASE
    WHEN min_level <= 15 THEN 'Simple (1-15)'
    WHEN min_level <= 30 THEN 'Moderate (15-30)'
    ELSE 'Advanced (30+)'
  END as tier,
  COUNT(*) as count
FROM recipe_groups
GROUP BY tier
ORDER BY 
  CASE tier
    WHEN 'Simple (1-15)' THEN 1
    WHEN 'Moderate (15-30)' THEN 2
    ELSE 3
  END;
