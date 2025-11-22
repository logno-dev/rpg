import { createClient } from '@libsql/client';
import 'dotenv/config';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const ability = await db.execute({
  sql: 'SELECT * FROM abilities WHERE name = ?',
  args: ['Regeneration I'],
});

console.log('Regeneration I:');
console.log('  ID:', ability.rows[0].id);

const effects = await db.execute({
  sql: 'SELECT * FROM ability_effects WHERE ability_id = ?',
  args: [ability.rows[0].id],
});

console.log('\nEffects:');
for (const effect of effects.rows) {
  console.log(`\n  Effect ${effect.effect_order}:`);
  console.log(`    Type: ${effect.effect_type}`);
  console.log(`    Value: ${effect.value_min}-${effect.value_max}`);
  console.log(`    Is Periodic: ${effect.is_periodic}`);
  console.log(`    Tick Value: ${effect.tick_value}`);
  console.log(`    Tick Interval: ${effect.tick_interval}s`);
  console.log(`    Tick Count: ${effect.tick_count}`);
  console.log(`    Stat Scaling: ${effect.stat_scaling}`);
  console.log(`    Scaling Factor: ${effect.scaling_factor}`);
  console.log(`    Total Duration: ${effect.tick_interval * effect.tick_count}s`);
}
