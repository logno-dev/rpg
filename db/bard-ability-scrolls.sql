-- Bard Ability Scrolls
-- Create scrolls that teach bard songs

-- ============================================
-- SCROLL ITEMS (Type: scroll, teaches bard abilities)
-- ============================================

-- Get ability IDs for bard songs
-- We'll create scrolls for key abilities at each tier

-- Tier I Scrolls (Level 1-10)
INSERT INTO items (name, description, type, slot, rarity, value, stackable, teaches_ability_id)
SELECT 
    'Scroll: ' || a.name,
    'Teaches the bard song: ' || a.name || '. ' || a.description,
    'scroll',
    NULL,
    'common',
    25,
    0,
    a.id
FROM abilities a
WHERE a.name IN (
    'Sonic Blast',
    'Discordant Note I',
    'Melody of Mending I'
)
AND a.primary_stat = 'charisma';

-- Tier II Scrolls (Level 5-15)
INSERT INTO items (name, description, type, slot, rarity, value, stackable, teaches_ability_id)
SELECT 
    'Scroll: ' || a.name,
    'Teaches the bard song: ' || a.name || '. ' || a.description,
    'scroll',
    NULL,
    'common',
    50,
    0,
    a.id
FROM abilities a
WHERE a.name IN (
    'Resonant Strike',
    'Cacophony I',
    'Ballad of Restoration I'
)
AND a.primary_stat = 'charisma';

-- Tier III Scrolls (Level 10-20)
INSERT INTO items (name, description, type, slot, rarity, value, stackable, teaches_ability_id)
SELECT 
    'Scroll: ' || a.name,
    'Teaches the bard song: ' || a.name || '. ' || a.description,
    'scroll',
    NULL,
    'uncommon',
    100,
    0,
    a.id
FROM abilities a
WHERE a.name IN (
    'Harmonic Burst',
    'Dirge of Despair I',
    'Hymn of Renewal I',
    'Power Chord'
)
AND a.primary_stat = 'charisma';

-- Tier IV Scrolls (Level 14-26)
INSERT INTO items (name, description, type, slot, rarity, value, stackable, teaches_ability_id)
SELECT 
    'Scroll: ' || a.name,
    'Teaches the bard song: ' || a.name || '. ' || a.description,
    'scroll',
    NULL,
    'uncommon',
    200,
    0,
    a.id
FROM abilities a
WHERE a.name IN (
    'Discordant Note II',
    'Cacophony II',
    'Melody of Mending II',
    'Crescendo'
)
AND a.primary_stat = 'charisma';

-- Tier V Scrolls (Level 20-30)
INSERT INTO items (name, description, type, slot, rarity, value, stackable, teaches_ability_id)
SELECT 
    'Scroll: ' || a.name,
    'Teaches the bard song: ' || a.name || '. ' || a.description,
    'scroll',
    NULL,
    'rare',
    350,
    0,
    a.id
FROM abilities a
WHERE a.name IN (
    'Dirge of Despair II',
    'Ballad of Restoration II',
    'Fortissimo',
    'Hymn of Renewal II'
)
AND a.primary_stat = 'charisma';

-- Tier VI Scrolls (Level 30-40)
INSERT INTO items (name, description, type, slot, rarity, value, stackable, teaches_ability_id)
SELECT 
    'Scroll: ' || a.name,
    'Teaches the bard song: ' || a.name || '. ' || a.description,
    'scroll',
    NULL,
    'rare',
    500,
    0,
    a.id
FROM abilities a
WHERE a.name IN (
    'Scream of Anguish',
    'Discordant Note III',
    'Cacophony III',
    'Song of Rejuvenation',
    'Thunderous Chord'
)
AND a.primary_stat = 'charisma';

-- Tier VII Scrolls (Level 40-50)
INSERT INTO items (name, description, type, slot, rarity, value, stackable, teaches_ability_id)
SELECT 
    'Scroll: ' || a.name,
    'Teaches the bard song: ' || a.name || '. ' || a.description,
    'scroll',
    NULL,
    'epic',
    800,
    0,
    a.id
FROM abilities a
WHERE a.name IN (
    'Dirge of Despair III',
    'Deathsong',
    'Discordant Note IV',
    'Melody of Mending III',
    'Ballad of Restoration III',
    'Apocalyptic Aria'
)
AND a.primary_stat = 'charisma';

-- Tier VIII Scrolls (Level 50-60)
INSERT INTO items (name, description, type, slot, rarity, value, stackable, teaches_ability_id)
SELECT 
    'Scroll: ' || a.name,
    'Teaches the bard song: ' || a.name || '. ' || a.description,
    'scroll',
    NULL,
    'epic',
    1200,
    0,
    a.id
FROM abilities a
WHERE a.name IN (
    'Cacophony IV',
    'Dirge of Despair IV',
    'Hymn of Renewal III',
    'Aria of Resurrection',
    'Reality Shattering Note'
)
AND a.primary_stat = 'charisma';

-- Tier IX Scrolls (Level 60 - Legendary)
INSERT INTO items (name, description, type, slot, rarity, value, stackable, teaches_ability_id)
SELECT 
    'Scroll: ' || a.name,
    'Teaches the bard song: ' || a.name || '. ' || a.description,
    'scroll',
    NULL,
    'legendary',
    2000,
    0,
    a.id
FROM abilities a
WHERE a.name IN (
    'Requiem of Oblivion',
    'Eternal Lifesong',
    'Worldending Symphony'
)
AND a.primary_stat = 'charisma';

-- ============================================
-- SCROLL LOOT TABLES
-- ============================================

-- Tier I Scrolls (Common) - Level 1-10 mobs
INSERT OR IGNORE INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT m.id, i.id, 0.08, 1, 1
FROM mobs m, items i
WHERE i.name LIKE 'Scroll:%'
AND i.rarity = 'common'
AND i.teaches_ability_id IN (
    SELECT id FROM abilities 
    WHERE name IN ('Sonic Blast', 'Discordant Note I', 'Melody of Mending I', 'Resonant Strike', 'Cacophony I', 'Ballad of Restoration I')
    AND primary_stat = 'charisma'
)
AND m.level >= 1 AND m.level <= 12;

-- Tier II Scrolls (Uncommon) - Level 10-20 mobs
INSERT OR IGNORE INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT m.id, i.id, 0.06, 1, 1
FROM mobs m, items i
WHERE i.name LIKE 'Scroll:%'
AND i.rarity = 'uncommon'
AND i.teaches_ability_id IN (
    SELECT id FROM abilities 
    WHERE name IN ('Harmonic Burst', 'Dirge of Despair I', 'Hymn of Renewal I', 'Power Chord', 'Discordant Note II', 'Cacophony II', 'Melody of Mending II', 'Crescendo')
    AND primary_stat = 'charisma'
)
AND m.level >= 10 AND m.level <= 22;

-- Tier III Scrolls (Rare) - Level 20-30 mobs
INSERT OR IGNORE INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT m.id, i.id, 0.04, 1, 1
FROM mobs m, items i
WHERE i.name LIKE 'Scroll:%'
AND i.rarity = 'rare'
AND i.teaches_ability_id IN (
    SELECT id FROM abilities 
    WHERE name IN ('Dirge of Despair II', 'Ballad of Restoration II', 'Fortissimo', 'Hymn of Renewal II')
    AND primary_stat = 'charisma'
)
AND m.level >= 20 AND m.level <= 32;

-- Tier IV Scrolls (Rare) - Level 30-40 mobs
INSERT OR IGNORE INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT m.id, i.id, 0.03, 1, 1
FROM mobs m, items i
WHERE i.name LIKE 'Scroll:%'
AND i.rarity = 'rare'
AND i.teaches_ability_id IN (
    SELECT id FROM abilities 
    WHERE name IN ('Scream of Anguish', 'Discordant Note III', 'Cacophony III', 'Song of Rejuvenation', 'Thunderous Chord')
    AND primary_stat = 'charisma'
)
AND m.level >= 30 AND m.level <= 42;

-- Tier V Scrolls (Epic) - Level 40-50 mobs
INSERT OR IGNORE INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT m.id, i.id, 0.025, 1, 1
FROM mobs m, items i
WHERE i.name LIKE 'Scroll:%'
AND i.rarity = 'epic'
AND i.teaches_ability_id IN (
    SELECT id FROM abilities 
    WHERE name IN ('Dirge of Despair III', 'Deathsong', 'Discordant Note IV', 'Melody of Mending III', 'Ballad of Restoration III', 'Apocalyptic Aria', 'Cacophony IV', 'Dirge of Despair IV', 'Hymn of Renewal III', 'Aria of Resurrection', 'Reality Shattering Note')
    AND primary_stat = 'charisma'
)
AND m.level >= 40 AND m.level <= 55;

-- Tier VI Scrolls (Legendary) - Level 55-60 mobs
INSERT OR IGNORE INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT m.id, i.id, 0.015, 1, 1
FROM mobs m, items i
WHERE i.name LIKE 'Scroll:%'
AND i.rarity = 'legendary'
AND i.teaches_ability_id IN (
    SELECT id FROM abilities 
    WHERE name IN ('Requiem of Oblivion', 'Eternal Lifesong', 'Worldending Symphony')
    AND primary_stat = 'charisma'
)
AND m.level >= 55 AND m.level <= 60;
