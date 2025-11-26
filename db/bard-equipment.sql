-- Bard Equipment System
-- Charisma (primary) + Strength/Dexterity (secondary)
-- For performers, enchanters, and buffer/support builds

-- ============================================
-- INSTRUMENTS (Offhand - Musical Items)
-- ============================================

-- Level 1-10 - Common
INSERT INTO items (name, description, type, slot, rarity, armor, charisma_bonus, strength_bonus, dexterity_bonus, required_level, value, stackable) VALUES
('Wooden Lute', 'A simple wooden lute that amplifies the performer''s charm and presence.', 'armor', 'offhand', 'common', 1, 2, 1, 0, 1, 20, 0),
('Tin Whistle', 'A basic tin whistle for beginning performers.', 'armor', 'offhand', 'common', 1, 3, 0, 1, 3, 40, 0),
('Apprentice''s Flute', 'A well-crafted flute for aspiring bards.', 'armor', 'offhand', 'common', 2, 4, 1, 1, 5, 60, 0),
('Cedar Mandolin', 'A lightweight mandolin made from aromatic cedar.', 'armor', 'offhand', 'uncommon', 2, 5, 1, 2, 8, 90, 0),
('Brass Horn', 'A polished brass horn with commanding presence.', 'armor', 'offhand', 'uncommon', 3, 6, 2, 1, 10, 120, 0);

-- Level 11-20 - Uncommon
INSERT INTO items (name, description, type, slot, rarity, armor, charisma_bonus, strength_bonus, dexterity_bonus, required_level, value, stackable) VALUES
('Maple Lute', 'A quality lute crafted from fine maple wood.', 'armor', 'offhand', 'uncommon', 3, 8, 3, 2, 11, 150, 0),
('Silver Flute', 'A gleaming silver flute with pure, clear tones.', 'armor', 'offhand', 'uncommon', 4, 10, 2, 3, 13, 200, 0),
('Enchanted Harp', 'A small harp imbued with minor enchantments.', 'armor', 'offhand', 'uncommon', 5, 12, 3, 3, 15, 250, 0),
('War Drums', 'Thunderous drums that inspire allies to battle.', 'armor', 'offhand', 'uncommon', 6, 14, 4, 2, 17, 300, 0),
('Masterwork Violin', 'An expertly crafted violin with perfect acoustics.', 'armor', 'offhand', 'uncommon', 7, 16, 4, 4, 19, 350, 0);

-- Level 21-30 - Rare
INSERT INTO items (name, description, type, slot, rarity, armor, charisma_bonus, strength_bonus, dexterity_bonus, required_level, value, stackable) VALUES
('Elven Lyre', 'An ancient elven instrument of legendary beauty.', 'armor', 'offhand', 'rare', 8, 20, 6, 5, 21, 450, 0),
('Crystal Horn', 'A horn carved from a single massive crystal.', 'armor', 'offhand', 'rare', 9, 24, 7, 6, 24, 550, 0),
('Songweaver''s Harp', 'A magical harp that weaves songs into reality.', 'armor', 'offhand', 'rare', 10, 28, 8, 7, 27, 650, 0),
('Drums of Thunder', 'Primal drums that echo with the power of storms.', 'armor', 'offhand', 'rare', 11, 32, 9, 6, 29, 750, 0);

-- Level 31-40 - Epic
INSERT INTO items (name, description, type, slot, rarity, armor, charisma_bonus, strength_bonus, dexterity_bonus, required_level, value, stackable) VALUES
('Archmage''s Lute', 'A legendary lute once owned by the greatest bards.', 'armor', 'offhand', 'epic', 12, 38, 11, 9, 31, 900, 0),
('Siren''s Flute', 'A flute said to contain the voice of a siren.', 'armor', 'offhand', 'epic', 14, 44, 13, 10, 34, 1100, 0),
('Celestial Harp', 'A harp strung with threads from the heavens.', 'armor', 'offhand', 'epic', 16, 50, 14, 12, 37, 1300, 0),
('Titan''s Horn', 'A massive horn carved from a titan''s tusk.', 'armor', 'offhand', 'epic', 18, 56, 16, 11, 39, 1500, 0);

-- Level 41-50 - Epic (high-end)
INSERT INTO items (name, description, type, slot, rarity, armor, charisma_bonus, strength_bonus, dexterity_bonus, required_level, value, stackable) VALUES
('Dreadlord''s Lute', 'A dark instrument that commands fear and respect.', 'armor', 'offhand', 'epic', 20, 64, 19, 14, 41, 1800, 0),
('Phoenix Pipes', 'Pan pipes that burst with flames and renewal.', 'armor', 'offhand', 'epic', 22, 72, 21, 16, 44, 2100, 0),
('Starfall Harp', 'A harp that plays melodies of falling stars.', 'armor', 'offhand', 'epic', 24, 80, 24, 18, 47, 2400, 0),
('Warlord''s War Horn', 'A commanding horn that rallies entire armies.', 'armor', 'offhand', 'epic', 26, 88, 26, 17, 49, 2700, 0);

-- Level 51-60 - Legendary
INSERT INTO items (name, description, type, slot, rarity, armor, charisma_bonus, strength_bonus, dexterity_bonus, required_level, value, stackable) VALUES
('Godvoice Lute', 'A divine lute said to speak with the voice of gods.', 'armor', 'offhand', 'legendary', 28, 100, 30, 22, 51, 3200, 0),
('Worldsong Harp', 'The legendary harp that sang the world into being.', 'armor', 'offhand', 'legendary', 32, 115, 35, 25, 55, 3800, 0),
('Eternal Symphony Horn', 'A horn that plays the eternal song of creation.', 'armor', 'offhand', 'legendary', 36, 130, 40, 28, 58, 4400, 0),
('Infinity''s Echo', 'The ultimate instrument, echoing across all time.', 'armor', 'offhand', 'legendary', 40, 150, 45, 32, 60, 5000, 0);

-- ============================================
-- BARD ARMOR (Head, Chest, Hands, Feet)
-- Uses existing chain armor but adds CHA-focused pieces
-- ============================================

-- Level 1-10 - Common (Performance Garb)
INSERT INTO items (name, description, type, slot, rarity, armor, charisma_bonus, strength_bonus, dexterity_bonus, required_level, value, stackable) VALUES
('Performer''s Cap', 'A colorful cap that draws attention.', 'armor', 'head', 'common', 2, 2, 1, 1, 1, 15, 0),
('Jester''s Tunic', 'A vibrant tunic for entertainers.', 'armor', 'chest', 'common', 4, 3, 1, 1, 1, 25, 0),
('Silk Gloves', 'Delicate gloves for nimble fingers.', 'armor', 'hands', 'common', 1, 2, 0, 2, 1, 12, 0),
('Dancing Shoes', 'Light footwear for graceful movement.', 'armor', 'feet', 'common', 1, 2, 1, 1, 1, 12, 0),

('Minstrel''s Hat', 'An elegant hat adorned with a feather.', 'armor', 'head', 'common', 4, 3, 2, 2, 5, 40, 0),
('Troubadour''s Vest', 'A well-fitted vest for traveling performers.', 'armor', 'chest', 'common', 6, 4, 2, 2, 5, 60, 0),
('Entertainer''s Gloves', 'Fine gloves that enhance dexterity.', 'armor', 'hands', 'common', 3, 3, 1, 2, 5, 35, 0),
('Bard''s Boots', 'Comfortable boots for long journeys.', 'armor', 'feet', 'common', 3, 3, 2, 1, 5, 35, 0),

('Decorated Beret', 'An artistically decorated beret.', 'armor', 'head', 'common', 5, 4, 2, 3, 8, 60, 0),
('Embroidered Doublet', 'A doublet with intricate embroidery.', 'armor', 'chest', 'common', 8, 5, 3, 3, 8, 85, 0),
('Virtuoso''s Gloves', 'Gloves that improve musical precision.', 'armor', 'hands', 'common', 4, 4, 2, 3, 8, 55, 0),
('Performer''s Footwear', 'Stylish footwear for stage presence.', 'armor', 'feet', 'common', 4, 4, 2, 2, 8, 55, 0);

-- Level 11-20 - Uncommon (Enchanted Performance Attire)
INSERT INTO items (name, description, type, slot, rarity, armor, charisma_bonus, strength_bonus, dexterity_bonus, required_level, value, stackable) VALUES
('Crown of Melodies', 'A crown that hums with musical energy.', 'armor', 'head', 'uncommon', 7, 6, 3, 4, 11, 100, 0),
('Harmonious Chainmail', 'Chain armor that chimes melodiously.', 'armor', 'chest', 'uncommon', 12, 8, 4, 4, 11, 140, 0),
('Conductor''s Gauntlets', 'Gauntlets imbued with leadership.', 'armor', 'hands', 'uncommon', 6, 6, 3, 4, 11, 80, 0),
('Rhythm Boots', 'Boots that keep perfect time.', 'armor', 'feet', 'uncommon', 6, 6, 3, 4, 11, 80, 0),

('Maestro''s Circlet', 'A circlet that enhances presence.', 'armor', 'head', 'uncommon', 10, 8, 4, 5, 15, 150, 0),
('Songsteel Hauberk', 'Chain armor forged with magical songs.', 'armor', 'chest', 'uncommon', 16, 11, 5, 6, 15, 200, 0),
('Spellsong Gloves', 'Gloves that weave magic into music.', 'armor', 'hands', 'uncommon', 8, 8, 4, 5, 15, 120, 0),
('Cadence Sabatons', 'Heavy boots that march to an inner beat.', 'armor', 'feet', 'uncommon', 8, 8, 4, 5, 15, 120, 0),

('Enchanter''s Crown', 'A crown that mesmerizes onlookers.', 'armor', 'head', 'uncommon', 13, 10, 5, 6, 18, 200, 0),
('Mesmerizing Chainmail', 'Armor that captivates attention.', 'armor', 'chest', 'uncommon', 20, 13, 6, 7, 18, 270, 0),
('Charmer''s Gauntlets', 'Gauntlets that enhance persuasion.', 'armor', 'hands', 'uncommon', 10, 10, 5, 6, 18, 160, 0),
('Hypnotic Boots', 'Boots with an entrancing rhythm.', 'armor', 'feet', 'uncommon', 10, 10, 5, 6, 18, 160, 0);

-- Level 21-30 - Rare (Legendary Performance Gear)
INSERT INTO items (name, description, type, slot, rarity, armor, charisma_bonus, strength_bonus, dexterity_bonus, required_level, value, stackable) VALUES
('Siren''s Diadem', 'A diadem that projects an irresistible aura.', 'armor', 'head', 'rare', 16, 14, 7, 8, 21, 280, 0),
('Spellweave Hauberk', 'Chainmail woven with enchantments.', 'armor', 'chest', 'rare', 24, 17, 9, 10, 21, 360, 0),
('Maestro''s Grips', 'Gauntlets of a legendary conductor.', 'armor', 'hands', 'rare', 12, 14, 7, 8, 21, 220, 0),
('Tempo Treads', 'Boots that control the pace of battle.', 'armor', 'feet', 'rare', 12, 14, 7, 8, 21, 220, 0),

('Bardic Crown', 'The crown of ancient bardic kings.', 'armor', 'head', 'rare', 20, 18, 9, 10, 25, 380, 0),
('Resonance Chainmail', 'Armor that resonates with power.', 'armor', 'chest', 'rare', 30, 22, 11, 12, 25, 480, 0),
('Harmony Gauntlets', 'Gauntlets that bring balance.', 'armor', 'hands', 'rare', 15, 18, 9, 10, 25, 290, 0),
('Symphony Sabatons', 'Boots that complete the ensemble.', 'armor', 'feet', 'rare', 15, 18, 9, 10, 25, 290, 0),

('Crown of Legends', 'A crown worn by the greatest bards.', 'armor', 'head', 'rare', 24, 22, 11, 12, 28, 480, 0),
('Mythsong Hauberk', 'Chainmail that sings of ancient myths.', 'armor', 'chest', 'rare', 36, 26, 13, 14, 28, 600, 0),
('Legend''s Grips', 'Gauntlets of legendary performers.', 'armor', 'hands', 'rare', 18, 22, 11, 12, 28, 370, 0),
('Fable Treads', 'Boots that walk through legend.', 'armor', 'feet', 'rare', 18, 22, 11, 12, 28, 370, 0);

-- Level 31-40 - Epic
INSERT INTO items (name, description, type, slot, rarity, armor, charisma_bonus, strength_bonus, dexterity_bonus, required_level, value, stackable) VALUES
('Archbard''s Coronet', 'The coronet of the greatest bard who ever lived.', 'armor', 'head', 'epic', 28, 28, 14, 15, 31, 600, 0),
('Celestial Songmail', 'Armor blessed by celestial muses.', 'armor', 'chest', 'epic', 42, 34, 17, 18, 31, 780, 0),
('Divinity''s Grasp', 'Gauntlets touched by divine inspiration.', 'armor', 'hands', 'epic', 21, 28, 14, 15, 31, 470, 0),
('Inspiration Treads', 'Boots that inspire greatness.', 'armor', 'feet', 'epic', 21, 28, 14, 15, 31, 470, 0),

('Worldsinger''s Crown', 'A crown that commands all who hear.', 'armor', 'head', 'epic', 33, 34, 17, 18, 35, 780, 0),
('Titanforged Songmail', 'Chainmail forged by titans.', 'armor', 'chest', 'epic', 50, 42, 20, 21, 35, 980, 0),
('Titan''s Grasp', 'Gauntlets of immense power.', 'armor', 'hands', 'epic', 25, 34, 17, 18, 35, 600, 0),
('Colossus Treads', 'Boots that shake the earth.', 'armor', 'feet', 'epic', 25, 34, 17, 18, 35, 600, 0),

('Stormsinger''s Helm', 'A helm that channels the storm''s fury.', 'armor', 'head', 'epic', 38, 40, 19, 21, 38, 960, 0),
('Thundersong Mail', 'Armor that crackles with energy.', 'armor', 'chest', 'epic', 58, 48, 23, 24, 38, 1200, 0),
('Storm Grips', 'Gauntlets wreathed in lightning.', 'armor', 'hands', 'epic', 29, 40, 19, 21, 38, 740, 0),
('Thunder Treads', 'Boots that echo with thunder.', 'armor', 'feet', 'epic', 29, 40, 19, 21, 38, 740, 0);

-- Level 41-50 - Epic (high-end)
INSERT INTO items (name, description, type, slot, rarity, armor, charisma_bonus, strength_bonus, dexterity_bonus, required_level, value, stackable) VALUES
('Dreadlord''s Crown', 'A crown that instills fear and awe.', 'armor', 'head', 'epic', 43, 46, 22, 24, 41, 1150, 0),
('Dreadnought Songmail', 'Unstoppable armor of dark majesty.', 'armor', 'chest', 'epic', 66, 56, 27, 28, 41, 1450, 0),
('Dread Gauntlets', 'Gauntlets of terrible power.', 'armor', 'hands', 'epic', 33, 46, 22, 24, 41, 890, 0),
('Dread Sabatons', 'Boots that crush hope.', 'armor', 'feet', 'epic', 33, 46, 22, 24, 41, 890, 0),

('Vanguard''s Diadem', 'The diadem of those who lead.', 'armor', 'head', 'epic', 50, 54, 26, 28, 45, 1380, 0),
('Vanguard Songmail', 'Armor of the first and finest.', 'armor', 'chest', 'epic', 76, 66, 32, 33, 45, 1730, 0),
('Vanguard Grips', 'Gauntlets of leadership.', 'armor', 'hands', 'epic', 38, 54, 26, 28, 45, 1070, 0),
('Vanguard Treads', 'Boots that march ahead.', 'armor', 'feet', 'epic', 38, 54, 26, 28, 45, 1070, 0),

('Adamant Performer''s Crown', 'An unbreakable crown of pure charisma.', 'armor', 'head', 'epic', 56, 62, 30, 31, 48, 1600, 0),
('Adamant Songmail', 'The strongest bardic armor ever made.', 'armor', 'chest', 'epic', 86, 76, 36, 38, 48, 2000, 0),
('Adamant Grips', 'Gauntlets of absolute control.', 'armor', 'hands', 'epic', 43, 62, 30, 31, 48, 1240, 0),
('Adamant Treads', 'Boots of unyielding will.', 'armor', 'feet', 'epic', 43, 62, 30, 31, 48, 1240, 0);

-- Level 51-60 - Legendary
INSERT INTO items (name, description, type, slot, rarity, armor, charisma_bonus, strength_bonus, dexterity_bonus, required_level, value, stackable) VALUES
('Mythril Muse''s Crown', 'A crown blessed by the muses themselves.', 'armor', 'head', 'legendary', 64, 72, 35, 36, 51, 1900, 0),
('Mythril Songweave', 'Legendary armor woven from pure song.', 'armor', 'chest', 'legendary', 98, 88, 42, 44, 51, 2400, 0),
('Mythril Muse Grips', 'Gauntlets of divine inspiration.', 'armor', 'hands', 'legendary', 48, 72, 35, 36, 51, 1460, 0),
('Mythril Muse Treads', 'Boots blessed by celestial dancers.', 'armor', 'feet', 'legendary', 48, 72, 35, 36, 51, 1460, 0),

('Godforged Bardic Crown', 'The crown of the god of music.', 'armor', 'head', 'legendary', 73, 84, 41, 42, 55, 2260, 0),
('Godforged Songmail', 'Armor forged in divine harmony.', 'armor', 'chest', 'legendary', 112, 103, 49, 51, 55, 2880, 0),
('Godforged Grips', 'Gauntlets of godly presence.', 'armor', 'hands', 'legendary', 56, 84, 41, 42, 55, 1750, 0),
('Godforged Treads', 'Boots that walk among gods.', 'armor', 'feet', 'legendary', 56, 84, 41, 42, 55, 1750, 0),

('Eternal Bard''s Crown', 'The crown of the eternal song.', 'armor', 'head', 'legendary', 84, 100, 48, 50, 60, 2760, 0),
('Eternal Songmail', 'Armor that exists beyond time.', 'armor', 'chest', 'legendary', 130, 122, 58, 60, 60, 3520, 0),
('Eternal Grips', 'Gauntlets of timeless mastery.', 'armor', 'hands', 'legendary', 65, 100, 48, 50, 60, 2140, 0),
('Eternal Treads', 'Boots that dance through eternity.', 'armor', 'feet', 'legendary', 65, 100, 48, 50, 60, 2140, 0);
