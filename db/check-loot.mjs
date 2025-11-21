import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';

const envFile = readFileSync('.env', 'utf-8');
envFile.split('\n').forEach(line => {
  line = line.trim();
  if (line && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    process.env[key.trim()] = valueParts.join('=').trim();
  }
});

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const result = await client.execute('SELECT mob_id, item_id, COUNT(*) as count FROM mob_loot GROUP BY mob_id, item_id ORDER BY mob_id, item_id');
console.log('Loot table entries:', result.rows);
console.log('Total rows:', result.rows.length);

const dupes = await client.execute('SELECT mob_id, item_id, COUNT(*) as count FROM mob_loot GROUP BY mob_id, item_id HAVING count > 1');
console.log('\nDUPLICATES:', dupes.rows);
