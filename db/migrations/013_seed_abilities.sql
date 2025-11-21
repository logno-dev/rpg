-- Seed basic abilities and spells
-- Note: base_id will reference the ID of the tier I version for upgrades

-- PHYSICAL ABILITIES (No mana cost, cooldown-based)

-- Kick (Strength-based damage)
INSERT INTO abilities (id, name, description, type, category, level, base_id, primary_stat, stat_scaling, cooldown, damage_min, damage_max) VALUES
(1, 'Kick I', 'A powerful kick that deals damage based on your strength', 'ability', 'damage', 1, 1, 'strength', 0.8, 10, 3, 6),
(2, 'Kick II', 'An improved kick technique', 'ability', 'damage', 2, 1, 'strength', 1.2, 10, 5, 10),
(3, 'Kick III', 'A devastating kick', 'ability', 'damage', 3, 1, 'strength', 1.6, 10, 8, 15);

-- Dodge (Dexterity-based buff)
INSERT INTO abilities (id, name, description, type, category, level, base_id, primary_stat, stat_scaling, cooldown, buff_stat, buff_amount, buff_duration) VALUES
(4, 'Dodge I', 'Increase your dexterity temporarily', 'ability', 'buff', 1, 4, 'dexterity', 0.3, 20, 'dexterity', 3, 10),
(5, 'Dodge II', 'Greatly increase your dexterity', 'ability', 'buff', 2, 4, 'dexterity', 0.5, 20, 'dexterity', 5, 10),
(6, 'Dodge III', 'Massively increase your dexterity', 'ability', 'buff', 3, 4, 'dexterity', 0.7, 20, 'dexterity', 8, 10);

-- Taunt (Charisma-based debuff - reduces enemy damage)
INSERT INTO abilities (id, name, description, type, category, level, base_id, primary_stat, stat_scaling, cooldown, damage_min, damage_max) VALUES
(7, 'Taunt I', 'Distract the enemy with your wit, confusing them briefly', 'ability', 'damage', 1, 7, 'charisma', 0.5, 15, 1, 3),
(8, 'Taunt II', 'A more clever distraction', 'ability', 'damage', 2, 7, 'charisma', 0.8, 15, 2, 5),
(9, 'Taunt III', 'A masterful display of wit and charm', 'ability', 'damage', 3, 7, 'charisma', 1.2, 15, 4, 8);

-- SPELLS (Mana cost, no cooldown)

-- Fireball (Intelligence-based damage)
INSERT INTO abilities (id, name, description, type, category, level, base_id, primary_stat, stat_scaling, mana_cost, damage_min, damage_max) VALUES
(10, 'Fireball I', 'Hurl a ball of fire at your enemy', 'spell', 'damage', 1, 10, 'intelligence', 1.0, 15, 8, 12),
(11, 'Fireball II', 'A larger, hotter fireball', 'spell', 'damage', 2, 10, 'intelligence', 1.5, 25, 12, 20),
(12, 'Fireball III', 'An inferno of magical flame', 'spell', 'damage', 3, 10, 'intelligence', 2.0, 35, 18, 30);

-- Heal (Wisdom-based healing)
INSERT INTO abilities (id, name, description, type, category, level, base_id, primary_stat, stat_scaling, mana_cost, healing) VALUES
(13, 'Heal I', 'Restore health with divine magic', 'spell', 'heal', 1, 13, 'wisdom', 1.0, 20, 20),
(14, 'Heal II', 'Restore more health', 'spell', 'heal', 2, 13, 'wisdom', 1.5, 30, 35),
(15, 'Heal III', 'Greatly restore health', 'spell', 'heal', 3, 13, 'wisdom', 2.0, 40, 50);

-- Blessing (Wisdom-based constitution buff)
INSERT INTO abilities (id, name, description, type, category, level, base_id, primary_stat, stat_scaling, mana_cost, buff_stat, buff_amount, buff_duration) VALUES
(16, 'Blessing I', 'Increase your constitution with divine power', 'spell', 'buff', 1, 16, 'wisdom', 0.4, 25, 'constitution', 3, 15),
(17, 'Blessing II', 'A greater blessing', 'spell', 'buff', 2, 16, 'wisdom', 0.6, 35, 'constitution', 5, 15),
(18, 'Blessing III', 'Divine protection', 'spell', 'buff', 3, 16, 'wisdom', 0.8, 45, 'constitution', 8, 15);

-- Add ability scroll items
INSERT INTO items (name, description, type, slot, rarity, stackable, value, teaches_ability_id) VALUES
('Scroll: Kick I', 'Teaches you the Kick I ability', 'consumable', null, 'common', 1, 50, 1),
('Scroll: Kick II', 'Teaches you the Kick II ability', 'consumable', null, 'uncommon', 1, 150, 2),
('Scroll: Kick III', 'Teaches you the Kick III ability', 'consumable', null, 'rare', 1, 400, 3),

('Scroll: Dodge I', 'Teaches you the Dodge I ability', 'consumable', null, 'common', 1, 50, 4),
('Scroll: Dodge II', 'Teaches you the Dodge II ability', 'consumable', null, 'uncommon', 1, 150, 5),
('Scroll: Dodge III', 'Teaches you the Dodge III ability', 'consumable', null, 'rare', 1, 400, 6),

('Scroll: Taunt I', 'Teaches you the Taunt I ability', 'consumable', null, 'common', 1, 50, 7),
('Scroll: Taunt II', 'Teaches you the Taunt II ability', 'consumable', null, 'uncommon', 1, 150, 8),
('Scroll: Taunt III', 'Teaches you the Taunt III ability', 'consumable', null, 'rare', 1, 400, 9),

('Scroll: Fireball I', 'Teaches you the Fireball I spell', 'consumable', null, 'common', 1, 75, 10),
('Scroll: Fireball II', 'Teaches you the Fireball II spell', 'consumable', null, 'uncommon', 1, 200, 11),
('Scroll: Fireball III', 'Teaches you the Fireball III spell', 'consumable', null, 'rare', 1, 500, 12),

('Scroll: Heal I', 'Teaches you the Heal I spell', 'consumable', null, 'common', 1, 75, 13),
('Scroll: Heal II', 'Teaches you the Heal II spell', 'consumable', null, 'uncommon', 1, 200, 14),
('Scroll: Heal III', 'Teaches you the Heal III spell', 'consumable', null, 'rare', 1, 500, 15),

('Scroll: Blessing I', 'Teaches you the Blessing I spell', 'consumable', null, 'common', 1, 75, 16),
('Scroll: Blessing II', 'Teaches you the Blessing II spell', 'consumable', null, 'uncommon', 1, 200, 17),
('Scroll: Blessing III', 'Teaches you the Blessing III spell', 'consumable', null, 'rare', 1, 500, 18);

-- Add ability scrolls to mob loot tables
-- Rat drops (low level scrolls)
INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max) VALUES
(1, 16, 0.05, 1, 1); -- Scroll: Kick I (5% chance)

-- Goblin drops (tier 1 abilities)
INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max) VALUES
(2, 16, 0.10, 1, 1), -- Scroll: Kick I
(2, 19, 0.10, 1, 1), -- Scroll: Dodge I
(2, 25, 0.08, 1, 1); -- Scroll: Fireball I

-- Wolf drops
INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max) VALUES
(3, 19, 0.12, 1, 1), -- Scroll: Dodge I
(3, 22, 0.08, 1, 1); -- Scroll: Taunt I

-- Skeleton drops (tier 1-2)
INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max) VALUES
(4, 28, 0.10, 1, 1), -- Scroll: Heal I
(4, 17, 0.08, 1, 1); -- Scroll: Kick II

-- Orc drops (tier 2)
INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max) VALUES
(5, 17, 0.12, 1, 1), -- Scroll: Kick II
(5, 20, 0.10, 1, 1), -- Scroll: Dodge II
(5, 26, 0.10, 1, 1); -- Scroll: Fireball II

-- Boar drops
INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max) VALUES
(6, 16, 0.08, 1, 1); -- Scroll: Kick I

-- Spider drops
INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max) VALUES
(7, 22, 0.10, 1, 1), -- Scroll: Taunt I
(7, 28, 0.08, 1, 1); -- Scroll: Heal I

-- Troll drops (tier 2-3, rare)
INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max) VALUES
(8, 18, 0.15, 1, 1), -- Scroll: Kick III
(8, 27, 0.12, 1, 1), -- Scroll: Fireball III
(8, 29, 0.10, 1, 1); -- Scroll: Heal II
