-- Add crafting recipes for all craftable equipment
-- Tank items (plate/shields) = blacksmithing
-- DEX items (leather/quivers) = leatherworking

-- Get material IDs first
-- Iron Ore = 1, Rough Leather = 3, Cured Leather = 4, Steel Ingot = 11, Mithril Ore = 12

-- blacksmithing Recipes - Level 1-15 items (Iron Ore)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft ' || name, 'blacksmithing', CAST(required_level / 2 AS INTEGER), id, 45, 100
FROM items
WHERE id IN (1433, 1434, 1435, 1455, 1468, 1482)
AND id NOT IN (SELECT item_id FROM recipes WHERE item_id IS NOT NULL);

-- Add materials for those recipes (Iron Ore)
INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, 1, 4
FROM recipes r
JOIN items i ON r.item_id = i.id
WHERE i.id IN (1433, 1434, 1435, 1455, 1468, 1482);

-- blacksmithing Recipes - Level 8-25 items (Steel Ingot)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft ' || name, 'blacksmithing', CAST(required_level / 2 AS INTEGER), id, 45, 100
FROM items
WHERE id IN (1436, 1437, 1438, 1439, 1440, 1456, 1469, 1470, 1483, 1484)
AND id NOT IN (SELECT item_id FROM recipes WHERE item_id IS NOT NULL);

-- Add materials (Steel Ingot)
INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, 11, 5
FROM recipes r
JOIN items i ON r.item_id = i.id
WHERE i.id IN (1436, 1437, 1438, 1439, 1440, 1456, 1469, 1470, 1483, 1484);

-- blacksmithing Recipes - Level 21+ items (Mithril Ore)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft ' || name, 'blacksmithing', MIN(30, CAST(required_level / 2 AS INTEGER)), id, 45, 100
FROM items
WHERE id IN (1441, 1442, 1443, 1444, 1445, 1446, 1447, 1448, 1449, 1450, 1451, 1452, 
             1457, 1458, 1459, 1460, 1461, 1462, 1463,
             1471, 1472, 1473, 1474, 1475, 1476, 1477,
             1485, 1486, 1487, 1488, 1489, 1490)
AND id NOT IN (SELECT item_id FROM recipes WHERE item_id IS NOT NULL);

-- Add materials (Mithril Ore)
INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, 12, 6
FROM recipes r
JOIN items i ON r.item_id = i.id
WHERE i.id IN (1441, 1442, 1443, 1444, 1445, 1446, 1447, 1448, 1449, 1450, 1451, 1452,
               1457, 1458, 1459, 1460, 1461, 1462, 1463,
               1471, 1472, 1473, 1474, 1475, 1476, 1477,
               1485, 1486, 1487, 1488, 1489, 1490);

-- leatherworking Recipes - Level 1-20 items (Rough Leather)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft ' || name, 'leatherworking', CAST(required_level / 2 AS INTEGER), id, 45, 100
FROM items
WHERE id IN (1500, 1501, 1502, 1503, 1504, 1522, 1523, 1536, 1537, 1549, 1550)
AND id NOT IN (SELECT item_id FROM recipes WHERE item_id IS NOT NULL);

-- Add materials (Rough Leather)
INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, 3, 4
FROM recipes r
JOIN items i ON r.item_id = i.id
WHERE i.id IN (1500, 1501, 1502, 1503, 1504, 1522, 1523, 1536, 1537, 1549, 1550);

-- leatherworking Recipes - Level 21+ items (Cured Leather)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft ' || name, 'leatherworking', MIN(30, CAST(required_level / 2 AS INTEGER)), id, 45, 100
FROM items
WHERE id IN (1505, 1506, 1507, 1508, 1509, 1510, 1511, 1512, 1513, 1514,
             1524, 1525, 1526, 1527, 1528, 1529, 1530,
             1538, 1539, 1540, 1541, 1542, 1543, 1544,
             1551, 1552, 1553, 1554, 1555, 1556, 1557, 1558)
AND id NOT IN (SELECT item_id FROM recipes WHERE item_id IS NOT NULL);

-- Add materials (Cured Leather)
INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, 4, 5
FROM recipes r
JOIN items i ON r.item_id = i.id
WHERE i.id IN (1505, 1506, 1507, 1508, 1509, 1510, 1511, 1512, 1513, 1514,
               1524, 1525, 1526, 1527, 1528, 1529, 1530,
               1538, 1539, 1540, 1541, 1542, 1543, 1544,
               1551, 1552, 1553, 1554, 1555, 1556, 1557, 1558);

