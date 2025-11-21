import { createClient } from '@libsql/client';
import 'dotenv/config';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function migrate() {
  console.log('Creating hotbar system...');

  // Create hotbar table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS character_hotbar (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      character_id INTEGER NOT NULL,
      slot INTEGER NOT NULL CHECK (slot >= 1 AND slot <= 8),
      type TEXT NOT NULL CHECK (type IN ('ability', 'consumable')),
      ability_id INTEGER,
      item_id INTEGER,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
      FOREIGN KEY (ability_id) REFERENCES abilities(id) ON DELETE CASCADE,
      FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
      UNIQUE(character_id, slot),
      CHECK ((type = 'ability' AND ability_id IS NOT NULL AND item_id IS NULL) OR 
             (type = 'consumable' AND item_id IS NOT NULL AND ability_id IS NULL))
    )
  `);

  console.log('✓ Hotbar table created');
  
  console.log('Migration complete!');
}

migrate().catch(console.error);
