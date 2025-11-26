-- Rebalance Loot Drop Rates
-- Problem: Too many equipment items dropping, inflating loot tables
-- Solution: Drastically reduce equipment drops while keeping consumables high
-- Strategy:
--   - Common equipment: 12% -> 2% (divide by 6)
--   - Uncommon equipment: 8% -> 1.5% (divide by 5.3)
--   - Rare equipment: 5% -> 1% (divide by 5)
--   - Epic equipment: 3% -> 0.6% (divide by 5)
--   - Legendary equipment: 1.5% -> 0.3% (divide by 5)
--   - Scrolls: Reduce by ~70% (divide by 3.3)
--   - Consumables: Keep unchanged (they're fine)

-- ============================================
-- EQUIPMENT (ARMOR & WEAPONS) - Reduce by 80-85%
-- ============================================

-- Common equipment: 12% -> 2%
UPDATE mob_loot
SET drop_chance = ROUND(drop_chance / 6.0, 4)
WHERE item_id IN (
  SELECT id FROM items 
  WHERE type IN ('armor', 'weapon') 
  AND rarity = 'common'
);

-- Uncommon equipment: 8% -> 1.5%
UPDATE mob_loot
SET drop_chance = ROUND(drop_chance / 5.3, 4)
WHERE item_id IN (
  SELECT id FROM items 
  WHERE type IN ('armor', 'weapon') 
  AND rarity = 'uncommon'
);

-- Rare equipment: 5% -> 1%
UPDATE mob_loot
SET drop_chance = ROUND(drop_chance / 5.0, 4)
WHERE item_id IN (
  SELECT id FROM items 
  WHERE type IN ('armor', 'weapon') 
  AND rarity = 'rare'
);

-- Epic equipment: 3% -> 0.6%
UPDATE mob_loot
SET drop_chance = ROUND(drop_chance / 5.0, 4)
WHERE item_id IN (
  SELECT id FROM items 
  WHERE type IN ('armor', 'weapon') 
  AND rarity = 'epic'
);

-- Legendary equipment: 1.5% -> 0.3%
UPDATE mob_loot
SET drop_chance = ROUND(drop_chance / 5.0, 4)
WHERE item_id IN (
  SELECT id FROM items 
  WHERE type IN ('armor', 'weapon') 
  AND rarity = 'legendary'
);

-- ============================================
-- SCROLLS - Reduce by ~70%
-- ============================================

UPDATE mob_loot
SET drop_chance = ROUND(drop_chance / 3.3, 4)
WHERE item_id IN (
  SELECT id FROM items 
  WHERE type = 'scroll'
);

-- ============================================
-- CONSUMABLES - Keep unchanged
-- ============================================
-- No changes to consumables (potions, food, etc.)
-- These should remain plentiful

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Show new drop rates by rarity
SELECT 
  i.rarity,
  i.type,
  COUNT(*) as item_count,
  ROUND(AVG(ml.drop_chance) * 100, 2) || '%' as avg_drop_rate,
  ROUND(MIN(ml.drop_chance) * 100, 2) || '%' as min_drop_rate,
  ROUND(MAX(ml.drop_chance) * 100, 2) || '%' as max_drop_rate
FROM mob_loot ml
JOIN items i ON ml.item_id = i.id
WHERE i.type IN ('armor', 'weapon')
GROUP BY i.rarity, i.type
ORDER BY 
  CASE i.rarity 
    WHEN 'common' THEN 1
    WHEN 'uncommon' THEN 2
    WHEN 'rare' THEN 3
    WHEN 'epic' THEN 4
    WHEN 'legendary' THEN 5
  END;

-- Show scroll drop rates
SELECT 
  i.rarity,
  COUNT(*) as scroll_count,
  ROUND(AVG(ml.drop_chance) * 100, 2) || '%' as avg_drop_rate
FROM mob_loot ml
JOIN items i ON ml.item_id = i.id
WHERE i.type = 'scroll'
GROUP BY i.rarity
ORDER BY 
  CASE i.rarity 
    WHEN 'common' THEN 1
    WHEN 'uncommon' THEN 2
    WHEN 'rare' THEN 3
    WHEN 'epic' THEN 4
    WHEN 'legendary' THEN 5
  END;

-- Sample: What would a high-level mob drop now?
SELECT 
  i.name,
  i.type,
  i.rarity,
  ROUND(ml.drop_chance * 100, 2) || '%' as drop_chance
FROM mob_loot ml
JOIN items i ON ml.item_id = i.id
WHERE ml.mob_id = (SELECT id FROM mobs WHERE name = 'Oblivion Walker' LIMIT 1)
ORDER BY i.type, i.rarity, i.name
LIMIT 30;
