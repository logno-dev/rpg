-- Chain Armor Loot Tables and Crafting Recipes
-- Add loot drops for chain armor (STR/DEX hybrid gear)

-- ============================================
-- LOOT TABLES
-- ============================================

-- Level 1-10 Chain Armor (Common)
INSERT OR IGNORE INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT m.id, i.id, 0.12, 1, 1
FROM mobs m, items i
WHERE i.id IN (1562, 1563, 1564, 1565, 1566, 1567, 1568, 1569, 1570, 1571, 1572, 1573)
AND m.level >= 1 AND m.level <= 10;

-- Level 11-20 Chain Armor (Uncommon)
INSERT OR IGNORE INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT m.id, i.id, 0.08, 1, 1
FROM mobs m, items i
WHERE i.id IN (1574, 1575, 1576, 1577, 1578, 1579, 1580, 1581, 1582, 1583, 1584, 1585)
AND m.level >= 11 AND m.level <= 20;

-- Level 21-30 Chain Armor (Rare)
INSERT OR IGNORE INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT m.id, i.id, 0.05, 1, 1
FROM mobs m, items i
WHERE i.id IN (1586, 1587, 1588, 1589, 1590, 1591, 1592, 1593, 1594, 1595, 1596, 1597)
AND m.level >= 21 AND m.level <= 30;

-- Level 31-40 Chain Armor (Epic)
INSERT OR IGNORE INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT m.id, i.id, 0.03, 1, 1
FROM mobs m, items i
WHERE i.id IN (1598, 1599, 1600, 1601, 1602, 1603, 1604, 1605, 1606, 1607, 1608, 1609)
AND m.level >= 31 AND m.level <= 40;

-- Level 41-50 Chain Armor (Epic high-end)
INSERT OR IGNORE INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT m.id, i.id, 0.025, 1, 1
FROM mobs m, items i
WHERE i.id IN (1610, 1611, 1612, 1613, 1614, 1615, 1616, 1617, 1618, 1619, 1620, 1621)
AND m.level >= 41 AND m.level <= 50;

-- Level 51-60 Chain Armor (Legendary)
INSERT OR IGNORE INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT m.id, i.id, 0.015, 1, 1
FROM mobs m, items i
WHERE i.id IN (1622, 1623, 1624, 1625, 1626, 1627, 1628, 1629, 1630, 1631, 1632, 1633)
AND m.level >= 51 AND m.level <= 60;

-- ============================================
-- CRAFTING RECIPES (Blacksmithing)
-- ============================================

-- Level 1-10 Chain Armor Recipes (Common)
INSERT OR IGNORE INTO crafting_recipes (name, profession, skill_level, result_item_id) VALUES
('Craft Rusty Chain Coif', 'Blacksmithing', 1, 1562),
('Craft Rusty Chainmail', 'Blacksmithing', 1, 1565),
('Craft Chain Gloves', 'Blacksmithing', 1, 1568),
('Craft Chain Boots', 'Blacksmithing', 1, 1571),
('Craft Chain Coif', 'Blacksmithing', 5, 1563),
('Craft Chainmail Hauberk', 'Blacksmithing', 5, 1566),
('Craft Chain Gauntlets', 'Blacksmithing', 5, 1569),
('Craft Chain Sabatons', 'Blacksmithing', 5, 1572),
('Craft Reinforced Chain Coif', 'Blacksmithing', 8, 1564),
('Craft Reinforced Chainmail', 'Blacksmithing', 8, 1567),
('Craft Reinforced Chain Gauntlets', 'Blacksmithing', 8, 1570),
('Craft Reinforced Chain Sabatons', 'Blacksmithing', 8, 1573);

-- Level 11-20 Chain Armor Recipes (Uncommon)
INSERT OR IGNORE INTO crafting_recipes (name, profession, skill_level, result_item_id) VALUES
('Craft Steel Chain Coif', 'Blacksmithing', 11, 1574),
('Craft Steel Chainmail', 'Blacksmithing', 11, 1577),
('Craft Steel Chain Gauntlets', 'Blacksmithing', 11, 1580),
('Craft Steel Chain Sabatons', 'Blacksmithing', 11, 1583),
('Craft Linked Chain Helm', 'Blacksmithing', 15, 1575),
('Craft Linked Chainmail', 'Blacksmithing', 15, 1578),
('Craft Linked Chain Gauntlets', 'Blacksmithing', 15, 1581),
('Craft Linked Chain Sabatons', 'Blacksmithing', 15, 1584),
('Craft Veteran''s Chain Helm', 'Blacksmithing', 18, 1576),
('Craft Veteran''s Chainmail', 'Blacksmithing', 18, 1579),
('Craft Veteran''s Chain Gauntlets', 'Blacksmithing', 18, 1582),
('Craft Veteran''s Chain Sabatons', 'Blacksmithing', 18, 1585);

-- Level 21-30 Chain Armor Recipes (Rare)
INSERT OR IGNORE INTO crafting_recipes (name, profession, skill_level, result_item_id) VALUES
('Craft Knight''s Chain Helm', 'Blacksmithing', 21, 1586),
('Craft Knight''s Chainmail', 'Blacksmithing', 21, 1589),
('Craft Knight''s Chain Gauntlets', 'Blacksmithing', 21, 1592),
('Craft Knight''s Chain Sabatons', 'Blacksmithing', 21, 1595),
('Craft Dragonscale Chain Helm', 'Blacksmithing', 25, 1587),
('Craft Dragonscale Chainmail', 'Blacksmithing', 25, 1590),
('Craft Dragonscale Chain Gauntlets', 'Blacksmithing', 25, 1593),
('Craft Dragonscale Chain Sabatons', 'Blacksmithing', 25, 1596),
('Craft Tempest Chain Helm', 'Blacksmithing', 28, 1588),
('Craft Tempest Chainmail', 'Blacksmithing', 28, 1591),
('Craft Tempest Chain Gauntlets', 'Blacksmithing', 28, 1594),
('Craft Tempest Chain Sabatons', 'Blacksmithing', 28, 1597);

-- Level 31-40 Chain Armor Recipes (Epic)
INSERT OR IGNORE INTO crafting_recipes (name, profession, skill_level, result_item_id) VALUES
('Craft Warlord''s Chain Helm', 'Blacksmithing', 31, 1598),
('Craft Warlord''s Chainmail', 'Blacksmithing', 31, 1601),
('Craft Warlord''s Chain Gauntlets', 'Blacksmithing', 31, 1604),
('Craft Warlord''s Chain Sabatons', 'Blacksmithing', 31, 1607),
('Craft Titanforged Chain Helm', 'Blacksmithing', 35, 1599),
('Craft Titanforged Chainmail', 'Blacksmithing', 35, 1602),
('Craft Titanforged Chain Gauntlets', 'Blacksmithing', 35, 1605),
('Craft Titanforged Chain Sabatons', 'Blacksmithing', 35, 1608),
('Craft Stormbringer Chain Helm', 'Blacksmithing', 38, 1600),
('Craft Stormbringer Chainmail', 'Blacksmithing', 38, 1603),
('Craft Stormbringer Chain Gauntlets', 'Blacksmithing', 38, 1606),
('Craft Stormbringer Chain Sabatons', 'Blacksmithing', 38, 1609);

-- Level 41-50 Chain Armor Recipes (Epic high-end)
INSERT OR IGNORE INTO crafting_recipes (name, profession, skill_level, result_item_id) VALUES
('Craft Dreadnought Chain Helm', 'Blacksmithing', 41, 1610),
('Craft Dreadnought Chainmail', 'Blacksmithing', 41, 1613),
('Craft Dreadnought Chain Gauntlets', 'Blacksmithing', 41, 1616),
('Craft Dreadnought Chain Sabatons', 'Blacksmithing', 41, 1619),
('Craft Vanguard Chain Helm', 'Blacksmithing', 45, 1611),
('Craft Vanguard Chainmail', 'Blacksmithing', 45, 1614),
('Craft Vanguard Chain Gauntlets', 'Blacksmithing', 45, 1617),
('Craft Vanguard Chain Sabatons', 'Blacksmithing', 45, 1620),
('Craft Adamant Chain Helm', 'Blacksmithing', 48, 1612),
('Craft Adamant Chainmail', 'Blacksmithing', 48, 1615),
('Craft Adamant Chain Gauntlets', 'Blacksmithing', 48, 1618),
('Craft Adamant Chain Sabatons', 'Blacksmithing', 48, 1621);

-- Level 51-60 Chain Armor Recipes (Legendary)
INSERT OR IGNORE INTO crafting_recipes (name, profession, skill_level, result_item_id) VALUES
('Craft Mythril Chain Helm', 'Blacksmithing', 51, 1622),
('Craft Mythril Chainmail', 'Blacksmithing', 51, 1625),
('Craft Mythril Chain Gauntlets', 'Blacksmithing', 51, 1628),
('Craft Mythril Chain Sabatons', 'Blacksmithing', 51, 1631),
('Craft Godforged Chain Helm', 'Blacksmithing', 55, 1623),
('Craft Godforged Chainmail', 'Blacksmithing', 55, 1626),
('Craft Godforged Chain Gauntlets', 'Blacksmithing', 55, 1629),
('Craft Godforged Chain Sabatons', 'Blacksmithing', 55, 1632),
('Craft Eternal Warlord''s Chain Helm', 'Blacksmithing', 60, 1624),
('Craft Eternal Warlord''s Chainmail', 'Blacksmithing', 60, 1627),
('Craft Eternal Warlord''s Chain Gauntlets', 'Blacksmithing', 60, 1630),
('Craft Eternal Warlord''s Chain Sabatons', 'Blacksmithing', 60, 1633);

-- ============================================
-- RECIPE INGREDIENTS
-- ============================================

-- Get recipe IDs and add ingredients
-- Level 1-10 (Copper Ore + Leather Strips)
INSERT OR IGNORE INTO recipe_ingredients (recipe_id, item_id, quantity)
SELECT r.id, 
  CASE 
    WHEN r.result_item_id IN (1565, 1566, 1567) THEN (SELECT id FROM items WHERE name = 'Copper Ore' LIMIT 1)
    ELSE (SELECT id FROM items WHERE name = 'Copper Ore' LIMIT 1)
  END,
  CASE 
    WHEN r.result_item_id IN (1565, 1566, 1567) THEN 8  -- Chest pieces need more
    ELSE 4  -- Head, hands, feet
  END
FROM crafting_recipes r
WHERE r.result_item_id IN (1562, 1563, 1564, 1565, 1566, 1567, 1568, 1569, 1570, 1571, 1572, 1573);

-- Level 11-20 (Iron Ore + Leather Strips)
INSERT OR IGNORE INTO recipe_ingredients (recipe_id, item_id, quantity)
SELECT r.id, (SELECT id FROM items WHERE name = 'Iron Ore' LIMIT 1),
  CASE 
    WHEN r.result_item_id IN (1577, 1578, 1579) THEN 10
    ELSE 5
  END
FROM crafting_recipes r
WHERE r.result_item_id IN (1574, 1575, 1576, 1577, 1578, 1579, 1580, 1581, 1582, 1583, 1584, 1585);

INSERT OR IGNORE INTO recipe_ingredients (recipe_id, item_id, quantity)
SELECT r.id, (SELECT id FROM items WHERE name = 'Leather Strips' LIMIT 1), 3
FROM crafting_recipes r
WHERE r.result_item_id IN (1574, 1575, 1576, 1577, 1578, 1579, 1580, 1581, 1582, 1583, 1584, 1585);

-- Level 21-30 (Steel Ingot + Leather Strips + Arcane Dust)
INSERT OR IGNORE INTO recipe_ingredients (recipe_id, item_id, quantity)
SELECT r.id, (SELECT id FROM items WHERE name = 'Steel Ingot' LIMIT 1),
  CASE 
    WHEN r.result_item_id IN (1589, 1590, 1591) THEN 12
    ELSE 6
  END
FROM crafting_recipes r
WHERE r.result_item_id IN (1586, 1587, 1588, 1589, 1590, 1591, 1592, 1593, 1594, 1595, 1596, 1597);

INSERT OR IGNORE INTO recipe_ingredients (recipe_id, item_id, quantity)
SELECT r.id, (SELECT id FROM items WHERE name = 'Leather Strips' LIMIT 1), 4
FROM crafting_recipes r
WHERE r.result_item_id IN (1586, 1587, 1588, 1589, 1590, 1591, 1592, 1593, 1594, 1595, 1596, 1597);

INSERT OR IGNORE INTO recipe_ingredients (recipe_id, item_id, quantity)
SELECT r.id, (SELECT id FROM items WHERE name = 'Arcane Dust' LIMIT 1), 2
FROM crafting_recipes r
WHERE r.result_item_id IN (1586, 1587, 1588, 1589, 1590, 1591, 1592, 1593, 1594, 1595, 1596, 1597);

-- Level 31-40 (Mithril Ore + Leather Strips + Arcane Dust + Essence of Power)
INSERT OR IGNORE INTO recipe_ingredients (recipe_id, item_id, quantity)
SELECT r.id, (SELECT id FROM items WHERE name = 'Mithril Ore' LIMIT 1),
  CASE 
    WHEN r.result_item_id IN (1601, 1602, 1603) THEN 14
    ELSE 7
  END
FROM crafting_recipes r
WHERE r.result_item_id IN (1598, 1599, 1600, 1601, 1602, 1603, 1604, 1605, 1606, 1607, 1608, 1609);

INSERT OR IGNORE INTO recipe_ingredients (recipe_id, item_id, quantity)
SELECT r.id, (SELECT id FROM items WHERE name = 'Leather Strips' LIMIT 1), 6
FROM crafting_recipes r
WHERE r.result_item_id IN (1598, 1599, 1600, 1601, 1602, 1603, 1604, 1605, 1606, 1607, 1608, 1609);

INSERT OR IGNORE INTO recipe_ingredients (recipe_id, item_id, quantity)
SELECT r.id, (SELECT id FROM items WHERE name = 'Arcane Dust' LIMIT 1), 4
FROM crafting_recipes r
WHERE r.result_item_id IN (1598, 1599, 1600, 1601, 1602, 1603, 1604, 1605, 1606, 1607, 1608, 1609);

INSERT OR IGNORE INTO recipe_ingredients (recipe_id, item_id, quantity)
SELECT r.id, (SELECT id FROM items WHERE name = 'Essence of Power' LIMIT 1), 2
FROM crafting_recipes r
WHERE r.result_item_id IN (1598, 1599, 1600, 1601, 1602, 1603, 1604, 1605, 1606, 1607, 1608, 1609);

-- Level 41-50 (Thorium Ore + Leather Strips + Arcane Dust + Essence of Power)
INSERT OR IGNORE INTO recipe_ingredients (recipe_id, item_id, quantity)
SELECT r.id, (SELECT id FROM items WHERE name = 'Thorium Ore' LIMIT 1),
  CASE 
    WHEN r.result_item_id IN (1613, 1614, 1615) THEN 16
    ELSE 8
  END
FROM crafting_recipes r
WHERE r.result_item_id IN (1610, 1611, 1612, 1613, 1614, 1615, 1616, 1617, 1618, 1619, 1620, 1621);

INSERT OR IGNORE INTO recipe_ingredients (recipe_id, item_id, quantity)
SELECT r.id, (SELECT id FROM items WHERE name = 'Leather Strips' LIMIT 1), 6
FROM crafting_recipes r
WHERE r.result_item_id IN (1610, 1611, 1612, 1613, 1614, 1615, 1616, 1617, 1618, 1619, 1620, 1621);

INSERT OR IGNORE INTO recipe_ingredients (recipe_id, item_id, quantity)
SELECT r.id, (SELECT id FROM items WHERE name = 'Arcane Dust' LIMIT 1), 4
FROM crafting_recipes r
WHERE r.result_item_id IN (1610, 1611, 1612, 1613, 1614, 1615, 1616, 1617, 1618, 1619, 1620, 1621);

INSERT OR IGNORE INTO recipe_ingredients (recipe_id, item_id, quantity)
SELECT r.id, (SELECT id FROM items WHERE name = 'Essence of Power' LIMIT 1), 2
FROM crafting_recipes r
WHERE r.result_item_id IN (1610, 1611, 1612, 1613, 1614, 1615, 1616, 1617, 1618, 1619, 1620, 1621);

-- Level 51-60 (Adamantite Ore + Leather Strips + Arcane Dust + Essence of Power + Dragon Scale)
INSERT OR IGNORE INTO recipe_ingredients (recipe_id, item_id, quantity)
SELECT r.id, (SELECT id FROM items WHERE name = 'Adamantite Ore' LIMIT 1),
  CASE 
    WHEN r.result_item_id IN (1625, 1626, 1627) THEN 20
    ELSE 10
  END
FROM crafting_recipes r
WHERE r.result_item_id IN (1622, 1623, 1624, 1625, 1626, 1627, 1628, 1629, 1630, 1631, 1632, 1633);

INSERT OR IGNORE INTO recipe_ingredients (recipe_id, item_id, quantity)
SELECT r.id, (SELECT id FROM items WHERE name = 'Leather Strips' LIMIT 1), 8
FROM crafting_recipes r
WHERE r.result_item_id IN (1622, 1623, 1624, 1625, 1626, 1627, 1628, 1629, 1630, 1631, 1632, 1633);

INSERT OR IGNORE INTO recipe_ingredients (recipe_id, item_id, quantity)
SELECT r.id, (SELECT id FROM items WHERE name = 'Arcane Dust' LIMIT 1), 6
FROM crafting_recipes r
WHERE r.result_item_id IN (1622, 1623, 1624, 1625, 1626, 1627, 1628, 1629, 1630, 1631, 1632, 1633);

INSERT OR IGNORE INTO recipe_ingredients (recipe_id, item_id, quantity)
SELECT r.id, (SELECT id FROM items WHERE name = 'Essence of Power' LIMIT 1), 4
FROM crafting_recipes r
WHERE r.result_item_id IN (1622, 1623, 1624, 1625, 1626, 1627, 1628, 1629, 1630, 1631, 1632, 1633);

INSERT OR IGNORE INTO recipe_ingredients (recipe_id, item_id, quantity)
SELECT r.id, (SELECT id FROM items WHERE name = 'Dragon Scale' LIMIT 1), 2
FROM crafting_recipes r
WHERE r.result_item_id IN (1622, 1623, 1624, 1625, 1626, 1627, 1628, 1629, 1630, 1631, 1632, 1633);
