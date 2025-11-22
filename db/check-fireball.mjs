import { createClient } from '@libsql/client';
import 'dotenv/config';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const result = await db.execute({
  sql: 'SELECT * FROM abilities WHERE name LIKE ?',
  args: ['Fireball%'],
});

console.log('Fireball abilities:');
for (const ability of result.rows) {
  console.log(`\n${ability.name}:`);
  console.log(`  damage_min: ${ability.damage_min}`);
  console.log(`  damage_max: ${ability.damage_max}`);
  console.log(`  stat_scaling: ${ability.stat_scaling}`);
  console.log(`  primary_stat: ${ability.primary_stat}`);
}
