import { createClient } from '@libsql/client';
import { config } from 'dotenv';

config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log('=== CHECKING FOR ACTIVE EFFECTS TABLE ===');
const tables = await db.execute("SELECT name FROM sqlite_master WHERE type='table'");
console.log('Tables:', tables.rows.map(r => r.name).join(', '));

const effectsTable = tables.rows.find(r => r.name.toLowerCase().includes('effect'));
if (effectsTable) {
  console.log('\n=== EFFECTS TABLE SCHEMA ===');
  const schema = await db.execute(`SELECT sql FROM sqlite_master WHERE type='table' AND name='${effectsTable.name}'`);
  console.log(schema.rows[0]?.sql);
}

db.close();
