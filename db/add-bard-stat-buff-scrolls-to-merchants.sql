-- Add bard stat buff scrolls to merchant inventories across all regions
-- Distribute Tier I-V scrolls based on region level

-- Get merchant IDs by region
-- Region 1 merchants (Tier I scrolls)
INSERT INTO merchant_inventory (merchant_id, item_id, stock, price_multiplier)
SELECT 
    m.id,
    i.id,
    20,
    1.5
FROM merchants m
CROSS JOIN items i
WHERE m.region_id = 1 
  AND i.name IN ('Scroll of Song of Courage I', 'Scroll of Song of Swiftness I');

-- Region 2 merchants (Tier I-II scrolls)
INSERT INTO merchant_inventory (merchant_id, item_id, stock, price_multiplier)
SELECT 
    m.id,
    i.id,
    15,
    1.5
FROM merchants m
CROSS JOIN items i
WHERE m.region_id = 2 
  AND i.name IN (
    'Scroll of Song of Courage I', 'Scroll of Song of Courage II',
    'Scroll of Song of Swiftness I', 'Scroll of Song of Swiftness II',
    'Scroll of Song of Fortitude I', 'Scroll of Song of Fortitude II'
  );

-- Region 3 merchants (Tier II-III scrolls)
INSERT INTO merchant_inventory (merchant_id, item_id, stock, price_multiplier)
SELECT 
    m.id,
    i.id,
    12,
    1.5
FROM merchants m
CROSS JOIN items i
WHERE m.region_id = 3 
  AND i.name IN (
    'Scroll of Song of Courage II', 'Scroll of Song of Courage III',
    'Scroll of Song of Swiftness II', 'Scroll of Song of Swiftness III',
    'Scroll of Song of Fortitude II', 'Scroll of Song of Fortitude III'
  );

-- Region 4 merchants (Tier III-IV scrolls)
INSERT INTO merchant_inventory (merchant_id, item_id, stock, price_multiplier)
SELECT 
    m.id,
    i.id,
    10,
    1.5
FROM merchants m
CROSS JOIN items i
WHERE m.region_id = 4 
  AND i.name IN (
    'Scroll of Song of Courage III', 'Scroll of Song of Courage IV',
    'Scroll of Song of Swiftness III', 'Scroll of Song of Swiftness IV',
    'Scroll of Song of Fortitude III', 'Scroll of Song of Fortitude IV'
  );

-- Region 5 merchants (Tier IV-V scrolls)
INSERT INTO merchant_inventory (merchant_id, item_id, stock, price_multiplier)
SELECT 
    m.id,
    i.id,
    8,
    1.5
FROM merchants m
CROSS JOIN items i
WHERE m.region_id = 5 
  AND i.name IN (
    'Scroll of Song of Courage IV', 'Scroll of Song of Courage V',
    'Scroll of Song of Swiftness IV', 'Scroll of Song of Swiftness V',
    'Scroll of Song of Fortitude IV', 'Scroll of Song of Fortitude V'
  );
