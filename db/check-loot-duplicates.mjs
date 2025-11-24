import { createClient } from '@libsql/client';
import { config } from 'dotenv';

config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Find mobs with duplicate loot entries
const result = await db.execute(`
  SELECT 
    m.name as mob_name,
    m.level,
    i.name as item_name,
    COUNT(*) as count,
    GROUP_CONCAT(ml.id) as loot_entry_ids
  FROM mob_loot ml
  JOIN mobs m ON ml.mob_id = m.id
  JOIN items i ON ml.item_id = i.id
  GROUP BY ml.mob_id, ml.item_id
  HAVING COUNT(*) > 1
  ORDER BY COUNT(*) DESC, m.level, m.name
`);

console.log(`Found ${result.rows.length} mob-item combinations with duplicates:\n`);
result.rows.forEach(row => {
  console.log(`${row.mob_name} (Lvl ${row.level}): ${row.item_name} appears ${row.count}x (IDs: ${row.loot_entry_ids})`);
});

// Show mobs with high loot counts
console.log('\n\n=== Mobs with lots of loot entries ===\n');
const highLoot = await db.execute(`
  SELECT 
    m.id,
    m.name,
    m.level,
    COUNT(*) as total_loot_entries,
    COUNT(DISTINCT ml.item_id) as unique_items
  FROM mobs m
  JOIN mob_loot ml ON m.id = ml.mob_id
  GROUP BY m.id
  HAVING COUNT(*) > 10
  ORDER BY COUNT(*) DESC
  LIMIT 20
`);

highLoot.rows.forEach(mob => {
  const duplicates = mob.total_loot_entries - mob.unique_items;
  console.log(`${mob.name} (Lvl ${mob.level}): ${mob.total_loot_entries} entries (${mob.unique_items} unique) - ${duplicates} duplicates`);
});

db.close();
