-- This script adds loot tables and crafting recipes for all new tank and DEX equipment
-- Items range from ID 1433-1561

-- First, let's identify boss-only items by their names
-- Tank Boss Items: Guardian Shield, Bulwark of the Mountain, Warlord Faceplate, Infernal Warhelm
--                  Gorak Iron Fists, Vexmora Crushing Grips, Flame Lord Molten Grips
--                  Shadowfang Treads, Infernal Sabatons
-- DEX Boss Items: Assassin Cowl, Nightstalker Mask, Shadowfang Grips, Gorak Nimble Fingers
--                 Vexmora Swift Hands, Gnarlroot Treads, Flame Lord Silent Steps

-- Add boss loot for specific named items
-- Guardian Shield (level 12) -> Gorak
INSERT INTO named_mob_loot (named_mob_id, item_id, drop_chance, min_quantity, max_quantity)
SELECT 9, id, 0.15, 1, 1 FROM items WHERE name = 'Guardian Shield';

-- Bulwark of the Mountain (level 18) -> Gorak
INSERT INTO named_mob_loot (named_mob_id, item_id, drop_chance, min_quantity, max_quantity)
SELECT 9, id, 0.15, 1, 1 FROM items WHERE name = 'Bulwark of the Mountain';

-- Warlord Faceplate (level 25) -> Frostmaw
INSERT INTO named_mob_loot (named_mob_id, item_id, drop_chance, min_quantity, max_quantity)
SELECT 14, id, 0.15, 1, 1 FROM items WHERE name = 'Warlord Faceplate';

-- Infernal Warhelm (level 40) -> Azrael
INSERT INTO named_mob_loot (named_mob_id, item_id, drop_chance, min_quantity, max_quantity)
SELECT 18, id, 0.15, 1, 1 FROM items WHERE name = 'Infernal Warhelm';

-- Gorak Iron Fists (level 18) -> Gorak
INSERT INTO named_mob_loot (named_mob_id, item_id, drop_chance, min_quantity, max_quantity)
SELECT 9, id, 0.15, 1, 1 FROM items WHERE name = 'Gorak Iron Fists';

-- Vexmora Crushing Grips (level 25) -> Vexmora  
INSERT INTO named_mob_loot (named_mob_id, item_id, drop_chance, min_quantity, max_quantity)
SELECT 10, id, 0.15, 1, 1 FROM items WHERE name = 'Vexmora Crushing Grips';

-- Flame Lord Molten Grips (level 40) -> Azrael
INSERT INTO named_mob_loot (named_mob_id, item_id, drop_chance, min_quantity, max_quantity)
SELECT 18, id, 0.15, 1, 1 FROM items WHERE name = 'Flame Lord Molten Grips';

-- Shadowfang Treads (level 12) -> Shadowfang
INSERT INTO named_mob_loot (named_mob_id, item_id, drop_chance, min_quantity, max_quantity)
SELECT 8, id, 0.15, 1, 1 FROM items WHERE name = 'Shadowfang Treads';

-- Infernal Sabatons (level 55) -> The Nothingness
INSERT INTO named_mob_loot (named_mob_id, item_id, drop_chance, min_quantity, max_quantity)
SELECT 22, id, 0.15, 1, 1 FROM items WHERE name = 'Infernal Sabatons';

-- DEX Boss Items
-- Assassin Cowl (level 25) -> Frostmaw
INSERT INTO named_mob_loot (named_mob_id, item_id, drop_chance, min_quantity, max_quantity)
SELECT 14, id, 0.15, 1, 1 FROM items WHERE name = 'Assassin Cowl';

-- Nightstalker Mask (level 40) -> Azrael
INSERT INTO named_mob_loot (named_mob_id, item_id, drop_chance, min_quantity, max_quantity)
SELECT 18, id, 0.15, 1, 1 FROM items WHERE name = 'Nightstalker Mask';

-- Shadowfang Grips (level 18) -> Shadowfang
INSERT INTO named_mob_loot (named_mob_id, item_id, drop_chance, min_quantity, max_quantity)
SELECT 8, id, 0.15, 1, 1 FROM items WHERE name = 'Shadowfang Grips';

-- Gorak Nimble Fingers (level 25) -> Gorak
INSERT INTO named_mob_loot (named_mob_id, item_id, drop_chance, min_quantity, max_quantity)
SELECT 9, id, 0.15, 1, 1 FROM items WHERE name = 'Gorak Nimble Fingers';

-- Vexmora Swift Hands (level 40) -> Vexmora
INSERT INTO named_mob_loot (named_mob_id, item_id, drop_chance, min_quantity, max_quantity)
SELECT 10, id, 0.15, 1, 1 FROM items WHERE name = 'Vexmora Swift Hands';

-- Gnarlroot Treads (level 12) -> Gnarlroot
INSERT INTO named_mob_loot (named_mob_id, item_id, drop_chance, min_quantity, max_quantity)
SELECT 7, id, 0.15, 1, 1 FROM items WHERE name = 'Gnarlroot Treads';

-- Flame Lord Silent Steps (level 55) -> The Nothingness
INSERT INTO named_mob_loot (named_mob_id, item_id, drop_chance, min_quantity, max_quantity)
SELECT 22, id, 0.15, 1, 1 FROM items WHERE name = 'Flame Lord Silent Steps';

