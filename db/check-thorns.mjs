import { createClient } from '@libsql/client';
import 'dotenv/config';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const thornsAbilities = await db.execute({
  sql: 'SELECT * FROM abilities WHERE name LIKE ?',
  args: ['%Thorns%'],
});

console.log('Thorns abilities found:', thornsAbilities.rows.length);

for (const ability of thornsAbilities.rows) {
  console.log(`\n${ability.name}:`);
  console.log('  ID:', ability.id);
  console.log('  Type:', ability.type);
  console.log('  Category:', ability.category);
  
  const effects = await db.execute({
    sql: 'SELECT * FROM ability_effects WHERE ability_id = ?',
    args: [ability.id],
  });
  
  console.log('  Effects:', effects.rows.length);
  for (const effect of effects.rows) {
    console.log(`    - ${effect.effect_type} (${effect.target})`);
    console.log(`      Value: ${effect.value_min}-${effect.value_max}`);
    console.log(`      Stat Affected: ${effect.stat_affected}`);
    console.log(`      Amount: ${effect.amount}`);
    console.log(`      Duration: ${effect.duration}s`);
    console.log(`      Is Periodic: ${effect.is_periodic}`);
  }
}
