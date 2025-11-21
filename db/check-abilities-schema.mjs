import { createClient } from '@libsql/client';
import 'dotenv/config';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Get table schema
const schema = await db.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='abilities'");
console.log('Abilities table schema:');
console.log(schema.rows[0].sql);

// Get sample abilities
const abilities = await db.execute('SELECT * FROM abilities LIMIT 3');
console.log('\nSample abilities:');
abilities.rows.forEach(row => {
  console.log(row);
});
