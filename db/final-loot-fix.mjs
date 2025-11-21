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

console.log('🔥 Deleting ALL loot entries...');
await client.execute('DELETE FROM mob_loot');

console.log('✅ Deleted. Checking...');
const check = await client.execute('SELECT COUNT(*) as count FROM mob_loot');
console.log('Remaining rows:', check.rows[0].count);

console.log('\n📦 Inserting clean loot data...');

const loot = [
  // Rat
  [1, 15, 0.25, 1, 2],
  [1, 16, 0.15, 1, 1],
  // Goblin
  [2, 2, 0.12, 1, 1],
  [2, 13, 0.20, 1, 1],
  [2, 16, 0.15, 1, 1],
  // Wolf
  [3, 7, 0.12, 1, 1],
  [3, 13, 0.20, 1, 1],
  [3, 19, 0.15, 1, 1],
  // Skeleton
  [4, 2, 0.15, 1, 1],
  [4, 13, 0.25, 1, 1],
  [4, 28, 0.12, 1, 1],
  // Orc
  [5, 3, 0.15, 1, 1],
  [5, 13, 0.30, 1, 1],
  [5, 17, 0.12, 1, 1],
  // Boar
  [6, 15, 0.30, 1, 2],
  [6, 16, 0.12, 1, 1],
  // Spider
  [7, 14, 0.20, 1, 1],
  [7, 22, 0.15, 1, 1],
  // Troll
  [8, 18, 0.15, 1, 1],
  [8, 27, 0.12, 1, 1],
  [8, 29, 0.10, 1, 1],
];

for (const [mob_id, item_id, drop_chance, quantity_min, quantity_max] of loot) {
  await client.execute({
    sql: 'INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max) VALUES (?, ?, ?, ?, ?)',
    args: [mob_id, item_id, drop_chance, quantity_min, quantity_max]
  });
}

console.log('✅ Inserted', loot.length, 'loot entries');

const final = await client.execute('SELECT COUNT(*) as count FROM mob_loot');
console.log('Final row count:', final.rows[0].count);

console.log('\n🎉 DONE! Loot table is clean!');
