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

console.log('=== FIXING PLATE CHEST RECIPE OUTPUTS ===\n');

// Get all plate chest recipe groups
const plateChestGroups = (await db.execute(`
  SELECT id, name FROM recipe_groups 
  WHERE LOWER(name) LIKE '%plate%' AND LOWER(name) LIKE '%chest%'
`)).rows;

console.log(`Found ${plateChestGroups.length} plate chest recipe groups:\n`);

for (const group of plateChestGroups) {
  console.log(`Recipe Group: ${group.name} (ID: ${group.id})`);
  
  // Get all outputs for this group
  const outputs = (await db.execute({
    sql: `SELECT ro.id, i.name, i.slot, ro.base_weight 
          FROM recipe_outputs ro 
          JOIN items i ON ro.item_id = i.id 
          WHERE ro.recipe_group_id = ?
          ORDER BY i.slot, ro.base_weight DESC`,
    args: [group.id]
  })).rows;
  
  const chestOutputs = outputs.filter(o => o.slot === 'chest');
  const wrongOutputs = outputs.filter(o => o.slot !== 'chest');
  
  console.log(`  ✅ ${chestOutputs.length} chest pieces (correct)`);
  console.log(`  ❌ ${wrongOutputs.length} non-chest pieces (wrong):\n`);
  
  for (const output of wrongOutputs) {
    console.log(`     - ${output.name} (${output.slot})`);
  }
  console.log('');
}

console.log('\n=== REMOVING INCORRECT OUTPUTS ===\n');

// Remove all non-chest outputs from plate chest recipe groups
for (const group of plateChestGroups) {
  const result = await db.execute({
    sql: `DELETE FROM recipe_outputs 
          WHERE recipe_group_id = ? 
          AND item_id IN (
            SELECT i.id FROM items i WHERE i.slot != 'chest'
          )`,
    args: [group.id]
  });
  
  console.log(`✅ Removed ${result.rowsAffected} non-chest outputs from "${group.name}"`);
}

console.log('\n=== VERIFICATION ===\n');

for (const group of plateChestGroups) {
  const remaining = (await db.execute({
    sql: `SELECT COUNT(*) as count
          FROM recipe_outputs ro
          JOIN items i ON ro.item_id = i.id
          WHERE ro.recipe_group_id = ?
          AND i.slot != 'chest'`,
    args: [group.id]
  })).rows[0];
  
  const total = (await db.execute({
    sql: `SELECT COUNT(*) as count FROM recipe_outputs WHERE recipe_group_id = ?`,
    args: [group.id]
  })).rows[0];
  
  console.log(`${group.name}: ${total.count} total outputs, ${remaining.count} non-chest (should be 0)`);
}

console.log('\n✅ Plate chest recipes fixed!');
