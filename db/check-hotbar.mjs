import { createClient } from '@libsql/client';
import 'dotenv/config';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const result = await db.execute('SELECT * FROM character_hotbar');
console.log('Hotbar entries:', result.rows.length);
result.rows.forEach(row => {
  console.log(row);
});

// Also check abilities
const abilities = await db.execute('SELECT ca.*, a.name FROM character_abilities ca JOIN abilities a ON ca.ability_id = a.id WHERE character_id = 1 LIMIT 5');
console.log('\nCharacter abilities:', abilities.rows);
