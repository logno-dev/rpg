-- Add mob loot for all craftable items  
-- Strategy: Add each item to mobs in appropriate level range

-- Level 1-7 items
INSERT OR IGNORE INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT m.id, i.id, 0.08, 1, 1
FROM mobs m, items i
WHERE i.id IN (1433, 1434, 1435, 1455, 1468, 1482, 1500, 1501, 1502, 1522, 1536, 1549)
AND m.level >= 1 AND m.level <= 7
AND m.id % 3 = 0;

-- Level 8-18 items
INSERT OR IGNORE INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT m.id, i.id, 0.07, 1, 1
FROM mobs m, items i
WHERE i.id IN (1436, 1437, 1438, 1456, 1469, 1470, 1483, 1503, 1504, 1523, 1537, 1550)
AND m.level >= 5 AND m.level <= 18
AND m.id % 3 = 1;

-- Level 15-30 items (rare tier)
INSERT OR IGNORE INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT m.id, i.id, 0.06, 1, 1
FROM mobs m, items i
WHERE i.id IN (1439, 1440, 1441, 1442, 1457, 1471, 1484, 1505, 1506, 1507, 1524, 1538, 1551)
AND m.level >= 15 AND m.level <= 30
AND m.id % 3 = 2;

-- Level 27-42 items (epic tier)
INSERT OR IGNORE INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT m.id, i.id, 0.05, 1, 1
FROM mobs m, items i
WHERE i.id IN (1443, 1444, 1445, 1458, 1459, 1472, 1473, 1485, 1486, 1508, 1509, 1525, 1526, 1539, 1540, 1552, 1553)
AND m.level >= 27 AND m.level <= 42
AND m.id % 2 = 0;

-- Level 40-54 items
INSERT OR IGNORE INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT m.id, i.id, 0.04, 1, 1
FROM mobs m, items i
WHERE i.id IN (1446, 1447, 1448, 1460, 1461, 1474, 1475, 1487, 1488, 1510, 1511, 1527, 1528, 1541, 1542, 1554, 1555)
AND m.level >= 40 AND m.level <= 54
AND m.id % 2 = 1;

-- Level 51-60 items (legendary tier)
INSERT OR IGNORE INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT m.id, i.id, 0.03, 1, 1
FROM mobs m, items i
WHERE i.id IN (1449, 1450, 1451, 1452, 1462, 1463, 1476, 1477, 1489, 1490, 1512, 1513, 1514, 1529, 1530, 1543, 1544, 1556, 1557, 1558)
AND m.level >= 51 AND m.level <= 60;

