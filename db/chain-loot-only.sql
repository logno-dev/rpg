-- Chain Armor Loot Tables
-- Add loot drops for chain armor (STR/DEX hybrid gear)

-- Level 1-10 Chain Armor (Common) - 12% drop rate
INSERT OR IGNORE INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT m.id, i.id, 0.12, 1, 1
FROM mobs m, items i
WHERE i.id IN (1562, 1563, 1564, 1565, 1566, 1567, 1568, 1569, 1570, 1571, 1572, 1573)
AND m.level >= 1 AND m.level <= 10;

-- Level 11-20 Chain Armor (Uncommon) - 8% drop rate
INSERT OR IGNORE INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT m.id, i.id, 0.08, 1, 1
FROM mobs m, items i
WHERE i.id IN (1574, 1575, 1576, 1577, 1578, 1579, 1580, 1581, 1582, 1583, 1584, 1585)
AND m.level >= 11 AND m.level <= 20;

-- Level 21-30 Chain Armor (Rare) - 5% drop rate
INSERT OR IGNORE INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT m.id, i.id, 0.05, 1, 1
FROM mobs m, items i
WHERE i.id IN (1586, 1587, 1588, 1589, 1590, 1591, 1592, 1593, 1594, 1595, 1596, 1597)
AND m.level >= 21 AND m.level <= 30;

-- Level 31-40 Chain Armor (Epic) - 3% drop rate
INSERT OR IGNORE INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT m.id, i.id, 0.03, 1, 1
FROM mobs m, items i
WHERE i.id IN (1598, 1599, 1600, 1601, 1602, 1603, 1604, 1605, 1606, 1607, 1608, 1609)
AND m.level >= 31 AND m.level <= 40;

-- Level 41-50 Chain Armor (Epic high-end) - 2.5% drop rate
INSERT OR IGNORE INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT m.id, i.id, 0.025, 1, 1
FROM mobs m, items i
WHERE i.id IN (1610, 1611, 1612, 1613, 1614, 1615, 1616, 1617, 1618, 1619, 1620, 1621)
AND m.level >= 41 AND m.level <= 50;

-- Level 51-60 Chain Armor (Legendary) - 1.5% drop rate
INSERT OR IGNORE INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT m.id, i.id, 0.015, 1, 1
FROM mobs m, items i
WHERE i.id IN (1622, 1623, 1624, 1625, 1626, 1627, 1628, 1629, 1630, 1631, 1632, 1633)
AND m.level >= 51 AND m.level <= 60;
