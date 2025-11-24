import { createClient } from '@libsql/client';
import { config } from 'dotenv';

config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log('=== REGIONS TABLE ===');
const regionsSchema = await db.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='regions'");
console.log(regionsSchema.rows[0]?.sql || 'Table not found');

console.log('\n\n=== MERCHANTS TABLE ===');
const merchantsSchema = await db.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='merchants'");
console.log(merchantsSchema.rows[0]?.sql || 'Table not found');

console.log('\n\n=== MERCHANT_INVENTORY TABLE ===');
const merchantInvSchema = await db.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='merchant_inventory'");
console.log(merchantInvSchema.rows[0]?.sql || 'Table not found');

db.close();
