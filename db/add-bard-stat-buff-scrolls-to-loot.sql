-- Add bard stat buff scrolls to mob loot tables
-- Distribute scrolls across level-appropriate mobs

-- ============================================
-- TIER I SCROLLS (Levels 1-10) - Common
-- ============================================

-- Song of Courage I, Swiftness I (Level 1+)
INSERT INTO mob_loot (mob_id, item_id, drop_chance)
SELECT 
    m.id,
    i.id,
    0.08
FROM mobs m
CROSS JOIN items i
WHERE m.level BETWEEN 1 AND 10
  AND i.name IN ('Scroll of Song of Courage I', 'Scroll of Song of Swiftness I');

-- Song of Fortitude I (Level 3+)
INSERT INTO mob_loot (mob_id, item_id, drop_chance)
SELECT 
    m.id,
    i.id,
    0.08
FROM mobs m
CROSS JOIN items i
WHERE m.level BETWEEN 3 AND 10
  AND i.name = 'Scroll of Song of Fortitude I';

-- ============================================
-- TIER II SCROLLS (Levels 11-20) - Uncommon
-- ============================================

INSERT INTO mob_loot (mob_id, item_id, drop_chance)
SELECT 
    m.id,
    i.id,
    0.05
FROM mobs m
CROSS JOIN items i
WHERE m.level BETWEEN 11 AND 20
  AND i.name IN (
    'Scroll of Song of Courage II',
    'Scroll of Song of Swiftness II'
  );

INSERT INTO mob_loot (mob_id, item_id, drop_chance)
SELECT 
    m.id,
    i.id,
    0.05
FROM mobs m
CROSS JOIN items i
WHERE m.level BETWEEN 13 AND 20
  AND i.name = 'Scroll of Song of Fortitude II';

-- ============================================
-- TIER III SCROLLS (Levels 21-30) - Rare
-- ============================================

INSERT INTO mob_loot (mob_id, item_id, drop_chance)
SELECT 
    m.id,
    i.id,
    0.03
FROM mobs m
CROSS JOIN items i
WHERE m.level BETWEEN 21 AND 30
  AND i.name IN (
    'Scroll of Song of Courage III',
    'Scroll of Song of Swiftness III'
  );

INSERT INTO mob_loot (mob_id, item_id, drop_chance)
SELECT 
    m.id,
    i.id,
    0.03
FROM mobs m
CROSS JOIN items i
WHERE m.level BETWEEN 23 AND 30
  AND i.name = 'Scroll of Song of Fortitude III';

-- ============================================
-- TIER IV SCROLLS (Levels 31-40) - Epic
-- ============================================

INSERT INTO mob_loot (mob_id, item_id, drop_chance)
SELECT 
    m.id,
    i.id,
    0.02
FROM mobs m
CROSS JOIN items i
WHERE m.level BETWEEN 31 AND 40
  AND i.name IN (
    'Scroll of Song of Courage IV',
    'Scroll of Song of Swiftness IV'
  );

INSERT INTO mob_loot (mob_id, item_id, drop_chance)
SELECT 
    m.id,
    i.id,
    0.02
FROM mobs m
CROSS JOIN items i
WHERE m.level BETWEEN 33 AND 40
  AND i.name = 'Scroll of Song of Fortitude IV';

-- ============================================
-- TIER V SCROLLS (Levels 41+) - Legendary
-- ============================================

INSERT INTO mob_loot (mob_id, item_id, drop_chance)
SELECT 
    m.id,
    i.id,
    0.01
FROM mobs m
CROSS JOIN items i
WHERE m.level >= 41
  AND i.name IN (
    'Scroll of Song of Courage V',
    'Scroll of Song of Swiftness V'
  );

INSERT INTO mob_loot (mob_id, item_id, drop_chance)
SELECT 
    m.id,
    i.id,
    0.01
FROM mobs m
CROSS JOIN items i
WHERE m.level >= 43
  AND i.name = 'Scroll of Song of Fortitude V';

-- Add to named mob loot for better drop rates
INSERT INTO named_mob_loot (named_mob_id, item_id, drop_chance)
SELECT 
    nm.id,
    i.id,
    0.15
FROM named_mobs nm
CROSS JOIN items i
WHERE nm.level BETWEEN 1 AND 15
  AND i.name IN ('Scroll of Song of Courage I', 'Scroll of Song of Swiftness I', 'Scroll of Song of Fortitude I');

INSERT INTO named_mob_loot (named_mob_id, item_id, drop_chance)
SELECT 
    nm.id,
    i.id,
    0.12
FROM named_mobs nm
CROSS JOIN items i
WHERE nm.level BETWEEN 11 AND 25
  AND i.name IN ('Scroll of Song of Courage II', 'Scroll of Song of Swiftness II', 'Scroll of Song of Fortitude II');

INSERT INTO named_mob_loot (named_mob_id, item_id, drop_chance)
SELECT 
    nm.id,
    i.id,
    0.10
FROM named_mobs nm
CROSS JOIN items i
WHERE nm.level BETWEEN 21 AND 35
  AND i.name IN ('Scroll of Song of Courage III', 'Scroll of Song of Swiftness III', 'Scroll of Song of Fortitude III');

INSERT INTO named_mob_loot (named_mob_id, item_id, drop_chance)
SELECT 
    nm.id,
    i.id,
    0.08
FROM named_mobs nm
CROSS JOIN items i
WHERE nm.level BETWEEN 31 AND 45
  AND i.name IN ('Scroll of Song of Courage IV', 'Scroll of Song of Swiftness IV', 'Scroll of Song of Fortitude IV');

INSERT INTO named_mob_loot (named_mob_id, item_id, drop_chance)
SELECT 
    nm.id,
    i.id,
    0.05
FROM named_mobs nm
CROSS JOIN items i
WHERE nm.level >= 41
  AND i.name IN ('Scroll of Song of Courage V', 'Scroll of Song of Swiftness V', 'Scroll of Song of Fortitude V');
