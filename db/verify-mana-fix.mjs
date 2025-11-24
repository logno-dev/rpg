import { createClient } from '@libsql/client';
import { config } from 'dotenv';

config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log('=== VERIFICATION ===\n');

const chars = await db.execute({
  sql: `SELECT name, level, intelligence, max_mana, current_mana FROM characters ORDER BY id`,
  args: []
});

chars.rows.forEach(char => {
  const expected = 100 + (char.level * 20) + ((char.intelligence - 10) * 5);
  const match = char.max_mana === expected ? '✓' : '✗';
  
  console.log(`${char.name}:`);
  console.log(`  Level ${char.level}, ${char.intelligence} INT`);
  console.log(`  Max mana: ${char.max_mana} (expected: ${expected}) ${match}`);
  console.log(`  Current mana: ${char.current_mana}`);
  console.log();
});

db.close();
