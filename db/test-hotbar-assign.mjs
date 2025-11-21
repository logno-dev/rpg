import { createClient } from '@libsql/client';
import 'dotenv/config';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log('Testing direct hotbar assignment...');

// Test inserting a hotbar entry
try {
  await db.execute({
    sql: `
      INSERT INTO character_hotbar (character_id, slot, type, ability_id, item_id)
      VALUES (?, ?, ?, ?, ?)
    `,
    args: [1, 1, 'ability', 16, null],
  });
  console.log('✓ Successfully inserted test hotbar entry');
} catch (error) {
  console.error('✗ Failed to insert:', error.message);
}

// Check if it was inserted
const result = await db.execute('SELECT * FROM character_hotbar WHERE character_id = 1');
console.log('\nHotbar entries for character 1:', result.rows);
