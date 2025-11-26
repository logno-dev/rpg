-- Add Bard Stat Buff Songs (Strength, Dexterity, Constitution)
-- These are charisma-based buff songs

-- ============================================
-- STRENGTH BUFFS - Song of Courage
-- ============================================

-- Tier I
INSERT INTO abilities (name, description, type, category, mana_cost, cooldown, required_level, primary_stat, buff_stat, buff_amount, buff_duration)
VALUES ('Song of Courage I', 'Inspire allies with a rousing melody, increasing Strength by 5 for 30 seconds. Scales with Charisma.', 'active', 'buff', 15, 45, 1, 'charisma', 'strength', 5, 30);

-- Tier II
INSERT INTO abilities (name, description, type, category, mana_cost, cooldown, required_level, primary_stat, buff_stat, buff_amount, buff_duration)
VALUES ('Song of Courage II', 'Inspire allies with a powerful melody, increasing Strength by 10 for 45 seconds. Scales with Charisma.', 'active', 'buff', 25, 50, 11, 'charisma', 'strength', 10, 45);

-- Tier III
INSERT INTO abilities (name, description, type, category, mana_cost, cooldown, required_level, primary_stat, buff_stat, buff_amount, buff_duration)
VALUES ('Song of Courage III', 'Inspire allies with an epic ballad, increasing Strength by 15 for 60 seconds. Scales with Charisma.', 'active', 'buff', 40, 55, 21, 'charisma', 'strength', 15, 60);

-- Tier IV
INSERT INTO abilities (name, description, type, category, mana_cost, cooldown, required_level, primary_stat, buff_stat, buff_amount, buff_duration)
VALUES ('Song of Courage IV', 'Inspire allies with a godlike melody, increasing Strength by 20 for 60 seconds. Scales with Charisma.', 'active', 'buff', 55, 60, 31, 'charisma', 'strength', 20, 60);

-- Tier V
INSERT INTO abilities (name, description, type, category, mana_cost, cooldown, required_level, primary_stat, buff_stat, buff_amount, buff_duration)
VALUES ('Song of Courage V', 'Inspire allies with the ultimate battle anthem, increasing Strength by 25 for 90 seconds. Scales with Charisma.', 'active', 'buff', 75, 65, 41, 'charisma', 'strength', 25, 90);

-- ============================================
-- DEXTERITY BUFFS - Song of Swiftness
-- ============================================

-- Tier I
INSERT INTO abilities (name, description, type, category, mana_cost, cooldown, required_level, primary_stat, buff_stat, buff_amount, buff_duration)
VALUES ('Song of Swiftness I', 'Play an energetic tune that increases Dexterity by 5 for 30 seconds. Scales with Charisma.', 'active', 'buff', 15, 45, 1, 'charisma', 'dexterity', 5, 30);

-- Tier II
INSERT INTO abilities (name, description, type, category, mana_cost, cooldown, required_level, primary_stat, buff_stat, buff_amount, buff_duration)
VALUES ('Song of Swiftness II', 'Play a rapid tune that increases Dexterity by 10 for 45 seconds. Scales with Charisma.', 'active', 'buff', 25, 50, 11, 'charisma', 'dexterity', 10, 45);

-- Tier III
INSERT INTO abilities (name, description, type, category, mana_cost, cooldown, required_level, primary_stat, buff_stat, buff_amount, buff_duration)
VALUES ('Song of Swiftness III', 'Play a masterful tune that increases Dexterity by 15 for 60 seconds. Scales with Charisma.', 'active', 'buff', 40, 55, 21, 'charisma', 'dexterity', 15, 60);

-- Tier IV
INSERT INTO abilities (name, description, type, category, mana_cost, cooldown, required_level, primary_stat, buff_stat, buff_amount, buff_duration)
VALUES ('Song of Swiftness IV', 'Play a perfect tune that increases Dexterity by 20 for 60 seconds. Scales with Charisma.', 'active', 'buff', 55, 60, 31, 'charisma', 'dexterity', 20, 60);

-- Tier V
INSERT INTO abilities (name, description, type, category, mana_cost, cooldown, required_level, primary_stat, buff_stat, buff_amount, buff_duration)
VALUES ('Song of Swiftness V', 'Play the song of legends, increasing Dexterity by 25 for 90 seconds. Scales with Charisma.', 'active', 'buff', 75, 65, 41, 'charisma', 'dexterity', 25, 90);

-- ============================================
-- CONSTITUTION BUFFS - Song of Fortitude
-- ============================================

-- Tier I
INSERT INTO abilities (name, description, type, category, mana_cost, cooldown, required_level, primary_stat, buff_stat, buff_amount, buff_duration)
VALUES ('Song of Fortitude I', 'Sing a hymn of endurance, increasing Constitution by 5 for 30 seconds. Scales with Charisma.', 'active', 'buff', 15, 45, 3, 'charisma', 'constitution', 5, 30);

-- Tier II
INSERT INTO abilities (name, description, type, category, mana_cost, cooldown, required_level, primary_stat, buff_stat, buff_amount, buff_duration)
VALUES ('Song of Fortitude II', 'Sing a strong hymn, increasing Constitution by 10 for 45 seconds. Scales with Charisma.', 'active', 'buff', 25, 50, 13, 'charisma', 'constitution', 10, 45);

-- Tier III
INSERT INTO abilities (name, description, type, category, mana_cost, cooldown, required_level, primary_stat, buff_stat, buff_amount, buff_duration)
VALUES ('Song of Fortitude III', 'Sing a legendary hymn, increasing Constitution by 15 for 60 seconds. Scales with Charisma.', 'active', 'buff', 40, 55, 23, 'charisma', 'constitution', 15, 60);

-- Tier IV
INSERT INTO abilities (name, description, type, category, mana_cost, cooldown, required_level, primary_stat, buff_stat, buff_amount, buff_duration)
VALUES ('Song of Fortitude IV', 'Sing an eternal hymn, increasing Constitution by 20 for 60 seconds. Scales with Charisma.', 'active', 'buff', 55, 60, 33, 'charisma', 'constitution', 20, 60);

-- Tier V
INSERT INTO abilities (name, description, type, category, mana_cost, cooldown, required_level, primary_stat, buff_stat, buff_amount, buff_duration)
VALUES ('Song of Fortitude V', 'Sing the hymn of immortals, increasing Constitution by 25 for 90 seconds. Scales with Charisma.', 'active', 'buff', 75, 65, 43, 'charisma', 'constitution', 25, 90);
