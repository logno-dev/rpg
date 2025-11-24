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
    GROUP_CONCAT(ml.drop_chance) as drop_chances,
    GROUP_CONCAT(ml.quantity_max) as max_quantities
  FROM mob_loot ml
  GROUP BY ml.mob_id, ml.item_id
  HAVING COUNT(*) > 1
  ORDER BY COUNT(*) DESC
`);

console.log(`Found ${duplicates.rows.length} mob-item combinations with duplicates`);

const allDeleteIds = [];

for (const dup of duplicates.rows) {
  const ids = dup.loot_entry_ids.split(',').map(id => parseInt(id));
  const dropChances = dup.drop_chances.split(',').map(chance => parseFloat(chance));
  const maxQtys = dup.max_quantities.split(',').map(q => parseInt(q));
  
  // Find the best entry (highest drop chance, then highest max quantity)
  let bestIdx = 0;
  let bestScore = dropChances[0] + (maxQtys[0] * 0.01);
  
  for (let i = 1; i < ids.length; i++) {
    const score = dropChances[i] + (maxQtys[i] * 0.01);
    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  }
  
  // Mark all except the best for deletion
  const deleteIds = ids.filter((id, idx) => idx !== bestIdx);
  allDeleteIds.push(...deleteIds);
}

console.log(`Will delete ${allDeleteIds.length} duplicate entries\n`);

// Delete in batches of 100
const batchSize = 100;
for (let i = 0; i < allDeleteIds.length; i += batchSize) {
  const batch = allDeleteIds.slice(i, i + batchSize);
  const placeholders = batch.map(() => '?').join(',');
  
  await db.execute({
    sql: `DELETE FROM mob_loot WHERE id IN (${placeholders})`,
    args: batch
  });
  
  console.log(`Deleted ${Math.min(i + batchSize, allDeleteIds.length)} / ${allDeleteIds.length}`);
}

console.log(`\n✅ Cleanup complete! Deleted ${allDeleteIds.length} duplicate loot entries`);

// Show stats after cleanup
const stats = await db.execute(`
  SELECT COUNT(*) as total_entries,
         COUNT(DISTINCT mob_id || '-' || item_id) as unique_combinations
  FROM mob_loot
`);

console.log(`\nFinal stats:`);
console.log(`  Total loot entries: ${stats.rows[0].total_entries}`);
console.log(`  Unique mob-item combinations: ${stats.rows[0].unique_combinations}`);

// Show some examples of cleaned mobs
console.log(`\nSample mobs after cleanup:`);
const sample = await db.execute(`
  SELECT 
    m.name,
    m.level,
    COUNT(*) as loot_count
  FROM mobs m
  JOIN mob_loot ml ON m.id = ml.mob_id
  WHERE m.level <= 10
  GROUP BY m.id
  ORDER BY m.level, m.name
  LIMIT 10
`);

sample.rows.forEach(row => {
  console.log(`  ${row.name} (Lvl ${row.level}): ${row.loot_count} unique items`);
});

db.close();
