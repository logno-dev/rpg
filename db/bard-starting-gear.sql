-- Bard Starting Gear
-- Give new bard characters a starter instrument and basic performance outfit
-- Also give them starter songs (scrolls)

-- This script should be integrated into character creation
-- For now, we'll create a helper query that can be used to give items to a character

-- ============================================
-- STARTER EQUIPMENT ITEM IDs
-- ============================================
-- Wooden Lute (Level 1 instrument)
-- Performer's Cap (Level 1 head)
-- Jester's Tunic (Level 1 chest)
-- Silk Gloves (Level 1 hands)
-- Dancing Shoes (Level 1 feet)

-- Query to find starter item IDs
SELECT 
    id,
    name,
    slot,
    charisma_bonus,
    value
FROM items 
WHERE name IN (
    'Wooden Lute',
    'Performer''s Cap',
    'Jester''s Tunic', 
    'Silk Gloves',
    'Dancing Shoes'
)
ORDER BY slot;

-- ============================================
-- EXAMPLE: Give starter gear to character
-- ============================================
-- Replace {CHARACTER_ID} with actual character ID
-- This would be run when a player selects "Bard" class or allocates high CHA

/*
INSERT INTO character_inventory (character_id, item_id, quantity, equipped)
SELECT 
    {CHARACTER_ID},
    id,
    1,
    0
FROM items 
WHERE name IN (
    'Wooden Lute',
    'Performer''s Cap',
    'Jester''s Tunic',
    'Silk Gloves', 
    'Dancing Shoes'
);
*/

-- ============================================
-- ALTERNATIVE: Create a "Bard Starter Pack" item
-- ============================================
-- A special item that when used, grants all starter gear

INSERT INTO items (name, description, type, slot, rarity, value, stackable) VALUES
('Bard Starter Pack', 
 'A pack containing essential gear for aspiring bards. Use to receive: Wooden Lute, Performer''s Cap, Jester''s Tunic, Silk Gloves, and Dancing Shoes. Perfect for those with high Charisma!',
 'consumable',
 NULL,
 'common',
 0,
 0);

-- ============================================
-- RECOMMENDED STARTING SONGS
-- ============================================
-- Characters should start with these abilities:
-- - Sonic Blast (basic damage, 3 mana)
-- - Melody of Mending I (basic heal, 6 mana)

-- Query to find these ability IDs
SELECT 
    id,
    name,
    category,
    mana_cost,
    required_level
FROM abilities
WHERE name IN (
    'Sonic Blast',
    'Melody of Mending I'
)
AND primary_stat = 'charisma'
ORDER BY category, name;

-- ============================================
-- CHARACTER CREATION INTEGRATION
-- ============================================
-- Add this to the character creation API endpoint:
/*
-- 1. Detect if character has high CHA (e.g., CHA >= 15)
-- 2. If yes, insert starter bard gear:

INSERT INTO character_inventory (character_id, item_id, quantity, equipped)
SELECT 
    NEW_CHARACTER_ID,
    id,
    1,
    0
FROM items 
WHERE name IN (
    'Wooden Lute',
    'Performer''s Cap',
    'Jester''s Tunic',
    'Silk Gloves',
    'Dancing Shoes'
);

-- 3. Give starter abilities:
INSERT INTO character_abilities (character_id, ability_id)
SELECT 
    NEW_CHARACTER_ID,
    id
FROM abilities
WHERE name IN ('Sonic Blast', 'Melody of Mending I')
AND primary_stat = 'charisma';
*/
