-- Bard Songs (Abilities) - Simplified for current schema
-- Charisma-scaling damage abilities (DOTs)
-- Buffs will need ability_effects table integration

-- ============================================
-- DAMAGE SONGS (Charisma-scaling DOT abilities)
-- ============================================

-- Tier I (Level 1-12) - Very low mana costs for low INT/WIS builds
INSERT INTO abilities (name, description, type, category, mana_cost, cooldown, damage_min, damage_max, required_level, primary_stat, stat_scaling, required_charisma, min_level) VALUES
('Discordant Note I', 'Strike a harsh note that deals damage over time. Scales with Charisma.', 'active', 'damage', 5, 8, 8, 12, 1, 'charisma', 0.5, 0, 1),
('Cacophony I', 'Unleash chaotic noise dealing damage over time. Scales with Charisma.', 'active', 'damage', 8, 10, 15, 22, 6, 'charisma', 0.6, 10, 6),
('Dirge of Despair I', 'Sing a mournful dirge dealing damage over time. Scales with Charisma.', 'active', 'damage', 10, 12, 25, 35, 10, 'charisma', 0.7, 15, 10);

-- Tier II (Level 14-26)
INSERT INTO abilities (name, description, type, category, mana_cost, cooldown, damage_min, damage_max, required_level, primary_stat, stat_scaling, required_charisma, min_level) VALUES
('Discordant Note II', 'Strike a painful note that deals significant damage over time. Scales with Charisma.', 'active', 'damage', 12, 10, 35, 48, 14, 'charisma', 0.8, 20, 14),
('Cacophony II', 'Unleash maddening noise dealing heavy damage over time. Scales with Charisma.', 'active', 'damage', 15, 12, 50, 70, 20, 'charisma', 0.9, 30, 20),
('Dirge of Despair II', 'Sing a soul-crushing dirge dealing massive damage over time. Scales with Charisma.', 'active', 'damage', 18, 14, 75, 100, 26, 'charisma', 1.0, 40, 26);

-- Tier III (Level 30-42)
INSERT INTO abilities (name, description, type, category, mana_cost, cooldown, damage_min, damage_max, required_level, primary_stat, stat_scaling, required_charisma, min_level) VALUES
('Scream of Anguish', 'A terrifying scream that deals devastating damage over time. Scales with Charisma.', 'active', 'damage', 22, 18, 100, 135, 30, 'charisma', 1.1, 50, 30),
('Discordant Note III', 'Strike a devastating note with powerful resonance. Scales with Charisma.', 'active', 'damage', 20, 12, 110, 145, 34, 'charisma', 1.0, 55, 34),
('Cacophony III', 'Unleash reality-breaking noise. Scales with Charisma.', 'active', 'damage', 25, 14, 150, 195, 39, 'charisma', 1.2, 65, 39);

-- Tier IV (Level 42-56)
INSERT INTO abilities (name, description, type, category, mana_cost, cooldown, damage_min, damage_max, required_level, primary_stat, stat_scaling, required_charisma, min_level) VALUES
('Dirge of Despair III', 'Sing a world-ending dirge of pure destruction. Scales with Charisma.', 'active', 'damage', 28, 16, 210, 265, 42, 'charisma', 1.3, 75, 42),
('Deathsong', 'The legendary song of endings. Scales with Charisma.', 'active', 'damage', 32, 22, 280, 350, 46, 'charisma', 1.4, 85, 46),
('Discordant Note IV', 'Strike a reality-shattering note. Scales with Charisma.', 'active', 'damage', 30, 14, 240, 305, 48, 'charisma', 1.2, 90, 48);

-- Tier V (Level 52-60)
INSERT INTO abilities (name, description, type, category, mana_cost, cooldown, damage_min, damage_max, required_level, primary_stat, stat_scaling, required_charisma, min_level) VALUES
('Cacophony IV', 'Unleash the chaos of creation. Scales with Charisma.', 'active', 'damage', 35, 16, 330, 415, 52, 'charisma', 1.5, 100, 52),
('Dirge of Despair IV', 'Sing the ultimate dirge of oblivion. Scales with Charisma.', 'active', 'damage', 40, 18, 450, 560, 56, 'charisma', 1.6, 115, 56),
('Requiem of Oblivion', 'The final song of destruction that ends all things. Scales with Charisma.', 'active', 'damage', 45, 25, 600, 750, 60, 'charisma', 1.8, 130, 60);

-- ============================================
-- HEALING SONGS (Charisma-scaling heals)
-- ============================================

-- Tier I-II - Low mana costs
INSERT INTO abilities (name, description, type, category, mana_cost, cooldown, healing, required_level, primary_stat, stat_scaling, required_charisma, min_level) VALUES
('Melody of Mending I', 'Play a soothing melody that heals over time. Scales with Charisma.', 'active', 'heal', 6, 30, 25, 2, 'charisma', 1.0, 5, 2),
('Ballad of Restoration I', 'Sing a healing ballad that restores health. Scales with Charisma.', 'active', 'heal', 10, 40, 45, 8, 'charisma', 1.1, 12, 8),
('Hymn of Renewal I', 'Chant a powerful renewal hymn. Scales with Charisma.', 'active', 'heal', 14, 50, 70, 12, 'charisma', 1.2, 18, 12);

-- Tier III
INSERT INTO abilities (name, description, type, category, mana_cost, cooldown, healing, required_level, primary_stat, stat_scaling, required_charisma, min_level) VALUES
('Melody of Mending II', 'Play an enchanting melody of restoration. Scales with Charisma.', 'active', 'heal', 16, 35, 95, 16, 'charisma', 1.3, 25, 16),
('Ballad of Restoration II', 'Sing a powerful healing ballad. Scales with Charisma.', 'active', 'heal', 20, 45, 135, 22, 'charisma', 1.4, 35, 22),
('Hymn of Renewal II', 'Chant a legendary renewal hymn. Scales with Charisma.', 'active', 'heal', 24, 55, 180, 28, 'charisma', 1.5, 45, 28),
('Song of Rejuvenation', 'A masterful song of complete restoration. Scales with Charisma.', 'active', 'heal', 28, 70, 250, 30, 'charisma', 1.6, 50, 30);

-- Tier IV-V
INSERT INTO abilities (name, description, type, category, mana_cost, cooldown, healing, required_level, primary_stat, stat_scaling, required_charisma, min_level) VALUES
('Melody of Mending III', 'Play a divine melody of healing. Scales with Charisma.', 'active', 'heal', 22, 40, 220, 32, 'charisma', 1.5, 60, 32),
('Ballad of Restoration III', 'Sing an epic healing ballad. Scales with Charisma.', 'active', 'heal', 26, 50, 310, 38, 'charisma', 1.7, 70, 38),
('Hymn of Renewal III', 'Chant the ultimate renewal hymn. Scales with Charisma.', 'active', 'heal', 32, 60, 420, 44, 'charisma', 1.8, 82, 44),
('Aria of Resurrection', 'The legendary healing aria. Scales with Charisma.', 'active', 'heal', 38, 90, 550, 50, 'charisma', 2.0, 95, 50),
('Eternal Lifesong', 'The song of immortality. Scales with Charisma.', 'active', 'heal', 45, 120, 750, 60, 'charisma', 2.2, 120, 60);

-- ============================================
-- BASIC ATTACK SONGS (Immediate damage + scaling)
-- ============================================

INSERT INTO abilities (name, description, type, category, mana_cost, cooldown, damage_min, damage_max, required_level, primary_stat, stat_scaling, required_charisma, min_level) VALUES
('Sonic Blast', 'Blast enemies with pure sound. Scales with Charisma.', 'active', 'damage', 3, 5, 5, 8, 1, 'charisma', 0.4, 0, 1),
('Resonant Strike', 'Strike with resonating force. Scales with Charisma.', 'active', 'damage', 5, 6, 12, 18, 5, 'charisma', 0.5, 8, 5),
('Harmonic Burst', 'Unleash harmonic energy. Scales with Charisma.', 'active', 'damage', 7, 7, 22, 32, 10, 'charisma', 0.6, 15, 10),
('Power Chord', 'Strike a devastating power chord. Scales with Charisma.', 'active', 'damage', 9, 8, 45, 62, 15, 'charisma', 0.7, 22, 15),
('Crescendo', 'Build to a devastating crescendo. Scales with Charisma.', 'active', 'damage', 12, 10, 85, 115, 20, 'charisma', 0.9, 32, 20),
('Fortissimo', 'The ultimate loud note. Scales with Charisma.', 'active', 'damage', 16, 12, 145, 190, 25, 'charisma', 1.0, 42, 25),
('Thunderous Chord', 'Shake the earth with sound. Scales with Charisma.', 'active', 'damage', 20, 14, 220, 280, 30, 'charisma', 1.2, 52, 30),
('Apocalyptic Aria', 'Sing the aria of the apocalypse. Scales with Charisma.', 'active', 'damage', 26, 18, 350, 440, 40, 'charisma', 1.4, 75, 40),
('Reality Shattering Note', 'A note that tears reality asunder. Scales with Charisma.', 'active', 'damage', 32, 22, 520, 650, 50, 'charisma', 1.6, 95, 50),
('Worldending Symphony', 'The symphony that ends worlds. Scales with Charisma.', 'active', 'damage', 40, 28, 750, 950, 60, 'charisma', 1.9, 125, 60);
