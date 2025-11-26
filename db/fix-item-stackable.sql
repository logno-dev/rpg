-- Fix stackable column for all items
-- Only consumables and scrolls should be stackable (stackable = 1)
-- All equipment (armor, weapon) should not be stackable (stackable = 0)

-- Set all consumables as stackable
UPDATE items 
SET stackable = 1 
WHERE type = 'consumable';

-- Set all scrolls as stackable
UPDATE items 
SET stackable = 1 
WHERE type = 'scroll';

-- Set all armor as non-stackable
UPDATE items 
SET stackable = 0 
WHERE type = 'armor';

-- Set all weapons as non-stackable
UPDATE items 
SET stackable = 0 
WHERE type = 'weapon';

-- Verify the changes
SELECT type, 
       COUNT(*) as total_items,
       SUM(CASE WHEN stackable = 1 THEN 1 ELSE 0 END) as stackable_items,
       SUM(CASE WHEN stackable = 0 THEN 1 ELSE 0 END) as non_stackable_items
FROM items 
GROUP BY type 
ORDER BY type;
