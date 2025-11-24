import { createClient } from '@libsql/client';
import { config } from 'dotenv';

config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log('=== YOUR CHARACTER ===\n');

// Get all characters to find yours
const chars = await db.execute({
  sql: `SELECT c.*, u.username 
        FROM characters c 
        JOIN users u ON c.user_id = u.id 
        ORDER BY c.id`,
  args: []
});

chars.rows.forEach(char => {
  console.log(`Character: ${char.name} (User: ${char.username})`);
  console.log(`  Level: ${char.level}`);
  console.log(`  Intelligence: ${char.intelligence}`);
  console.log(`  Max Mana (DB): ${char.max_mana}`);
  console.log(`  Current Mana: ${char.current_mana}`);
  
  // Calculate what it SHOULD be
  const expectedBase = 100;
  const expectedLevelBonus = char.level * 20;
  const expectedIntBonus = (char.intelligence - 10) * 5;
  const expectedTotal = expectedBase + expectedLevelBonus + expectedIntBonus;
  
  console.log(`\n  Expected calculation:`);
  console.log(`    Base: ${expectedBase}`);
  console.log(`    Level bonus: ${char.level} × 20 = ${expectedLevelBonus}`);
  console.log(`    INT bonus: (${char.intelligence} - 10) × 5 = ${expectedIntBonus}`);
  console.log(`    TOTAL SHOULD BE: ${expectedTotal}`);
  console.log(`    ACTUAL IN DB: ${char.max_mana}`);
  console.log(`    DIFFERENCE: ${char.max_mana - expectedTotal}\n`);
});

db.close();
