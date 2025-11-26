-- Bard Equipment Crafting Recipes
-- Instruments use Woodworking/Leatherworking
-- Performance Armor uses Tailoring/Leatherworking

-- ============================================
-- INSTRUMENT CRAFTING RECIPES
-- ============================================

-- Level 1-10 Instruments (Common/Uncommon)
-- Wooden Lute, Tin Whistle, Apprentice's Flute, Cedar Mandolin, Brass Horn

-- Get item IDs for instruments
-- We'll create recipes for select key instruments

-- Wooden Lute (Level 1)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Wooden Lute', 'woodworking', 1, id, 45, 50
FROM items WHERE name = 'Wooden Lute' LIMIT 1;

-- Cedar Mandolin (Level 8)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Cedar Mandolin', 'woodworking', 8, id, 60, 100
FROM items WHERE name = 'Cedar Mandolin' LIMIT 1;

-- Brass Horn (Level 10)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Brass Horn', 'blacksmithing', 10, id, 70, 125
FROM items WHERE name = 'Brass Horn' LIMIT 1;

-- Level 11-20 Instruments
-- Maple Lute (Level 11)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Maple Lute', 'woodworking', 11, id, 80, 150
FROM items WHERE name = 'Maple Lute' LIMIT 1;

-- Silver Flute (Level 13)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Silver Flute', 'blacksmithing', 13, id, 90, 175
FROM items WHERE name = 'Silver Flute' LIMIT 1;

-- Enchanted Harp (Level 15)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Enchanted Harp', 'woodworking', 15, id, 100, 200
FROM items WHERE name = 'Enchanted Harp' LIMIT 1;

-- War Drums (Level 17)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft War Drums', 'leatherworking', 17, id, 110, 225
FROM items WHERE name = 'War Drums' LIMIT 1;

-- Masterwork Violin (Level 19)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Masterwork Violin', 'woodworking', 19, id, 120, 250
FROM items WHERE name = 'Masterwork Violin' LIMIT 1;

-- Level 21-30 Instruments (Rare)
-- Elven Lyre (Level 21)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Elven Lyre', 'woodworking', 21, id, 130, 300
FROM items WHERE name = 'Elven Lyre' LIMIT 1;

-- Crystal Horn (Level 24)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Crystal Horn', 'alchemy', 24, id, 140, 350
FROM items WHERE name = 'Crystal Horn' LIMIT 1;

-- Songweaver's Harp (Level 27)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Songweaver''s Harp', 'woodworking', 27, id, 150, 400
FROM items WHERE name = 'Songweaver''s Harp' LIMIT 1;

-- Drums of Thunder (Level 29)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Drums of Thunder', 'leatherworking', 29, id, 160, 450
FROM items WHERE name = 'Drums of Thunder' LIMIT 1;

-- Level 31-40 Instruments (Epic)
-- Archmage's Lute (Level 31)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Archmage''s Lute', 'woodworking', 31, id, 170, 500
FROM items WHERE name = 'Archmage''s Lute' LIMIT 1;

-- Siren's Flute (Level 34)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Siren''s Flute', 'woodworking', 34, id, 180, 600
FROM items WHERE name = 'Siren''s Flute' LIMIT 1;

-- Celestial Harp (Level 37)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Celestial Harp', 'woodworking', 37, id, 190, 700
FROM items WHERE name = 'Celestial Harp' LIMIT 1;

-- Titan's Horn (Level 39)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Titan''s Horn', 'blacksmithing', 39, id, 200, 800
FROM items WHERE name = 'Titan''s Horn' LIMIT 1;

-- Level 41-50 Instruments (Epic high-end)
-- Dreadlord's Lute (Level 41)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Dreadlord''s Lute', 'woodworking', 41, id, 210, 900
FROM items WHERE name = 'Dreadlord''s Lute' LIMIT 1;

-- Phoenix Pipes (Level 44)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Phoenix Pipes', 'woodworking', 44, id, 220, 1000
FROM items WHERE name = 'Phoenix Pipes' LIMIT 1;

-- Starfall Harp (Level 47)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Starfall Harp', 'woodworking', 47, id, 230, 1100
FROM items WHERE name = 'Starfall Harp' LIMIT 1;

-- Warlord's War Horn (Level 49)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Warlord''s War Horn', 'blacksmithing', 49, id, 240, 1200
FROM items WHERE name = 'Warlord''s War Horn' LIMIT 1;

-- Level 51-60 Instruments (Legendary)
-- Godvoice Lute (Level 51)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Godvoice Lute', 'woodworking', 51, id, 250, 1400
FROM items WHERE name = 'Godvoice Lute' LIMIT 1;

-- Worldsong Harp (Level 55)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Worldsong Harp', 'woodworking', 55, id, 260, 1600
FROM items WHERE name = 'Worldsong Harp' LIMIT 1;

-- Eternal Symphony Horn (Level 58)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Eternal Symphony Horn', 'blacksmithing', 58, id, 270, 1800
FROM items WHERE name = 'Eternal Symphony Horn' LIMIT 1;

-- Infinity's Echo (Level 60)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Infinity''s Echo', 'woodworking', 60, id, 300, 2000
FROM items WHERE name = 'Infinity''s Echo' LIMIT 1;

-- ============================================
-- PERFORMANCE ARMOR CRAFTING RECIPES
-- ============================================

-- Level 1-10 Performance Armor (Select key pieces)
-- Performer's Cap (Level 1)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Performer''s Cap', 'tailoring', 1, id, 30, 40
FROM items WHERE name = 'Performer''s Cap' LIMIT 1;

-- Jester's Tunic (Level 1)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Jester''s Tunic', 'tailoring', 1, id, 45, 60
FROM items WHERE name = 'Jester''s Tunic' LIMIT 1;

-- Minstrel's Hat (Level 5)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Minstrel''s Hat', 'tailoring', 5, id, 40, 75
FROM items WHERE name = 'Minstrel''s Hat' LIMIT 1;

-- Troubadour's Vest (Level 5)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Troubadour''s Vest', 'tailoring', 5, id, 50, 90
FROM items WHERE name = 'Troubadour''s Vest' LIMIT 1;

-- Level 11-20 Performance Armor
-- Crown of Melodies (Level 11)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Crown of Melodies', 'tailoring', 11, id, 70, 140
FROM items WHERE name = 'Crown of Melodies' LIMIT 1;

-- Harmonious Chainmail (Level 11)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Harmonious Chainmail', 'blacksmithing', 11, id, 85, 180
FROM items WHERE name = 'Harmonious Chainmail' LIMIT 1;

-- Maestro's Circlet (Level 15)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Maestro''s Circlet', 'tailoring', 15, id, 90, 200
FROM items WHERE name = 'Maestro''s Circlet' LIMIT 1;

-- Songsteel Hauberk (Level 15)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Songsteel Hauberk', 'blacksmithing', 15, id, 100, 230
FROM items WHERE name = 'Songsteel Hauberk' LIMIT 1;

-- Level 21-30 Performance Armor (Rare)
-- Siren's Diadem (Level 21)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Siren''s Diadem', 'tailoring', 21, id, 120, 280
FROM items WHERE name = 'Siren''s Diadem' LIMIT 1;

-- Spellweave Hauberk (Level 21)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Spellweave Hauberk', 'blacksmithing', 21, id, 140, 330
FROM items WHERE name = 'Spellweave Hauberk' LIMIT 1;

-- Bardic Crown (Level 25)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Bardic Crown', 'tailoring', 25, id, 140, 360
FROM items WHERE name = 'Bardic Crown' LIMIT 1;

-- Resonance Chainmail (Level 25)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Resonance Chainmail', 'blacksmithing', 25, id, 160, 410
FROM items WHERE name = 'Resonance Chainmail' LIMIT 1;

-- Level 31-40 Performance Armor (Epic)
-- Archbard's Coronet (Level 31)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Archbard''s Coronet', 'tailoring', 31, id, 170, 500
FROM items WHERE name = 'Archbard''s Coronet' LIMIT 1;

-- Celestial Songmail (Level 31)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Celestial Songmail', 'blacksmithing', 31, id, 190, 580
FROM items WHERE name = 'Celestial Songmail' LIMIT 1;

-- Worldsinger's Crown (Level 35)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Worldsinger''s Crown', 'tailoring', 35, id, 190, 650
FROM items WHERE name = 'Worldsinger''s Crown' LIMIT 1;

-- Titanforged Songmail (Level 35)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Titanforged Songmail', 'blacksmithing', 35, id, 210, 750
FROM items WHERE name = 'Titanforged Songmail' LIMIT 1;

-- Level 41-50 Performance Armor (Epic high-end)
-- Dreadlord's Crown (Level 41)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Dreadlord''s Crown', 'tailoring', 41, id, 210, 850
FROM items WHERE name = 'Dreadlord''s Crown' LIMIT 1;

-- Dreadnought Songmail (Level 41)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Dreadnought Songmail', 'blacksmithing', 41, id, 230, 950
FROM items WHERE name = 'Dreadnought Songmail' LIMIT 1;

-- Vanguard's Diadem (Level 45)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Vanguard''s Diadem', 'tailoring', 45, id, 230, 1050
FROM items WHERE name = 'Vanguard''s Diadem' LIMIT 1;

-- Vanguard Songmail (Level 45)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Vanguard Songmail', 'blacksmithing', 45, id, 250, 1150
FROM items WHERE name = 'Vanguard Songmail' LIMIT 1;

-- Level 51-60 Performance Armor (Legendary)
-- Mythril Muse's Crown (Level 51)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Mythril Muse''s Crown', 'tailoring', 51, id, 250, 1300
FROM items WHERE name = 'Mythril Muse''s Crown' LIMIT 1;

-- Mythril Songweave (Level 51)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Mythril Songweave', 'blacksmithing', 51, id, 270, 1450
FROM items WHERE name = 'Mythril Songweave' LIMIT 1;

-- Godforged Bardic Crown (Level 55)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Godforged Bardic Crown', 'tailoring', 55, id, 270, 1600
FROM items WHERE name = 'Godforged Bardic Crown' LIMIT 1;

-- Godforged Songmail (Level 55)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Godforged Songmail', 'blacksmithing', 55, id, 290, 1750
FROM items WHERE name = 'Godforged Songmail' LIMIT 1;

-- Eternal Bard's Crown (Level 60)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Eternal Bard''s Crown', 'tailoring', 60, id, 290, 1900
FROM items WHERE name = 'Eternal Bard''s Crown' LIMIT 1;

-- Eternal Songmail (Level 60)
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft Eternal Songmail', 'blacksmithing', 60, id, 310, 2050
FROM items WHERE name = 'Eternal Songmail' LIMIT 1;

-- ============================================
-- RECIPE MATERIALS
-- ============================================

-- Level 1-10 Instruments: Wood + Rough Leather
INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, (SELECT id FROM crafting_materials WHERE name = 'Wooden Planks' LIMIT 1), 3
FROM recipes r
WHERE r.name IN ('Craft Wooden Lute', 'Craft Cedar Mandolin')
AND r.profession_type = 'woodworking';

INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, (SELECT id FROM crafting_materials WHERE name = 'Rough Leather' LIMIT 1), 2
FROM recipes r
WHERE r.name IN ('Craft Wooden Lute', 'Craft Cedar Mandolin')
AND r.profession_type = 'woodworking';

-- Brass Horn: Copper Ore
INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, (SELECT id FROM crafting_materials WHERE name = 'Copper Ore' LIMIT 1), 4
FROM recipes r
WHERE r.name = 'Craft Brass Horn';

-- Level 11-20 Instruments: Ancient Wood + Cured Leather
INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, (SELECT id FROM crafting_materials WHERE name = 'Ancient Wood' LIMIT 1), 4
FROM recipes r
WHERE r.name IN ('Craft Maple Lute', 'Craft Enchanted Harp', 'Craft Masterwork Violin')
AND r.profession_type = 'woodworking';

INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, (SELECT id FROM crafting_materials WHERE name = 'Cured Leather' LIMIT 1), 3
FROM recipes r
WHERE r.name IN ('Craft Maple Lute', 'Craft Enchanted Harp', 'Craft Masterwork Violin', 'Craft War Drums');

-- Silver Flute: Iron Ore
INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, (SELECT id FROM crafting_materials WHERE name = 'Iron Ore' LIMIT 1), 5
FROM recipes r
WHERE r.name = 'Craft Silver Flute';

-- War Drums: Cured Leather + Wood
INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, (SELECT id FROM crafting_materials WHERE name = 'Wooden Planks' LIMIT 1), 3
FROM recipes r
WHERE r.name = 'Craft War Drums';

-- Level 21-30 Instruments: Ancient Wood + Minor Gemstone
INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, (SELECT id FROM crafting_materials WHERE name = 'Ancient Wood' LIMIT 1), 6
FROM recipes r
WHERE r.name IN ('Craft Elven Lyre', 'Craft Songweaver''s Harp')
AND r.profession_type = 'woodworking';

INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, (SELECT id FROM crafting_materials WHERE name = 'Minor Gemstone' LIMIT 1), 2
FROM recipes r
WHERE r.name IN ('Craft Elven Lyre', 'Craft Songweaver''s Harp', 'Craft Crystal Horn');

INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, (SELECT id FROM crafting_materials WHERE name = 'Cured Leather' LIMIT 1), 4
FROM recipes r
WHERE r.name = 'Craft Drums of Thunder';

-- Level 31-40 Instruments: Ancient Wood + Major Gemstone + Rare Herbs
INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, (SELECT id FROM crafting_materials WHERE name = 'Ancient Wood' LIMIT 1), 8
FROM recipes r
WHERE r.name IN ('Craft Archmage''s Lute', 'Craft Siren''s Flute', 'Craft Celestial Harp')
AND r.profession_type = 'woodworking';

INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, (SELECT id FROM crafting_materials WHERE name = 'Major Gemstone' LIMIT 1), 3
FROM recipes r
WHERE r.name IN ('Craft Archmage''s Lute', 'Craft Siren''s Flute', 'Celestial Harp');

INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, (SELECT id FROM crafting_materials WHERE name = 'Rare Herbs' LIMIT 1), 2
FROM recipes r
WHERE r.name IN ('Craft Archmage''s Lute', 'Craft Siren''s Flute', 'Craft Celestial Harp');

-- Level 51-60 Legendary Instruments: Ancient Wood + Dragon Scale + Major Gemstone
INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, (SELECT id FROM crafting_materials WHERE name = 'Ancient Wood' LIMIT 1), 12
FROM recipes r
WHERE r.name IN ('Craft Godvoice Lute', 'Craft Worldsong Harp', 'Craft Infinity''s Echo')
AND r.profession_type = 'woodworking';

INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, (SELECT id FROM crafting_materials WHERE name = 'Dragon Scale' LIMIT 1), 4
FROM recipes r
WHERE r.name IN ('Craft Godvoice Lute', 'Craft Worldsong Harp', 'Craft Infinity''s Echo');

INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, (SELECT id FROM crafting_materials WHERE name = 'Major Gemstone' LIMIT 1), 6
FROM recipes r
WHERE r.name IN ('Craft Godvoice Lute', 'Craft Worldsong Harp', 'Craft Infinity''s Echo');

-- Performance Armor Materials (Select key recipes)
-- Level 1-10: Linen + Rough Leather
INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, (SELECT id FROM crafting_materials WHERE name = 'Linen Cloth' LIMIT 1), 3
FROM recipes r
WHERE r.name IN ('Craft Performer''s Cap', 'Craft Minstrel''s Hat');

INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, (SELECT id FROM crafting_materials WHERE name = 'Linen Cloth' LIMIT 1), 5
FROM recipes r
WHERE r.name IN ('Craft Jester''s Tunic', 'Craft Troubadour''s Vest');

-- Level 11-20: Silk + Cured Leather
INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, (SELECT id FROM crafting_materials WHERE name = 'Silk Cloth' LIMIT 1), 4
FROM recipes r
WHERE r.name IN ('Craft Crown of Melodies', 'Craft Maestro''s Circlet');

INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, (SELECT id FROM crafting_materials WHERE name = 'Steel Ingot' LIMIT 1), 8
FROM recipes r
WHERE r.name IN ('Craft Harmonious Chainmail', 'Craft Songsteel Hauberk');

INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, (SELECT id FROM crafting_materials WHERE name = 'Cured Leather' LIMIT 1), 4
FROM recipes r
WHERE r.name IN ('Craft Harmonious Chainmail', 'Craft Songsteel Hauberk');

-- Level 51-60: Ethereal Silk + Dragon Scale
INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, (SELECT id FROM crafting_materials WHERE name = 'Ethereal Silk' LIMIT 1), 8
FROM recipes r
WHERE r.name IN ('Craft Mythril Muse''s Crown', 'Craft Godforged Bardic Crown', 'Craft Eternal Bard''s Crown');

INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, (SELECT id FROM crafting_materials WHERE name = 'Adamantite Ore' LIMIT 1), 16
FROM recipes r
WHERE r.name IN ('Craft Mythril Songweave', 'Craft Godforged Songmail', 'Craft Eternal Songmail');

INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, (SELECT id FROM crafting_materials WHERE name = 'Dragon Scale' LIMIT 1), 3
FROM recipes r
WHERE r.name IN ('Craft Mythril Songweave', 'Craft Godforged Songmail', 'Craft Eternal Songmail', 'Craft Mythril Muse''s Crown', 'Craft Godforged Bardic Crown', 'Craft Eternal Bard''s Crown');
