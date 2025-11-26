-- Seed initial recipe groups
-- This creates the basic recipe structure that outputs will be attached to

-- Blacksmithing - Weapons
INSERT OR IGNORE INTO recipe_groups (id, name, description, profession_type, category, min_level, max_level, craft_time_seconds, base_experience)
VALUES 
  (1, 'Simple Weapon', 'Craft basic weapons for new adventurers', 'blacksmithing', 'weapon', 1, 15, 12, 100),
  (2, 'Moderate Weapon', 'Craft intermediate weapons for experienced fighters', 'blacksmithing', 'weapon', 10, 30, 12, 150),
  (3, 'Advanced Weapon', 'Forge powerful weapons for veterans', 'blacksmithing', 'weapon', 25, 50, 12, 250);

-- Blacksmithing - Armor (Plate/Chain)
INSERT OR IGNORE INTO recipe_groups (id, name, description, profession_type, category, min_level, max_level, craft_time_seconds, base_experience)
VALUES 
  (4, 'Simple Plate Armor', 'Forge basic heavy armor', 'blacksmithing', 'armor', 1, 15, 12, 100),
  (5, 'Moderate Plate Armor', 'Forge intermediate heavy armor', 'blacksmithing', 'armor', 10, 30, 12, 150);

-- Tailoring - Armor (Cloth)
INSERT OR IGNORE INTO recipe_groups (id, name, description, profession_type, category, min_level, max_level, craft_time_seconds, base_experience)
VALUES 
  (6, 'Simple Robe', 'Weave basic robes for apprentice mages', 'tailoring', 'armor', 1, 15, 12, 100),
  (7, 'Moderate Robe', 'Weave intermediate robes for skilled casters', 'tailoring', 'armor', 10, 30, 12, 150),
  (8, 'Advanced Robe', 'Weave powerful robes for master mages', 'tailoring', 'armor', 25, 50, 12, 250);

-- Leatherworking - Armor
INSERT OR IGNORE INTO recipe_groups (id, name, description, profession_type, category, min_level, max_level, craft_time_seconds, base_experience)
VALUES 
  (9, 'Simple Leather Armor', 'Craft basic leather protection', 'leatherworking', 'armor', 1, 15, 12, 100),
  (10, 'Moderate Leather Armor', 'Craft intermediate leather armor', 'leatherworking', 'armor', 10, 30, 12, 150),
  (11, 'Advanced Leather Armor', 'Craft superior leather protection', 'leatherworking', 'armor', 25, 50, 12, 250);

-- Fletching - Weapons (Bows)
INSERT OR IGNORE INTO recipe_groups (id, name, description, profession_type, category, min_level, max_level, craft_time_seconds, base_experience)
VALUES 
  (12, 'Simple Bow', 'Craft basic bows for hunters', 'fletching', 'weapon', 1, 15, 12, 100),
  (13, 'Moderate Bow', 'Craft intermediate bows', 'fletching', 'weapon', 10, 30, 12, 150);

-- Alchemy - Consumables
INSERT OR IGNORE INTO recipe_groups (id, name, description, profession_type, category, min_level, max_level, craft_time_seconds, base_experience)
VALUES 
  (14, 'Simple Potion', 'Brew basic healing and mana potions', 'alchemy', 'consumable', 1, 15, 12, 80),
  (15, 'Moderate Potion', 'Brew intermediate potions', 'alchemy', 'consumable', 10, 30, 12, 120),
  (16, 'Advanced Potion', 'Brew powerful elixirs', 'alchemy', 'consumable', 25, 50, 12, 200);

-- Note: recipe_outputs and recipe_group_materials will be populated via script
-- after analyzing existing items in the database
