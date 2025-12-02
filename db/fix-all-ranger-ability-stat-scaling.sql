-- Fix ALL Ranger ability effects - stat_scaling should be 'dexterity', not the scaling factor number
-- The bug: ability_effects.stat_scaling was set to numbers like 0.8, 0.5, etc.
-- Should be: stat_scaling = 'dexterity', scaling_factor = 0.8, 0.5, etc.

-- ============================================
-- AIMED SHOT
-- ============================================
UPDATE ability_effects
SET stat_scaling = 'dexterity', scaling_factor = 0.8
WHERE ability_id = (SELECT id FROM abilities WHERE name = 'Aimed Shot I') AND effect_type = 'damage';

UPDATE ability_effects
SET stat_scaling = 'dexterity', scaling_factor = 1.0
WHERE ability_id = (SELECT id FROM abilities WHERE name = 'Aimed Shot II') AND effect_type = 'damage';

UPDATE ability_effects
SET stat_scaling = 'dexterity', scaling_factor = 1.2
WHERE ability_id = (SELECT id FROM abilities WHERE name = 'Aimed Shot III') AND effect_type = 'damage';

UPDATE ability_effects
SET stat_scaling = 'dexterity', scaling_factor = 1.4
WHERE ability_id = (SELECT id FROM abilities WHERE name = 'Aimed Shot IV') AND effect_type = 'damage';

UPDATE ability_effects
SET stat_scaling = 'dexterity', scaling_factor = 1.6
WHERE ability_id = (SELECT id FROM abilities WHERE name = 'Aimed Shot V') AND effect_type = 'damage';

-- ============================================
-- MULTI-SHOT
-- ============================================
UPDATE ability_effects
SET stat_scaling = 'dexterity', scaling_factor = 0.5
WHERE ability_id = (SELECT id FROM abilities WHERE name = 'Multi-Shot I') AND effect_type = 'damage';

UPDATE ability_effects
SET stat_scaling = 'dexterity', scaling_factor = 0.6
WHERE ability_id = (SELECT id FROM abilities WHERE name = 'Multi-Shot II') AND effect_type = 'damage';

UPDATE ability_effects
SET stat_scaling = 'dexterity', scaling_factor = 0.7
WHERE ability_id = (SELECT id FROM abilities WHERE name = 'Multi-Shot III') AND effect_type = 'damage';

UPDATE ability_effects
SET stat_scaling = 'dexterity', scaling_factor = 0.8
WHERE ability_id = (SELECT id FROM abilities WHERE name = 'Multi-Shot IV') AND effect_type = 'damage';

UPDATE ability_effects
SET stat_scaling = 'dexterity', scaling_factor = 0.9
WHERE ability_id = (SELECT id FROM abilities WHERE name = 'Multi-Shot V') AND effect_type = 'damage';

-- ============================================
-- POISON ARROW (initial damage and DoT)
-- ============================================
-- Tier I - initial damage
UPDATE ability_effects
SET stat_scaling = 'dexterity', scaling_factor = 0.4
WHERE ability_id = (SELECT id FROM abilities WHERE name = 'Poison Arrow I') 
  AND effect_type = 'damage' AND effect_order = 0;

-- Tier I - DoT
UPDATE ability_effects
SET stat_scaling = 'dexterity', scaling_factor = 0.2
WHERE ability_id = (SELECT id FROM abilities WHERE name = 'Poison Arrow I') 
  AND effect_type = 'damage' AND effect_order = 1;

-- Tier II - initial damage
UPDATE ability_effects
SET stat_scaling = 'dexterity', scaling_factor = 0.5
WHERE ability_id = (SELECT id FROM abilities WHERE name = 'Poison Arrow II') 
  AND effect_type = 'damage' AND effect_order = 0;

-- Tier II - DoT
UPDATE ability_effects
SET stat_scaling = 'dexterity', scaling_factor = 0.25
WHERE ability_id = (SELECT id FROM abilities WHERE name = 'Poison Arrow II') 
  AND effect_type = 'damage' AND effect_order = 1;

-- Tier III - initial damage
UPDATE ability_effects
SET stat_scaling = 'dexterity', scaling_factor = 0.6
WHERE ability_id = (SELECT id FROM abilities WHERE name = 'Poison Arrow III') 
  AND effect_type = 'damage' AND effect_order = 0;

-- Tier III - DoT
UPDATE ability_effects
SET stat_scaling = 'dexterity', scaling_factor = 0.3
WHERE ability_id = (SELECT id FROM abilities WHERE name = 'Poison Arrow III') 
  AND effect_type = 'damage' AND effect_order = 1;

-- Tier IV - initial damage
UPDATE ability_effects
SET stat_scaling = 'dexterity', scaling_factor = 0.7
WHERE ability_id = (SELECT id FROM abilities WHERE name = 'Poison Arrow IV') 
  AND effect_type = 'damage' AND effect_order = 0;

-- Tier IV - DoT
UPDATE ability_effects
SET stat_scaling = 'dexterity', scaling_factor = 0.35
WHERE ability_id = (SELECT id FROM abilities WHERE name = 'Poison Arrow IV') 
  AND effect_type = 'damage' AND effect_order = 1;

-- Tier V - initial damage
UPDATE ability_effects
SET stat_scaling = 'dexterity', scaling_factor = 0.8
WHERE ability_id = (SELECT id FROM abilities WHERE name = 'Poison Arrow V') 
  AND effect_type = 'damage' AND effect_order = 0;

-- Tier V - DoT
UPDATE ability_effects
SET stat_scaling = 'dexterity', scaling_factor = 0.4
WHERE ability_id = (SELECT id FROM abilities WHERE name = 'Poison Arrow V') 
  AND effect_type = 'damage' AND effect_order = 1;

-- ============================================
-- EVASION (buff ability)
-- ============================================
-- Note: Evasion buffs evasiveness stat, scaling based on dexterity
UPDATE ability_effects
SET stat_scaling = 'dexterity', scaling_factor = 0.3
WHERE ability_id = (SELECT id FROM abilities WHERE name = 'Evasion I') AND effect_type = 'buff';

UPDATE ability_effects
SET stat_scaling = 'dexterity', scaling_factor = 0.4
WHERE ability_id = (SELECT id FROM abilities WHERE name = 'Evasion II') AND effect_type = 'buff';

UPDATE ability_effects
SET stat_scaling = 'dexterity', scaling_factor = 0.5
WHERE ability_id = (SELECT id FROM abilities WHERE name = 'Evasion III') AND effect_type = 'buff';

UPDATE ability_effects
SET stat_scaling = 'dexterity', scaling_factor = 0.6
WHERE ability_id = (SELECT id FROM abilities WHERE name = 'Evasion IV') AND effect_type = 'buff';

UPDATE ability_effects
SET stat_scaling = 'dexterity', scaling_factor = 0.7
WHERE ability_id = (SELECT id FROM abilities WHERE name = 'Evasion V') AND effect_type = 'buff';

-- ============================================
-- RAPID FIRE
-- ============================================
UPDATE ability_effects
SET stat_scaling = 'dexterity', scaling_factor = 0.4
WHERE ability_id = (SELECT id FROM abilities WHERE name = 'Rapid Fire I') AND effect_type = 'damage';

UPDATE ability_effects
SET stat_scaling = 'dexterity', scaling_factor = 0.5
WHERE ability_id = (SELECT id FROM abilities WHERE name = 'Rapid Fire II') AND effect_type = 'damage';

UPDATE ability_effects
SET stat_scaling = 'dexterity', scaling_factor = 0.6
WHERE ability_id = (SELECT id FROM abilities WHERE name = 'Rapid Fire III') AND effect_type = 'damage';

UPDATE ability_effects
SET stat_scaling = 'dexterity', scaling_factor = 0.7
WHERE ability_id = (SELECT id FROM abilities WHERE name = 'Rapid Fire IV') AND effect_type = 'damage';

UPDATE ability_effects
SET stat_scaling = 'dexterity', scaling_factor = 0.8
WHERE ability_id = (SELECT id FROM abilities WHERE name = 'Rapid Fire V') AND effect_type = 'damage';

-- ============================================
-- CRIPPLING SHOT (damage + debuff)
-- ============================================
-- Tier I - damage
UPDATE ability_effects
SET stat_scaling = 'dexterity', scaling_factor = 0.5
WHERE ability_id = (SELECT id FROM abilities WHERE name = 'Crippling Shot I') 
  AND effect_type = 'damage';

-- Tier I - debuff (evasiveness reduction)
UPDATE ability_effects
SET stat_scaling = 'dexterity', scaling_factor = 0.2
WHERE ability_id = (SELECT id FROM abilities WHERE name = 'Crippling Shot I') 
  AND effect_type = 'debuff';

-- Tier II - damage
UPDATE ability_effects
SET stat_scaling = 'dexterity', scaling_factor = 0.6
WHERE ability_id = (SELECT id FROM abilities WHERE name = 'Crippling Shot II') 
  AND effect_type = 'damage';

-- Tier II - debuff
UPDATE ability_effects
SET stat_scaling = 'dexterity', scaling_factor = 0.25
WHERE ability_id = (SELECT id FROM abilities WHERE name = 'Crippling Shot II') 
  AND effect_type = 'debuff';

-- Tier III - damage
UPDATE ability_effects
SET stat_scaling = 'dexterity', scaling_factor = 0.7
WHERE ability_id = (SELECT id FROM abilities WHERE name = 'Crippling Shot III') 
  AND effect_type = 'damage';

-- Tier III - debuff
UPDATE ability_effects
SET stat_scaling = 'dexterity', scaling_factor = 0.3
WHERE ability_id = (SELECT id FROM abilities WHERE name = 'Crippling Shot III') 
  AND effect_type = 'debuff';

-- Tier IV - damage
UPDATE ability_effects
SET stat_scaling = 'dexterity', scaling_factor = 0.8
WHERE ability_id = (SELECT id FROM abilities WHERE name = 'Crippling Shot IV') 
  AND effect_type = 'damage';

-- Tier IV - debuff
UPDATE ability_effects
SET stat_scaling = 'dexterity', scaling_factor = 0.35
WHERE ability_id = (SELECT id FROM abilities WHERE name = 'Crippling Shot IV') 
  AND effect_type = 'debuff';

-- Tier V - damage
UPDATE ability_effects
SET stat_scaling = 'dexterity', scaling_factor = 0.9
WHERE ability_id = (SELECT id FROM abilities WHERE name = 'Crippling Shot V') 
  AND effect_type = 'damage';

-- Tier V - debuff
UPDATE ability_effects
SET stat_scaling = 'dexterity', scaling_factor = 0.4
WHERE ability_id = (SELECT id FROM abilities WHERE name = 'Crippling Shot V') 
  AND effect_type = 'debuff';
