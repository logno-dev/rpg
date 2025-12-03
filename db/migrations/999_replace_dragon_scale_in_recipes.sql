-- Replace Dragon Scale in Regular Recipes
-- Dragon Scale should only be used as a special gate material, not a required base material
-- We'll create a new rare leather material for Advanced leatherworking recipes

BEGIN TRANSACTION;

-- ================================================================================
-- STEP 1: Create new rare leather material
-- ================================================================================

INSERT INTO crafting_materials (id, name, description, rarity)
VALUES (48, 'Reinforced Leather', 'Exceptionally tough leather from powerful beasts, suitable for advanced armor', 'rare');

-- ================================================================================
-- STEP 2: Replace Dragon Scale with Reinforced Leather in Advanced leather recipes
-- ================================================================================

UPDATE recipe_group_materials
SET material_id = 48
WHERE material_id = 18
  AND recipe_group_id IN (
    SELECT id FROM recipe_groups 
    WHERE name IN ('Advanced Leather Chest', 'Advanced Leather Feet', 'Advanced Leather Hands', 'Advanced Leather Head')
  );

-- ================================================================================
-- STEP 3: Replace Dragon Scale with Ancient Wood in Advanced Quiver
-- ================================================================================
-- Quivers are fletching (wood-based), so Ancient Wood makes more sense than Dragon Scale

UPDATE recipe_group_materials
SET material_id = 15  -- Ancient Wood (uncommon)
WHERE material_id = 18
  AND recipe_group_id IN (
    SELECT id FROM recipe_groups 
    WHERE name = 'Advanced Quiver'
  );

COMMIT;

-- ================================================================================
-- VERIFICATION
-- ================================================================================

SELECT 'Reinforced Leather added to crafting_materials' as '';
SELECT id, name, rarity FROM crafting_materials WHERE id = 48;

SELECT '' as '';
SELECT 'Advanced Leather recipes now use Reinforced Leather:' as '';
SELECT rg.name, cm.name as material, rgm.quantity
FROM recipe_group_materials rgm
JOIN recipe_groups rg ON rgm.recipe_group_id = rg.id
JOIN crafting_materials cm ON rgm.material_id = cm.id
WHERE rg.name LIKE 'Advanced Leather%'
ORDER BY rg.name;

SELECT '' as '';
SELECT 'Dragon Scale is now only used as gate material in:' as '';
SELECT rg.name, COUNT(*) as gated_items
FROM recipe_outputs ro
JOIN recipe_groups rg ON ro.recipe_group_id = rg.id
WHERE ro.requires_rare_material_id = 18
GROUP BY rg.name;
