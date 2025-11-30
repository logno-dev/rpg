#!/usr/bin/env node

/**
 * Add Ranger Abilities System
 * 
 * Creates a complete set of ranger abilities with 5 tiers each:
 * 1. Aimed Shot - High damage single target (physical)
 * 2. Multi-Shot - Damage multiple enemies (physical)
 * 3. Poison Arrow - Damage over time with poison (magic, uses mana)
 * 4. Explosive Arrow - Area damage (magic, uses mana)
 * 5. Rapid Fire - Quick successive shots (physical, low cooldown)
 * 
 * All abilities require bow or quiver and scale with dexterity.
 */

import Database from 'better-sqlite3';

const db = new Database('rpg.db');

console.log('Creating ranger abilities system...\n');

// Helper to get next ability ID
const getNextAbilityId = () => {
  const result = db.prepare('SELECT MAX(id) as max_id FROM abilities').get();
  return (result.max_id || 0) + 1;
};

// Helper to get next item ID
const getNextItemId = () => {
  const result = db.prepare('SELECT MAX(id) as max_id FROM items').get();
  return (result.max_id || 0) + 1;
};

// Helper to get next effect ID
const getNextEffectId = () => {
  const result = db.prepare('SELECT MAX(id) as max_id FROM ability_effects').get();
  return (result.max_id || 0) + 1;
};

// Tier progression patterns (based on Backstab)
const tierProgression = {
  1: { level: 3, requiredDex: 16 },
  2: { level: 16, requiredDex: 32 },
  3: { level: 23, requiredDex: 40 },
  4: { level: 36, requiredDex: 58 },
  5: { level: 49, requiredDex: 71 }
};

const rarityByTier = {
  1: 'common',
  2: 'uncommon',
  3: 'rare',
  4: 'epic',
  5: 'legendary'
};

const scrollValueByTier = {
  1: 75,
  2: 200,
  3: 500,
  4: 1200,
  5: 3000
};

// Ability definitions
const abilities = [
  {
    baseName: 'Aimed Shot',
    description: 'A carefully aimed arrow that deals devastating damage',
    type: 'ability',
    category: 'damage',
    primaryStat: 'dexterity',
    weaponRequirement: 'bow',
    offhandRequirement: 'quiver',
    tiers: [
      { cooldown: 6, manaCost: 0, damageMin: 15, damageMax: 25, statScaling: 0.8 },
      { cooldown: 6, manaCost: 0, damageMin: 28, damageMax: 42, statScaling: 1.0 },
      { cooldown: 6, manaCost: 0, damageMin: 45, damageMax: 65, statScaling: 1.2 },
      { cooldown: 6, manaCost: 0, damageMin: 70, damageMax: 95, statScaling: 1.4 },
      { cooldown: 6, manaCost: 0, damageMin: 105, damageMax: 140, statScaling: 1.6 }
    ],
    effectType: 'damage'
  },
  {
    baseName: 'Multi-Shot',
    description: 'Fire arrows at multiple targets in quick succession',
    type: 'ability',
    category: 'damage',
    primaryStat: 'dexterity',
    weaponRequirement: 'bow',
    offhandRequirement: 'quiver',
    tiers: [
      { cooldown: 10, manaCost: 0, damageMin: 8, damageMax: 14, statScaling: 0.5, targets: 2 },
      { cooldown: 10, manaCost: 0, damageMin: 15, damageMax: 23, statScaling: 0.6, targets: 3 },
      { cooldown: 10, manaCost: 0, damageMin: 24, damageMax: 35, statScaling: 0.7, targets: 3 },
      { cooldown: 10, manaCost: 0, damageMin: 38, damageMax: 52, statScaling: 0.8, targets: 4 },
      { cooldown: 10, manaCost: 0, damageMin: 58, damageMax: 78, statScaling: 0.9, targets: 5 }
    ],
    effectType: 'multi_damage'
  },
  {
    baseName: 'Poison Arrow',
    description: 'An arrow coated with deadly poison that deals damage over time',
    type: 'spell',
    category: 'magic',
    primaryStat: 'dexterity',
    weaponRequirement: 'bow',
    offhandRequirement: 'quiver',
    tiers: [
      { cooldown: 8, manaCost: 10, damageMin: 5, damageMax: 8, statScaling: 0.4, tickDamage: 3, tickCount: 5, tickInterval: 2 },
      { cooldown: 8, manaCost: 15, damageMin: 10, damageMax: 15, statScaling: 0.5, tickDamage: 5, tickCount: 6, tickInterval: 2 },
      { cooldown: 8, manaCost: 22, damageMin: 16, damageMax: 24, statScaling: 0.6, tickDamage: 8, tickCount: 6, tickInterval: 2 },
      { cooldown: 8, manaCost: 32, damageMin: 26, damageMax: 38, statScaling: 0.7, tickDamage: 12, tickCount: 7, tickInterval: 2 },
      { cooldown: 8, manaCost: 45, damageMin: 40, damageMax: 58, statScaling: 0.8, tickDamage: 18, tickCount: 8, tickInterval: 2 }
    ],
    effectType: 'poison_dot'
  },
  {
    baseName: 'Explosive Arrow',
    description: 'A magically charged arrow that explodes on impact',
    type: 'spell',
    category: 'magic',
    primaryStat: 'dexterity',
    weaponRequirement: 'bow',
    offhandRequirement: 'quiver',
    tiers: [
      { cooldown: 12, manaCost: 20, damageMin: 18, damageMax: 28, statScaling: 0.9 },
      { cooldown: 12, manaCost: 30, damageMin: 32, damageMax: 48, statScaling: 1.1 },
      { cooldown: 12, manaCost: 42, damageMin: 52, damageMax: 72, statScaling: 1.3 },
      { cooldown: 12, manaCost: 58, damageMin: 80, damageMax: 110, statScaling: 1.5 },
      { cooldown: 12, manaCost: 78, damageMin: 120, damageMax: 160, statScaling: 1.7 }
    ],
    effectType: 'damage'
  },
  {
    baseName: 'Rapid Fire',
    description: 'Unleash a flurry of rapid shots at your target',
    type: 'ability',
    category: 'damage',
    primaryStat: 'dexterity',
    weaponRequirement: 'bow',
    offhandRequirement: 'quiver',
    tiers: [
      { cooldown: 5, manaCost: 0, damageMin: 6, damageMax: 10, statScaling: 0.4, hits: 3 },
      { cooldown: 5, manaCost: 0, damageMin: 11, damageMax: 17, statScaling: 0.5, hits: 3 },
      { cooldown: 5, manaCost: 0, damageMin: 18, damageMax: 26, statScaling: 0.6, hits: 4 },
      { cooldown: 5, manaCost: 0, damageMin: 28, damageMax: 40, statScaling: 0.7, hits: 4 },
      { cooldown: 5, manaCost: 0, damageMin: 42, damageMax: 60, statScaling: 0.8, hits: 5 }
    ],
    effectType: 'rapid_damage'
  }
];

let nextAbilityId = getNextAbilityId();
let nextItemId = getNextItemId();
let nextEffectId = getNextEffectId();

const abilityInsert = db.prepare(`
  INSERT INTO abilities (
    id, name, description, type, category, level, base_id, primary_stat, stat_scaling,
    required_level, required_dexterity, mana_cost, cooldown, 
    weapon_type_requirement, offhand_type_requirement, created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const effectInsert = db.prepare(`
  INSERT INTO ability_effects (
    id, ability_id, effect_order, effect_type, target, value_min, value_max,
    is_periodic, tick_interval, tick_count, tick_value, stat_affected,
    stat_scaling, scaling_factor, duration, chance, stacks_max, created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const itemInsert = db.prepare(`
  INSERT INTO items (
    id, name, description, type, rarity, value, stackable,
    teaches_ability_id, required_level, required_dexterity, created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const timestamp = Math.floor(Date.now() / 1000);
const abilityMap = new Map(); // Store base_id mapping

// Create all abilities and their effects
abilities.forEach((ability) => {
  let baseId = null;
  
  ability.tiers.forEach((tier, index) => {
    const tierNum = index + 1;
    const tierName = ['I', 'II', 'III', 'IV', 'V'][index];
    const fullName = `${ability.baseName} ${tierName}`;
    const currentAbilityId = nextAbilityId++;
    
    if (tierNum === 1) {
      baseId = currentAbilityId;
      abilityMap.set(ability.baseName, baseId);
    }
    
    const prog = tierProgression[tierNum];
    
    // Insert ability
    abilityInsert.run(
      currentAbilityId,
      fullName,
      ability.description,
      ability.type,
      ability.category,
      tierNum,
      baseId,
      ability.primaryStat,
      tier.statScaling || 0,
      prog.level,
      prog.requiredDex,
      tier.manaCost,
      tier.cooldown,
      ability.weaponRequirement,
      ability.offhandRequirement,
      timestamp
    );
    
    console.log(`Created ability: ${fullName} (ID: ${currentAbilityId})`);
    
    // Create ability effects
    const currentEffectId = nextEffectId++;
    
    if (ability.effectType === 'damage') {
      // Simple damage effect
      effectInsert.run(
        currentEffectId,
        currentAbilityId,
        0, // effect_order
        'damage',
        'enemy',
        tier.damageMin,
        tier.damageMax,
        0, // is_periodic
        2, // tick_interval (default)
        0, // tick_count
        0, // tick_value
        null,
        ability.primaryStat,
        tier.statScaling,
        0, // duration
        1, // chance
        1, // stacks_max
        timestamp
      );
    } else if (ability.effectType === 'multi_damage') {
      // Multi-target damage
      effectInsert.run(
        currentEffectId,
        currentAbilityId,
        0,
        'damage',
        'enemy',
        tier.damageMin,
        tier.damageMax,
        0,
        2,
        0,
        0,
        null,
        ability.primaryStat,
        tier.statScaling,
        0,
        1,
        1,
        timestamp
      );
      console.log(`  - Hits ${tier.targets} targets`);
    } else if (ability.effectType === 'poison_dot') {
      // Initial damage
      effectInsert.run(
        currentEffectId,
        currentAbilityId,
        0,
        'damage',
        'enemy',
        tier.damageMin,
        tier.damageMax,
        0,
        2,
        0,
        0,
        null,
        ability.primaryStat,
        tier.statScaling,
        0,
        1,
        1,
        timestamp
      );
      
      // DoT effect
      const dotEffectId = nextEffectId++;
      effectInsert.run(
        dotEffectId,
        currentAbilityId,
        1,
        'damage',
        'enemy',
        tier.tickDamage,
        tier.tickDamage,
        1, // is_periodic
        tier.tickInterval,
        tier.tickCount,
        tier.tickDamage,
        null,
        ability.primaryStat,
        tier.statScaling * 0.5, // DoT scales at 50% of main stat
        tier.tickCount * tier.tickInterval, // duration
        1,
        1,
        timestamp
      );
      console.log(`  - Poison DoT: ${tier.tickDamage} damage x ${tier.tickCount} ticks`);
    } else if (ability.effectType === 'rapid_damage') {
      // Multiple hits
      effectInsert.run(
        currentEffectId,
        currentAbilityId,
        0,
        'damage',
        'enemy',
        tier.damageMin,
        tier.damageMax,
        0,
        2,
        0,
        0,
        null,
        ability.primaryStat,
        tier.statScaling,
        0,
        1,
        1,
        timestamp
      );
      console.log(`  - ${tier.hits} rapid hits`);
    }
    
    // Create scroll for this ability
    const scrollId = nextItemId++;
    const scrollName = `Scroll: ${fullName}`;
    const scrollDesc = `Teaches you the ${fullName} ability`;
    
    itemInsert.run(
      scrollId,
      scrollName,
      scrollDesc,
      'scroll',
      rarityByTier[tierNum],
      scrollValueByTier[tierNum],
      1, // stackable
      currentAbilityId,
      prog.level,
      prog.requiredDex,
      timestamp
    );
    
    console.log(`  Created scroll: ${scrollName} (ID: ${scrollId})\n`);
  });
});

console.log('\n=== Ranger Abilities Summary ===');
console.log(`Total abilities created: ${nextAbilityId - getNextAbilityId() + abilities.length * 5}`);
console.log(`Total scrolls created: ${abilities.length * 5}`);
console.log('\nAbilities created:');
abilities.forEach(ability => {
  console.log(`- ${ability.baseName} (I-V) - ${ability.description}`);
});

db.close();
console.log('\nDone!');
