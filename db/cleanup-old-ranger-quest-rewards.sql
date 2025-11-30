-- Remove ranger scroll rewards from non-ranger quests
-- These were added before the dedicated ranger quests were created

DELETE FROM quest_rewards 
WHERE reward_type = 'item' 
AND reward_item_id IN (
  SELECT id FROM items 
  WHERE name LIKE 'Scroll: %Shot%' 
  OR name LIKE 'Scroll: %Arrow%' 
  OR name LIKE 'Scroll: %Fire%'
)
AND quest_id NOT IN (
  SELECT id FROM quests 
  WHERE name LIKE '%Archery%' 
  OR name LIKE '%Ranger%'
);
