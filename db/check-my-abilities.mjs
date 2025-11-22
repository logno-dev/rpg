import { createClient } from '@libsql/client';
import 'dotenv/config';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function checkAbilities() {
  const abilityNames = ['Life Drain I', 'Regeneration I', 'Fireball I', 'Shadow Bolt'];
  
  for (const name of abilityNames) {
    const result = await db.execute({
      sql: 'SELECT * FROM abilities WHERE name = ?',
      args: [name],
    });
    
    if (result.rows.length === 0) {
      console.log(`\n❌ ${name} NOT FOUND`);
      continue;
    }
    
    const ability = result.rows[0];
    console.log(`\n✅ ${ability.name}`);
    console.log(`   Category: ${ability.category} | Primary: ${ability.primary_stat}`);
    
    const effects = await db.execute({
      sql: 'SELECT * FROM ability_effects WHERE ability_id = ?',
      args: [ability.id],
    });
    
    console.log(`   Effects: ${effects.rows.length}`);
    effects.rows.forEach((e, i) => {
      console.log(`     ${i + 1}. ${e.effect_type} (${e.target}): ${e.value_min}-${e.value_max}`);
      if (e.stat_scaling) console.log(`        Scaling: ${e.stat_scaling} × ${e.scaling_factor}`);
      if (e.is_periodic) console.log(`        Periodic: ${e.tick_value} × ${e.tick_count} ticks`);
      if (e.drain_percent) console.log(`        Drain: ${e.drain_percent * 100}%`);
    });
  }
}

checkAbilities().catch(console.error);
