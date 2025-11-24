import { createClient } from '@libsql/client';
import { config } from 'dotenv';

config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log('Finding duplicate loot entries...\n');

// Find all mob-item combinations with duplicates
const duplicates = await db.execute(`
  SELECT 
    ml.mob_id,
    ml.item_id,
    COUNT(*) as count,
    GROUP_CONCAT(ml.id) as loot_entry_ids,
    GROUP_CONCAT(ml.drop_chance) as drop_chances
  FROM mob_loot ml
  GROUP BY ml.mob_id, ml.item_id
  HAVING COUNT(*) > 1
  ORDER BY COUNT(*) DESC
`);

console.log(`Found ${duplicates.rows.length} mob-item combinations with duplicates`);

let totalDeleted = 0;

for (const dup of duplicates.rows) {
  const ids = dup.loot_entry_ids.split(',').map(id => parseInt(id));
  const dropChances = dup.drop_chances.split(',').map(chance => parseFloat(chance));
  
  // Find the entry with the highest drop chance
  let bestIdx = 0;
  let bestDropChance = dropChances[0];
  for (let i = 1; i < dropChances.length; i++) {
    if (dropChances[i] > bestDropChance) {
      bestDropChance = dropChances[i];
      bestIdx = i;
    }
  }
  
  const keepId = ids[bestIdx];
  const deleteIds = ids.filter((id, idx) => idx !== bestIdx);
  
  // Delete all duplicates except the best one
  for (const deleteId of deleteIds) {
    await db.execute({
      sql: 'DELETE FROM mob_loot WHERE id = ?',
      args: [deleteId]
    });
    totalDeleted++;
  }
  
  if (totalDeleted % 100 === 0) {
    console.log(`Deleted ${totalDeleted} duplicate entries so far...`);
  }
}

console.log(`\n✅ Cleanup complete! Deleted ${totalDeleted} duplicate loot entries`);

// Show stats after cleanup
const stats = await db.execute(`
  SELECT COUNT(*) as total_entries,
         COUNT(DISTINCT mob_id || '-' || item_id) as unique_combinations
  FROM mob_loot
`);

console.log(`\nFinal stats:`);
console.log(`  Total loot entries: ${stats.rows[0].total_entries}`);
console.log(`  Unique mob-item combinations: ${stats.rows[0].unique_combinations}`);

db.close();
