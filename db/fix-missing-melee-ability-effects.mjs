#!/usr/bin/env node
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  console.log('🔍 Finding melee abilities missing effects...\n');
  
  // Find all damage abilities with weapon requirements but no effects
  const missingEffects = await db.execute(`
    SELECT 
      a.id, 
      a.name, 
      a.level,
      a.primary_stat,
      a.stat_scaling,
      a.weapon_type_requirement
    FROM abilities a
    LEFT JOIN ability_effects ae ON a.id = ae.ability_id
    WHERE a.category = 'damage' 
      AND a.weapon_type_requirement IS NOT NULL
    GROUP BY a.id
    HAVING COUNT(ae.id) = 0
    ORDER BY a.name, a.level
  `);

  console.log(`Found ${missingEffects.rows.length} abilities missing effects:\n`);
  
  // Group by ability chain
  const chains = {};
  missingEffects.rows.forEach(row => {
    const baseName = row.name.replace(/ [IV]+$/, '');
    if (!chains[baseName]) chains[baseName] = [];
    chains[baseName].push(row);
  });

  // Define damage scaling for each ability chain
  const abilityConfigs = {
    'Strike': {
      baseDamage: [8, 12],  // Level 1
      damagePerLevel: 3,     // +3 min/max per tier
      statScaling: 0.5,      // 50% of strength
      primaryStat: 'strength'
    },
    'Cleave': {
      baseDamage: [12, 18],  // Higher base damage (AoE)
      damagePerLevel: 4,
      statScaling: 0.5,
      primaryStat: 'strength'
    },
    'Precise Strike': {
      baseDamage: [10, 16],
      damagePerLevel: 4,
      statScaling: 0.6,      // Higher stat scaling for precision
      primaryStat: 'dexterity'
    }
  };

  console.log('📝 Ability configurations:');
  Object.entries(abilityConfigs).forEach(([name, config]) => {
    console.log(`  ${name}:`);
    console.log(`    - Base Damage: ${config.baseDamage[0]}-${config.baseDamage[1]}`);
    console.log(`    - Scales with ${config.primaryStat} (${config.statScaling * 100}%)`);
    console.log(`    - +${config.damagePerLevel} damage per tier`);
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

    console.log(`\n${chainName} Chain (${abilities.length} abilities):`);
    
    for (let i = 0; i < abilities.length; i++) {
      const ability = abilities[i];
      const tier = i; // 0-indexed tier
      
      // Calculate damage for this tier
      const minDamage = config.baseDamage[0] + (tier * config.damagePerLevel);
      const maxDamage = config.baseDamage[1] + (tier * config.damagePerLevel);
      
      // Insert effect
      await db.execute({
        sql: `INSERT INTO ability_effects (
          ability_id,
          effect_order,
          effect_type,
          target,
          value_min,
          value_max,
          stat_affected,
          scaling_factor,
          duration,
          chance,
          stacks_max,
          is_periodic,
          tick_interval,
          tick_count,
          tick_value,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          ability.id,
          0,                    // effect_order
          'damage',             // effect_type
          'enemy',              // target
          minDamage,            // value_min
          maxDamage,            // value_max
          config.primaryStat,   // stat_affected
          config.statScaling,   // scaling_factor
          0,                    // duration (instant)
          1,                    // chance (100%)
          1,                    // stacks_max
          0,                    // is_periodic
          0,                    // tick_interval
          0,                    // tick_count
          0,                    // tick_value
          Math.floor(Date.now() / 1000)
        ]
      });
      
      console.log(`  ✅ ${ability.name} (Lv${ability.level}): ${minDamage}-${maxDamage} damage + ${config.statScaling * 100}% ${config.primaryStat}`);
      totalAdded++;
    }
  }

  console.log(`\n--- Verification ---\n`);
  
  // Verify all abilities now have effects
  const stillMissing = await db.execute(`
    SELECT 
      a.id, 
      a.name
    FROM abilities a
    LEFT JOIN ability_effects ae ON a.id = ae.ability_id
    WHERE a.category = 'damage' 
      AND a.weapon_type_requirement IS NOT NULL
    GROUP BY a.id
    HAVING COUNT(ae.id) = 0
    ORDER BY a.name
  `);

  if (stillMissing.rows.length === 0) {
    console.log('✅ All melee abilities now have effects!');
  } else {
    console.log(`⚠️  ${stillMissing.rows.length} abilities still missing effects:`);
    stillMissing.rows.forEach(row => {
      console.log(`  - ${row.name} (ID: ${row.id})`);
    });
  }

  console.log(`\n📊 Summary: Added ${totalAdded} effects total`);
  
  // Show sample of what was added
  console.log('\n--- Sample Effects Added ---\n');
  const samples = await db.execute(`
    SELECT 
      a.name,
      a.level,
      ae.value_min,
      ae.value_max,
      ae.stat_affected,
      ae.scaling_factor
    FROM abilities a
    JOIN ability_effects ae ON a.id = ae.ability_id
    WHERE a.name IN ('Strike I', 'Strike V', 'Cleave I', 'Cleave V', 'Precise Strike I', 'Precise Strike V')
    ORDER BY a.name, a.level
  `);
  
  samples.rows.forEach(row => {
    console.log(`${row.name}: ${row.value_min}-${row.value_max} damage + ${row.scaling_factor * 100}% ${row.stat_affected}`);
  });
  
  console.log('\n✅ Done!');
}

main().catch(console.error);
