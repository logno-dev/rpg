import { createClient } from '@libsql/client';
import 'dotenv/config';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function checkAbilities() {
  console.log('🔍 Checking Abilities System...\n');
  
  // Check a few key abilities
  const abilityNames = [
    'Shadow Bolt',
    'Drain Soul',
    'Backstab',
    'Renewal', // This might be what you're calling "Regeneration I"
  ];
  
  for (const name of abilityNames) {
    const abilityResult = await db.execute({
      sql: 'SELECT * FROM abilities WHERE name = ?',
      args: [name],
    });
    
    if (abilityResult.rows.length === 0) {
      console.log(`❌ ${name} not found\n`);
      continue;
    }
    
    const ability = abilityResult.rows[0];
    console.log(`✅ ${ability.name}`);
    console.log(`   Type: ${ability.type} | Category: ${ability.category}`);
    console.log(`   Mana: ${ability.mana_cost} | Cooldown: ${ability.cooldown}s`);
    console.log(`   Primary Stat: ${ability.primary_stat}`);
    console.log(`   Required Level: ${ability.required_level}`);
    
    // Get effects
    const effectsResult = await db.execute({
      sql: 'SELECT * FROM ability_effects WHERE ability_id = ? ORDER BY effect_order',
      args: [ability.id],
    });
    
    console.log(`   Effects (${effectsResult.rows.length}):`);
    for (const effect of effectsResult.rows) {
      console.log(`     - ${effect.effect_type} (${effect.target})`);
      if (effect.effect_type === 'damage' || effect.effect_type === 'heal') {
        console.log(`       Value: ${effect.value_min}-${effect.value_max}`);
        console.log(`       Scaling: ${effect.stat_scaling} × ${effect.scaling_factor}`);
      }
      if (effect.effect_type === 'drain') {
        console.log(`       Damage: ${effect.value_min}-${effect.value_max}`);
        console.log(`       Drain %: ${effect.drain_percent * 100}%`);
        console.log(`       Scaling: ${effect.stat_scaling} × ${effect.scaling_factor}`);
      }
      if (effect.is_periodic) {
        console.log(`       Periodic: ${effect.tick_value} per tick`);
        console.log(`       Interval: ${effect.tick_interval}s × ${effect.tick_count} ticks`);
        console.log(`       Total Duration: ${effect.tick_interval * effect.tick_count}s`);
      }
    }
    console.log('');
  }
  
  // Check for healing over time abilities
  console.log('🔍 Checking for Healing Over Time abilities...\n');
  const hotResult = await db.execute({
    sql: `SELECT a.name, a.id, a.category 
          FROM abilities a 
          JOIN ability_effects e ON a.id = e.ability_id 
          WHERE e.effect_type = 'hot' OR (a.category = 'heal' AND e.is_periodic = 1)
          GROUP BY a.id`,
  });
  
  console.log(`Found ${hotResult.rows.length} HoT abilities:`);
  for (const row of hotResult.rows) {
    console.log(`  - ${row.name} (ID: ${row.id})`);
  }
}

checkAbilities().catch(console.error);
