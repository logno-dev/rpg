import { createClient } from '@libsql/client';
import { config } from 'dotenv';

config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log('=== DODGE ABILITIES ===');
const dodge = await db.execute({
  sql: "SELECT * FROM abilities WHERE name LIKE '%Dodge%' OR name LIKE '%dodge%'",
  args: []
});

dodge.rows.forEach(row => {
  console.log('\n' + row.name + ':');
  console.log(JSON.stringify(row, null, 2));
});

db.close();
