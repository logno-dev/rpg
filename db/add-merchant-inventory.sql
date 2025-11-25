-- Add common and uncommon items to merchant inventories
-- Strategy: Add items to merchants in regions that match the item level range

-- Merchant 1: Bran the Merchant (Greenfield Plains, levels 1-4)
-- Add level 1-3 items
INSERT OR IGNORE INTO merchant_inventory (merchant_id, item_id, stock, price_multiplier)
SELECT 1, id, -1, 1.0 FROM items WHERE id IN (1433, 1434, 1500, 1501);

-- Merchant 2: Elara Moonwhisper (Darkwood Forest, levels 3-7)
-- Add level 3-5 items
INSERT OR IGNORE INTO merchant_inventory (merchant_id, item_id, stock, price_multiplier)
SELECT 2, id, -1, 1.0 FROM items WHERE id IN (1434, 1435, 1455, 1468, 1482, 1501, 1502, 1522, 1535, 1549);

-- Merchant 3: Thorgrim Ironforge (Ironpeak Mountains, levels 5-11)
-- Add level 5-10 items
INSERT OR IGNORE INTO merchant_inventory (merchant_id, item_id, stock, price_multiplier)
SELECT 3, id, -1, 1.0 FROM items WHERE id IN (1435, 1436, 1437, 1455, 1456, 1468, 1469, 1482, 1483, 
                                                1502, 1503, 1504, 1522, 1523, 1535, 1536, 1549, 1550);

-- Merchant 4: Cassandra the Shadowed (Shadowdeep Dungeon, levels 8-15)
-- Add level 8-10 items (uncommon focus for dungeon merchant)
INSERT OR IGNORE INTO merchant_inventory (merchant_id, item_id, stock, price_multiplier)
SELECT 4, id, -1, 1.1 FROM items WHERE id IN (1436, 1437, 1456, 1469, 1483, 1503, 1504, 1523, 1536, 1550);

-- Merchants 5+ get progressively fewer starter items (they focus on higher tier equipment)
-- Merchant 5: Ignis the Flame Broker (Scorched Badlands, levels 13-18) - just a few uncommon items
INSERT OR IGNORE INTO merchant_inventory (merchant_id, item_id, stock, price_multiplier)
SELECT 5, id, -1, 1.2 FROM items WHERE id IN (1437, 1456, 1469, 1504);

