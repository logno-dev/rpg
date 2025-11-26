-- Bard Merchant Inventory
-- Distributes bard equipment and scrolls across merchants in regions 1-5
-- Strategy: Early merchants sell common/uncommon, later merchants sell rare/epic/legendary
-- Note: Only 1 merchant per region, so combining equipment + scrolls per merchant

-- ============================================
-- REGION 1 MERCHANT (Levels 1-10)
-- ============================================

-- Region 1 - Starting Instruments, Armor & Basic Scrolls
INSERT INTO merchant_inventory (merchant_id, item_id, stock)
SELECT 
  (SELECT id FROM merchants WHERE region_id = 1),
  id,
  -1
FROM items 
WHERE name IN (
  'Wooden Lute',
  'Tin Whistle',
  'Apprentice''s Flute',
  'Performer''s Cap',
  'Jester''s Tunic',
  'Silk Gloves',
  'Dancing Shoes',
  'Scroll of Sonic Blast',
  'Scroll of Discordant Note I',
  'Scroll of Melody of Mending I'
);

-- ============================================
-- REGION 2 MERCHANT (Levels 11-20)
-- ============================================

-- Region 2 - Uncommon Instruments, Armor & Tier II Scrolls
INSERT INTO merchant_inventory (merchant_id, item_id, stock)
SELECT 
  (SELECT id FROM merchants WHERE region_id = 2),
  id,
  -1
FROM items 
WHERE name IN (
  'Cedar Mandolin',
  'Brass Horn',
  'Maple Lute',
  'Silver Flute',
  'Enchanted Harp',
  'Scroll of Discordant Note II',
  'Scroll of Cacophony I',
  'Scroll of Melody of Mending II',
  'Scroll of Ballad of Restoration I',
  'Scroll of Thunderous Chord',
  'Scroll of Crescendo'
);

-- Region 2 - Uncommon Armor (11-20)
INSERT INTO merchant_inventory (merchant_id, item_id, stock)
SELECT 
  (SELECT id FROM merchants WHERE region_id = 2),
  id,
  -1
FROM items 
WHERE type = 'armor' 
  AND slot IN ('head', 'chest', 'hands', 'feet')
  AND charisma_bonus > 0
  AND required_level BETWEEN 11 AND 20
  AND rarity = 'uncommon';

-- ============================================
-- REGION 3 MERCHANT (Levels 21-30)
-- ============================================

-- Region 3 - Rare Instruments & Tier III Scrolls
INSERT INTO merchant_inventory (merchant_id, item_id, stock)
SELECT 
  (SELECT id FROM merchants WHERE region_id = 3),
  id,
  -1
FROM items 
WHERE name IN (
  'War Drums',
  'Masterwork Violin',
  'Elven Lyre',
  'Crystal Horn',
  'Scroll of Discordant Note III',
  'Scroll of Cacophony II',
  'Scroll of Dirge of Despair I',
  'Scroll of Melody of Mending III',
  'Scroll of Ballad of Restoration II',
  'Scroll of Hymn of Renewal I',
  'Scroll of Shattering Resonance',
  'Scroll of Harmonic Convergence'
);

-- Region 3 - Rare Armor (21-30)
INSERT INTO merchant_inventory (merchant_id, item_id, stock)
SELECT 
  (SELECT id FROM merchants WHERE region_id = 3),
  id,
  -1
FROM items 
WHERE type = 'armor' 
  AND slot IN ('head', 'chest', 'hands', 'feet')
  AND charisma_bonus > 0
  AND required_level BETWEEN 21 AND 30
  AND rarity IN ('rare', 'uncommon');

-- ============================================
-- REGION 4 MERCHANT (Levels 31-40)
-- ============================================

-- Region 4 - Epic Instruments & Tier IV-V Scrolls
INSERT INTO merchant_inventory (merchant_id, item_id, stock)
SELECT 
  (SELECT id FROM merchants WHERE region_id = 4),
  id,
  -1
FROM items 
WHERE name IN (
  'Songweaver''s Harp',
  'Drums of Thunder',
  'Archmage''s Lute',
  'Siren''s Flute',
  'Scroll of Discordant Note IV',
  'Scroll of Cacophony III',
  'Scroll of Dirge of Despair II',
  'Scroll of Hymn of Renewal II',
  'Scroll of Cataclysmic Chorus',
  'Scroll of Symphony of Destruction'
);

-- Region 4 - Epic Armor (31-40)
INSERT INTO merchant_inventory (merchant_id, item_id, stock)
SELECT 
  (SELECT id FROM merchants WHERE region_id = 4),
  id,
  -1
FROM items 
WHERE type = 'armor' 
  AND slot IN ('head', 'chest', 'hands', 'feet')
  AND charisma_bonus > 0
  AND required_level BETWEEN 31 AND 40
  AND rarity IN ('epic', 'rare');

-- ============================================
-- REGION 5 MERCHANT (Levels 41-60)
-- ============================================

-- Region 5 - Legendary Instruments & High Tier Scrolls
INSERT INTO merchant_inventory (merchant_id, item_id, stock)
SELECT 
  (SELECT id FROM merchants WHERE region_id = 5),
  id,
  -1
FROM items 
WHERE name IN (
  'Celestial Harp',
  'Titan''s Horn',
  'Dreadlord''s Lute',
  'Phoenix Pipes',
  'Starfall Harp',
  'Warlord''s War Horn',
  'Godvoice Lute',
  'Worldsong Harp',
  'Eternal Symphony Horn',
  'Infinity''s Echo',
  'Scroll of Cacophony IV',
  'Scroll of Dirge of Despair III',
  'Scroll of Hymn of Renewal III',
  'Scroll of Apocalyptic Aria',
  'Scroll of Worldending Symphony',
  'Scroll of Divine Anthem',
  'Scroll of Eternal Lifesong'
);

-- Region 5 - Legendary Armor (41-60)
INSERT INTO merchant_inventory (merchant_id, item_id, stock)
SELECT 
  (SELECT id FROM merchants WHERE region_id = 5),
  id,
  -1
FROM items 
WHERE type = 'armor' 
  AND slot IN ('head', 'chest', 'hands', 'feet')
  AND charisma_bonus > 0
  AND required_level BETWEEN 41 AND 60
  AND rarity IN ('legendary', 'epic');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check how many bard items each region's merchants have
SELECT 
  m.region_id,
  COUNT(DISTINCT mi.item_id) as unique_items,
  SUM(CASE WHEN mi.stock = -1 THEN 1 ELSE mi.stock END) as total_stock
FROM merchant_inventory mi
JOIN merchants m ON m.id = mi.merchant_id
JOIN items i ON i.id = mi.item_id
WHERE i.charisma_bonus > 0 OR i.name LIKE '%Scroll of%'
GROUP BY m.region_id
ORDER BY m.region_id;

-- Show what each merchant sells
SELECT 
  m.region_id,
  m.id as merchant_id,
  i.name,
  i.rarity,
  i.required_level,
  mi.stock
FROM merchant_inventory mi
JOIN merchants m ON m.id = mi.merchant_id
JOIN items i ON i.id = mi.item_id
WHERE i.charisma_bonus > 0 OR i.name LIKE '%Scroll of%'
ORDER BY m.region_id, m.id, i.required_level;
