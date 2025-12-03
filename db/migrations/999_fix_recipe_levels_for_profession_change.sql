-- Migration: Fix Recipe Levels After Profession System Change
-- Profession level now equals character level (changed from char_level / 2)
-- This means recipe min_level directly corresponds to character level requirement

-- ================================================================================
-- COMPREHENSIVE FIX STRATEGY:
-- 
-- 1. Simple recipes (1-15): Keep as-is, craft items level 1-15 (mostly acceptable)
-- 2. Moderate recipes (10-30): Shift to (15-30) to match item outputs
-- 3. Advanced recipes (25-50): Shift to (30-50) to match item outputs
-- 4. Dual Wield/2H (10-60): Shift to (20-60) since lowest item is level 21
-- 5. Remove broken potion outputs from Advanced recipes
-- ================================================================================

BEGIN TRANSACTION;

-- ================================================================================
-- STEP 1: Adjust Moderate Tier Recipes (10 -> 15)
-- ================================================================================
-- These recipes craft items around level 15-30
-- Moving min_level from 10 to 15 better aligns with outputs

UPDATE recipe_groups 
SET min_level = 15
WHERE min_level = 10 
  AND max_level = 30
  AND name LIKE 'Moderate%';

-- ================================================================================
-- STEP 2: Adjust Advanced Tier Recipes (25 -> 30)
-- ================================================================================
-- These recipes craft items around level 30-50
-- Moving min_level from 25 to 30 better aligns with outputs

UPDATE recipe_groups 
SET min_level = 30
WHERE min_level = 25 
  AND max_level = 50
  AND name LIKE 'Advanced%';

-- ================================================================================
-- STEP 3: Fix Dual Wield and 2-Handed Weapon Recipes (10 -> 20)
-- ================================================================================
-- These recipes craft items level 21-60
-- Moving min_level from 10 to 20 matches the lowest craftable item (level 21)

UPDATE recipe_groups
SET min_level = 20
WHERE name IN ('Dual Daggers', 'Dual Swords', 'Greatsword', 'Greataxe')
  AND min_level = 10;

-- ================================================================================
-- STEP 4: Update recipe_outputs min_profession_level to match new recipe tiers
-- ================================================================================
-- Recipe outputs have their own min_profession_level that gates when items appear
-- We need to adjust these proportionally

-- Update outputs for Moderate recipes (shift by +5)
UPDATE recipe_outputs
SET min_profession_level = min_profession_level + 5
WHERE recipe_group_id IN (
  SELECT id FROM recipe_groups 
  WHERE min_level = 15 AND max_level = 30 AND name LIKE 'Moderate%'
)
AND min_profession_level < 26; -- Don't exceed max_level

-- Update outputs for Advanced recipes (shift by +5)
UPDATE recipe_outputs
SET min_profession_level = min_profession_level + 5
WHERE recipe_group_id IN (
  SELECT id FROM recipe_groups 
  WHERE min_level = 30 AND max_level = 50 AND name LIKE 'Advanced%'
)
AND min_profession_level < 46; -- Don't exceed max_level

-- Update outputs for Dual Wield/2H recipes (shift by +10)
UPDATE recipe_outputs
SET min_profession_level = min_profession_level + 10
WHERE recipe_group_id IN (
  SELECT id FROM recipe_groups 
  WHERE name IN ('Dual Daggers', 'Dual Swords', 'Greatsword', 'Greataxe')
)
AND min_profession_level < 51; -- Don't exceed max_level

-- ================================================================================
-- STEP 5: Fix Advanced Potion Recipes
-- ================================================================================
-- Advanced potions currently craft level 1 potions (broken!)
-- Remove these broken outputs - they need proper high-level potions added later

DELETE FROM recipe_outputs
WHERE recipe_group_id IN (
  SELECT id FROM recipe_groups 
  WHERE name IN ('Advanced Health Potion', 'Advanced Mana Potion', 'Advanced Rejuvenation Potion')
    AND min_level = 30  -- After our update above
)
AND item_id IN (
  SELECT id FROM items 
  WHERE required_level <= 5  -- Remove low-level potion outputs
);

-- ================================================================================
-- STEP 6: Remove extremely mismatched outputs (items 20+ levels off)
-- ================================================================================
-- Some items are just too far off from their recipe requirements
-- Better to remove them than have broken progression

-- Remove items that are 20+ levels ABOVE the recipe max_level
DELETE FROM recipe_outputs
WHERE recipe_group_id IN (
  SELECT rg.id 
  FROM recipe_groups rg
  WHERE rg.max_level <= 30
)
AND item_id IN (
  SELECT ro.item_id
  FROM recipe_outputs ro
  JOIN items i ON ro.item_id = i.id
  JOIN recipe_groups rg ON ro.recipe_group_id = rg.id
  WHERE i.required_level > rg.max_level + 20
);

-- Remove items that are 15+ levels BELOW the recipe min_level (except potions)
DELETE FROM recipe_outputs
WHERE recipe_group_id IN (
  SELECT rg.id 
  FROM recipe_groups rg
  WHERE rg.name NOT LIKE '%Potion%'
)
AND item_id IN (
  SELECT ro.item_id
  FROM recipe_outputs ro
  JOIN items i ON ro.item_id = i.id
  JOIN recipe_groups rg ON ro.recipe_group_id = rg.id
  WHERE i.required_level < rg.min_level - 15
);

COMMIT;

-- ================================================================================
-- VERIFICATION: Show new recipe tier distribution
-- ================================================================================

SELECT '================================================================================' as '';
SELECT 'UPDATED RECIPE TIER DISTRIBUTION' as '';
SELECT '================================================================================' as '';

SELECT 
  CASE
    WHEN min_level <= 15 THEN 'Simple (1-15)'
    WHEN min_level <= 20 THEN 'Entry (15-20)'
    WHEN min_level <= 30 THEN 'Moderate (20-30)'
    ELSE 'Advanced (30+)'
  END as tier,
  COUNT(*) as recipe_count,
  GROUP_CONCAT(name, ', ') as examples
FROM recipe_groups
GROUP BY tier
ORDER BY 
  CASE tier
    WHEN 'Simple (1-15)' THEN 1
    WHEN 'Entry (15-20)' THEN 2
    WHEN 'Moderate (20-30)' THEN 3
    ELSE 4
  END;

SELECT '' as '';
SELECT 'Key Changes:' as '';
SELECT '- Moderate recipes: 10-30 -> 15-30' as '';
SELECT '- Advanced recipes: 25-50 -> 30-50' as '';
SELECT '- Dual Wield/2H: 10-60 -> 20-60' as '';
SELECT '- Removed extremely mismatched outputs' as '';
SELECT '- Adjusted min_profession_level for all outputs' as '';
