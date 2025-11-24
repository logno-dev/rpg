import { createClient } from '@libsql/client';
import { config } from 'dotenv';

config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log('Updating Dodge abilities to be buff-type...\n');

// Update Dodge I to buff dexterity by 20 for 10 seconds
await db.execute({
  sql: `UPDATE abilities SET
          type = 'buff',
          category = 'defense',
          damage_min = 0,
          damage_max = 0,
          buff_stat = 'dexterity',
          buff_amount = 20,
          buff_duration = 10,
          description = 'Enhances reflexes, temporarily increasing DEX by 20 for 10 seconds (improves dodge chance)'
        WHERE id = 4`,
  args: []
});
console.log('✓ Updated Dodge I: +20 DEX for 10 seconds');

// Update Dodge II to buff dexterity by 35 for 12 seconds  
await db.execute({
  sql: `UPDATE abilities SET
          type = 'buff',
          category = 'defense',
          damage_min = 0,
          damage_max = 0,
          buff_stat = 'dexterity',
          buff_amount = 35,
          buff_duration = 12,
          description = 'Enhanced reflexes, temporarily increasing DEX by 35 for 12 seconds (greatly improves dodge chance)'
        WHERE id = 5`,
  args: []
});
console.log('✓ Updated Dodge II: +35 DEX for 12 seconds');

// Update Dodge III to buff dexterity by 50 for 15 seconds
await db.execute({
  sql: `UPDATE abilities SET
          type = 'buff',
          category = 'defense',
          damage_min = 0,
          damage_max = 0,
          buff_stat = 'dexterity',
          buff_amount = 50,
          buff_duration = 15,
          description = 'Master reflexes, temporarily increasing DEX by 50 for 15 seconds (massively improves dodge chance)'
        WHERE id = 6`,
  args: []
});
console.log('✓ Updated Dodge III: +50 DEX for 15 seconds');

console.log('\n=== Verifying changes ===\n');
const result = await db.execute("SELECT name, type, category, buff_stat, buff_amount, buff_duration, description FROM abilities WHERE id IN (4, 5, 6)");
result.rows.forEach(row => {
  console.log(`${row.name}:`);
  console.log(`  Type: ${row.type}, Category: ${row.category}`);
  console.log(`  Buff: ${row.buff_stat} +${row.buff_amount} for ${row.buff_duration}s`);
  console.log(`  Description: ${row.description}`);
  console.log();
});

db.close();
