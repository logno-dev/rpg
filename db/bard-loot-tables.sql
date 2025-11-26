-- Bard Equipment Loot Tables
-- Add instruments and performance armor to mob drops

-- First, get all bard equipment item IDs
-- Instruments: charisma_bonus > 0, slot = 'offhand'
-- Performance armor: charisma_bonus > 0, slot IN ('head', 'chest', 'hands', 'feet')

-- ============================================
-- INSTRUMENTS (Offhand) LOOT
-- ============================================

-- Level 1-10 Instruments (Common/Uncommon)
-- Items: Wooden Lute, Tin Whistle, Cedar Mandolin, Brass Horn, Apprentice's Flute
INSERT OR IGNORE INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT m.id, i.id, 0.10, 1, 1
FROM mobs m, items i
WHERE i.slot = 'offhand' 
AND i.charisma_bonus > 0 
AND i.required_level >= 1 
AND i.required_level <= 10
AND i.rarity IN ('common', 'uncommon')
AND m.level >= 1 AND m.level <= 12;

-- Level 11-20 Instruments (Uncommon)
-- Items: Maple Lute, Silver Flute, Enchanted Harp, War Drums, Masterwork Violin
INSERT OR IGNORE INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT m.id, i.id, 0.08, 1, 1
FROM mobs m, items i
WHERE i.slot = 'offhand' 
AND i.charisma_bonus > 0 
AND i.required_level >= 11 
AND i.required_level <= 20
AND i.rarity = 'uncommon'
AND m.level >= 11 AND m.level <= 22;

-- Level 21-30 Instruments (Rare)
-- Items: Elven Lyre, Crystal Horn, Songweaver's Harp, Drums of Thunder
INSERT OR IGNORE INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT m.id, i.id, 0.05, 1, 1
FROM mobs m, items i
WHERE i.slot = 'offhand' 
AND i.charisma_bonus > 0 
AND i.required_level >= 21 
AND i.required_level <= 30
AND i.rarity = 'rare'
AND m.level >= 21 AND m.level <= 32;

-- Level 31-40 Instruments (Epic)
-- Items: Archmage's Lute, Siren's Flute, Celestial Harp, Titan's Horn
INSERT OR IGNORE INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT m.id, i.id, 0.03, 1, 1
FROM mobs m, items i
WHERE i.slot = 'offhand' 
AND i.charisma_bonus > 0 
AND i.required_level >= 31 
AND i.required_level <= 40
AND i.rarity = 'epic'
AND m.level >= 31 AND m.level <= 42;

-- Level 41-50 Instruments (Epic high-end)
-- Items: Dreadlord's Lute, Phoenix Pipes, Starfall Harp, Warlord's War Horn
INSERT OR IGNORE INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT m.id, i.id, 0.025, 1, 1
FROM mobs m, items i
WHERE i.slot = 'offhand' 
AND i.charisma_bonus > 0 
AND i.required_level >= 41 
AND i.required_level <= 50
AND i.rarity = 'epic'
AND m.level >= 41 AND m.level <= 52;

-- Level 51-60 Instruments (Legendary)
-- Items: Godvoice Lute, Worldsong Harp, Eternal Symphony Horn, Infinity's Echo
INSERT OR IGNORE INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT m.id, i.id, 0.015, 1, 1
FROM mobs m, items i
WHERE i.slot = 'offhand' 
AND i.charisma_bonus > 0 
AND i.required_level >= 51 
AND i.required_level <= 60
AND i.rarity = 'legendary'
AND m.level >= 51 AND m.level <= 60;

-- ============================================
-- PERFORMANCE ARMOR (Head, Chest, Hands, Feet) LOOT
-- ============================================

-- Level 1-10 Performance Armor (Common)
INSERT OR IGNORE INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT m.id, i.id, 0.12, 1, 1
FROM mobs m, items i
WHERE i.slot IN ('head', 'chest', 'hands', 'feet')
AND i.charisma_bonus > 0 
AND i.required_level >= 1 
AND i.required_level <= 10
AND i.rarity = 'common'
AND m.level >= 1 AND m.level <= 12;

-- Level 11-20 Performance Armor (Uncommon)
INSERT OR IGNORE INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT m.id, i.id, 0.08, 1, 1
FROM mobs m, items i
WHERE i.slot IN ('head', 'chest', 'hands', 'feet')
AND i.charisma_bonus > 0 
AND i.required_level >= 11 
AND i.required_level <= 20
AND i.rarity = 'uncommon'
AND m.level >= 11 AND m.level <= 22;

-- Level 21-30 Performance Armor (Rare)
INSERT OR IGNORE INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT m.id, i.id, 0.05, 1, 1
FROM mobs m, items i
WHERE i.slot IN ('head', 'chest', 'hands', 'feet')
AND i.charisma_bonus > 0 
AND i.required_level >= 21 
AND i.required_level <= 30
AND i.rarity = 'rare'
AND m.level >= 21 AND m.level <= 32;

-- Level 31-40 Performance Armor (Epic)
INSERT OR IGNORE INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT m.id, i.id, 0.03, 1, 1
FROM mobs m, items i
WHERE i.slot IN ('head', 'chest', 'hands', 'feet')
AND i.charisma_bonus > 0 
AND i.required_level >= 31 
AND i.required_level <= 40
AND i.rarity = 'epic'
AND m.level >= 31 AND m.level <= 42;

-- Level 41-50 Performance Armor (Epic high-end)
INSERT OR IGNORE INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT m.id, i.id, 0.025, 1, 1
FROM mobs m, items i
WHERE i.slot IN ('head', 'chest', 'hands', 'feet')
AND i.charisma_bonus > 0 
AND i.required_level >= 41 
AND i.required_level <= 50
AND i.rarity = 'epic'
AND m.level >= 41 AND m.level <= 52;

-- Level 51-60 Performance Armor (Legendary)
INSERT OR IGNORE INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT m.id, i.id, 0.015, 1, 1
FROM mobs m, items i
WHERE i.slot IN ('head', 'chest', 'hands', 'feet')
AND i.charisma_bonus > 0 
AND i.required_level >= 51 
AND i.required_level <= 60
AND i.rarity = 'legendary'
AND m.level >= 51 AND m.level <= 60;
