import { createClient } from '@libsql/client';
import { config } from 'dotenv';

config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log('=== Loot Cleanup Verification ===\n');

// Check for any remaining duplicates
const remaining = await db.execute(`
  SELECT 
    COUNT(*) as duplicate_count
  FROM (
    SELECT mob_id, item_id, COUNT(*) as cnt
    FROM mob_loot
    GROUP BY mob_id, item_id
    HAVING COUNT(*) > 1
  )
`);

console.log(`Remaining duplicates: ${remaining.rows[0].duplicate_count}`);

// Show distribution of loot entries per mob
const distribution = await db.execute(`
  SELECT 
    COUNT(*) as loot_count,
    COUNT(DISTINCT m.id) as mob_count
  FROM (
    SELECT mob_id, COUNT(*) as cnt
    FROM mob_loot
    GROUP BY mob_id
  ) sub
  JOIN mobs m ON sub.mob_id = m.id
  GROUP BY cnt
  ORDER BY cnt
`);

console.log('\nLoot entries distribution:');
distribution.rows.forEach(row => {
  console.log(`  ${row.mob_count} mobs have ${row.loot_count} loot entries`);
});

// Show mobs with most loot
console.log('\nTop 15 mobs by loot variety:');
const topMobs = await db.execute(`
  SELECT 
    m.name,
    m.level,
    COUNT(*) as unique_items
  FROM mobs m
  JOIN mob_loot ml ON m.id = ml.mob_id
  GROUP BY m.id
  ORDER BY COUNT(*) DESC
  LIMIT 15
`);

topMobs.rows.forEach(row => {
  console.log(`  ${row.name} (Lvl ${row.level}): ${row.unique_items} unique items`);
});

// Total stats
const totals = await db.execute(`
  SELECT 
    COUNT(DISTINCT mob_id) as unique_mobs_with_loot,
    COUNT(*) as total_loot_entries,
    AVG(cnt) as avg_items_per_mob
  FROM (
    SELECT mob_id, COUNT(*) as cnt
    FROM mob_loot
    GROUP BY mob_id
  )
`);

console.log('\n=== Overall Stats ===');
console.log(`Total mobs with loot: ${totals.rows[0].unique_mobs_with_loot}`);
console.log(`Total loot entries: ${totals.rows[0].total_loot_entries}`);
console.log(`Average items per mob: ${totals.rows[0].avg_items_per_mob.toFixed(1)}`);

db.close();
