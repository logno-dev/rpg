-- Chain Armor Crafting Recipes (Blacksmithing)
-- Uses actual crafting_materials and recipes tables

-- ============================================
-- LEVEL 1-10 RECIPES (Common)
-- ============================================
-- Materials: Copper Ore (id=2) + Rough Leather (id=3)

-- Head pieces
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
VALUES 
('Craft Rusty Chain Coif', 'blacksmithing', 1, 1562, 30, 50),
('Craft Chain Coif', 'blacksmithing', 5, 1563, 35, 75),
('Craft Reinforced Chain Coif', 'blacksmithing', 8, 1564, 40, 100);

-- Chest pieces
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
VALUES 
('Craft Rusty Chainmail', 'blacksmithing', 1, 1565, 45, 75),
('Craft Chainmail Hauberk', 'blacksmithing', 5, 1566, 50, 100),
('Craft Reinforced Chainmail', 'blacksmithing', 8, 1567, 55, 125);

-- Hands pieces
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
VALUES 
('Craft Chain Gloves', 'blacksmithing', 1, 1568, 25, 40),
('Craft Chain Gauntlets', 'blacksmithing', 5, 1569, 30, 65),
('Craft Reinforced Chain Gauntlets', 'blacksmithing', 8, 1570, 35, 90);

-- Feet pieces
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
VALUES 
('Craft Chain Boots', 'blacksmithing', 1, 1571, 25, 40),
('Craft Chain Sabatons', 'blacksmithing', 5, 1572, 30, 65),
('Craft Reinforced Chain Sabatons', 'blacksmithing', 8, 1573, 35, 90);

-- ============================================
-- LEVEL 11-20 RECIPES (Uncommon)
-- ============================================
-- Materials: Iron Ore (id=1) + Cured Leather (id=4)

-- Head pieces
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
VALUES 
('Craft Steel Chain Coif', 'blacksmithing', 11, 1574, 50, 150),
('Craft Linked Chain Helm', 'blacksmithing', 15, 1575, 60, 200),
('Craft Veteran''s Chain Helm', 'blacksmithing', 18, 1576, 70, 250);

-- Chest pieces
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
VALUES 
('Craft Steel Chainmail', 'blacksmithing', 11, 1577, 65, 200),
('Craft Linked Chainmail', 'blacksmithing', 15, 1578, 75, 250),
('Craft Veteran''s Chainmail', 'blacksmithing', 18, 1579, 85, 300);

-- Hands pieces
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
VALUES 
('Craft Steel Chain Gauntlets', 'blacksmithing', 11, 1580, 45, 140),
('Craft Linked Chain Gauntlets', 'blacksmithing', 15, 1581, 55, 180),
('Craft Veteran''s Chain Gauntlets', 'blacksmithing', 18, 1582, 65, 220);

-- Feet pieces
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
VALUES 
('Craft Steel Chain Sabatons', 'blacksmithing', 11, 1583, 45, 140),
('Craft Linked Chain Sabatons', 'blacksmithing', 15, 1584, 55, 180),
('Craft Veteran''s Chain Sabatons', 'blacksmithing', 18, 1585, 65, 220);

-- ============================================
-- LEVEL 21-30 RECIPES (Rare)
-- ============================================
-- Materials: Steel Ingot (id=11) + Cured Leather (id=4) + Minor Gemstone (id=9)

-- Head pieces
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
VALUES 
('Craft Knight''s Chain Helm', 'blacksmithing', 21, 1586, 80, 300),
('Craft Dragonscale Chain Helm', 'blacksmithing', 25, 1587, 90, 350),
('Craft Tempest Chain Helm', 'blacksmithing', 28, 1588, 100, 400);

-- Chest pieces
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
VALUES 
('Craft Knight''s Chainmail', 'blacksmithing', 21, 1589, 95, 350),
('Craft Dragonscale Chainmail', 'blacksmithing', 25, 1590, 105, 400),
('Craft Tempest Chainmail', 'blacksmithing', 28, 1591, 115, 450);

-- Hands pieces
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
VALUES 
('Craft Knight''s Chain Gauntlets', 'blacksmithing', 21, 1592, 75, 280),
('Craft Dragonscale Chain Gauntlets', 'blacksmithing', 25, 1593, 85, 320),
('Craft Tempest Chain Gauntlets', 'blacksmithing', 28, 1594, 95, 360);

-- Feet pieces
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
VALUES 
('Craft Knight''s Chain Sabatons', 'blacksmithing', 21, 1595, 75, 280),
('Craft Dragonscale Chain Sabatons', 'blacksmithing', 25, 1596, 85, 320),
('Craft Tempest Chain Sabatons', 'blacksmithing', 28, 1597, 95, 360);

-- ============================================
-- LEVEL 31-40 RECIPES (Epic)
-- ============================================
-- Materials: Mithril Ore (id=12) + Cured Leather (id=4) + Minor Gemstone (id=9) + Rare Herbs (id=17)

-- Head pieces
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
VALUES 
('Craft Warlord''s Chain Helm', 'blacksmithing', 31, 1598, 110, 500),
('Craft Titanforged Chain Helm', 'blacksmithing', 35, 1599, 120, 600),
('Craft Stormbringer Chain Helm', 'blacksmithing', 38, 1600, 130, 700);

-- Chest pieces
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
VALUES 
('Craft Warlord''s Chainmail', 'blacksmithing', 31, 1601, 125, 550),
('Craft Titanforged Chainmail', 'blacksmithing', 35, 1602, 135, 650),
('Craft Stormbringer Chainmail', 'blacksmithing', 38, 1603, 145, 750);

-- Hands pieces
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
VALUES 
('Craft Warlord''s Chain Gauntlets', 'blacksmithing', 31, 1604, 105, 450),
('Craft Titanforged Chain Gauntlets', 'blacksmithing', 35, 1605, 115, 550),
('Craft Stormbringer Chain Gauntlets', 'blacksmithing', 38, 1606, 125, 650);

-- Feet pieces
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
VALUES 
('Craft Warlord''s Chain Sabatons', 'blacksmithing', 31, 1607, 105, 450),
('Craft Titanforged Chain Sabatons', 'blacksmithing', 35, 1608, 115, 550),
('Craft Stormbringer Chain Sabatons', 'blacksmithing', 38, 1609, 125, 650);

-- ============================================
-- LEVEL 41-50 RECIPES (Epic high-end)
-- ============================================
-- Materials: Adamantite Ore (id=19) + Cured Leather (id=4) + Major Gemstone (id=16) + Rare Herbs (id=17)

-- Head pieces
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
VALUES 
('Craft Dreadnought Chain Helm', 'blacksmithing', 41, 1610, 140, 800),
('Craft Vanguard Chain Helm', 'blacksmithing', 45, 1611, 150, 900),
('Craft Adamant Chain Helm', 'blacksmithing', 48, 1612, 160, 1000);

-- Chest pieces
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
VALUES 
('Craft Dreadnought Chainmail', 'blacksmithing', 41, 1613, 155, 850),
('Craft Vanguard Chainmail', 'blacksmithing', 45, 1614, 165, 950),
('Craft Adamant Chainmail', 'blacksmithing', 48, 1615, 175, 1050);

-- Hands pieces
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
VALUES 
('Craft Dreadnought Chain Gauntlets', 'blacksmithing', 41, 1616, 135, 750),
('Craft Vanguard Chain Gauntlets', 'blacksmithing', 45, 1617, 145, 850),
('Craft Adamant Chain Gauntlets', 'blacksmithing', 48, 1618, 155, 950);

-- Feet pieces
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
VALUES 
('Craft Dreadnought Chain Sabatons', 'blacksmithing', 41, 1619, 135, 750),
('Craft Vanguard Chain Sabatons', 'blacksmithing', 45, 1620, 145, 850),
('Craft Adamant Chain Sabatons', 'blacksmithing', 48, 1621, 155, 950);

-- ============================================
-- LEVEL 51-60 RECIPES (Legendary)
-- ============================================
-- Materials: Adamantite Ore (id=19) + Cured Leather (id=4) + Major Gemstone (id=16) + Dragon Scale (id=18)

-- Head pieces
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
VALUES 
('Craft Mythril Chain Helm', 'blacksmithing', 51, 1622, 170, 1200),
('Craft Godforged Chain Helm', 'blacksmithing', 55, 1623, 180, 1400),
('Craft Eternal Warlord''s Chain Helm', 'blacksmithing', 60, 1624, 190, 1600);

-- Chest pieces
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
VALUES 
('Craft Mythril Chainmail', 'blacksmithing', 51, 1625, 185, 1250),
('Craft Godforged Chainmail', 'blacksmithing', 55, 1626, 195, 1450),
('Craft Eternal Warlord''s Chainmail', 'blacksmithing', 60, 1627, 205, 1650);

-- Hands pieces
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
VALUES 
('Craft Mythril Chain Gauntlets', 'blacksmithing', 51, 1628, 165, 1150),
('Craft Godforged Chain Gauntlets', 'blacksmithing', 55, 1629, 175, 1350),
('Craft Eternal Warlord''s Chain Gauntlets', 'blacksmithing', 60, 1630, 185, 1550);

-- Feet pieces
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
VALUES 
('Craft Mythril Chain Sabatons', 'blacksmithing', 51, 1631, 165, 1150),
('Craft Godforged Chain Sabatons', 'blacksmithing', 55, 1632, 175, 1350),
('Craft Eternal Warlord''s Chain Sabatons', 'blacksmithing', 60, 1633, 185, 1550);

-- ============================================
-- RECIPE MATERIALS
-- ============================================

-- Level 1-10: Copper Ore + Rough Leather
INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, 2, CASE WHEN r.item_id IN (1565, 1566, 1567) THEN 8 ELSE 4 END
FROM recipes r
WHERE r.item_id IN (1562, 1563, 1564, 1565, 1566, 1567, 1568, 1569, 1570, 1571, 1572, 1573);

INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, 3, 2
FROM recipes r
WHERE r.item_id IN (1562, 1563, 1564, 1565, 1566, 1567, 1568, 1569, 1570, 1571, 1572, 1573);

-- Level 11-20: Iron Ore + Cured Leather
INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, 1, CASE WHEN r.item_id IN (1577, 1578, 1579) THEN 10 ELSE 5 END
FROM recipes r
WHERE r.item_id IN (1574, 1575, 1576, 1577, 1578, 1579, 1580, 1581, 1582, 1583, 1584, 1585);

INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, 4, 3
FROM recipes r
WHERE r.item_id IN (1574, 1575, 1576, 1577, 1578, 1579, 1580, 1581, 1582, 1583, 1584, 1585);

-- Level 21-30: Steel Ingot + Cured Leather + Minor Gemstone
INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, 11, CASE WHEN r.item_id IN (1589, 1590, 1591) THEN 12 ELSE 6 END
FROM recipes r
WHERE r.item_id IN (1586, 1587, 1588, 1589, 1590, 1591, 1592, 1593, 1594, 1595, 1596, 1597);

INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, 4, 4
FROM recipes r
WHERE r.item_id IN (1586, 1587, 1588, 1589, 1590, 1591, 1592, 1593, 1594, 1595, 1596, 1597);

INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, 9, 2
FROM recipes r
WHERE r.item_id IN (1586, 1587, 1588, 1589, 1590, 1591, 1592, 1593, 1594, 1595, 1596, 1597);

-- Level 31-40: Mithril Ore + Cured Leather + Minor Gemstone + Rare Herbs
INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, 12, CASE WHEN r.item_id IN (1601, 1602, 1603) THEN 14 ELSE 7 END
FROM recipes r
WHERE r.item_id IN (1598, 1599, 1600, 1601, 1602, 1603, 1604, 1605, 1606, 1607, 1608, 1609);

INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, 4, 6
FROM recipes r
WHERE r.item_id IN (1598, 1599, 1600, 1601, 1602, 1603, 1604, 1605, 1606, 1607, 1608, 1609);

INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, 9, 4
FROM recipes r
WHERE r.item_id IN (1598, 1599, 1600, 1601, 1602, 1603, 1604, 1605, 1606, 1607, 1608, 1609);

INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, 17, 2
FROM recipes r
WHERE r.item_id IN (1598, 1599, 1600, 1601, 1602, 1603, 1604, 1605, 1606, 1607, 1608, 1609);

-- Level 41-50: Adamantite Ore + Cured Leather + Major Gemstone + Rare Herbs
INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, 19, CASE WHEN r.item_id IN (1613, 1614, 1615) THEN 16 ELSE 8 END
FROM recipes r
WHERE r.item_id IN (1610, 1611, 1612, 1613, 1614, 1615, 1616, 1617, 1618, 1619, 1620, 1621);

INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, 4, 6
FROM recipes r
WHERE r.item_id IN (1610, 1611, 1612, 1613, 1614, 1615, 1616, 1617, 1618, 1619, 1620, 1621);

INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, 16, 4
FROM recipes r
WHERE r.item_id IN (1610, 1611, 1612, 1613, 1614, 1615, 1616, 1617, 1618, 1619, 1620, 1621);

INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, 17, 3
FROM recipes r
WHERE r.item_id IN (1610, 1611, 1612, 1613, 1614, 1615, 1616, 1617, 1618, 1619, 1620, 1621);

-- Level 51-60: Adamantite Ore + Cured Leather + Major Gemstone + Dragon Scale
INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, 19, CASE WHEN r.item_id IN (1625, 1626, 1627) THEN 20 ELSE 10 END
FROM recipes r
WHERE r.item_id IN (1622, 1623, 1624, 1625, 1626, 1627, 1628, 1629, 1630, 1631, 1632, 1633);

INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, 4, 8
FROM recipes r
WHERE r.item_id IN (1622, 1623, 1624, 1625, 1626, 1627, 1628, 1629, 1630, 1631, 1632, 1633);

INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, 16, 6
FROM recipes r
WHERE r.item_id IN (1622, 1623, 1624, 1625, 1626, 1627, 1628, 1629, 1630, 1631, 1632, 1633);

INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, 18, 3
FROM recipes r
WHERE r.item_id IN (1622, 1623, 1624, 1625, 1626, 1627, 1628, 1629, 1630, 1631, 1632, 1633);
