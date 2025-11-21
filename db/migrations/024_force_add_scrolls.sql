-- FORCE ADD SCROLLS - manually insert scroll items
-- Clear any existing scrolls first
DELETE FROM items WHERE teaches_ability_id IS NOT NULL;

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
