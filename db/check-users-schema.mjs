import { createClient } from '@libsql/client';
import 'dotenv/config';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const result = await db.execute({
  sql: "PRAGMA table_info(users);",
  args: [],
});

console.log('Users table columns:');
for (const col of result.rows) {
  console.log(`  ${col.name} (${col.type})`);
}
