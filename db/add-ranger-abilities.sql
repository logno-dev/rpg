-- ============================================
-- Ranger Abilities System
-- ============================================
-- Creates a complete set of ranger abilities with 5 tiers each:
-- 1. Aimed Shot - High damage single target (physical)
-- 2. Multi-Shot - Damage multiple enemies (physical)  
-- 3. Poison Arrow - Damage over time with poison (magic, uses mana)
-- 4. Explosive Arrow - Area damage (magic, uses mana)
-- 5. Rapid Fire - Quick successive shots (physical, low cooldown)
--
-- All abilities require bow and quiver, scale with dexterity

-- Get starting IDs
-- Abilities will start from a high ID to avoid conflicts
-- Items will start from a high ID to avoid conflicts

-- ============================================
-- AIMED SHOT - High damage precision shot
-- ============================================

-- Aimed Shot I
INSERT INTO abilities (name, description, type, category, level, base_id, primary_stat, stat_scaling,
  required_level, required_dexterity, mana_cost, cooldown, weapon_type_requirement, offhand_type_requirement, created_at)
VALUES ('Aimed Shot I', 'A carefully aimed arrow that deals devastating damage', 'ability', 'damage', 1, NULL, 'dexterity', 0.8,
  3, 16, 0, 6, 'bow', 'quiver', unixepoch());

-- Get the base_id for Aimed Shot
-- Aimed Shot II-V
INSERT INTO abilities (name, description, type, category, level, base_id, primary_stat, stat_scaling,
  required_level, required_dexterity, mana_cost, cooldown, weapon_type_requirement, offhand_type_requirement, created_at)
SELECT 'Aimed Shot II', 'A carefully aimed arrow that deals devastating damage', 'ability', 'damage', 2, id, 'dexterity', 1.0,
  16, 32, 0, 6, 'bow', 'quiver', unixepoch()
FROM abilities WHERE name = 'Aimed Shot I';

INSERT INTO abilities (name, description, type, category, level, base_id, primary_stat, stat_scaling,
  required_level, required_dexterity, mana_cost, cooldown, weapon_type_requirement, offhand_type_requirement, created_at)
SELECT 'Aimed Shot III', 'A carefully aimed arrow that deals devastating damage', 'ability', 'damage', 3, id, 'dexterity', 1.2,
  23, 40, 0, 6, 'bow', 'quiver', unixepoch()
FROM abilities WHERE name = 'Aimed Shot I';

INSERT INTO abilities (name, description, type, category, level, base_id, primary_stat, stat_scaling,
  required_level, required_dexterity, mana_cost, cooldown, weapon_type_requirement, offhand_type_requirement, created_at)
SELECT 'Aimed Shot IV', 'A carefully aimed arrow that deals devastating damage', 'ability', 'damage', 4, id, 'dexterity', 1.4,
  36, 58, 0, 6, 'bow', 'quiver', unixepoch()
FROM abilities WHERE name = 'Aimed Shot I';

INSERT INTO abilities (name, description, type, category, level, base_id, primary_stat, stat_scaling,
  required_level, required_dexterity, mana_cost, cooldown, weapon_type_requirement, offhand_type_requirement, created_at)
SELECT 'Aimed Shot V', 'A carefully aimed arrow that deals devastating damage', 'ability', 'damage', 5, id, 'dexterity', 1.6,
  49, 71, 0, 6, 'bow', 'quiver', unixepoch()
FROM abilities WHERE name = 'Aimed Shot I';

-- Aimed Shot Effects
INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, value_min, value_max,
  is_periodic, tick_interval, tick_count, tick_value, stat_scaling, duration, chance, stacks_max, created_at)
SELECT id, 0, 'damage', 'enemy', 15, 25, 0, 2, 0, 0, 0.8, 0, 1, 1, unixepoch()
FROM abilities WHERE name = 'Aimed Shot I';

INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, value_min, value_max,
  is_periodic, tick_interval, tick_count, tick_value, stat_scaling, duration, chance, stacks_max, created_at)
SELECT id, 0, 'damage', 'enemy', 28, 42, 0, 2, 0, 0, 1.0, 0, 1, 1, unixepoch()
FROM abilities WHERE name = 'Aimed Shot II';

INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, value_min, value_max,
  is_periodic, tick_interval, tick_count, tick_value, stat_scaling, duration, chance, stacks_max, created_at)
SELECT id, 0, 'damage', 'enemy', 45, 65, 0, 2, 0, 0, 1.2, 0, 1, 1, unixepoch()
FROM abilities WHERE name = 'Aimed Shot III';

INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, value_min, value_max,
  is_periodic, tick_interval, tick_count, tick_value, stat_scaling, duration, chance, stacks_max, created_at)
SELECT id, 0, 'damage', 'enemy', 70, 95, 0, 2, 0, 0, 1.4, 0, 1, 1, unixepoch()
FROM abilities WHERE name = 'Aimed Shot IV';

INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, value_min, value_max,
  is_periodic, tick_interval, tick_count, tick_value, stat_scaling, duration, chance, stacks_max, created_at)
SELECT id, 0, 'damage', 'enemy', 105, 140, 0, 2, 0, 0, 1.6, 0, 1, 1, unixepoch()
FROM abilities WHERE name = 'Aimed Shot V';

-- ============================================
-- MULTI-SHOT - Damage multiple targets
-- ============================================

INSERT INTO abilities (name, description, type, category, level, base_id, primary_stat, stat_scaling,
  required_level, required_dexterity, mana_cost, cooldown, weapon_type_requirement, offhand_type_requirement, created_at)
VALUES ('Multi-Shot I', 'Fire arrows at multiple targets in quick succession', 'ability', 'damage', 1, NULL, 'dexterity', 0.5,
  3, 16, 0, 10, 'bow', 'quiver', unixepoch());

INSERT INTO abilities (name, description, type, category, level, base_id, primary_stat, stat_scaling,
  required_level, required_dexterity, mana_cost, cooldown, weapon_type_requirement, offhand_type_requirement, created_at)
SELECT 'Multi-Shot II', 'Fire arrows at multiple targets in quick succession', 'ability', 'damage', 2, id, 'dexterity', 0.6,
  16, 32, 0, 10, 'bow', 'quiver', unixepoch()
FROM abilities WHERE name = 'Multi-Shot I';

INSERT INTO abilities (name, description, type, category, level, base_id, primary_stat, stat_scaling,
  required_level, required_dexterity, mana_cost, cooldown, weapon_type_requirement, offhand_type_requirement, created_at)
SELECT 'Multi-Shot III', 'Fire arrows at multiple targets in quick succession', 'ability', 'damage', 3, id, 'dexterity', 0.7,
  23, 40, 0, 10, 'bow', 'quiver', unixepoch()
FROM abilities WHERE name = 'Multi-Shot I';

INSERT INTO abilities (name, description, type, category, level, base_id, primary_stat, stat_scaling,
  required_level, required_dexterity, mana_cost, cooldown, weapon_type_requirement, offhand_type_requirement, created_at)
SELECT 'Multi-Shot IV', 'Fire arrows at multiple targets in quick succession', 'ability', 'damage', 4, id, 'dexterity', 0.8,
  36, 58, 0, 10, 'bow', 'quiver', unixepoch()
FROM abilities WHERE name = 'Multi-Shot I';

INSERT INTO abilities (name, description, type, category, level, base_id, primary_stat, stat_scaling,
  required_level, required_dexterity, mana_cost, cooldown, weapon_type_requirement, offhand_type_requirement, created_at)
SELECT 'Multi-Shot V', 'Fire arrows at multiple targets in quick succession', 'ability', 'damage', 5, id, 'dexterity', 0.9,
  49, 71, 0, 10, 'bow', 'quiver', unixepoch()
FROM abilities WHERE name = 'Multi-Shot I';

-- Multi-Shot Effects
INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, value_min, value_max,
  is_periodic, tick_interval, tick_count, tick_value, stat_scaling, duration, chance, stacks_max, created_at)
SELECT id, 0, 'damage', 'enemy', 8, 14, 0, 2, 0, 0, 0.5, 0, 1, 1, unixepoch()
FROM abilities WHERE name = 'Multi-Shot I';

INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, value_min, value_max,
  is_periodic, tick_interval, tick_count, tick_value, stat_scaling, duration, chance, stacks_max, created_at)
SELECT id, 0, 'damage', 'enemy', 15, 23, 0, 2, 0, 0, 0.6, 0, 1, 1, unixepoch()
FROM abilities WHERE name = 'Multi-Shot II';

INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, value_min, value_max,
  is_periodic, tick_interval, tick_count, tick_value, stat_scaling, duration, chance, stacks_max, created_at)
SELECT id, 0, 'damage', 'enemy', 24, 35, 0, 2, 0, 0, 0.7, 0, 1, 1, unixepoch()
FROM abilities WHERE name = 'Multi-Shot III';

INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, value_min, value_max,
  is_periodic, tick_interval, tick_count, tick_value, stat_scaling, duration, chance, stacks_max, created_at)
SELECT id, 0, 'damage', 'enemy', 38, 52, 0, 2, 0, 0, 0.8, 0, 1, 1, unixepoch()
FROM abilities WHERE name = 'Multi-Shot IV';

INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, value_min, value_max,
  is_periodic, tick_interval, tick_count, tick_value, stat_scaling, duration, chance, stacks_max, created_at)
SELECT id, 0, 'damage', 'enemy', 58, 78, 0, 2, 0, 0, 0.9, 0, 1, 1, unixepoch()
FROM abilities WHERE name = 'Multi-Shot V';

-- ============================================
-- POISON ARROW - DoT ability
-- ============================================

INSERT INTO abilities (name, description, type, category, level, base_id, primary_stat, stat_scaling,
  required_level, required_dexterity, mana_cost, cooldown, weapon_type_requirement, offhand_type_requirement, created_at)
VALUES ('Poison Arrow I', 'An arrow coated with deadly poison that deals damage over time', 'spell', 'magic', 1, NULL, 'dexterity', 0.4,
  3, 16, 10, 8, 'bow', 'quiver', unixepoch());

INSERT INTO abilities (name, description, type, category, level, base_id, primary_stat, stat_scaling,
  required_level, required_dexterity, mana_cost, cooldown, weapon_type_requirement, offhand_type_requirement, created_at)
SELECT 'Poison Arrow II', 'An arrow coated with deadly poison that deals damage over time', 'spell', 'magic', 2, id, 'dexterity', 0.5,
  16, 32, 15, 8, 'bow', 'quiver', unixepoch()
FROM abilities WHERE name = 'Poison Arrow I';

INSERT INTO abilities (name, description, type, category, level, base_id, primary_stat, stat_scaling,
  required_level, required_dexterity, mana_cost, cooldown, weapon_type_requirement, offhand_type_requirement, created_at)
SELECT 'Poison Arrow III', 'An arrow coated with deadly poison that deals damage over time', 'spell', 'magic', 3, id, 'dexterity', 0.6,
  23, 40, 22, 8, 'bow', 'quiver', unixepoch()
FROM abilities WHERE name = 'Poison Arrow I';

INSERT INTO abilities (name, description, type, category, level, base_id, primary_stat, stat_scaling,
  required_level, required_dexterity, mana_cost, cooldown, weapon_type_requirement, offhand_type_requirement, created_at)
SELECT 'Poison Arrow IV', 'An arrow coated with deadly poison that deals damage over time', 'spell', 'magic', 4, id, 'dexterity', 0.7,
  36, 58, 32, 8, 'bow', 'quiver', unixepoch()
FROM abilities WHERE name = 'Poison Arrow I';

INSERT INTO abilities (name, description, type, category, level, base_id, primary_stat, stat_scaling,
  required_level, required_dexterity, mana_cost, cooldown, weapon_type_requirement, offhand_type_requirement, created_at)
SELECT 'Poison Arrow V', 'An arrow coated with deadly poison that deals damage over time', 'spell', 'magic', 5, id, 'dexterity', 0.8,
  49, 71, 45, 8, 'bow', 'quiver', unixepoch()
FROM abilities WHERE name = 'Poison Arrow I';

-- Poison Arrow Effects (Initial damage + DoT)
-- Tier I
INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, value_min, value_max,
  is_periodic, tick_interval, tick_count, tick_value, stat_scaling, duration, chance, stacks_max, created_at)
SELECT id, 0, 'damage', 'enemy', 5, 8, 0, 2, 0, 0, 0.4, 0, 1, 1, unixepoch()
FROM abilities WHERE name = 'Poison Arrow I';

INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, value_min, value_max,
  is_periodic, tick_interval, tick_count, tick_value, stat_scaling, duration, chance, stacks_max, created_at)
SELECT id, 1, 'damage', 'enemy', 3, 3, 1, 2, 5, 3, 0.2, 10, 1, 1, unixepoch()
FROM abilities WHERE name = 'Poison Arrow I';

-- Tier II
INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, value_min, value_max,
  is_periodic, tick_interval, tick_count, tick_value, stat_scaling, duration, chance, stacks_max, created_at)
SELECT id, 0, 'damage', 'enemy', 10, 15, 0, 2, 0, 0, 0.5, 0, 1, 1, unixepoch()
FROM abilities WHERE name = 'Poison Arrow II';

INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, value_min, value_max,
  is_periodic, tick_interval, tick_count, tick_value, stat_scaling, duration, chance, stacks_max, created_at)
SELECT id, 1, 'damage', 'enemy', 5, 5, 1, 2, 6, 5, 0.25, 12, 1, 1, unixepoch()
FROM abilities WHERE name = 'Poison Arrow II';

-- Tier III
INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, value_min, value_max,
  is_periodic, tick_interval, tick_count, tick_value, stat_scaling, duration, chance, stacks_max, created_at)
SELECT id, 0, 'damage', 'enemy', 16, 24, 0, 2, 0, 0, 0.6, 0, 1, 1, unixepoch()
FROM abilities WHERE name = 'Poison Arrow III';

INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, value_min, value_max,
  is_periodic, tick_interval, tick_count, tick_value, stat_scaling, duration, chance, stacks_max, created_at)
SELECT id, 1, 'damage', 'enemy', 8, 8, 1, 2, 6, 8, 0.3, 12, 1, 1, unixepoch()
FROM abilities WHERE name = 'Poison Arrow III';

-- Tier IV
INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, value_min, value_max,
  is_periodic, tick_interval, tick_count, tick_value, stat_scaling, duration, chance, stacks_max, created_at)
SELECT id, 0, 'damage', 'enemy', 26, 38, 0, 2, 0, 0, 0.7, 0, 1, 1, unixepoch()
FROM abilities WHERE name = 'Poison Arrow IV';

INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, value_min, value_max,
  is_periodic, tick_interval, tick_count, tick_value, stat_scaling, duration, chance, stacks_max, created_at)
SELECT id, 1, 'damage', 'enemy', 12, 12, 1, 2, 7, 12, 0.35, 14, 1, 1, unixepoch()
FROM abilities WHERE name = 'Poison Arrow IV';

-- Tier V
INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, value_min, value_max,
  is_periodic, tick_interval, tick_count, tick_value, stat_scaling, duration, chance, stacks_max, created_at)
SELECT id, 0, 'damage', 'enemy', 40, 58, 0, 2, 0, 0, 0.8, 0, 1, 1, unixepoch()
FROM abilities WHERE name = 'Poison Arrow V';

INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, value_min, value_max,
  is_periodic, tick_interval, tick_count, tick_value, stat_scaling, duration, chance, stacks_max, created_at)
SELECT id, 1, 'damage', 'enemy', 18, 18, 1, 2, 8, 18, 0.4, 16, 1, 1, unixepoch()
FROM abilities WHERE name = 'Poison Arrow V';

-- ============================================
-- EXPLOSIVE ARROW - High damage AoE
-- ============================================

INSERT INTO abilities (name, description, type, category, level, base_id, primary_stat, stat_scaling,
  required_level, required_dexterity, mana_cost, cooldown, weapon_type_requirement, offhand_type_requirement, created_at)
VALUES ('Explosive Arrow I', 'A magically charged arrow that explodes on impact', 'spell', 'magic', 1, NULL, 'dexterity', 0.9,
  3, 16, 20, 12, 'bow', 'quiver', unixepoch());

INSERT INTO abilities (name, description, type, category, level, base_id, primary_stat, stat_scaling,
  required_level, required_dexterity, mana_cost, cooldown, weapon_type_requirement, offhand_type_requirement, created_at)
SELECT 'Explosive Arrow II', 'A magically charged arrow that explodes on impact', 'spell', 'magic', 2, id, 'dexterity', 1.1,
  16, 32, 30, 12, 'bow', 'quiver', unixepoch()
FROM abilities WHERE name = 'Explosive Arrow I';

INSERT INTO abilities (name, description, type, category, level, base_id, primary_stat, stat_scaling,
  required_level, required_dexterity, mana_cost, cooldown, weapon_type_requirement, offhand_type_requirement, created_at)
SELECT 'Explosive Arrow III', 'A magically charged arrow that explodes on impact', 'spell', 'magic', 3, id, 'dexterity', 1.3,
  23, 40, 42, 12, 'bow', 'quiver', unixepoch()
FROM abilities WHERE name = 'Explosive Arrow I';

INSERT INTO abilities (name, description, type, category, level, base_id, primary_stat, stat_scaling,
  required_level, required_dexterity, mana_cost, cooldown, weapon_type_requirement, offhand_type_requirement, created_at)
SELECT 'Explosive Arrow IV', 'A magically charged arrow that explodes on impact', 'spell', 'magic', 4, id, 'dexterity', 1.5,
  36, 58, 58, 12, 'bow', 'quiver', unixepoch()
FROM abilities WHERE name = 'Explosive Arrow I';

INSERT INTO abilities (name, description, type, category, level, base_id, primary_stat, stat_scaling,
  required_level, required_dexterity, mana_cost, cooldown, weapon_type_requirement, offhand_type_requirement, created_at)
SELECT 'Explosive Arrow V', 'A magically charged arrow that explodes on impact', 'spell', 'magic', 5, id, 'dexterity', 1.7,
  49, 71, 78, 12, 'bow', 'quiver', unixepoch()
FROM abilities WHERE name = 'Explosive Arrow I';

-- Explosive Arrow Effects
INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, value_min, value_max,
  is_periodic, tick_interval, tick_count, tick_value, stat_scaling, duration, chance, stacks_max, created_at)
SELECT id, 0, 'damage', 'enemy', 18, 28, 0, 2, 0, 0, 0.9, 0, 1, 1, unixepoch()
FROM abilities WHERE name = 'Explosive Arrow I';

INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, value_min, value_max,
  is_periodic, tick_interval, tick_count, tick_value, stat_scaling, duration, chance, stacks_max, created_at)
SELECT id, 0, 'damage', 'enemy', 32, 48, 0, 2, 0, 0, 1.1, 0, 1, 1, unixepoch()
FROM abilities WHERE name = 'Explosive Arrow II';

INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, value_min, value_max,
  is_periodic, tick_interval, tick_count, tick_value, stat_scaling, duration, chance, stacks_max, created_at)
SELECT id, 0, 'damage', 'enemy', 52, 72, 0, 2, 0, 0, 1.3, 0, 1, 1, unixepoch()
FROM abilities WHERE name = 'Explosive Arrow III';

INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, value_min, value_max,
  is_periodic, tick_interval, tick_count, tick_value, stat_scaling, duration, chance, stacks_max, created_at)
SELECT id, 0, 'damage', 'enemy', 80, 110, 0, 2, 0, 0, 1.5, 0, 1, 1, unixepoch()
FROM abilities WHERE name = 'Explosive Arrow IV';

INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, value_min, value_max,
  is_periodic, tick_interval, tick_count, tick_value, stat_scaling, duration, chance, stacks_max, created_at)
SELECT id, 0, 'damage', 'enemy', 120, 160, 0, 2, 0, 0, 1.7, 0, 1, 1, unixepoch()
FROM abilities WHERE name = 'Explosive Arrow V';

-- ============================================
-- RAPID FIRE - Low cooldown quick shots
-- ============================================

INSERT INTO abilities (name, description, type, category, level, base_id, primary_stat, stat_scaling,
  required_level, required_dexterity, mana_cost, cooldown, weapon_type_requirement, offhand_type_requirement, created_at)
VALUES ('Rapid Fire I', 'Unleash a flurry of rapid shots at your target', 'ability', 'damage', 1, NULL, 'dexterity', 0.4,
  3, 16, 0, 5, 'bow', 'quiver', unixepoch());

INSERT INTO abilities (name, description, type, category, level, base_id, primary_stat, stat_scaling,
  required_level, required_dexterity, mana_cost, cooldown, weapon_type_requirement, offhand_type_requirement, created_at)
SELECT 'Rapid Fire II', 'Unleash a flurry of rapid shots at your target', 'ability', 'damage', 2, id, 'dexterity', 0.5,
  16, 32, 0, 5, 'bow', 'quiver', unixepoch()
FROM abilities WHERE name = 'Rapid Fire I';

INSERT INTO abilities (name, description, type, category, level, base_id, primary_stat, stat_scaling,
  required_level, required_dexterity, mana_cost, cooldown, weapon_type_requirement, offhand_type_requirement, created_at)
SELECT 'Rapid Fire III', 'Unleash a flurry of rapid shots at your target', 'ability', 'damage', 3, id, 'dexterity', 0.6,
  23, 40, 0, 5, 'bow', 'quiver', unixepoch()
FROM abilities WHERE name = 'Rapid Fire I';

INSERT INTO abilities (name, description, type, category, level, base_id, primary_stat, stat_scaling,
  required_level, required_dexterity, mana_cost, cooldown, weapon_type_requirement, offhand_type_requirement, created_at)
SELECT 'Rapid Fire IV', 'Unleash a flurry of rapid shots at your target', 'ability', 'damage', 4, id, 'dexterity', 0.7,
  36, 58, 0, 5, 'bow', 'quiver', unixepoch()
FROM abilities WHERE name = 'Rapid Fire I';

INSERT INTO abilities (name, description, type, category, level, base_id, primary_stat, stat_scaling,
  required_level, required_dexterity, mana_cost, cooldown, weapon_type_requirement, offhand_type_requirement, created_at)
SELECT 'Rapid Fire V', 'Unleash a flurry of rapid shots at your target', 'ability', 'damage', 5, id, 'dexterity', 0.8,
  49, 71, 0, 5, 'bow', 'quiver', unixepoch()
FROM abilities WHERE name = 'Rapid Fire I';

-- Rapid Fire Effects
INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, value_min, value_max,
  is_periodic, tick_interval, tick_count, tick_value, stat_scaling, duration, chance, stacks_max, created_at)
SELECT id, 0, 'damage', 'enemy', 6, 10, 0, 2, 0, 0, 0.4, 0, 1, 1, unixepoch()
FROM abilities WHERE name = 'Rapid Fire I';

INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, value_min, value_max,
  is_periodic, tick_interval, tick_count, tick_value, stat_scaling, duration, chance, stacks_max, created_at)
SELECT id, 0, 'damage', 'enemy', 11, 17, 0, 2, 0, 0, 0.5, 0, 1, 1, unixepoch()
FROM abilities WHERE name = 'Rapid Fire II';

INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, value_min, value_max,
  is_periodic, tick_interval, tick_count, tick_value, stat_scaling, duration, chance, stacks_max, created_at)
SELECT id, 0, 'damage', 'enemy', 18, 26, 0, 2, 0, 0, 0.6, 0, 1, 1, unixepoch()
FROM abilities WHERE name = 'Rapid Fire III';

INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, value_min, value_max,
  is_periodic, tick_interval, tick_count, tick_value, stat_scaling, duration, chance, stacks_max, created_at)
SELECT id, 0, 'damage', 'enemy', 28, 40, 0, 2, 0, 0, 0.7, 0, 1, 1, unixepoch()
FROM abilities WHERE name = 'Rapid Fire IV';

INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, value_min, value_max,
  is_periodic, tick_interval, tick_count, tick_value, stat_scaling, duration, chance, stacks_max, created_at)
SELECT id, 0, 'damage', 'enemy', 42, 60, 0, 2, 0, 0, 0.8, 0, 1, 1, unixepoch()
FROM abilities WHERE name = 'Rapid Fire V';

-- ============================================
-- SCROLLS - Teaching items for all abilities
-- ============================================

-- Aimed Shot Scrolls
INSERT INTO items (name, description, type, rarity, value, stackable, teaches_ability_id, required_level, required_dexterity, created_at)
SELECT 'Scroll: Aimed Shot I', 'Teaches you the Aimed Shot I ability', 'scroll', 'common', 75, 1, id, 3, 16, unixepoch()
FROM abilities WHERE name = 'Aimed Shot I';

INSERT INTO items (name, description, type, rarity, value, stackable, teaches_ability_id, required_level, required_dexterity, created_at)
SELECT 'Scroll: Aimed Shot II', 'Teaches you the Aimed Shot II ability', 'scroll', 'uncommon', 200, 1, id, 16, 32, unixepoch()
FROM abilities WHERE name = 'Aimed Shot II';

INSERT INTO items (name, description, type, rarity, value, stackable, teaches_ability_id, required_level, required_dexterity, created_at)
SELECT 'Scroll: Aimed Shot III', 'Teaches you the Aimed Shot III ability', 'scroll', 'rare', 500, 1, id, 23, 40, unixepoch()
FROM abilities WHERE name = 'Aimed Shot III';

INSERT INTO items (name, description, type, rarity, value, stackable, teaches_ability_id, required_level, required_dexterity, created_at)
SELECT 'Scroll: Aimed Shot IV', 'Teaches you the Aimed Shot IV ability', 'scroll', 'epic', 1200, 1, id, 36, 58, unixepoch()
FROM abilities WHERE name = 'Aimed Shot IV';

INSERT INTO items (name, description, type, rarity, value, stackable, teaches_ability_id, required_level, required_dexterity, created_at)
SELECT 'Scroll: Aimed Shot V', 'Teaches you the Aimed Shot V ability', 'scroll', 'legendary', 3000, 1, id, 49, 71, unixepoch()
FROM abilities WHERE name = 'Aimed Shot V';

-- Multi-Shot Scrolls
INSERT INTO items (name, description, type, rarity, value, stackable, teaches_ability_id, required_level, required_dexterity, created_at)
SELECT 'Scroll: Multi-Shot I', 'Teaches you the Multi-Shot I ability', 'scroll', 'common', 75, 1, id, 3, 16, unixepoch()
FROM abilities WHERE name = 'Multi-Shot I';

INSERT INTO items (name, description, type, rarity, value, stackable, teaches_ability_id, required_level, required_dexterity, created_at)
SELECT 'Scroll: Multi-Shot II', 'Teaches you the Multi-Shot II ability', 'scroll', 'uncommon', 200, 1, id, 16, 32, unixepoch()
FROM abilities WHERE name = 'Multi-Shot II';

INSERT INTO items (name, description, type, rarity, value, stackable, teaches_ability_id, required_level, required_dexterity, created_at)
SELECT 'Scroll: Multi-Shot III', 'Teaches you the Multi-Shot III ability', 'scroll', 'rare', 500, 1, id, 23, 40, unixepoch()
FROM abilities WHERE name = 'Multi-Shot III';

INSERT INTO items (name, description, type, rarity, value, stackable, teaches_ability_id, required_level, required_dexterity, created_at)
SELECT 'Scroll: Multi-Shot IV', 'Teaches you the Multi-Shot IV ability', 'scroll', 'epic', 1200, 1, id, 36, 58, unixepoch()
FROM abilities WHERE name = 'Multi-Shot IV';

INSERT INTO items (name, description, type, rarity, value, stackable, teaches_ability_id, required_level, required_dexterity, created_at)
SELECT 'Scroll: Multi-Shot V', 'Teaches you the Multi-Shot V ability', 'scroll', 'legendary', 3000, 1, id, 49, 71, unixepoch()
FROM abilities WHERE name = 'Multi-Shot V';

-- Poison Arrow Scrolls
INSERT INTO items (name, description, type, rarity, value, stackable, teaches_ability_id, required_level, required_dexterity, created_at)
SELECT 'Scroll: Poison Arrow I', 'Teaches you the Poison Arrow I ability', 'scroll', 'common', 75, 1, id, 3, 16, unixepoch()
FROM abilities WHERE name = 'Poison Arrow I';

INSERT INTO items (name, description, type, rarity, value, stackable, teaches_ability_id, required_level, required_dexterity, created_at)
SELECT 'Scroll: Poison Arrow II', 'Teaches you the Poison Arrow II ability', 'scroll', 'uncommon', 200, 1, id, 16, 32, unixepoch()
FROM abilities WHERE name = 'Poison Arrow II';

INSERT INTO items (name, description, type, rarity, value, stackable, teaches_ability_id, required_level, required_dexterity, created_at)
SELECT 'Scroll: Poison Arrow III', 'Teaches you the Poison Arrow III ability', 'scroll', 'rare', 500, 1, id, 23, 40, unixepoch()
FROM abilities WHERE name = 'Poison Arrow III';

INSERT INTO items (name, description, type, rarity, value, stackable, teaches_ability_id, required_level, required_dexterity, created_at)
SELECT 'Scroll: Poison Arrow IV', 'Teaches you the Poison Arrow IV ability', 'scroll', 'epic', 1200, 1, id, 36, 58, unixepoch()
FROM abilities WHERE name = 'Poison Arrow IV';

INSERT INTO items (name, description, type, rarity, value, stackable, teaches_ability_id, required_level, required_dexterity, created_at)
SELECT 'Scroll: Poison Arrow V', 'Teaches you the Poison Arrow V ability', 'scroll', 'legendary', 3000, 1, id, 49, 71, unixepoch()
FROM abilities WHERE name = 'Poison Arrow V';

-- Explosive Arrow Scrolls
INSERT INTO items (name, description, type, rarity, value, stackable, teaches_ability_id, required_level, required_dexterity, created_at)
SELECT 'Scroll: Explosive Arrow I', 'Teaches you the Explosive Arrow I ability', 'scroll', 'common', 75, 1, id, 3, 16, unixepoch()
FROM abilities WHERE name = 'Explosive Arrow I';

INSERT INTO items (name, description, type, rarity, value, stackable, teaches_ability_id, required_level, required_dexterity, created_at)
SELECT 'Scroll: Explosive Arrow II', 'Teaches you the Explosive Arrow II ability', 'scroll', 'uncommon', 200, 1, id, 16, 32, unixepoch()
FROM abilities WHERE name = 'Explosive Arrow II';

INSERT INTO items (name, description, type, rarity, value, stackable, teaches_ability_id, required_level, required_dexterity, created_at)
SELECT 'Scroll: Explosive Arrow III', 'Teaches you the Explosive Arrow III ability', 'scroll', 'rare', 500, 1, id, 23, 40, unixepoch()
FROM abilities WHERE name = 'Explosive Arrow III';

INSERT INTO items (name, description, type, rarity, value, stackable, teaches_ability_id, required_level, required_dexterity, created_at)
SELECT 'Scroll: Explosive Arrow IV', 'Teaches you the Explosive Arrow IV ability', 'scroll', 'epic', 1200, 1, id, 36, 58, unixepoch()
FROM abilities WHERE name = 'Explosive Arrow IV';

INSERT INTO items (name, description, type, rarity, value, stackable, teaches_ability_id, required_level, required_dexterity, created_at)
SELECT 'Scroll: Explosive Arrow V', 'Teaches you the Explosive Arrow V ability', 'scroll', 'legendary', 3000, 1, id, 49, 71, unixepoch()
FROM abilities WHERE name = 'Explosive Arrow V';

-- Rapid Fire Scrolls
INSERT INTO items (name, description, type, rarity, value, stackable, teaches_ability_id, required_level, required_dexterity, created_at)
SELECT 'Scroll: Rapid Fire I', 'Teaches you the Rapid Fire I ability', 'scroll', 'common', 75, 1, id, 3, 16, unixepoch()
FROM abilities WHERE name = 'Rapid Fire I';

INSERT INTO items (name, description, type, rarity, value, stackable, teaches_ability_id, required_level, required_dexterity, created_at)
SELECT 'Scroll: Rapid Fire II', 'Teaches you the Rapid Fire II ability', 'scroll', 'uncommon', 200, 1, id, 16, 32, unixepoch()
FROM abilities WHERE name = 'Rapid Fire II';

INSERT INTO items (name, description, type, rarity, value, stackable, teaches_ability_id, required_level, required_dexterity, created_at)
SELECT 'Scroll: Rapid Fire III', 'Teaches you the Rapid Fire III ability', 'scroll', 'rare', 500, 1, id, 23, 40, unixepoch()
FROM abilities WHERE name = 'Rapid Fire III';

INSERT INTO items (name, description, type, rarity, value, stackable, teaches_ability_id, required_level, required_dexterity, created_at)
SELECT 'Scroll: Rapid Fire IV', 'Teaches you the Rapid Fire IV ability', 'scroll', 'epic', 1200, 1, id, 36, 58, unixepoch()
FROM abilities WHERE name = 'Rapid Fire IV';

INSERT INTO items (name, description, type, rarity, value, stackable, teaches_ability_id, required_level, required_dexterity, created_at)
SELECT 'Scroll: Rapid Fire V', 'Teaches you the Rapid Fire V ability', 'scroll', 'legendary', 3000, 1, id, 49, 71, unixepoch()
FROM abilities WHERE name = 'Rapid Fire V';
