-- Create scrolls for bard stat buff songs
-- These teach the Song of Courage, Swiftness, and Fortitude abilities

-- ============================================
-- SONG OF COURAGE SCROLLS (Strength Buffs)
-- ============================================

-- Tier I
INSERT INTO items (name, description, type, rarity, required_level, value, teaches_ability_id)
SELECT 
    'Scroll of Song of Courage I',
    'Teaches the bard song: Song of Courage I. Inspire allies with a rousing melody, increasing Strength by 5 for 30 seconds.',
    'scroll',
    'common',
    1,
    25,
    id
FROM abilities WHERE name = 'Song of Courage I' LIMIT 1;

-- Tier II
INSERT INTO items (name, description, type, rarity, required_level, value, teaches_ability_id)
SELECT 
    'Scroll of Song of Courage II',
    'Teaches the bard song: Song of Courage II. Inspire allies with a powerful melody, increasing Strength by 10 for 45 seconds.',
    'scroll',
    'uncommon',
    11,
    80,
    id
FROM abilities WHERE name = 'Song of Courage II' LIMIT 1;

-- Tier III
INSERT INTO items (name, description, type, rarity, required_level, value, teaches_ability_id)
SELECT 
    'Scroll of Song of Courage III',
    'Teaches the bard song: Song of Courage III. Inspire allies with an epic ballad, increasing Strength by 15 for 60 seconds.',
    'scroll',
    'rare',
    21,
    200,
    id
FROM abilities WHERE name = 'Song of Courage III' LIMIT 1;

-- Tier IV
INSERT INTO items (name, description, type, rarity, required_level, value, teaches_ability_id)
SELECT 
    'Scroll of Song of Courage IV',
    'Teaches the bard song: Song of Courage IV. Inspire allies with a godlike melody, increasing Strength by 20 for 60 seconds.',
    'scroll',
    'epic',
    31,
    500,
    id
FROM abilities WHERE name = 'Song of Courage IV' LIMIT 1;

-- Tier V
INSERT INTO items (name, description, type, rarity, required_level, value, teaches_ability_id)
SELECT 
    'Scroll of Song of Courage V',
    'Teaches the bard song: Song of Courage V. Inspire allies with the ultimate battle anthem, increasing Strength by 25 for 90 seconds.',
    'scroll',
    'legendary',
    41,
    1200,
    id
FROM abilities WHERE name = 'Song of Courage V' LIMIT 1;

-- ============================================
-- SONG OF SWIFTNESS SCROLLS (Dexterity Buffs)
-- ============================================

-- Tier I
INSERT INTO items (name, description, type, rarity, required_level, value, teaches_ability_id)
SELECT 
    'Scroll of Song of Swiftness I',
    'Teaches the bard song: Song of Swiftness I. Play an energetic tune that increases Dexterity by 5 for 30 seconds.',
    'scroll',
    'common',
    1,
    25,
    id
FROM abilities WHERE name = 'Song of Swiftness I' LIMIT 1;

-- Tier II
INSERT INTO items (name, description, type, rarity, required_level, value, teaches_ability_id)
SELECT 
    'Scroll of Song of Swiftness II',
    'Teaches the bard song: Song of Swiftness II. Play a rapid tune that increases Dexterity by 10 for 45 seconds.',
    'scroll',
    'uncommon',
    11,
    80,
    id
FROM abilities WHERE name = 'Song of Swiftness II' LIMIT 1;

-- Tier III
INSERT INTO items (name, description, type, rarity, required_level, value, teaches_ability_id)
SELECT 
    'Scroll of Song of Swiftness III',
    'Teaches the bard song: Song of Swiftness III. Play a masterful tune that increases Dexterity by 15 for 60 seconds.',
    'scroll',
    'rare',
    21,
    200,
    id
FROM abilities WHERE name = 'Song of Swiftness III' LIMIT 1;

-- Tier IV
INSERT INTO items (name, description, type, rarity, required_level, value, teaches_ability_id)
SELECT 
    'Scroll of Song of Swiftness IV',
    'Teaches the bard song: Song of Swiftness IV. Play a perfect tune that increases Dexterity by 20 for 60 seconds.',
    'scroll',
    'epic',
    31,
    500,
    id
FROM abilities WHERE name = 'Song of Swiftness IV' LIMIT 1;

-- Tier V
INSERT INTO items (name, description, type, rarity, required_level, value, teaches_ability_id)
SELECT 
    'Scroll of Song of Swiftness V',
    'Teaches the bard song: Song of Swiftness V. Play the song of legends, increasing Dexterity by 25 for 90 seconds.',
    'scroll',
    'legendary',
    41,
    1200,
    id
FROM abilities WHERE name = 'Song of Swiftness V' LIMIT 1;

-- ============================================
-- SONG OF FORTITUDE SCROLLS (Constitution Buffs)
-- ============================================

-- Tier I
INSERT INTO items (name, description, type, rarity, required_level, value, teaches_ability_id)
SELECT 
    'Scroll of Song of Fortitude I',
    'Teaches the bard song: Song of Fortitude I. Sing a hymn of endurance, increasing Constitution by 5 for 30 seconds.',
    'scroll',
    'common',
    3,
    25,
    id
FROM abilities WHERE name = 'Song of Fortitude I' LIMIT 1;

-- Tier II
INSERT INTO items (name, description, type, rarity, required_level, value, teaches_ability_id)
SELECT 
    'Scroll of Song of Fortitude II',
    'Teaches the bard song: Song of Fortitude II. Sing a strong hymn, increasing Constitution by 10 for 45 seconds.',
    'scroll',
    'uncommon',
    13,
    80,
    id
FROM abilities WHERE name = 'Song of Fortitude II' LIMIT 1;

-- Tier III
INSERT INTO items (name, description, type, rarity, required_level, value, teaches_ability_id)
SELECT 
    'Scroll of Song of Fortitude III',
    'Teaches the bard song: Song of Fortitude III. Sing a legendary hymn, increasing Constitution by 15 for 60 seconds.',
    'scroll',
    'rare',
    23,
    200,
    id
FROM abilities WHERE name = 'Song of Fortitude III' LIMIT 1;

-- Tier IV
INSERT INTO items (name, description, type, rarity, required_level, value, teaches_ability_id)
SELECT 
    'Scroll of Song of Fortitude IV',
    'Teaches the bard song: Song of Fortitude IV. Sing an eternal hymn, increasing Constitution by 20 for 60 seconds.',
    'scroll',
    'epic',
    33,
    500,
    id
FROM abilities WHERE name = 'Song of Fortitude IV' LIMIT 1;

-- Tier V
INSERT INTO items (name, description, type, rarity, required_level, value, teaches_ability_id)
SELECT 
    'Scroll of Song of Fortitude V',
    'Teaches the bard song: Song of Fortitude V. Sing the hymn of immortals, increasing Constitution by 25 for 90 seconds.',
    'scroll',
    'legendary',
    43,
    1200,
    id
FROM abilities WHERE name = 'Song of Fortitude V' LIMIT 1;
