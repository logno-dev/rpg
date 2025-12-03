-- Audit Recipe Groups vs Item Levels
-- With the new profession level = character level change

SELECT '================================================================================' as '';
SELECT 'RECIPE GROUPS WITH PROBLEMATIC ITEM LEVELS' as '';
SELECT '================================================================================' as '';
SELECT '' as '';

-- Find recipes where output items don't match recipe level
SELECT 
  rg.name as recipe_name,
  rg.min_level as recipe_level,
  rg.max_level as recipe_max,
  i.name as item_name,
  i.required_level as item_level,
  (i.required_level - rg.min_level) as level_diff,
  CASE 
    WHEN ro.requires_rare_material_id IS NOT NULL THEN cm.name
    ELSE 'BASE'
  END as material_type,
  CASE
    WHEN ABS(i.required_level - rg.min_level) <= 5 THEN 'OK'
    WHEN i.required_level > rg.min_level + 5 THEN 'TOO HIGH'
    WHEN i.required_level < rg.min_level - 5 THEN 'TOO LOW'
  END as status
FROM recipe_groups rg
JOIN recipe_outputs ro ON rg.id = ro.recipe_group_id
JOIN items i ON ro.item_id = i.id
LEFT JOIN crafting_materials cm ON ro.requires_rare_material_id = cm.id
WHERE ABS(i.required_level - rg.min_level) > 5
ORDER BY 
  CASE 
    WHEN ABS(i.required_level - rg.min_level) > 15 THEN 1
    WHEN ABS(i.required_level - rg.min_level) > 10 THEN 2
    ELSE 3
  END,
  ABS(i.required_level - rg.min_level) DESC;

SELECT '' as '';
SELECT '================================================================================' as '';
SELECT 'SUMMARY BY PROBLEM SEVERITY' as '';
SELECT '================================================================================' as '';
SELECT '' as '';

-- Count by severity
SELECT 
  CASE
    WHEN ABS(i.required_level - rg.min_level) > 15 THEN 'CRITICAL (15+ levels off)'
    WHEN ABS(i.required_level - rg.min_level) > 10 THEN 'HIGH (10-15 levels off)'
    WHEN ABS(i.required_level - rg.min_level) > 5 THEN 'MEDIUM (5-10 levels off)'
  END as severity,
  COUNT(*) as count
FROM recipe_groups rg
JOIN recipe_outputs ro ON rg.id = ro.recipe_group_id
JOIN items i ON ro.item_id = i.id
WHERE ABS(i.required_level - rg.min_level) > 5
GROUP BY severity
ORDER BY 
  CASE severity
    WHEN 'CRITICAL (15+ levels off)' THEN 1
    WHEN 'HIGH (10-15 levels off)' THEN 2
    WHEN 'MEDIUM (5-10 levels off)' THEN 3
  END;

SELECT '' as '';
SELECT '================================================================================' as '';
SELECT 'RECIPE TIER DISTRIBUTION' as '';
SELECT '================================================================================' as '';
SELECT '' as '';

SELECT 
  CASE
    WHEN min_level <= 15 THEN 'Simple (1-15)'
    WHEN min_level <= 30 THEN 'Moderate (16-30)'
    ELSE 'Advanced (31+)'
  END as tier,
  COUNT(*) as recipe_count
FROM recipe_groups
GROUP BY tier
ORDER BY 
  CASE tier
    WHEN 'Simple (1-15)' THEN 1
    WHEN 'Moderate (16-30)' THEN 2
    WHEN 'Advanced (31+)' THEN 3
  END;
