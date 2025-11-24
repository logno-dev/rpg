import { createClient } from '@libsql/client';
import { config } from 'dotenv';

config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log('=== ABILITIES TABLE SCHEMA ===');
const schema = await db.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='abilities'");
console.log(schema.rows[0]?.sql || 'Table not found');

console.log('\n\n=== SAMPLE ABILITIES DATA ===');
const sample = await db.execute("SELECT * FROM abilities LIMIT 5");
sample.rows.forEach(row => {
  console.log(JSON.stringify(row, null, 2));
});

db.close();
