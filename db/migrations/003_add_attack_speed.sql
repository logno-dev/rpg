-- Add attack_speed column to items
ALTER TABLE items ADD COLUMN attack_speed REAL DEFAULT 1.0;

-- Add attack_speed column to mobs  
ALTER TABLE mobs ADD COLUMN attack_speed REAL DEFAULT 1.0;

-- Update existing items with attack speeds
UPDATE items SET attack_speed = 1.0 WHERE name = 'Rusty Sword';
UPDATE items SET attack_speed = 1.2 WHERE name = 'Iron Sword';
UPDATE items SET attack_speed = 1.1 WHERE name = 'Steel Sword';
UPDATE items SET attack_speed = 0.8 WHERE name = 'Wooden Staff';
UPDATE items SET attack_speed = 0.9 WHERE name = 'Mage Staff';

-- Update existing mobs with attack speeds
UPDATE mobs SET attack_speed = 1.4 WHERE name = 'Giant Rat';
UPDATE mobs SET attack_speed = 1.1 WHERE name = 'Goblin';
UPDATE mobs SET attack_speed = 1.3 WHERE name = 'Wolf';
UPDATE mobs SET attack_speed = 0.9 WHERE name = 'Skeleton';
UPDATE mobs SET attack_speed = 0.8 WHERE name = 'Orc';
UPDATE mobs SET attack_speed = 1.0 WHERE name = 'Wild Boar';
UPDATE mobs SET attack_speed = 1.5 WHERE name = 'Forest Spider';
UPDATE mobs SET attack_speed = 0.7 WHERE name = 'Cave Troll';
