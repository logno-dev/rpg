import { createClient } from '@libsql/client';
import { config } from 'dotenv';

config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const schema = await db.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='mob_loot'");
console.log(schema.rows[0]?.sql || 'Table not found');

db.close();
