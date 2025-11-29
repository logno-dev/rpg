#!/usr/bin/env node
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Configuration for each ability chain
const abilityConfigs = {
  // Damage abilities
  'Hamstring': {
    type: 'damage',
    baseDamage: [6, 10],
    damagePerLevel: 3,
    statScaling: 0.4,
    primaryStat: 'dexterity',
    weaponRequirement: 'sword,dagger',
    description: 'Light damage with slow debuff'
  },
  'Shield Bash': {
    type: 'damage',
    baseDamage: [10, 14],
    damagePerLevel: 3,
    statScaling: 0.4,
    primaryStat: 'strength',
    offhandRequirement: 'shield',
    description: 'Tank damage ability requiring shield'
  },
  
  // Buff abilities
  'War Cry': {
    type: 'buff',
    statBuff: 'strength',
    buffValue: 2,
    buffPerLevel: 1,
    duration: 30,
    durationPerLevel: 5,
    description: 'Increases strength temporarily'
  },
  'Adrenaline Rush': {
    type: 'buff',
    statBuff: 'dexterity',
    buffValue: 2,
    buffPerLevel: 1,
    duration: 30,
    durationPerLevel: 5,
    description: 'Increases dexterity temporarily'
  },
  'Berserker Rage': {
    type: 'buff',
    statBuff: 'strength',
    buffValue: 3,
    buffPerLevel: 2,
    duration: 20,
    durationPerLevel: 3,
    description: 'Large strength boost, shorter duration'
  }
};

async function main() {
  console.log('🔍 Finding all abilities missing effects...\n');
  
  const missingEffects = await db.execute(`
    SELECT 
      a.id, 
      a.name, 
      a.category,
      a.level,
      a.primary_stat,
      a.stat_scaling,
      a.weapon_type_requirement,
      a.offhand_type_requirement
    FROM abilities a
    LEFT JOIN ability_effects ae ON a.id = ae.ability_id
    WHERE a.category IN ('damage', 'heal', 'buff', 'debuff')
    GROUP BY a.id
    HAVING COUNT(ae.id) = 0
    ORDER BY a.category, a.name, a.level
  `);

  console.log(`Found ${missingEffects.rows.length} abilities missing effects\n`);
  
  // Group by ability chain
  const chains = {};
  missingEffects.rows.forEach(row => {
    const baseName = row.name.replace(/ [IVX]+$/, '');
    if (!chains[baseName]) chains[baseName] = [];
    chains[baseName].push(row);
  });

  console.log('📝 Ability chains found:');
  Object.keys(chains).forEach(name => {
    console.log(`  - ${name} (${chains[name].length} tiers)`);
  });
  console.log('');

  console.log('--- Adding Effects ---\n');

  let totalAdded = 0;

  for (const [chainName, abilities] of Object.entries(chains)) {
    const config = abilityConfigs[chainName];
    
    if (!config) {
      console.log(`⚠️  No config found for "${chainName}", skipping...`);
      continue;
    }

    console.log(`\n${chainName} (${config.type}):`);
    
    for (let i = 0; i < abilities.length; i++) {
      const ability = abilities[i];
      const tier = i;
      
      if (config.type === 'damage') {
        const minDamage = config.baseDamage[0] + (tier * config.damagePerLevel);
        const maxDamage = config.baseDamage[1] + (tier * config.damagePerLevel);
        
        await db.execute({
          sql: `INSERT INTO ability_effects (
            ability_id, effect_order, effect_type, target,
            value_min, value_max, stat_affected, scaling_factor,
            duration, chance, stacks_max, is_periodic,
            tick_interval, tick_count, tick_value, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            ability.id, 0, 'damage', 'enemy',
            minDamage, maxDamage, config.primaryStat, config.statScaling,
            0, 1, 1, 0, 0, 0, 0,
            Math.floor(Date.now() / 1000)
          ]
        });
        
        console.log(`  ✅ ${ability.name}: ${minDamage}-${maxDamage} dmg + ${config.statScaling * 100}% ${config.primaryStat}`);
        totalAdded++;
        
      } else if (config.type === 'buff') {
        const buffAmount = config.buffValue + (tier * config.buffPerLevel);
        const duration = config.duration + (tier * config.durationPerLevel);
        
        await db.execute({
          sql: `INSERT INTO ability_effects (
            ability_id, effect_order, effect_type, target,
            value_min, value_max, stat_affected, scaling_factor,
            duration, chance, stacks_max, is_periodic,
            tick_interval, tick_count, tick_value, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            ability.id, 0, 'buff', 'self',
            buffAmount, buffAmount, config.statBuff, 0,
            duration, 1, 1, 0, 0, 0, 0,
            Math.floor(Date.now() / 1000)
          ]
        });
        
        console.log(`  ✅ ${ability.name}: +${buffAmount} ${config.statBuff} for ${duration}s`);
        totalAdded++;
      }
    }
  }

  console.log(`\n--- Verification ---\n`);
  
  const stillMissing = await db.execute(`
    SELECT 
      a.id, 
      a.name,
      a.category
    FROM abilities a
    LEFT JOIN ability_effects ae ON a.id = ae.ability_id
    WHERE a.category IN ('damage', 'heal', 'buff', 'debuff')
    GROUP BY a.id
    HAVING COUNT(ae.id) = 0
    ORDER BY a.category, a.name
    LIMIT 20
  `);

  if (stillMissing.rows.length === 0) {
    console.log('✅ All combat abilities now have effects!');
  } else {
    console.log(`⚠️  ${stillMissing.rows.length} abilities still missing effects:`);
    stillMissing.rows.forEach(row => {
      console.log(`  - ${row.name} (${row.category})`);
    });
  }

  console.log(`\n📊 Summary: Added ${totalAdded} effects total`);
  
  console.log('\n✅ Done!');
}

main().catch(console.error);
