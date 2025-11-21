-- Seed basic items
INSERT INTO items (name, description, type, slot, rarity, damage_min, damage_max, attack_speed, value) VALUES
('Rusty Sword', 'A worn sword, barely holding together', 'weapon', 'weapon', 'common', 3, 7, 1.0, 10),
('Iron Sword', 'A reliable iron blade', 'weapon', 'weapon', 'common', 8, 15, 1.2, 50),
('Steel Sword', 'A well-crafted steel weapon', 'weapon', 'weapon', 'uncommon', 15, 25, 1.1, 150),
('Wooden Staff', 'A simple wooden staff', 'weapon', 'weapon', 'common', 2, 5, 0.8, 15),
('Mage Staff', 'A staff imbued with magic', 'weapon', 'weapon', 'uncommon', 5, 10, 0.9, 100);

INSERT INTO items (name, description, type, slot, rarity, armor, constitution_bonus, value) VALUES
('Cloth Armor', 'Basic cloth protection', 'armor', 'chest', 'common', 2, 1, 20),
('Leather Armor', 'Sturdy leather protection', 'armor', 'chest', 'common', 5, 2, 60),
('Chainmail', 'Interlocking metal rings', 'armor', 'chest', 'uncommon', 10, 5, 200),
('Leather Helmet', 'A simple leather cap', 'armor', 'head', 'common', 2, 1, 30),
('Iron Helmet', 'A sturdy iron helmet', 'armor', 'head', 'uncommon', 5, 2, 80);

INSERT INTO items (name, description, type, slot, rarity, dexterity_bonus, value) VALUES
('Leather Boots', 'Comfortable leather footwear', 'armor', 'feet', 'common', 1, 25),
('Leather Gloves', 'Flexible leather gloves', 'armor', 'hands', 'common', 1, 20);

INSERT INTO items (name, description, type, slot, rarity, stackable, value) VALUES
('Health Potion', 'Restores 50 health', 'consumable', null, 'common', 1, 25),
('Mana Potion', 'Restores 30 mana', 'consumable', null, 'common', 1, 30),
('Bread', 'Restores 20 health', 'consumable', null, 'common', 1, 5);

-- Seed basic mobs
INSERT INTO mobs (name, level, area, max_health, damage_min, damage_max, defense, attack_speed, experience_reward, gold_min, gold_max, aggressive) VALUES
('Giant Rat', 1, 'plains', 25, 2, 5, 0, 1.4, 10, 1, 5, 1),
('Goblin', 2, 'forest', 40, 4, 8, 1, 1.1, 20, 3, 10, 1),
('Wolf', 3, 'forest', 60, 6, 12, 2, 1.3, 35, 5, 15, 1),
('Skeleton', 4, 'dungeon', 80, 8, 15, 3, 0.9, 50, 8, 20, 1),
('Orc', 5, 'mountains', 120, 12, 20, 5, 0.8, 75, 15, 35, 1),
('Wild Boar', 2, 'plains', 50, 5, 10, 2, 1.0, 25, 4, 12, 0),
('Forest Spider', 3, 'forest', 45, 7, 13, 1, 1.5, 40, 6, 18, 1),
('Cave Troll', 6, 'dungeon', 200, 15, 30, 8, 0.7, 120, 25, 60, 1);

-- Seed mob loot drops
-- Giant Rat drops
INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max) VALUES
(1, 1, 0.15, 1, 1), -- Rusty Sword (15% chance)
(1, 15, 0.30, 1, 1); -- Bread (30% chance)

-- Goblin drops
INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max) VALUES
(2, 1, 0.25, 1, 1), -- Rusty Sword
(2, 2, 0.10, 1, 1), -- Iron Sword
(2, 9, 0.20, 1, 1), -- Leather Helmet
(2, 13, 0.15, 1, 1); -- Health Potion

-- Wolf drops
INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max) VALUES
(3, 7, 0.20, 1, 1), -- Leather Armor
(3, 11, 0.25, 1, 1), -- Leather Boots
(3, 13, 0.20, 1, 1); -- Health Potion

-- Skeleton drops
INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max) VALUES
(4, 2, 0.30, 1, 1), -- Iron Sword
(4, 10, 0.15, 1, 1), -- Iron Helmet
(4, 13, 0.25, 1, 1), -- Health Potion
(4, 14, 0.20, 1, 1); -- Mana Potion

-- Orc drops
INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max) VALUES
(5, 3, 0.20, 1, 1), -- Steel Sword
(5, 8, 0.15, 1, 1), -- Chainmail
(5, 13, 0.30, 1, 2), -- Health Potion
(5, 14, 0.25, 1, 1); -- Mana Potion

-- Wild Boar drops
INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max) VALUES
(6, 15, 0.50, 1, 3), -- Bread
(6, 7, 0.10, 1, 1); -- Leather Armor

-- Forest Spider drops
INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max) VALUES
(7, 14, 0.25, 1, 1), -- Mana Potion
(7, 12, 0.20, 1, 1); -- Leather Gloves

-- Cave Troll drops
INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max) VALUES
(8, 3, 0.40, 1, 1), -- Steel Sword
(8, 8, 0.30, 1, 1), -- Chainmail
(8, 10, 0.25, 1, 1), -- Iron Helmet
(8, 13, 0.50, 2, 4), -- Health Potion
(8, 14, 0.40, 1, 2); -- Mana Potion

-- Seed basic abilities
INSERT INTO abilities (name, description, type, min_level, strength_required, mana_cost, cooldown, damage_min, damage_max) VALUES
('Power Strike', 'A powerful melee attack', 'physical', 1, 12, 10, 5, 15, 25),
('Cleave', 'Strike multiple enemies', 'physical', 3, 15, 15, 8, 20, 35),
('Berserk', 'Unleash devastating power', 'physical', 5, 20, 25, 15, 40, 60);

INSERT INTO abilities (name, description, type, min_level, intelligence_required, mana_cost, cooldown, damage_min, damage_max) VALUES
('Fireball', 'Hurl a ball of flame', 'magical', 1, 12, 15, 6, 18, 30),
('Ice Shard', 'Launch a freezing projectile', 'magical', 2, 14, 18, 7, 22, 38),
('Lightning Bolt', 'Call down lightning', 'magical', 4, 18, 25, 10, 35, 55);

INSERT INTO abilities (name, description, type, min_level, wisdom_required, mana_cost, cooldown, healing) VALUES
('Heal', 'Restore health', 'heal', 1, 12, 20, 8, 40),
('Greater Heal', 'Restore significant health', 'heal', 3, 16, 35, 12, 80);
