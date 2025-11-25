-- Seed crafting materials

-- Common materials (frequent drops from regular mobs)
INSERT OR IGNORE INTO crafting_materials (name, description, rarity) VALUES
('Iron Ore', 'Raw iron ore used in blacksmithing', 'common'),
('Copper Ore', 'Base metal for crafting simple items', 'common'),
('Rough Leather', 'Untreated animal hide', 'common'),
('Cured Leather', 'Treated leather ready for crafting', 'common'),
('Linen Cloth', 'Basic woven fabric', 'common'),
('Wool Cloth', 'Warm textile material', 'common'),
('Wooden Planks', 'Shaped wood for crafting', 'common'),
('Feathers', 'Light feathers for fletching', 'common'),
('Minor Gemstone', 'Small decorative gem', 'common'),
('Herbs', 'Basic alchemical reagent', 'common');

-- Uncommon materials (rarer drops from higher level mobs/bosses)
INSERT OR IGNORE INTO crafting_materials (name, description, rarity) VALUES
('Steel Ingot', 'Refined and strengthened metal', 'uncommon'),
('Mithril Ore', 'Rare lightweight metal', 'uncommon'),
('Silk Cloth', 'Luxurious fine fabric', 'uncommon'),
('Enchanted Thread', 'Magically imbued sewing material', 'uncommon'),
('Ancient Wood', 'Aged hardwood with magical properties', 'uncommon'),
('Major Gemstone', 'Large precious stone', 'uncommon'),
('Rare Herbs', 'Potent alchemical ingredients', 'uncommon');

-- Rare materials (boss-only drops)
INSERT OR IGNORE INTO crafting_materials (name, description, rarity) VALUES
('Dragon Scale', 'Incredibly durable scale from a dragon', 'rare'),
('Adamantite Ore', 'The hardest metal known to exist', 'rare'),
('Ethereal Silk', 'Fabric woven from magical essence', 'rare');
