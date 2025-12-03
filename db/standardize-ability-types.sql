-- Standardizing Ability Types and Categories
-- Based on CombatEngine.tsx usage and effect types

BEGIN TRANSACTION;

-- Standardize TYPE field
-- Map old values to standard values based on CombatEngine expectations
UPDATE abilities SET type = 'damage' WHERE type = 'ability';
UPDATE abilities SET type = 'damage' WHERE type = 'active';
UPDATE abilities SET type = 'damage' WHERE type = 'magical';
UPDATE abilities SET type = 'damage' WHERE type = 'spell';

-- Standardize CATEGORY field
-- Map old values to 'combat', 'passive', or 'crafting'
UPDATE abilities SET category = 'combat' WHERE category = 'buff';
UPDATE abilities SET category = 'combat' WHERE category = 'damage';
UPDATE abilities SET category = 'combat' WHERE category = 'defense';
UPDATE abilities SET category = 'combat' WHERE category = 'heal';
UPDATE abilities SET category = 'combat' WHERE category = 'magic';

-- Intelligently set TYPE based on ability_effects
-- Abilities with heal effects -> type = heal
UPDATE abilities 
SET type = 'heal'
WHERE id IN (
  SELECT DISTINCT a.id
  FROM abilities a
  JOIN ability_effects ae ON a.id = ae.ability_id
  WHERE ae.effect_type = 'heal'
);

-- Abilities with ONLY buff effects -> type = buff
UPDATE abilities 
SET type = 'buff'
WHERE id IN (
  SELECT DISTINCT a.id
  FROM abilities a
  JOIN ability_effects ae ON a.id = ae.ability_id
  WHERE ae.effect_type = 'buff'
  AND NOT EXISTS (
    SELECT 1 FROM ability_effects ae2 
    WHERE ae2.ability_id = a.id 
    AND ae2.effect_type IN ('damage', 'heal')
  )
);

-- Abilities with ONLY debuff effects -> type = debuff
UPDATE abilities 
SET type = 'debuff'
WHERE id IN (
  SELECT DISTINCT a.id
  FROM abilities a
  JOIN ability_effects ae ON a.id = ae.ability_id
  WHERE ae.effect_type = 'debuff'
  AND NOT EXISTS (
    SELECT 1 FROM ability_effects ae2 
    WHERE ae2.ability_id = a.id 
    AND ae2.effect_type IN ('damage', 'heal', 'buff')
  )
);

-- Abilities with damage/dot effects -> type = damage
UPDATE abilities 
SET type = 'damage'
WHERE id IN (
  SELECT DISTINCT a.id
  FROM abilities a
  JOIN ability_effects ae ON a.id = ae.ability_id
  WHERE ae.effect_type IN ('damage', 'dot')
  AND a.type NOT IN ('heal', 'buff', 'debuff')
);

COMMIT;
