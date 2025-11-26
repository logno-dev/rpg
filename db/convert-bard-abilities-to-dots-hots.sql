-- Convert All Bard Abilities to DOT/HOT Format
-- Strategy: 
--   - Damage songs -> DOT (Damage Over Time)
--   - Healing songs -> HOT (Heal Over Time)
--   - Use tick_count and tick_value for periodic effects
--   - Maintain stat_scaling from charisma
--
-- Tick Design:
--   - Fast songs (short cooldown): 5 ticks over 10 seconds (2s interval)
--   - Medium songs: 8 ticks over 16 seconds (2s interval)
--   - Slow songs (long cooldown): 10 ticks over 20 seconds (2s interval)

-- ============================================
-- HEALING SONGS (HOT Effects)
-- ============================================

-- Ballad of Restoration I-III (Medium HOTs)
INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, is_periodic, tick_interval, tick_count, tick_value, stat_affected, stat_scaling, scaling_factor)
SELECT 
  id,
  1,
  'hot',
  'self',
  1,
  2,
  8,
  CASE 
    WHEN name = 'Ballad of Restoration I' THEN 6   -- 6 per tick x 8 ticks = 48 base
    WHEN name = 'Ballad of Restoration II' THEN 17  -- 17 x 8 = 136 base
    WHEN name = 'Ballad of Restoration III' THEN 39 -- 39 x 8 = 312 base
  END,
  'charisma',
  'charisma',
  CASE 
    WHEN name = 'Ballad of Restoration I' THEN 1.1  -- 1.1x CHA scaling per tick
    WHEN name = 'Ballad of Restoration II' THEN 1.4
    WHEN name = 'Ballad of Restoration III' THEN 1.7
  END
FROM abilities
WHERE name IN ('Ballad of Restoration I', 'Ballad of Restoration II', 'Ballad of Restoration III');

-- Hymn of Renewal I-III (Strong HOTs)
INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, is_periodic, tick_interval, tick_count, tick_value, stat_affected, stat_scaling, scaling_factor)
SELECT 
  id,
  1,
  'hot',
  'self',
  1,
  2,
  10,
  CASE 
    WHEN name = 'Hymn of Renewal I' THEN 7    -- 7 x 10 = 70 base
    WHEN name = 'Hymn of Renewal II' THEN 18   -- 18 x 10 = 180 base
    WHEN name = 'Hymn of Renewal III' THEN 42  -- 42 x 10 = 420 base
  END,
  'charisma',
  'charisma',
  CASE 
    WHEN name = 'Hymn of Renewal I' THEN 1.2  -- 1.2x CHA scaling per tick
    WHEN name = 'Hymn of Renewal II' THEN 1.5
    WHEN name = 'Hymn of Renewal III' THEN 1.8
  END
FROM abilities
WHERE name IN ('Hymn of Renewal I', 'Hymn of Renewal II', 'Hymn of Renewal III');

-- Song of Rejuvenation (Medium HOT)
INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, is_periodic, tick_interval, tick_count, tick_value, stat_affected, stat_scaling, scaling_factor)
SELECT 
  id,
  1,
  'hot',
  'self',
  1,
  2,
  8,
  31, -- 31 x 8 = 248 base
  'charisma',
  'charisma',
  1.6
FROM abilities
WHERE name = 'Song of Rejuvenation';

-- Aria of Resurrection (Strong HOT)
INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, is_periodic, tick_interval, tick_count, tick_value, stat_affected, stat_scaling, scaling_factor)
SELECT 
  id,
  1,
  'hot',
  'self',
  1,
  2,
  10,
  55, -- 55 x 10 = 550 base
  'charisma',
  'charisma',
  2.0
FROM abilities
WHERE name = 'Aria of Resurrection';

-- Eternal Lifesong (Ultimate HOT)
INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, is_periodic, tick_interval, tick_count, tick_value, stat_affected, stat_scaling, scaling_factor)
SELECT 
  id,
  1,
  'hot',
  'self',
  1,
  2,
  10,
  75, -- 75 x 10 = 750 base
  'charisma',
  'charisma',
  2.2
FROM abilities
WHERE name = 'Eternal Lifesong';

-- ============================================
-- DAMAGE SONGS (DOT Effects)
-- ============================================

-- Discordant Note I-IV (Fast DOTs)
INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, is_periodic, tick_interval, tick_count, tick_value, stat_affected, stat_scaling, scaling_factor)
SELECT 
  id,
  1,
  'dot',
  'enemy',
  1,
  2,
  5,
  CASE 
    WHEN name = 'Discordant Note I' THEN 2    -- 2 x 5 = 10 base
    WHEN name = 'Discordant Note II' THEN 8   -- 8 x 5 = 40 base
    WHEN name = 'Discordant Note III' THEN 25 -- 25 x 5 = 125 base
    WHEN name = 'Discordant Note IV' THEN 54  -- 54 x 5 = 270 base
  END,
  'charisma',
  'charisma',
  CASE 
    WHEN name = 'Discordant Note I' THEN 0.5
    WHEN name = 'Discordant Note II' THEN 0.7
    WHEN name = 'Discordant Note III' THEN 1.0
    WHEN name = 'Discordant Note IV' THEN 1.2
  END
FROM abilities
WHERE name IN ('Discordant Note I', 'Discordant Note II', 'Discordant Note III', 'Discordant Note IV');

-- Cacophony I-IV (Medium DOTs)
INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, is_periodic, tick_interval, tick_count, tick_value, stat_affected, stat_scaling, scaling_factor)
SELECT 
  id,
  1,
  'dot',
  'enemy',
  1,
  2,
  8,
  CASE 
    WHEN name = 'Cacophony I' THEN 2     -- 2 x 8 = 16 base
    WHEN name = 'Cacophony II' THEN 7    -- 7 x 8 = 56 base
    WHEN name = 'Cacophony III' THEN 21  -- 21 x 8 = 168 base
    WHEN name = 'Cacophony IV' THEN 47   -- 47 x 8 = 376 base
  END,
  'charisma',
  'charisma',
  CASE 
    WHEN name = 'Cacophony I' THEN 0.6
    WHEN name = 'Cacophony II' THEN 0.8
    WHEN name = 'Cacophony III' THEN 1.2
    WHEN name = 'Cacophony IV' THEN 1.5
  END
FROM abilities
WHERE name IN ('Cacophony I', 'Cacophony II', 'Cacophony III', 'Cacophony IV');

-- Dirge of Despair I-IV (Strong DOTs)
INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, is_periodic, tick_interval, tick_count, tick_value, stat_affected, stat_scaling, scaling_factor)
SELECT 
  id,
  1,
  'dot',
  'enemy',
  1,
  2,
  10,
  CASE 
    WHEN name = 'Dirge of Despair I' THEN 3   -- 3 x 10 = 30 base
    WHEN name = 'Dirge of Despair II' THEN 9  -- 9 x 10 = 90 base
    WHEN name = 'Dirge of Despair III' THEN 24 -- 24 x 10 = 240 base
    WHEN name = 'Dirge of Despair IV' THEN 51 -- 51 x 10 = 510 base
  END,
  'charisma',
  'charisma',
  CASE 
    WHEN name = 'Dirge of Despair I' THEN 0.7
    WHEN name = 'Dirge of Despair II' THEN 0.9
    WHEN name = 'Dirge of Despair III' THEN 1.3
    WHEN name = 'Dirge of Despair IV' THEN 1.6
  END
FROM abilities
WHERE name IN ('Dirge of Despair I', 'Dirge of Despair II', 'Dirge of Despair III', 'Dirge of Despair IV');

-- Instant Damage Songs (Keep as instant, but move to ability_effects)
-- Sonic Blast
INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, is_periodic, value_min, value_max, stat_affected, stat_scaling, scaling_factor)
SELECT id, 1, 'damage', 'enemy', 0, 5, 8, 'charisma', 'charisma', 0.4
FROM abilities WHERE name = 'Sonic Blast';

-- Resonant Strike
INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, is_periodic, value_min, value_max, stat_affected, stat_scaling, scaling_factor)
SELECT id, 1, 'damage', 'enemy', 0, 12, 18, 'charisma', 'charisma', 0.5
FROM abilities WHERE name = 'Resonant Strike';

-- Harmonic Burst
INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, is_periodic, value_min, value_max, stat_affected, stat_scaling, scaling_factor)
SELECT id, 1, 'damage', 'enemy', 0, 22, 32, 'charisma', 'charisma', 0.6
FROM abilities WHERE name = 'Harmonic Burst';

-- Power Chord
INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, is_periodic, value_min, value_max, stat_affected, stat_scaling, scaling_factor)
SELECT id, 1, 'damage', 'enemy', 0, 45, 62, 'charisma', 'charisma', 0.7
FROM abilities WHERE name = 'Power Chord';

-- Crescendo
INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, is_periodic, value_min, value_max, stat_affected, stat_scaling, scaling_factor)
SELECT id, 1, 'damage', 'enemy', 0, 85, 115, 'charisma', 'charisma', 0.9
FROM abilities WHERE name = 'Crescendo';

-- Fortissimo
INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, is_periodic, value_min, value_max, stat_affected, stat_scaling, scaling_factor)
SELECT id, 1, 'damage', 'enemy', 0, 145, 190, 'charisma', 'charisma', 1.1
FROM abilities WHERE name = 'Fortissimo';

-- Thunderous Chord
INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, is_periodic, value_min, value_max, stat_affected, stat_scaling, scaling_factor)
SELECT id, 1, 'damage', 'enemy', 0, 220, 280, 'charisma', 'charisma', 1.2
FROM abilities WHERE name = 'Thunderous Chord';

-- Scream of Anguish
INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, is_periodic, value_min, value_max, stat_affected, stat_scaling, scaling_factor)
SELECT id, 1, 'damage', 'enemy', 0, 100, 135, 'charisma', 'charisma', 1.0
FROM abilities WHERE name = 'Scream of Anguish';

-- Deathsong
INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, is_periodic, value_min, value_max, stat_affected, stat_scaling, scaling_factor)
SELECT id, 1, 'damage', 'enemy', 0, 280, 350, 'charisma', 'charisma', 1.3
FROM abilities WHERE name = 'Deathsong';

-- Apocalyptic Aria
INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, is_periodic, value_min, value_max, stat_affected, stat_scaling, scaling_factor)
SELECT id, 1, 'damage', 'enemy', 0, 350, 440, 'charisma', 'charisma', 1.4
FROM abilities WHERE name = 'Apocalyptic Aria';

-- Reality Shattering Note
INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, is_periodic, value_min, value_max, stat_affected, stat_scaling, scaling_factor)
SELECT id, 1, 'damage', 'enemy', 0, 520, 650, 'charisma', 'charisma', 1.6
FROM abilities WHERE name = 'Reality Shattering Note';

-- Requiem of Oblivion
INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, is_periodic, value_min, value_max, stat_affected, stat_scaling, scaling_factor)
SELECT id, 1, 'damage', 'enemy', 0, 600, 750, 'charisma', 'charisma', 1.8
FROM abilities WHERE name = 'Requiem of Oblivion';

-- Worldending Symphony
INSERT INTO ability_effects (ability_id, effect_order, effect_type, target, is_periodic, value_min, value_max, stat_affected, stat_scaling, scaling_factor)
SELECT id, 1, 'damage', 'enemy', 0, 750, 950, 'charisma', 'charisma', 1.9
FROM abilities WHERE name = 'Worldending Symphony';

-- ============================================
-- CLEAR OLD DAMAGE/HEALING VALUES
-- ============================================

-- Remove instant damage/healing from abilities table for bard songs
-- (Keep mana cost, cooldown, and type)
UPDATE abilities
SET damage_min = 0, damage_max = 0, healing = 0
WHERE primary_stat = 'charisma';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Show all bard abilities with their new effects
SELECT 
  a.name,
  a.mana_cost,
  a.cooldown,
  ae.effect_type,
  ae.is_periodic,
  CASE 
    WHEN ae.is_periodic = 1 THEN ae.tick_value || ' x ' || ae.tick_count || ' ticks = ' || (ae.tick_value * ae.tick_count) || ' base'
    ELSE ae.value_min || '-' || ae.value_max || ' instant'
  END as damage_or_healing,
  ae.scaling_factor || 'x CHA' as scaling
FROM abilities a
LEFT JOIN ability_effects ae ON a.id = ae.ability_id
WHERE a.primary_stat = 'charisma'
ORDER BY 
  CASE 
    WHEN ae.effect_type = 'hot' THEN 1
    WHEN ae.effect_type = 'dot' THEN 2
    ELSE 3
  END,
  a.name;

-- Count bard abilities by effect type
SELECT 
  COALESCE(ae.effect_type, 'no_effect') as effect_type,
  COUNT(DISTINCT a.id) as ability_count
FROM abilities a
LEFT JOIN ability_effects ae ON a.id = ae.ability_id
WHERE a.primary_stat = 'charisma'
GROUP BY COALESCE(ae.effect_type, 'no_effect');
