import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnv() {
  try {
    const envPath = join(__dirname, '..', '.env');
    const envFile = readFileSync(envPath, 'utf-8');
    envFile.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').trim();
        process.env[key.trim()] = value;
      }
    });
  } catch (error) {
    console.error('Could not load .env file:', error.message);
  }
}

loadEnv();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log('Checking items for merchant inventory...\n');

// Get total items
const totalItems = await db.execute('SELECT COUNT(*) as count FROM items');
console.log(`Total items: ${totalItems.rows[0].count}\n`);

// Check items by required_level
for (let level = 0; level <= 60; level += 10) {
  const items = await db.execute({
    sql: `SELECT COUNT(*) as count FROM items WHERE required_level >= ? AND required_level < ?`,
    args: [level, level + 10]
  });
  
  if (items.rows[0].count > 0) {
    console.log(`Level ${level}-${level+9}: ${items.rows[0].count} items`);
  }
}

// Check highest level items
console.log('\n\nHighest level items:\n');
const highItems = await db.execute({
  sql: `SELECT name, type, slot, required_level, rarity, value 
        FROM items 
        WHERE required_level IS NOT NULL
        ORDER BY required_level DESC 
        LIMIT 20`,
  args: []
});

highItems.rows.forEach(item => {
  console.log(`  Level ${item.required_level || 0}: ${item.name} (${item.type}) - ${item.rarity}`);
});
