-- Replace all "Mana Potion" (ids 14, 1792, 1802, 1812) with "Minor Mana Potion" (id 1349)
-- Similar to the health potion consolidation

BEGIN TRANSACTION;

-- 1. Update mob_loot table
UPDATE mob_loot 
SET item_id = 1349 
WHERE item_id IN (14, 1792, 1802, 1812);

-- 2. Update merchant_inventory table
UPDATE merchant_inventory 
SET item_id = 1349 
WHERE item_id IN (14, 1792, 1802, 1812);

-- 3. Update character_inventory table
-- For characters that have any of the old mana potions, combine them into Minor Mana Potion
UPDATE character_inventory 
SET item_id = 1349 
WHERE item_id IN (14, 1792, 1802, 1812);

-- 4. Update named_mob_loot table (if any exist)
UPDATE named_mob_loot 
SET item_id = 1349 
WHERE item_id IN (14, 1792, 1802, 1812);

-- 5. Update quest_rewards table (if any exist)
UPDATE quest_rewards 
SET reward_item_id = 1349 
WHERE reward_item_id IN (14, 1792, 1802, 1812);

-- 6. Update mob_crafting_loot table (if any exist)
UPDATE mob_crafting_loot 
SET item_id = 1349 
WHERE item_id IN (14, 1792, 1802, 1812);

-- 7. Update named_mob_crafting_loot table (if any exist)
UPDATE named_mob_crafting_loot 
SET item_id = 1349 
WHERE item_id IN (14, 1792, 1802, 1812);

-- 8. Update region_rare_loot table (if any exist)
UPDATE region_rare_loot 
SET item_id = 1349 
WHERE item_id IN (14, 1792, 1802, 1812);

-- 9. Delete the old "Mana Potion" items
DELETE FROM items WHERE id IN (14, 1792, 1802, 1812);

COMMIT;

-- Verification queries
SELECT 'mob_loot count' as check_name, COUNT(*) as count FROM mob_loot WHERE item_id = 1349
UNION ALL
SELECT 'merchant_inventory count', COUNT(*) FROM merchant_inventory WHERE item_id = 1349
UNION ALL
SELECT 'character_inventory count', COUNT(*) FROM character_inventory WHERE item_id = 1349
UNION ALL
SELECT 'remaining old mana potions', COUNT(*) FROM items WHERE id IN (14, 1792, 1802, 1812);
