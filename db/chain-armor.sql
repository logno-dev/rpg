-- Chain Armor for STR/DEX Hybrid Builds
-- Levels 1-60, all slots (head, chest, hands, feet)
-- Balanced STR and DEX bonuses with moderate armor

-- LEVEL 1-10 - Common tier
INSERT INTO items (name, description, type, slot, rarity, armor, strength_bonus, dexterity_bonus, required_level, value, stackable) VALUES
-- Head
('Rusty Chain Coif', 'Chain armor providing balanced protection and mobility.', 'armor', 'head', 'common', 3, 1, 1, 1, 15, 0),
('Chain Coif', 'Chain armor providing balanced protection and mobility.', 'armor', 'head', 'common', 5, 2, 2, 5, 35, 0),
('Reinforced Chain Coif', 'Chain armor providing balanced protection and mobility.', 'armor', 'head', 'common', 7, 3, 3, 8, 55, 0),
-- Chest
('Rusty Chainmail', 'Chain armor providing balanced protection and mobility.', 'armor', 'chest', 'common', 5, 2, 1, 1, 20, 0),
('Chainmail Hauberk', 'Chain armor providing balanced protection and mobility.', 'armor', 'chest', 'common', 8, 3, 2, 5, 50, 0),
('Reinforced Chainmail', 'Chain armor providing balanced protection and mobility.', 'armor', 'chest', 'common', 11, 4, 3, 8, 75, 0),
-- Hands
('Chain Gloves', 'Chain armor providing balanced protection and mobility.', 'armor', 'hands', 'common', 2, 1, 1, 1, 12, 0),
('Chain Gauntlets', 'Chain armor providing balanced protection and mobility.', 'armor', 'hands', 'common', 4, 2, 2, 5, 30, 0),
('Reinforced Chain Gauntlets', 'Chain armor providing balanced protection and mobility.', 'armor', 'hands', 'common', 5, 3, 3, 8, 50, 0),
-- Feet
('Chain Boots', 'Chain armor providing balanced protection and mobility.', 'armor', 'feet', 'common', 2, 1, 1, 1, 12, 0),
('Chain Sabatons', 'Chain armor providing balanced protection and mobility.', 'armor', 'feet', 'common', 4, 2, 2, 5, 30, 0),
('Reinforced Chain Sabatons', 'Chain armor providing balanced protection and mobility.', 'armor', 'feet', 'common', 5, 3, 3, 8, 50, 0);

-- LEVEL 11-20 - Uncommon tier
INSERT INTO items (name, description, type, slot, rarity, armor, strength_bonus, dexterity_bonus, required_level, value, stackable) VALUES
-- Head
('Steel Chain Coif', 'Chain armor providing balanced protection and mobility.', 'armor', 'head', 'uncommon', 9, 4, 4, 11, 80, 0),
('Linked Chain Helm', 'Chain armor providing balanced protection and mobility.', 'armor', 'head', 'uncommon', 12, 6, 5, 15, 120, 0),
('Veteran''s Chain Helm', 'Chain armor providing balanced protection and mobility.', 'armor', 'head', 'uncommon', 15, 7, 6, 18, 160, 0),
-- Chest
('Steel Chainmail', 'Chain armor providing balanced protection and mobility.', 'armor', 'chest', 'uncommon', 14, 5, 4, 11, 110, 0),
('Linked Chainmail', 'Chain armor providing balanced protection and mobility.', 'armor', 'chest', 'uncommon', 18, 7, 6, 15, 160, 0),
('Veteran''s Chainmail', 'Chain armor providing balanced protection and mobility.', 'armor', 'chest', 'uncommon', 22, 9, 7, 18, 210, 0),
-- Hands
('Steel Chain Gauntlets', 'Chain armor providing balanced protection and mobility.', 'armor', 'hands', 'uncommon', 7, 4, 4, 11, 65, 0),
('Linked Chain Gauntlets', 'Chain armor providing balanced protection and mobility.', 'armor', 'hands', 'uncommon', 9, 6, 5, 15, 95, 0),
('Veteran''s Chain Gauntlets', 'Chain armor providing balanced protection and mobility.', 'armor', 'hands', 'uncommon', 11, 7, 6, 18, 125, 0),
-- Feet
('Steel Chain Sabatons', 'Chain armor providing balanced protection and mobility.', 'armor', 'feet', 'uncommon', 7, 4, 4, 11, 65, 0),
('Linked Chain Sabatons', 'Chain armor providing balanced protection and mobility.', 'armor', 'feet', 'uncommon', 9, 6, 5, 15, 95, 0),
('Veteran''s Chain Sabatons', 'Chain armor providing balanced protection and mobility.', 'armor', 'feet', 'uncommon', 11, 7, 6, 18, 125, 0);

-- LEVEL 21-30 - Rare tier
INSERT INTO items (name, description, type, slot, rarity, armor, strength_bonus, dexterity_bonus, required_level, value, stackable) VALUES
-- Head
('Knight''s Chain Helm', 'Chain armor providing balanced protection and mobility.', 'armor', 'head', 'rare', 18, 9, 7, 21, 220, 0),
('Dragonscale Chain Helm', 'Chain armor providing balanced protection and mobility.', 'armor', 'head', 'rare', 22, 11, 9, 25, 300, 0),
('Tempest Chain Helm', 'Chain armor providing balanced protection and mobility.', 'armor', 'head', 'rare', 26, 13, 11, 28, 380, 0),
-- Chest
('Knight''s Chainmail', 'Chain armor providing balanced protection and mobility.', 'armor', 'chest', 'rare', 26, 11, 9, 21, 280, 0),
('Dragonscale Chainmail', 'Chain armor providing balanced protection and mobility.', 'armor', 'chest', 'rare', 32, 14, 11, 25, 380, 0),
('Tempest Chainmail', 'Chain armor providing balanced protection and mobility.', 'armor', 'chest', 'rare', 38, 16, 13, 28, 480, 0),
-- Hands
('Knight''s Chain Gauntlets', 'Chain armor providing balanced protection and mobility.', 'armor', 'hands', 'rare', 13, 9, 7, 21, 170, 0),
('Dragonscale Chain Gauntlets', 'Chain armor providing balanced protection and mobility.', 'armor', 'hands', 'rare', 16, 11, 9, 25, 230, 0),
('Tempest Chain Gauntlets', 'Chain armor providing balanced protection and mobility.', 'armor', 'hands', 'rare', 19, 13, 11, 28, 290, 0),
-- Feet
('Knight''s Chain Sabatons', 'Chain armor providing balanced protection and mobility.', 'armor', 'feet', 'rare', 13, 9, 7, 21, 170, 0),
('Dragonscale Chain Sabatons', 'Chain armor providing balanced protection and mobility.', 'armor', 'feet', 'rare', 16, 11, 9, 25, 230, 0),
('Tempest Chain Sabatons', 'Chain armor providing balanced protection and mobility.', 'armor', 'feet', 'rare', 19, 13, 11, 28, 290, 0);

-- LEVEL 31-40 - Epic tier
INSERT INTO items (name, description, type, slot, rarity, armor, strength_bonus, dexterity_bonus, required_level, value, stackable) VALUES
-- Head
('Warlord''s Chain Helm', 'Chain armor providing balanced protection and mobility.', 'armor', 'head', 'epic', 30, 15, 12, 31, 480, 0),
('Titanforged Chain Helm', 'Chain armor providing balanced protection and mobility.', 'armor', 'head', 'epic', 35, 18, 15, 35, 620, 0),
('Stormbringer Chain Helm', 'Chain armor providing balanced protection and mobility.', 'armor', 'head', 'epic', 40, 21, 17, 38, 760, 0),
-- Chest
('Warlord''s Chainmail', 'Chain armor providing balanced protection and mobility.', 'armor', 'chest', 'epic', 44, 19, 15, 31, 600, 0),
('Titanforged Chainmail', 'Chain armor providing balanced protection and mobility.', 'armor', 'chest', 'epic', 52, 23, 18, 35, 780, 0),
('Stormbringer Chainmail', 'Chain armor providing balanced protection and mobility.', 'armor', 'chest', 'epic', 60, 26, 21, 38, 960, 0),
-- Hands
('Warlord''s Chain Gauntlets', 'Chain armor providing balanced protection and mobility.', 'armor', 'hands', 'epic', 22, 15, 12, 31, 370, 0),
('Titanforged Chain Gauntlets', 'Chain armor providing balanced protection and mobility.', 'armor', 'hands', 'epic', 26, 18, 15, 35, 480, 0),
('Stormbringer Chain Gauntlets', 'Chain armor providing balanced protection and mobility.', 'armor', 'hands', 'epic', 30, 21, 17, 38, 590, 0),
-- Feet
('Warlord''s Chain Sabatons', 'Chain armor providing balanced protection and mobility.', 'armor', 'feet', 'epic', 22, 15, 12, 31, 370, 0),
('Titanforged Chain Sabatons', 'Chain armor providing balanced protection and mobility.', 'armor', 'feet', 'epic', 26, 18, 15, 35, 480, 0),
('Stormbringer Chain Sabatons', 'Chain armor providing balanced protection and mobility.', 'armor', 'feet', 'epic', 30, 21, 17, 38, 590, 0);

-- LEVEL 41-50 - Epic tier (high-end)
INSERT INTO items (name, description, type, slot, rarity, armor, strength_bonus, dexterity_bonus, required_level, value, stackable) VALUES
-- Head
('Dreadnought Chain Helm', 'Chain armor providing balanced protection and mobility.', 'armor', 'head', 'epic', 45, 24, 19, 41, 920, 0),
('Vanguard Chain Helm', 'Chain armor providing balanced protection and mobility.', 'armor', 'head', 'epic', 52, 28, 22, 45, 1100, 0),
('Adamant Chain Helm', 'Chain armor providing balanced protection and mobility.', 'armor', 'head', 'epic', 58, 32, 25, 48, 1280, 0),
-- Chest
('Dreadnought Chainmail', 'Chain armor providing balanced protection and mobility.', 'armor', 'chest', 'epic', 68, 30, 24, 41, 1160, 0),
('Vanguard Chainmail', 'Chain armor providing balanced protection and mobility.', 'armor', 'chest', 'epic', 78, 35, 28, 45, 1380, 0),
('Adamant Chainmail', 'Chain armor providing balanced protection and mobility.', 'armor', 'chest', 'epic', 88, 40, 31, 48, 1600, 0),
-- Hands
('Dreadnought Chain Gauntlets', 'Chain armor providing balanced protection and mobility.', 'armor', 'hands', 'epic', 34, 24, 19, 41, 710, 0),
('Vanguard Chain Gauntlets', 'Chain armor providing balanced protection and mobility.', 'armor', 'hands', 'epic', 39, 28, 22, 45, 850, 0),
('Adamant Chain Gauntlets', 'Chain armor providing balanced protection and mobility.', 'armor', 'hands', 'epic', 44, 32, 25, 48, 990, 0),
-- Feet
('Dreadnought Chain Sabatons', 'Chain armor providing balanced protection and mobility.', 'armor', 'feet', 'epic', 34, 24, 19, 41, 710, 0),
('Vanguard Chain Sabatons', 'Chain armor providing balanced protection and mobility.', 'armor', 'feet', 'epic', 39, 28, 22, 45, 850, 0),
('Adamant Chain Sabatons', 'Chain armor providing balanced protection and mobility.', 'armor', 'feet', 'epic', 44, 32, 25, 48, 990, 0);

-- LEVEL 51-60 - Legendary tier
INSERT INTO items (name, description, type, slot, rarity, armor, strength_bonus, dexterity_bonus, required_level, value, stackable) VALUES
-- Head
('Mythril Chain Helm', 'Chain armor providing balanced protection and mobility.', 'armor', 'head', 'legendary', 65, 36, 28, 51, 1500, 0),
('Godforged Chain Helm', 'Chain armor providing balanced protection and mobility.', 'armor', 'head', 'legendary', 74, 42, 33, 55, 1800, 0),
('Eternal Warlord''s Chain Helm', 'Chain armor providing balanced protection and mobility.', 'armor', 'head', 'legendary', 85, 50, 38, 60, 2200, 0),
-- Chest
('Mythril Chainmail', 'Chain armor providing balanced protection and mobility.', 'armor', 'chest', 'legendary', 98, 45, 35, 51, 1900, 0),
('Godforged Chainmail', 'Chain armor providing balanced protection and mobility.', 'armor', 'chest', 'legendary', 112, 52, 41, 55, 2300, 0),
('Eternal Warlord''s Chainmail', 'Chain armor providing balanced protection and mobility.', 'armor', 'chest', 'legendary', 130, 62, 48, 60, 2800, 0),
-- Hands
('Mythril Chain Gauntlets', 'Chain armor providing balanced protection and mobility.', 'armor', 'hands', 'legendary', 49, 36, 28, 51, 1160, 0),
('Godforged Chain Gauntlets', 'Chain armor providing balanced protection and mobility.', 'armor', 'hands', 'legendary', 56, 42, 33, 55, 1400, 0),
('Eternal Warlord''s Chain Gauntlets', 'Chain armor providing balanced protection and mobility.', 'armor', 'hands', 'legendary', 65, 50, 38, 60, 1700, 0),
-- Feet
('Mythril Chain Sabatons', 'Chain armor providing balanced protection and mobility.', 'armor', 'feet', 'legendary', 49, 36, 28, 51, 1160, 0),
('Godforged Chain Sabatons', 'Chain armor providing balanced protection and mobility.', 'armor', 'feet', 'legendary', 56, 42, 33, 55, 1400, 0),
('Eternal Warlord''s Chain Sabatons', 'Chain armor providing balanced protection and mobility.', 'armor', 'feet', 'legendary', 65, 50, 38, 60, 1700, 0);
