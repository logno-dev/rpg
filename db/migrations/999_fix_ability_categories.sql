-- Fix Ability Categories to Match Types
-- Currently all abilities have category='combat' which makes them all purple
-- We should set category based on type for better visual distinction

BEGIN TRANSACTION;

-- Update categories to match ability types
UPDATE abilities
SET category = type
WHERE category = 'combat';

COMMIT;

-- Verification
SELECT 'Updated ability categories to match types' as '';
SELECT type, category, COUNT(*) as count
FROM abilities
GROUP BY type, category
ORDER BY type;

SELECT '' as '';
SELECT 'Sample abilities after update:' as '';
SELECT name, type, category
FROM abilities
WHERE name IN ('Strike I', 'Dodge I', 'Fireball I', 'Heal I', 'Iron Skin', 'Song of Courage I')
ORDER BY type, name;
