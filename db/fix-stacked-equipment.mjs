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
    console.error('Error loading .env file:', error);
  }
}

loadEnv();

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function fixStackedEquipment() {
  console.log('Finding stacked non-stackable items...');
  
  // Find all non-stackable items with quantity > 1
  const stackedItems = await client.execute(`
    SELECT ci.id, ci.character_id, ci.item_id, ci.quantity, ci.equipped, it.name, it.stackable
    FROM character_inventory ci
    JOIN items it ON ci.item_id = it.id
    WHERE it.stackable = 0 AND ci.quantity > 1
  `);
  
  console.log(`Found ${stackedItems.rows.length} stacked non-stackable items`);
  
  for (const item of stackedItems.rows) {
    console.log(`\nFixing: ${item.name} (ID: ${item.id}) - Quantity: ${item.quantity}`);
    
    const quantity = Number(item.quantity);
    const characterId = item.character_id;
    const itemId = item.item_id;
    const equipped = item.equipped;
    const inventoryId = item.id;
    
    // Delete the original stacked entry
    await client.execute({
      sql: 'DELETE FROM character_inventory WHERE id = ?',
      args: [inventoryId]
    });
    console.log(`  - Deleted stacked entry (ID: ${inventoryId})`);
    
    // Create separate entries for each item
    for (let i = 0; i < quantity; i++) {
      await client.execute({
        sql: 'INSERT INTO character_inventory (character_id, item_id, quantity, equipped) VALUES (?, ?, 1, ?)',
        args: [characterId, itemId, equipped]
      });
      console.log(`  - Created separate entry ${i + 1}/${quantity}`);
    }
  }
  
  console.log('\n✅ Fixed all stacked non-stackable items!');
  
  // Verify the fix
  const remainingStacked = await client.execute(`
    SELECT COUNT(*) as count
    FROM character_inventory ci
    JOIN items it ON ci.item_id = it.id
    WHERE it.stackable = 0 AND ci.quantity > 1
  `);
  
  console.log(`\nRemaining stacked non-stackable items: ${remainingStacked.rows[0].count}`);
}

fixStackedEquipment().catch(console.error);
