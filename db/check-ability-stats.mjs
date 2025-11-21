import { createClient } from '@libsql/client';
import 'dotenv/config';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const abilities = await db.execute('SELECT COUNT(*) as count FROM abilities');
const effects = await db.execute('SELECT COUNT(*) as count FROM ability_effects');
const scrolls = await db.execute("SELECT COUNT(*) as count FROM items WHERE type = 'scroll'");

console.log('📊 Database Stats:');
console.log('Total Abilities:', abilities.rows[0].count);
console.log('Total Effects:', effects.rows[0].count);
console.log('Total Scrolls:', scrolls.rows[0].count);

// Sample some new abilities
console.log('\n🔮 Sample New Abilities:');
const samples = await db.execute(`
  SELECT a.name, a.required_level, a.type, COUNT(e.id) as effect_count
  FROM abilities a
  LEFT JOIN ability_effects e ON a.id = e.ability_id
  WHERE a.id > 230
  GROUP BY a.id
  ORDER BY a.required_level
  LIMIT 10
`);

samples.rows.forEach(row => {
  console.log(`- ${row.name} (Lv${row.required_level}) - ${row.type} - ${row.effect_count} effects`);
});
