-- Fix Aimed Shot ability effects - stat_scaling should be 'dexterity', not the scaling factor number

-- Aimed Shot I (15-25 damage, 0.8 scaling)
UPDATE ability_effects
SET stat_scaling = 'dexterity',
    scaling_factor = 0.8
WHERE ability_id = (SELECT id FROM abilities WHERE name = 'Aimed Shot I')
  AND effect_type = 'damage';

-- Aimed Shot II (28-42 damage, 1.0 scaling)
UPDATE ability_effects
SET stat_scaling = 'dexterity',
    scaling_factor = 1.0
WHERE ability_id = (SELECT id FROM abilities WHERE name = 'Aimed Shot II')
  AND effect_type = 'damage';

-- Aimed Shot III (45-65 damage, 1.2 scaling)
UPDATE ability_effects
SET stat_scaling = 'dexterity',
    scaling_factor = 1.2
WHERE ability_id = (SELECT id FROM abilities WHERE name = 'Aimed Shot III')
  AND effect_type = 'damage';

-- Aimed Shot IV (70-95 damage, 1.4 scaling)
UPDATE ability_effects
SET stat_scaling = 'dexterity',
    scaling_factor = 1.4
WHERE ability_id = (SELECT id FROM abilities WHERE name = 'Aimed Shot IV')
  AND effect_type = 'damage';

-- Aimed Shot V (105-140 damage, 1.6 scaling)
UPDATE ability_effects
SET stat_scaling = 'dexterity',
    scaling_factor = 1.6
WHERE ability_id = (SELECT id FROM abilities WHERE name = 'Aimed Shot V')
  AND effect_type = 'damage';
