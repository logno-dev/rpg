-- Add requirement columns to abilities table
ALTER TABLE abilities ADD COLUMN required_strength INTEGER DEFAULT 0;
ALTER TABLE abilities ADD COLUMN required_dexterity INTEGER DEFAULT 0;
ALTER TABLE abilities ADD COLUMN required_constitution INTEGER DEFAULT 0;
ALTER TABLE abilities ADD COLUMN required_intelligence INTEGER DEFAULT 0;
ALTER TABLE abilities ADD COLUMN required_wisdom INTEGER DEFAULT 0;
ALTER TABLE abilities ADD COLUMN required_charisma INTEGER DEFAULT 0;
ALTER TABLE abilities ADD COLUMN required_level INTEGER DEFAULT 1;

-- Add requirement columns to items table
ALTER TABLE items ADD COLUMN required_strength INTEGER DEFAULT 0;
ALTER TABLE items ADD COLUMN required_dexterity INTEGER DEFAULT 0;
ALTER TABLE items ADD COLUMN required_constitution INTEGER DEFAULT 0;
ALTER TABLE items ADD COLUMN required_intelligence INTEGER DEFAULT 0;
ALTER TABLE items ADD COLUMN required_wisdom INTEGER DEFAULT 0;
ALTER TABLE items ADD COLUMN required_charisma INTEGER DEFAULT 0;
ALTER TABLE items ADD COLUMN required_level INTEGER DEFAULT 1;

-- Set requirements for abilities
-- Tier 1 Physical Abilities
UPDATE abilities SET required_strength = 10, required_level = 1 WHERE name = 'Kick I';
UPDATE abilities SET required_dexterity = 10, required_level = 1 WHERE name = 'Dodge I';
UPDATE abilities SET required_charisma = 10, required_level = 1 WHERE name = 'Taunt I';

-- Tier 2 Physical Abilities
UPDATE abilities SET required_strength = 15, required_level = 3 WHERE name = 'Kick II';
UPDATE abilities SET required_dexterity = 15, required_level = 3 WHERE name = 'Dodge II';
UPDATE abilities SET required_charisma = 15, required_level = 3 WHERE name = 'Taunt II';

-- Tier 3 Physical Abilities
UPDATE abilities SET required_strength = 20, required_level = 5 WHERE name = 'Kick III';
UPDATE abilities SET required_dexterity = 20, required_level = 5 WHERE name = 'Dodge III';
UPDATE abilities SET required_charisma = 20, required_level = 5 WHERE name = 'Taunt III';

-- Tier 1 Spells
UPDATE abilities SET required_intelligence = 10, required_level = 1 WHERE name = 'Fireball I';
UPDATE abilities SET required_wisdom = 10, required_level = 1 WHERE name = 'Heal I';
UPDATE abilities SET required_wisdom = 10, required_intelligence = 8, required_level = 1 WHERE name = 'Blessing I';

-- Tier 2 Spells
UPDATE abilities SET required_intelligence = 15, required_level = 3 WHERE name = 'Fireball II';
UPDATE abilities SET required_wisdom = 15, required_level = 3 WHERE name = 'Heal II';
UPDATE abilities SET required_wisdom = 15, required_intelligence = 12, required_level = 3 WHERE name = 'Blessing II';

-- Tier 3 Spells
UPDATE abilities SET required_intelligence = 20, required_level = 5 WHERE name = 'Fireball III';
UPDATE abilities SET required_wisdom = 20, required_level = 5 WHERE name = 'Heal III';
UPDATE abilities SET required_wisdom = 20, required_intelligence = 16, required_level = 5 WHERE name = 'Blessing III';

-- Set requirements for weapons (based on type and power)
-- Basic weapons - no requirements
UPDATE items SET required_strength = 0 WHERE name IN ('Rusty Sword', 'Wooden Club', 'Training Dagger');
UPDATE items SET required_intelligence = 0 WHERE name IN ('Wooden Staff');

-- Tier 2 weapons (Level 2-3)
UPDATE items SET required_strength = 12, required_level = 2 WHERE name = 'Iron Sword';
UPDATE items SET required_dexterity = 12, required_level = 2 WHERE name IN ('Hunter Bow', 'Forest Blade');
UPDATE items SET required_intelligence = 12, required_level = 2 WHERE name = 'Mage Staff';

-- Tier 3 weapons (Level 3-4)
UPDATE items SET required_strength = 15, required_level = 3 WHERE name = 'Steel Sword';

-- Tier 4 weapons (Level 4-5)
UPDATE items SET required_strength = 18, required_level = 4 WHERE name IN ('Battle Axe', 'War Hammer');

-- Epic weapons (Level 5-6)
UPDATE items SET required_strength = 20, required_intelligence = 15, required_level = 5 WHERE name = 'Shadowblade';
UPDATE items SET required_intelligence = 22, required_level = 5 WHERE name = 'Staff of the Depths';

-- Set requirements for armor (heavier armor needs more strength/constitution)
-- Light armor - minimal requirements
UPDATE items SET required_level = 1 WHERE type = 'armor' AND name IN ('Cloth Armor', 'Padded Vest', 'Worn Boots', 'Cloth Gloves', 'Leather Boots', 'Leather Gloves');

-- Medium armor
UPDATE items SET required_constitution = 12, required_level = 2 WHERE name IN ('Leather Armor', 'Leather Helmet', 'Ranger Tunic', 'Ranger Hood');
UPDATE items SET required_intelligence = 10, required_level = 2 WHERE name = 'Apprentice Robes';

-- Heavy armor
UPDATE items SET required_strength = 14, required_constitution = 14, required_level = 3 WHERE name = 'Chainmail';
UPDATE items SET required_strength = 16, required_constitution = 16, required_level = 4 WHERE name IN ('Plate Armor', 'Steel Helm', 'Plate Gauntlets', 'Steel Boots');
UPDATE items SET required_constitution = 14, required_level = 3 WHERE name = 'Iron Helmet';

-- Mage armor
UPDATE items SET required_intelligence = 15, required_wisdom = 12, required_level = 4 WHERE name = 'Mage Robes';

-- Epic armor
UPDATE items SET required_strength = 20, required_constitution = 18, required_level = 5 WHERE name = 'Shadowplate';
UPDATE items SET required_intelligence = 20, required_wisdom = 18, required_level = 5 WHERE name = 'Archmage Vestments';
UPDATE items SET required_constitution = 16, required_level = 5 WHERE name = 'Crown of Shadows';
