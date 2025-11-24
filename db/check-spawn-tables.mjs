import { createClient } from '@libsql/client';
import { config } from 'dotenv';

config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log('=== REGION_MOBS TABLE (Controls mob spawning) ===');
const regionMobsSchema = await db.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='region_mobs'");
console.log(regionMobsSchema.rows[0]?.sql || 'Table not found');

console.log('\n\n=== MERCHANT_INVENTORY TABLE (Controls merchant items) ===');
const merchantInvSchema = await db.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='merchant_inventory'");
console.log(merchantInvSchema.rows[0]?.sql || 'Table not found');

console.log('\n\n=== Sample region_mobs data ===');
const sampleMobs = await db.execute("SELECT * FROM region_mobs LIMIT 10");
console.log(sampleMobs.rows);

console.log('\n\n=== Sample merchant_inventory data ===');
const sampleInv = await db.execute("SELECT * FROM merchant_inventory LIMIT 10");
console.log(sampleInv.rows);

db.close();
