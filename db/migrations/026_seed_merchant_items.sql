-- Add more leveled equipment for merchants to sell

-- LEVEL 1-2 ITEMS (Greenfield Plains)
INSERT INTO items (name, description, type, slot, rarity, damage_min, damage_max, attack_speed, value) VALUES
('Wooden Club', 'A simple wooden club for beginners', 'weapon', 'weapon', 'common', 2, 4, 1.1, 8),
('Training Dagger', 'A dull practice dagger', 'weapon', 'weapon', 'common', 1, 3, 1.5, 6);

INSERT INTO items (name, description, type, slot, rarity, armor, value) VALUES
('Padded Vest', 'Thick cloth padding for basic protection', 'armor', 'chest', 'common', 1, 15),
('Worn Boots', 'Old but functional boots', 'armor', 'feet', 'common', 1, 10),
('Cloth Gloves', 'Simple cloth hand wraps', 'armor', 'hands', 'common', 1, 8);

-- LEVEL 2-3 ITEMS (Darkwood Forest)  
INSERT INTO items (name, description, type, slot, rarity, damage_min, damage_max, attack_speed, strength_bonus, value) VALUES
('Hunter Bow', 'A well-made hunting bow', 'weapon', 'weapon', 'uncommon', 6, 12, 1.3, 1, 80),
('Forest Blade', 'A blade favored by forest rangers', 'weapon', 'weapon', 'uncommon', 10, 18, 1.15, 2, 120);

INSERT INTO items (name, description, type, slot, rarity, armor, dexterity_bonus, value) VALUES
('Ranger Tunic', 'Light armor for agile fighters', 'armor', 'chest', 'uncommon', 6, 2, 90),
('Ranger Hood', 'A hooded cap for forest travel', 'armor', 'head', 'uncommon', 3, 1, 45);

INSERT INTO items (name, description, type, slot, rarity, intelligence_bonus, value) VALUES
('Apprentice Robes', 'Robes that enhance magical focus', 'armor', 'chest', 'uncommon', 3, 85);

-- LEVEL 4-5 ITEMS (Ironpeak Mountains)
INSERT INTO items (name, description, type, slot, rarity, damage_min, damage_max, attack_speed, strength_bonus, value) VALUES
('Battle Axe', 'A heavy axe for cleaving armor', 'weapon', 'weapon', 'rare', 18, 30, 0.9, 3, 250),
('War Hammer', 'A crushing weapon of war', 'weapon', 'weapon', 'rare', 20, 28, 0.85, 4, 280);

INSERT INTO items (name, description, type, slot, rarity, armor, constitution_bonus, value) VALUES
('Plate Armor', 'Heavy full plate protection', 'armor', 'chest', 'rare', 15, 8, 350),
('Steel Helm', 'A reinforced steel helmet', 'armor', 'head', 'rare', 8, 4, 150),
('Plate Gauntlets', 'Heavy armored gloves', 'armor', 'hands', 'rare', 5, 2, 120),
('Steel Boots', 'Armored boots for warriors', 'armor', 'feet', 'rare', 5, 2, 110);

INSERT INTO items (name, description, type, slot, rarity, intelligence_bonus, wisdom_bonus, value) VALUES
('Mage Robes', 'Enchanted robes for spellcasters', 'armor', 'chest', 'rare', 5, 3, 320);

-- LEVEL 5-6 ITEMS (Shadowdeep Dungeon)
INSERT INTO items (name, description, type, slot, rarity, damage_min, damage_max, attack_speed, strength_bonus, intelligence_bonus, value) VALUES
('Shadowblade', 'A dark blade infused with shadow magic', 'weapon', 'weapon', 'epic', 25, 40, 1.2, 5, 3, 500),
('Staff of the Depths', 'An ancient staff from the dungeon depths', 'weapon', 'weapon', 'epic', 15, 25, 1.0, 0, 8, 550);

INSERT INTO items (name, description, type, slot, rarity, armor, constitution_bonus, strength_bonus, value) VALUES
('Shadowplate', 'Dark armor forged in ancient forges', 'armor', 'chest', 'epic', 20, 10, 6, 600);

INSERT INTO items (name, description, type, slot, rarity, armor, intelligence_bonus, wisdom_bonus, value) VALUES
('Archmage Vestments', 'Legendary robes of great power', 'armor', 'chest', 'epic', 8, 8, 6, 580);

INSERT INTO items (name, description, type, slot, rarity, armor, constitution_bonus, value) VALUES
('Crown of Shadows', 'A dark crown from the dungeon lords', 'armor', 'head', 'epic', 10, 6, 320);

-- CONSUMABLES (all merchants sell these, prices vary)
INSERT INTO items (name, description, type, slot, rarity, stackable, value) VALUES
('Greater Health Potion', 'Restores 100 health', 'consumable', null, 'uncommon', 1, 50),
('Greater Mana Potion', 'Restores 60 mana', 'consumable', null, 'uncommon', 1, 60),
('Elixir of Strength', 'Temporarily increases strength', 'consumable', null, 'rare', 1, 100),
('Elixir of Intelligence', 'Temporarily increases intelligence', 'consumable', null, 'rare', 1, 100);

-- MERCHANT 1: Bran the Merchant (Greenfield Plains - Levels 1-2)
-- Basic starter gear and consumables
INSERT INTO merchant_inventory (merchant_id, item_id, stock, price_multiplier) VALUES
-- Weapons
(1, 1, -1, 1.0),  -- Rusty Sword
(1, 324, -1, 1.0), -- Wooden Club
(1, 325, -1, 1.0), -- Training Dagger
(1, 4, -1, 1.2),  -- Wooden Staff
-- Armor
(1, 326, -1, 1.0), -- Padded Vest
(1, 6, -1, 1.0),   -- Cloth Armor
(1, 327, -1, 1.0), -- Worn Boots
(1, 328, -1, 1.0), -- Cloth Gloves
(1, 12, -1, 1.0),  -- Leather Boots
(1, 11, -1, 1.0),  -- Leather Gloves
-- Consumables
(1, 13, -1, 1.0),  -- Health Potion
(1, 14, -1, 1.0),  -- Mana Potion
(1, 15, -1, 0.8);  -- Bread (discounted)

-- MERCHANT 2: Elara Moonwhisper (Darkwood Forest - Levels 2-3)
-- Mid-tier equipment
INSERT INTO merchant_inventory (merchant_id, item_id, stock, price_multiplier) VALUES
-- Weapons
(2, 2, -1, 1.0),   -- Iron Sword
(2, 329, -1, 1.0), -- Hunter Bow
(2, 330, -1, 1.0), -- Forest Blade
(2, 5, -1, 1.0),   -- Mage Staff
-- Armor  
(2, 7, -1, 1.0),   -- Leather Armor
(2, 331, -1, 1.0), -- Ranger Tunic
(2, 332, -1, 1.0), -- Ranger Hood
(2, 9, -1, 1.0),   -- Leather Helmet
(2, 333, -1, 1.0), -- Apprentice Robes
-- Consumables
(2, 13, -1, 1.1),  -- Health Potion (slight markup)
(2, 14, -1, 1.1),  -- Mana Potion (slight markup)
(2, 340, -1, 1.0), -- Greater Health Potion
(2, 341, -1, 1.0); -- Greater Mana Potion

-- MERCHANT 3: Thorgrim Ironforge (Ironpeak Mountains - Levels 4-5)
-- High-tier equipment
INSERT INTO merchant_inventory (merchant_id, item_id, stock, price_multiplier) VALUES
-- Weapons
(3, 3, -1, 1.0),   -- Steel Sword
(3, 334, -1, 1.0), -- Battle Axe
(3, 335, -1, 1.0), -- War Hammer
-- Armor
(3, 8, -1, 1.0),   -- Chainmail
(3, 336, -1, 1.0), -- Plate Armor
(3, 337, -1, 1.0), -- Steel Helm
(3, 338, -1, 1.0), -- Plate Gauntlets
(3, 339, -1, 1.0), -- Steel Boots
(3, 10, -1, 1.0),  -- Iron Helmet
(3, 340, -1, 1.0), -- Mage Robes
-- Consumables
(3, 340, -1, 1.0), -- Greater Health Potion
(3, 341, -1, 1.0), -- Greater Mana Potion
(3, 342, -1, 1.2), -- Elixir of Strength
(3, 343, -1, 1.2); -- Elixir of Intelligence

-- MERCHANT 4: Cassandra the Shadowed (Shadowdeep Dungeon - Levels 5-6)
-- Epic equipment
INSERT INTO merchant_inventory (merchant_id, item_id, stock, price_multiplier) VALUES
-- Weapons
(4, 344, -1, 1.0), -- Shadowblade
(4, 345, -1, 1.0), -- Staff of the Depths
-- Armor
(4, 346, -1, 1.0), -- Shadowplate
(4, 347, -1, 1.0), -- Archmage Vestments
(4, 348, -1, 1.0), -- Crown of Shadows
-- Also sells previous tier items at markup
(4, 336, -1, 1.3), -- Plate Armor
(4, 340, -1, 1.3), -- Mage Robes
-- Consumables (expensive in dungeon)
(4, 340, -1, 1.5), -- Greater Health Potion (marked up)
(4, 341, -1, 1.5), -- Greater Mana Potion (marked up)
(4, 342, -1, 1.3), -- Elixir of Strength
(4, 343, -1, 1.3); -- Elixir of Intelligence
