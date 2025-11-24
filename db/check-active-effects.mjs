import { createClient } from '@libsql/client';
import { config } from 'dotenv';

config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const tables = await db.execute("SELECT name FROM sqlite_master WHERE type='table'");
const effectTables = tables.rows.filter(r => r.name.toLowerCase().includes('effect') || r.name.toLowerCase().includes('buff'));
console.log('Effect-related tables:', effectTables);

db.close();
