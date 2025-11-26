-- Bard Songs (Abilities)
-- Charisma-scaling buffs, DOTs, and HOTs
-- All abilities scale with CHA stat

-- ============================================
-- BUFF SONGS (Party/Self Buffs)
-- ============================================

-- Tier I - Level 1-10
INSERT INTO abilities (name, description, type, category, mana_cost, cooldown, required_level, primary_stat, buff_stat, buff_amount, buff_duration) VALUES
('Song of Courage I', 'Inspire allies with a rousing melody, increasing Strength by 5 for 30 seconds. Scales with Charisma.', 'active', 'buff', 15, 45, 1, 'charisma', 'strength', 5, 30),
('Song of Swiftness I', 'Play an energetic tune that increases Dexterity by 5 for 30 seconds. Scales with Charisma.', 'active', 'buff', 15, 45, 1, 'charisma', 'dexterity', 5, 30),
('Song of Fortitude I', 'Sing a hymn of endurance, increasing Constitution by 5 for 30 seconds. Scales with Charisma.', 'active', 'buff', 15, 45, 3, 'charisma', 'constitution', 5, 30),
('Song of Clarity I', 'Hum a melody of focus, increasing Intelligence by 5 for 30 seconds. Scales with Charisma.', 'active', 'buff', 15, 45, 5, 'charisma', 'intelligence', 5, 30),
('Song of Wisdom I', 'Chant an ancient verse, increasing Wisdom by 5 for 30 seconds. Scales with Charisma.', 'active', 'buff', 15, 45, 7, 'charisma', 'wisdom', 5, 30);

-- Tier II - Level 11-20
INSERT INTO abilities (name, description, mana_cost, cooldown, damage_min, damage_max, required_level, ability_type, scaling_stat) VALUES
('Song of Courage II', 'Inspire allies with a powerful melody, increasing Strength by 10% for 45 seconds. Scales with Charisma.', 25, 50, 0, 0, 11, 'buff', 'charisma'),
('Song of Swiftness II', 'Play a rapid tune that increases Dexterity by 10% for 45 seconds. Scales with Charisma.', 25, 50, 0, 0, 11, 'buff', 'charisma'),
('Song of Fortitude II', 'Sing a strong hymn, increasing Constitution by 10% for 45 seconds. Scales with Charisma.', 25, 50, 0, 0, 13, 'buff', 'charisma'),
('Song of Clarity II', 'Hum a clear melody, increasing Intelligence by 10% for 45 seconds. Scales with Charisma.', 25, 50, 0, 0, 15, 'buff', 'charisma'),
('Song of Wisdom II', 'Chant sacred verses, increasing Wisdom by 10% for 45 seconds. Scales with Charisma.', 25, 50, 0, 0, 17, 'buff', 'charisma'),
('Battle Hymn I', 'A rousing war song that increases all damage by 8% for 30 seconds. Scales with Charisma.', 30, 60, 0, 0, 15, 'buff', 'charisma'),
('Defender''s Chorus I', 'Sing a protective melody that increases armor by 15% for 30 seconds. Scales with Charisma.', 30, 60, 0, 0, 18, 'buff', 'charisma');

-- Tier III - Level 21-30
INSERT INTO abilities (name, description, mana_cost, cooldown, damage_min, damage_max, required_level, ability_type, scaling_stat) VALUES
('Song of Courage III', 'Inspire allies with an epic ballad, increasing Strength by 15% for 60 seconds. Scales with Charisma.', 40, 55, 0, 0, 21, 'buff', 'charisma'),
('Song of Swiftness III', 'Play a masterful tune that increases Dexterity by 15% for 60 seconds. Scales with Charisma.', 40, 55, 0, 0, 21, 'buff', 'charisma'),
('Song of Fortitude III', 'Sing a legendary hymn, increasing Constitution by 15% for 60 seconds. Scales with Charisma.', 40, 55, 0, 0, 23, 'buff', 'charisma'),
('Song of Clarity III', 'Hum an enlightening melody, increasing Intelligence by 15% for 60 seconds. Scales with Charisma.', 40, 55, 0, 0, 25, 'buff', 'charisma'),
('Song of Wisdom III', 'Chant divine verses, increasing Wisdom by 15% for 60 seconds. Scales with Charisma.', 40, 55, 0, 0, 27, 'buff', 'charisma'),
('Battle Hymn II', 'A thunderous war song that increases all damage by 12% for 45 seconds. Scales with Charisma.', 50, 65, 0, 0, 25, 'buff', 'charisma'),
('Defender''s Chorus II', 'Sing an unbreakable shield song that increases armor by 25% for 45 seconds. Scales with Charisma.', 50, 65, 0, 0, 28, 'buff', 'charisma'),
('Anthem of Heroes', 'Play an inspiring anthem that increases all stats by 8% for 30 seconds. Scales with Charisma.', 60, 90, 0, 0, 30, 'buff', 'charisma');

-- Tier IV - Level 31-40
INSERT INTO abilities (name, description, mana_cost, cooldown, damage_min, damage_max, required_level, ability_type, scaling_stat) VALUES
('Song of Courage IV', 'Inspire allies with a godlike melody, increasing Strength by 20% for 60 seconds. Scales with Charisma.', 55, 60, 0, 0, 31, 'buff', 'charisma'),
('Song of Swiftness IV', 'Play a perfect tune that increases Dexterity by 20% for 60 seconds. Scales with Charisma.', 55, 60, 0, 0, 31, 'buff', 'charisma'),
('Song of Fortitude IV', 'Sing an eternal hymn, increasing Constitution by 20% for 60 seconds. Scales with Charisma.', 55, 60, 0, 0, 33, 'buff', 'charisma'),
('Song of Clarity IV', 'Hum a transcendent melody, increasing Intelligence by 20% for 60 seconds. Scales with Charisma.', 55, 60, 0, 0, 35, 'buff', 'charisma'),
('Song of Wisdom IV', 'Chant celestial verses, increasing Wisdom by 20% for 60 seconds. Scales with Charisma.', 55, 60, 0, 0, 37, 'buff', 'charisma'),
('Battle Hymn III', 'An earth-shaking war song that increases all damage by 16% for 60 seconds. Scales with Charisma.', 70, 70, 0, 0, 35, 'buff', 'charisma'),
('Defender''s Chorus III', 'Sing a fortress song that increases armor by 35% for 60 seconds. Scales with Charisma.', 70, 70, 0, 0, 38, 'buff', 'charisma'),
('Symphony of Victory', 'Conduct a masterpiece that increases all stats by 12% and max health by 10% for 45 seconds. Scales with Charisma.', 85, 100, 0, 0, 40, 'buff', 'charisma');

-- Tier V - Level 41-60
INSERT INTO abilities (name, description, mana_cost, cooldown, damage_min, damage_max, required_level, ability_type, scaling_stat) VALUES
('Song of Courage V', 'Inspire allies with the ultimate battle anthem, increasing Strength by 25% for 90 seconds. Scales with Charisma.', 75, 65, 0, 0, 41, 'buff', 'charisma'),
('Song of Swiftness V', 'Play the song of legends, increasing Dexterity by 25% for 90 seconds. Scales with Charisma.', 75, 65, 0, 0, 41, 'buff', 'charisma'),
('Song of Fortitude V', 'Sing the hymn of immortals, increasing Constitution by 25% for 90 seconds. Scales with Charisma.', 75, 65, 0, 0, 43, 'buff', 'charisma'),
('Song of Clarity V', 'Hum the melody of creation, increasing Intelligence by 25% for 90 seconds. Scales with Charisma.', 75, 65, 0, 0, 45, 'buff', 'charisma'),
('Song of Wisdom V', 'Chant the verses of eternity, increasing Wisdom by 25% for 90 seconds. Scales with Charisma.', 75, 65, 0, 0, 47, 'buff', 'charisma'),
('Battle Hymn IV', 'The ultimate war cry that increases all damage by 20% for 90 seconds. Scales with Charisma.', 90, 75, 0, 0, 45, 'buff', 'charisma'),
('Defender''s Chorus IV', 'Sing the eternal wall, increasing armor by 45% for 90 seconds. Scales with Charisma.', 90, 75, 0, 0, 48, 'buff', 'charisma'),
('Worldsong', 'The legendary song that sang reality into being. Increases all stats by 18% and max HP/MP by 15% for 90 seconds. Scales with Charisma.', 120, 120, 0, 0, 50, 'buff', 'charisma'),
('Eternal Symphony', 'The song beyond time. Increases all stats by 25%, damage by 15%, and armor by 30% for 120 seconds. Scales with Charisma.', 150, 180, 0, 0, 60, 'buff', 'charisma');

-- ============================================
-- HEALING SONGS (HOTs - Heal Over Time)
-- ============================================

-- Tier I-II
INSERT INTO abilities (name, description, mana_cost, cooldown, damage_min, damage_max, required_level, ability_type, scaling_stat) VALUES
('Melody of Mending I', 'Play a soothing melody that heals 5% of max health over 15 seconds. Scales with Charisma.', 20, 30, 0, 0, 2, 'heal', 'charisma'),
('Ballad of Restoration I', 'Sing a healing ballad that restores 8% of max health over 20 seconds. Scales with Charisma.', 35, 40, 0, 0, 8, 'heal', 'charisma'),
('Hymn of Renewal I', 'Chant a powerful renewal hymn that heals 12% of max health over 25 seconds. Scales with Charisma.', 50, 50, 0, 0, 12, 'heal', 'charisma');

-- Tier III
INSERT INTO abilities (name, description, mana_cost, cooldown, damage_min, damage_max, required_level, ability_type, scaling_stat) VALUES
('Melody of Mending II', 'Play an enchanting melody that heals 10% of max health over 20 seconds. Scales with Charisma.', 40, 35, 0, 0, 16, 'heal', 'charisma'),
('Ballad of Restoration II', 'Sing a powerful healing ballad that restores 15% of max health over 25 seconds. Scales with Charisma.', 60, 45, 0, 0, 22, 'heal', 'charisma'),
('Hymn of Renewal II', 'Chant a legendary renewal hymn that heals 20% of max health over 30 seconds. Scales with Charisma.', 80, 55, 0, 0, 28, 'heal', 'charisma'),
('Song of Rejuvenation', 'A masterful song that heals 25% of max health immediately and 15% over 20 seconds. Scales with Charisma.', 100, 70, 0, 0, 30, 'heal', 'charisma');

-- Tier IV-V
INSERT INTO abilities (name, description, mana_cost, cooldown, damage_min, damage_max, required_level, ability_type, scaling_stat) VALUES
('Melody of Mending III', 'Play a divine melody that heals 15% of max health over 25 seconds. Scales with Charisma.', 65, 40, 0, 0, 32, 'heal', 'charisma'),
('Ballad of Restoration III', 'Sing an epic healing ballad that restores 25% of max health over 30 seconds. Scales with Charisma.', 90, 50, 0, 0, 38, 'heal', 'charisma'),
('Hymn of Renewal III', 'Chant the ultimate renewal hymn that heals 35% of max health over 35 seconds. Scales with Charisma.', 120, 60, 0, 0, 44, 'heal', 'charisma'),
('Aria of Resurrection', 'The legendary healing aria that heals 40% of max health immediately and 30% over 30 seconds. Scales with Charisma.', 150, 90, 0, 0, 50, 'heal', 'charisma'),
('Eternal Lifesong', 'The song of immortality that heals 50% of max health immediately and 40% over 40 seconds, plus removes all debuffs. Scales with Charisma.', 180, 120, 0, 0, 60, 'heal', 'charisma');

-- ============================================
-- DAMAGE SONGS (DOTs - Damage Over Time)
-- ============================================

-- Tier I-II
INSERT INTO abilities (name, description, mana_cost, cooldown, damage_min, damage_max, required_level, ability_type, scaling_stat) VALUES
('Discordant Note I', 'Strike a harsh note that deals 8-12 damage immediately and 15 damage over 12 seconds. Scales with Charisma.', 15, 8, 8, 12, 1, 'damage', 'charisma'),
('Cacophony I', 'Unleash chaotic noise dealing 15-22 damage immediately and 30 damage over 15 seconds. Scales with Charisma.', 25, 10, 15, 22, 6, 'damage', 'charisma'),
('Dirge of Despair I', 'Sing a mournful dirge dealing 25-35 damage immediately and 50 damage over 18 seconds. Scales with Charisma.', 35, 12, 25, 35, 10, 'damage', 'charisma');

-- Tier III
INSERT INTO abilities (name, description, mana_cost, cooldown, damage_min, damage_max, required_level, ability_type, scaling_stat) VALUES
('Discordant Note II', 'Strike a painful note that deals 35-48 damage immediately and 60 damage over 15 seconds. Scales with Charisma.', 40, 10, 35, 48, 14, 'damage', 'charisma'),
('Cacophony II', 'Unleash maddening noise dealing 50-70 damage immediately and 90 damage over 18 seconds. Scales with Charisma.', 55, 12, 50, 70, 20, 'damage', 'charisma'),
('Dirge of Despair II', 'Sing a soul-crushing dirge dealing 75-100 damage immediately and 140 damage over 20 seconds. Scales with Charisma.', 70, 14, 75, 100, 26, 'damage', 'charisma'),
('Scream of Anguish', 'A terrifying scream that deals 100-135 damage immediately and 180 damage over 25 seconds, reducing enemy damage by 10%. Scales with Charisma.', 85, 18, 100, 135, 30, 'damage', 'charisma');

-- Tier IV
INSERT INTO abilities (name, description, mana_cost, cooldown, damage_min, damage_max, required_level, ability_type, scaling_stat) VALUES
('Discordant Note III', 'Strike a devastating note that deals 110-145 damage immediately and 190 damage over 18 seconds. Scales with Charisma.', 75, 12, 110, 145, 34, 'damage', 'charisma'),
('Cacophony III', 'Unleash reality-breaking noise dealing 150-195 damage immediately and 270 damage over 22 seconds. Scales with Charisma.', 95, 14, 150, 195, 39, 'damage', 'charisma'),
('Dirge of Despair III', 'Sing a world-ending dirge dealing 210-265 damage immediately and 380 damage over 25 seconds. Scales with Charisma.', 115, 16, 210, 265, 42, 'damage', 'charisma'),
('Deathsong', 'The legendary song of endings that deals 280-350 damage immediately and 500 damage over 30 seconds, reducing enemy armor by 20%. Scales with Charisma.', 140, 22, 280, 350, 46, 'damage', 'charisma');

-- Tier V
INSERT INTO abilities (name, description, mana_cost, cooldown, damage_min, damage_max, required_level, ability_type, scaling_stat) VALUES
('Discordant Note IV', 'Strike a reality-shattering note that deals 240-305 damage immediately and 420 damage over 22 seconds. Scales with Charisma.', 110, 14, 240, 305, 48, 'damage', 'charisma'),
('Cacophony IV', 'Unleash the chaos of creation dealing 330-415 damage immediately and 580 damage over 26 seconds. Scales with Charisma.', 135, 16, 330, 415, 52, 'damage', 'charisma'),
('Dirge of Despair IV', 'Sing the ultimate dirge dealing 450-560 damage immediately and 800 damage over 30 seconds. Scales with Charisma.', 165, 18, 450, 560, 56, 'damage', 'charisma'),
('Requiem of Oblivion', 'The final song of destruction that deals 600-750 damage immediately and 1100 damage over 35 seconds, reducing enemy armor and damage by 30%. Scales with Charisma.', 200, 25, 600, 750, 60, 'damage', 'charisma');

-- ============================================
-- CROWD CONTROL SONGS
-- ============================================

INSERT INTO abilities (name, description, mana_cost, cooldown, damage_min, damage_max, required_level, ability_type, scaling_stat) VALUES
('Lullaby I', 'Sing a soothing lullaby that puts enemies to sleep for 6 seconds (breaks on damage). Scales with Charisma.', 30, 45, 0, 0, 9, 'control', 'charisma'),
('Lullaby II', 'Sing an irresistible lullaby that puts enemies to sleep for 10 seconds (breaks on damage). Scales with Charisma.', 50, 50, 0, 0, 24, 'control', 'charisma'),
('Lullaby III', 'Sing the eternal lullaby that puts enemies to sleep for 15 seconds (breaks on damage). Scales with Charisma.', 75, 55, 0, 0, 40, 'control', 'charisma'),
('Song of Fear I', 'A terrifying melody that causes enemies to flee for 8 seconds. Scales with Charisma.', 35, 60, 0, 0, 19, 'control', 'charisma'),
('Song of Fear II', 'An overwhelming melody that causes enemies to flee for 12 seconds. Scales with Charisma.', 60, 65, 0, 0, 36, 'control', 'charisma'),
('Song of Confusion', 'A bewildering tune that confuses enemies, reducing their accuracy by 50% for 15 seconds. Scales with Charisma.', 70, 75, 0, 0, 54, 'control', 'charisma');
