-- Add crafting material loot table for named mobs (bosses)
-- Allows named mobs to drop rare crafting materials

CREATE TABLE IF NOT EXISTS named_mob_crafting_loot (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  named_mob_id INTEGER NOT NULL,
  material_id INTEGER NOT NULL,
  drop_chance REAL NOT NULL DEFAULT 0.5, -- 50% base drop rate for bosses
  min_quantity INTEGER NOT NULL DEFAULT 1,
  max_quantity INTEGER NOT NULL DEFAULT 2,
  FOREIGN KEY (named_mob_id) REFERENCES named_mobs(id) ON DELETE CASCADE,
  FOREIGN KEY (material_id) REFERENCES crafting_materials(id) ON DELETE CASCADE
);

-- Add rare materials to named mobs (bosses)
-- Strategy: Higher level bosses drop better/more materials
-- Early bosses (5-20): 1 rare material type each
-- Mid bosses (24-40): 2 rare material types
-- Late bosses (44+): All 3 rare materials

-- Gnarlroot (Level 5) - Dragon Scale (for early weapon crafting)
INSERT INTO named_mob_crafting_loot (named_mob_id, material_id, drop_chance, min_quantity, max_quantity)
VALUES (7, 18, 0.35, 1, 1);

-- Shadowfang (Level 8) - Dragon Scale
INSERT INTO named_mob_crafting_loot (named_mob_id, material_id, drop_chance, min_quantity, max_quantity)
VALUES (8, 18, 0.4, 1, 1);

-- Gorak Stonefist (Level 12) - Adamantite Ore (for armor crafting)
INSERT INTO named_mob_crafting_loot (named_mob_id, material_id, drop_chance, min_quantity, max_quantity)
VALUES (9, 19, 0.4, 1, 1);

-- Vexmora (Level 16) - Ethereal Silk (for cloth/alchemy)
INSERT INTO named_mob_crafting_loot (named_mob_id, material_id, drop_chance, min_quantity, max_quantity)
VALUES (10, 20, 0.45, 1, 1);

-- Brimstone (Level 20) - Dragon Scale + Adamantite Ore
INSERT INTO named_mob_crafting_loot (named_mob_id, material_id, drop_chance, min_quantity, max_quantity)
VALUES (11, 18, 0.45, 1, 1), (11, 19, 0.45, 1, 1);

-- Frostmaw (Level 24) - Dragon Scale + Ethereal Silk
INSERT INTO named_mob_crafting_loot (named_mob_id, material_id, drop_chance, min_quantity, max_quantity)
VALUES (14, 18, 0.5, 1, 2), (14, 20, 0.5, 1, 1);

-- Sylvanas Darkbow (Level 28) - Adamantite Ore + Ethereal Silk
INSERT INTO named_mob_crafting_loot (named_mob_id, material_id, drop_chance, min_quantity, max_quantity)
VALUES (15, 19, 0.5, 1, 2), (15, 20, 0.5, 1, 1);

-- Vermithrax (Level 32) - All 3 rare materials
INSERT INTO named_mob_crafting_loot (named_mob_id, material_id, drop_chance, min_quantity, max_quantity)
VALUES 
  (16, 18, 0.55, 1, 2),
  (16, 19, 0.55, 1, 2),
  (16, 20, 0.55, 1, 1);

-- Leviathan Prime (Level 36) - All 3 rare materials
INSERT INTO named_mob_crafting_loot (named_mob_id, material_id, drop_chance, min_quantity, max_quantity)
VALUES 
  (17, 18, 0.6, 1, 2),
  (17, 19, 0.6, 1, 2),
  (17, 20, 0.6, 1, 2);

-- Azrael (Level 40) - All 3 rare materials (guaranteed 1-2 each)
INSERT INTO named_mob_crafting_loot (named_mob_id, material_id, drop_chance, min_quantity, max_quantity)
VALUES 
  (18, 18, 0.65, 1, 2),
  (18, 19, 0.65, 1, 2),
  (18, 20, 0.65, 1, 2);

-- Diabolus (Level 44) - All 3 rare materials (high quantity)
INSERT INTO named_mob_crafting_loot (named_mob_id, material_id, drop_chance, min_quantity, max_quantity)
VALUES 
  (19, 18, 0.7, 1, 3),
  (19, 19, 0.7, 1, 3),
  (19, 20, 0.7, 1, 2);

-- The Paradox (Level 48) - All 3 rare materials
INSERT INTO named_mob_crafting_loot (named_mob_id, material_id, drop_chance, min_quantity, max_quantity)
VALUES 
  (20, 18, 0.75, 2, 3),
  (20, 19, 0.75, 2, 3),
  (20, 20, 0.75, 1, 2);

-- Primordius (Level 52) - All 3 rare materials (guaranteed multiple)
INSERT INTO named_mob_crafting_loot (named_mob_id, material_id, drop_chance, min_quantity, max_quantity)
VALUES 
  (21, 18, 0.8, 2, 3),
  (21, 19, 0.8, 2, 3),
  (21, 20, 0.8, 2, 3);

-- The Nothingness (Level 56) - All 3 rare materials (high quantity)
INSERT INTO named_mob_crafting_loot (named_mob_id, material_id, drop_chance, min_quantity, max_quantity)
VALUES 
  (22, 18, 0.85, 2, 4),
  (22, 19, 0.85, 2, 4),
  (22, 20, 0.85, 2, 3);

-- Kronos (Level 60) - All 3 rare materials (guaranteed high quantity)
INSERT INTO named_mob_crafting_loot (named_mob_id, material_id, drop_chance, min_quantity, max_quantity)
VALUES 
  (23, 18, 0.9, 2, 4),
  (23, 19, 0.9, 2, 4),
  (23, 20, 0.9, 2, 4);

-- Oblivion (Level 65) - All 3 rare materials (maximum rewards)
INSERT INTO named_mob_crafting_loot (named_mob_id, material_id, drop_chance, min_quantity, max_quantity)
VALUES 
  (24, 18, 1.0, 3, 5),
  (24, 19, 1.0, 3, 5),
  (24, 20, 1.0, 3, 5);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_named_mob_crafting_loot_named_mob ON named_mob_crafting_loot(named_mob_id);
