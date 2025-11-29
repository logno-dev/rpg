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

console.log('=== FIXING ALL ARMOR RECIPE OUTPUTS ===\n');

// Map recipe group name patterns to expected slots
const slotMappings = {
  'Chest': 'chest',
  'Head': 'head',
  'Hands': 'hands',
  'Feet': 'feet',
};

// Get all armor recipe groups
const armorGroups = (await db.execute(`
  SELECT id, name FROM recipe_groups 
  WHERE profession_type IN ('blacksmithing', 'leatherworking', 'tailoring')
  AND (name LIKE '%Chest%' OR name LIKE '%Head%' OR name LIKE '%Hands%' OR name LIKE '%Feet%')
  ORDER BY name
`)).rows;

console.log(`Found ${armorGroups.length} armor recipe groups\n`);

let totalFixed = 0;

for (const group of armorGroups) {
  // Determine expected slot from recipe group name
  let expectedSlot = null;
  for (const [pattern, slot] of Object.entries(slotMappings)) {
    if (group.name.includes(pattern)) {
      expectedSlot = slot;
      break;
    }
  }
  
  if (!expectedSlot) {
    console.log(`⚠️  Could not determine slot for: ${group.name}`);
    continue;
  }
  
  // Get all outputs
  const outputs = (await db.execute({
    sql: `SELECT ro.id, i.name, i.slot, ro.base_weight 
          FROM recipe_outputs ro 
          JOIN items i ON ro.item_id = i.id 
          WHERE ro.recipe_group_id = ?
          ORDER BY i.slot, ro.base_weight DESC`,
    args: [group.id]
  })).rows;
  
  const correctOutputs = outputs.filter(o => o.slot === expectedSlot);
  const wrongOutputs = outputs.filter(o => o.slot !== expectedSlot);
  
  if (wrongOutputs.length > 0) {
    console.log(`Recipe: "${group.name}" (expects ${expectedSlot})`);
    console.log(`  ✅ ${correctOutputs.length} ${expectedSlot} pieces`);
    console.log(`  ❌ ${wrongOutputs.length} wrong outputs:`);
    
    wrongOutputs.forEach(o => {
      console.log(`     - ${o.name} (${o.slot || 'NULL'})`);
    });
    
    // Remove wrong outputs
    const result = await db.execute({
      sql: `DELETE FROM recipe_outputs 
            WHERE recipe_group_id = ? 
            AND item_id IN (
              SELECT i.id FROM items i WHERE i.slot != ? OR i.slot IS NULL
            )`,
      args: [group.id, expectedSlot]
    });
    
    console.log(`  🗑️  Removed ${result.rowsAffected} incorrect outputs\n`);
    totalFixed += result.rowsAffected;
  }
}

console.log(`\n=== SUMMARY ===`);
console.log(`Total incorrect outputs removed: ${totalFixed}\n`);

console.log('=== VERIFICATION ===\n');

let remaining = 0;
for (const group of armorGroups) {
  let expectedSlot = null;
  for (const [pattern, slot] of Object.entries(slotMappings)) {
    if (group.name.includes(pattern)) {
      expectedSlot = slot;
      break;
    }
  }
  
  if (!expectedSlot) continue;
  
  const wrong = (await db.execute({
    sql: `SELECT COUNT(*) as count
          FROM recipe_outputs ro
          JOIN items i ON ro.item_id = i.id
          WHERE ro.recipe_group_id = ?
          AND (i.slot != ? OR i.slot IS NULL)`,
    args: [group.id, expectedSlot]
  })).rows[0];
  
  if (wrong.count > 0) {
    console.log(`⚠️  ${group.name}: ${wrong.count} incorrect outputs remaining`);
    remaining += parseInt(wrong.count);
  }
}

if (remaining === 0) {
  console.log('✅ All armor recipes fixed! No incorrect outputs remaining.\n');
} else {
  console.log(`\n⚠️  ${remaining} incorrect outputs still remain\n`);
}
