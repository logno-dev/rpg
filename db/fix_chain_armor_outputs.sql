-- Fix for missing chain armor recipe outputs
-- Issue: Chain armor head/hands/feet recipe groups have no outputs

-- ===========================
-- SIMPLE CHAIN (Levels 1-9)
-- ===========================

-- Simple Chain Head (Recipe Group 34)
INSERT INTO recipe_outputs (recipe_group_id, item_id, min_profession_level, base_weight, weight_per_level, quality_bonus_weight)
SELECT 34, id, 1, 200, 10, 30 FROM items WHERE id IN (1574, 1575) -- Basic helms
UNION ALL
SELECT 34, id, 5, 100, 12, 60 FROM items WHERE id = 1823 -- Better helm
UNION ALL
SELECT 34, id, 8, 50, 15, 90 FROM items WHERE id IN (1576, 1827); -- Best helms

-- Simple Chain Hands (Recipe Group 35)
INSERT INTO recipe_outputs (recipe_group_id, item_id, min_profession_level, base_weight, weight_per_level, quality_bonus_weight)
SELECT 35, id, 1, 200, 10, 30 FROM items WHERE id IN (1568, 1569) -- Basic gloves
UNION ALL
SELECT 35, id, 5, 100, 12, 60 FROM items WHERE id = 1817 -- Better gloves
UNION ALL
SELECT 35, id, 8, 50, 15, 90 FROM items WHERE id IN (1570, 1821); -- Best gloves

-- Simple Chain Feet (Recipe Group 36)
INSERT INTO recipe_outputs (recipe_group_id, item_id, min_profession_level, base_weight, weight_per_level, quality_bonus_weight)
SELECT 36, id, 1, 200, 10, 30 FROM items WHERE id IN (1571, 1572) -- Basic boots
UNION ALL
SELECT 36, id, 5, 100, 12, 60 FROM items WHERE id = 1811 -- Better boots
UNION ALL
SELECT 36, id, 8, 50, 15, 90 FROM items WHERE id IN (1573, 1815); -- Best boots

-- ===========================
-- MODERATE CHAIN (Levels 10-24)
-- ===========================

-- Moderate Chain Head (Recipe Group 40)
INSERT INTO recipe_outputs (recipe_group_id, item_id, min_profession_level, base_weight, weight_per_level, quality_bonus_weight)
SELECT 40, id, 10, 150, 10, 60 FROM items WHERE id = 1827 -- Level 11
UNION ALL
SELECT 40, id, 12, 100, 12, 80 FROM items WHERE id = 1675 -- Level 11
UNION ALL
SELECT 40, id, 15, 100, 12, 80 FROM items WHERE id IN (814, 1828) -- Levels 15, 18
UNION ALL
SELECT 40, id, 18, 80, 14, 100 FROM items WHERE id = 1683 -- Level 18
UNION ALL
SELECT 40, id, 21, 60, 16, 120 FROM items WHERE id IN (822, 1829); -- Levels 21, 24

-- Moderate Chain Hands (Recipe Group 41)
INSERT INTO recipe_outputs (recipe_group_id, item_id, min_profession_level, base_weight, weight_per_level, quality_bonus_weight)
SELECT 41, id, 10, 150, 10, 60 FROM items WHERE id = 1821 -- Level 11
UNION ALL
SELECT 41, id, 12, 100, 12, 80 FROM items WHERE id = 1669 -- Level 11
UNION ALL
SELECT 41, id, 15, 100, 12, 80 FROM items WHERE id IN (808, 1822) -- Levels 15, 18
UNION ALL
SELECT 41, id, 18, 80, 14, 100 FROM items WHERE id = 1677 -- Level 18
UNION ALL
SELECT 41, id, 21, 60, 16, 120 FROM items WHERE id IN (816, 1823); -- Levels 21, 24

-- Moderate Chain Feet (Recipe Group 42)
INSERT INTO recipe_outputs (recipe_group_id, item_id, min_profession_level, base_weight, weight_per_level, quality_bonus_weight)
SELECT 42, id, 10, 150, 10, 60 FROM items WHERE id = 1815 -- Level 11
UNION ALL
SELECT 42, id, 12, 100, 12, 80 FROM items WHERE id = 1663 -- Level 11
UNION ALL
SELECT 42, id, 15, 100, 12, 80 FROM items WHERE id IN (802, 1816) -- Levels 15, 18
UNION ALL
SELECT 42, id, 18, 80, 14, 100 FROM items WHERE id = 1671 -- Level 18
UNION ALL
SELECT 42, id, 21, 60, 16, 120 FROM items WHERE id IN (810, 1817); -- Levels 21, 24

-- ===========================
-- ADVANCED CHAIN (Levels 25-50)
-- ===========================

-- Advanced Chain Head (Recipe Group 46)
INSERT INTO recipe_outputs (recipe_group_id, item_id, min_profession_level, base_weight, weight_per_level, quality_bonus_weight)
SELECT 46, id, 25, 120, 10, 100 FROM items WHERE id IN (826, 1830, 1691) -- Levels 24-27
UNION ALL
SELECT 46, id, 28, 90, 12, 120 FROM items WHERE id IN (830, 1831) -- Levels 27-30
UNION ALL
SELECT 46, id, 31, 70, 14, 140 FROM items WHERE id IN (834, 1841) -- Levels 30-33
UNION ALL
SELECT 46, id, 35, 50, 16, 160 FROM items WHERE id IN (838, 1842, 1843) -- Levels 33-39
UNION ALL
SELECT 46, id, 40, 35, 18, 180 FROM items WHERE id IN (842, 1853) -- Levels 39-45
UNION ALL
SELECT 46, id, 45, 25, 20, 200 FROM items WHERE id IN (846, 850, 1854, 1855); -- Levels 45-51

-- Advanced Chain Hands (Recipe Group 47)
INSERT INTO recipe_outputs (recipe_group_id, item_id, min_profession_level, base_weight, weight_per_level, quality_bonus_weight)
SELECT 47, id, 25, 120, 10, 100 FROM items WHERE id IN (820, 1824, 1685) -- Levels 24-27
UNION ALL
SELECT 47, id, 28, 90, 12, 120 FROM items WHERE id IN (824, 1825) -- Levels 27-30
UNION ALL
SELECT 47, id, 31, 70, 14, 140 FROM items WHERE id IN (828, 1835) -- Levels 30-33
UNION ALL
SELECT 47, id, 35, 50, 16, 160 FROM items WHERE id IN (832, 1836, 1837) -- Levels 33-39
UNION ALL
SELECT 47, id, 40, 35, 18, 180 FROM items WHERE id IN (836, 1847) -- Levels 39-45
UNION ALL
SELECT 47, id, 45, 25, 20, 200 FROM items WHERE id IN (840, 844, 1848, 1849); -- Levels 45-51

-- Advanced Chain Feet (Recipe Group 48)
INSERT INTO recipe_outputs (recipe_group_id, item_id, min_profession_level, base_weight, weight_per_level, quality_bonus_weight)
SELECT 48, id, 25, 120, 10, 100 FROM items WHERE id IN (814, 1818, 1679) -- Levels 24-27
UNION ALL
SELECT 48, id, 28, 90, 12, 120 FROM items WHERE id IN (818, 1819) -- Levels 27-30
UNION ALL
SELECT 48, id, 31, 70, 14, 140 FROM items WHERE id IN (822, 1829) -- Levels 30-33
UNION ALL
SELECT 48, id, 35, 50, 16, 160 FROM items WHERE id IN (826, 1830, 1831) -- Levels 33-39
UNION ALL
SELECT 48, id, 40, 35, 18, 180 FROM items WHERE id IN (830, 1841) -- Levels 39-45
UNION ALL
SELECT 48, id, 45, 25, 20, 200 FROM items WHERE id IN (834, 838, 1842, 1843); -- Levels 45-51
