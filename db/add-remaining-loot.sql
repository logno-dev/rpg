-- Add high-level items (42+) to mob loot
INSERT OR IGNORE INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT m.id, i.id, 0.03, 1, 1
FROM mobs m, items i
WHERE i.name IN ('Celestial Ward', 'Celestial Quiver', 'Ethereal Bastion', 'Ethereal Quiver',
                 'Primordial Helm', 'Primordial Gauntlets', 'Primordial Greaves', 'Primordial Wall', 
                 'Primordial Quiver', 'Primordial Hood', 'Primordial Gloves', 'Primordial Boots',
                 'Godforged Helm', 'Godforged Gauntlets', 'Godforged Greaves', 'Godforged Rampart',
                 'Godforged Quiver', 'Godforged Hood', 'Godforged Gloves', 'Godforged Boots',
                 'Timeless Quiver', 'Shield of the Immortal', 'Quiver of Infinite Arrows',
                 'Ascendant Aegis', 'Ascendant Crown', 'Ascendant Gauntlets', 'Ascendant Greaves',
                 'Ascendant Quiver', 'Ascendant Hood', 'Ascendant Gloves', 'Ascendant Boots')
AND m.level >= 40;

-- Add high-level recipes
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft ' || name, 'blacksmithing', 30, id, 45, 100
FROM items
WHERE name IN ('Primordial Helm', 'Primordial Gauntlets', 'Primordial Greaves', 'Primordial Wall',
               'Godforged Helm', 'Godforged Gauntlets', 'Godforged Greaves', 'Godforged Rampart',
               'Ascendant Aegis', 'Ascendant Crown', 'Ascendant Gauntlets', 'Ascendant Greaves');

-- Add Mithril Ore materials
INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, 12, 8
FROM recipes r
JOIN items i ON r.item_id = i.id
WHERE i.name IN ('Primordial Helm', 'Primordial Gauntlets', 'Primordial Greaves', 'Primordial Wall',
                 'Godforged Helm', 'Godforged Gauntlets', 'Godforged Greaves', 'Godforged Rampart',
                 'Ascendant Aegis', 'Ascendant Crown', 'Ascendant Gauntlets', 'Ascendant Greaves');

-- Add DEX recipes
INSERT OR IGNORE INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
SELECT 'Craft ' || name, 'leatherworking', 30, id, 45, 100
FROM items
WHERE name IN ('Primordial Quiver', 'Primordial Hood', 'Primordial Gloves', 'Primordial Boots',
               'Godforged Quiver', 'Godforged Hood', 'Godforged Gloves', 'Godforged Boots',
               'Ascendant Quiver', 'Ascendant Hood', 'Ascendant Gloves', 'Ascendant Boots',
               'Celestial Ward', 'Celestial Quiver', 'Ethereal Bastion', 'Ethereal Quiver',
               'Timeless Quiver', 'Shield of the Immortal', 'Quiver of Infinite Arrows',
               'Leather Gloves');

-- Add Cured Leather materials  
INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity)
SELECT r.id, 4, 7
FROM recipes r
JOIN items i ON r.item_id = i.id
WHERE i.name IN ('Primordial Quiver', 'Primordial Hood', 'Primordial Gloves', 'Primordial Boots',
                 'Godforged Quiver', 'Godforged Hood', 'Godforged Gloves', 'Godforged Boots',
                 'Ascendant Quiver', 'Ascendant Hood', 'Ascendant Gloves', 'Ascendant Boots',
                 'Celestial Ward', 'Celestial Quiver', 'Ethereal Bastion', 'Ethereal Quiver',
                 'Timeless Quiver', 'Shield of the Immortal', 'Quiver of Infinite Arrows',
                 'Leather Gloves');

-- Add Dragonscale Barrier to loot
INSERT OR IGNORE INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
SELECT m.id, i.id, 0.04, 1, 1
FROM mobs m, items i
WHERE i.name = 'Dragonscale Barrier'
AND m.level >= 27 AND m.level <= 33;

