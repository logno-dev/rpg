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

const REDUCTION_PERCENT = 50; // Reduce by 50% (multiply by 0.5)

console.log(`=== REDUCING NON-BOSS MOB LOOT RATES BY ${REDUCTION_PERCENT}% ===\n`);
console.log('This will reduce drop rates for non-crafting materials on regular mobs only.\n');
console.log('Named mobs (bosses) will keep their current drop rates.\n');

// Get current stats for regular mobs
const beforeStats = (await db.execute(`
  SELECT 
    COUNT(*) as total_entries,
    AVG(ml.drop_chance) as avg_drop,
    MIN(ml.drop_chance) as min_drop,
    MAX(ml.drop_chance) as max_drop
  FROM mob_loot ml
  JOIN items i ON ml.item_id = i.id
  WHERE i.type != 'crafting_material'
`)).rows[0];

console.log('=== CURRENT LOOT STATS (All Mobs) ===');
console.log(`  Total loot entries (non-crafting): ${beforeStats.total_entries}`);
console.log(`  Average drop chance: ${(beforeStats.avg_drop * 100).toFixed(2)}%`);
console.log(`  Min drop chance: ${(beforeStats.min_drop * 100).toFixed(2)}%`);
console.log(`  Max drop chance: ${(beforeStats.max_drop * 100).toFixed(2)}%\n`);

// Get some example drops before
const examples = (await db.execute(`
  SELECT m.name as mob_name, i.name as item_name, ml.drop_chance
  FROM mob_loot ml
  JOIN mobs m ON ml.mob_id = m.id
  JOIN items i ON ml.item_id = i.id
  WHERE i.type != 'crafting_material'
  ORDER BY RANDOM()
  LIMIT 5
`)).rows;

console.log('Example Drops (Before):');
examples.forEach(e => {
  const newChance = e.drop_chance * (1 - REDUCTION_PERCENT / 100);
  console.log(`  ${e.mob_name} → ${e.item_name}: ${(e.drop_chance * 100).toFixed(2)}% → ${(newChance * 100).toFixed(2)}%`);
});

console.log('\n=== APPLYING REDUCTION ===\n');

// Reduce loot rates on regular mobs (not named mobs) for non-crafting materials
const result = await db.execute(`
  UPDATE mob_loot
  SET drop_chance = drop_chance * ${1 - REDUCTION_PERCENT / 100}
  WHERE item_id IN (
    SELECT id FROM items WHERE type != 'crafting_material'
  )
  AND mob_id IN (
    SELECT id FROM mobs
  )
`);

console.log(`✅ Updated ${result.rowsAffected} loot entries\n`);

// Get new stats
const afterStats = (await db.execute(`
  SELECT 
    COUNT(*) as total_entries,
    AVG(ml.drop_chance) as avg_drop,
    MIN(ml.drop_chance) as min_drop,
    MAX(ml.drop_chance) as max_drop
  FROM mob_loot ml
  JOIN items i ON ml.item_id = i.id
  WHERE i.type != 'crafting_material'
`)).rows[0];

console.log('=== NEW LOOT STATS ===');
console.log(`  Total loot entries: ${afterStats.total_entries}`);
console.log(`  Average drop chance: ${(afterStats.avg_drop * 100).toFixed(2)}%`);
console.log(`  Min drop chance: ${(afterStats.min_drop * 100).toFixed(2)}%`);
console.log(`  Max drop chance: ${(afterStats.max_drop * 100).toFixed(2)}%\n`);

// Show examples after
const examplesAfter = (await db.execute(`
  SELECT m.name as mob_name, i.name as item_name, ml.drop_chance
  FROM mob_loot ml
  JOIN mobs m ON ml.mob_id = m.id
  JOIN items i ON ml.item_id = i.id
  WHERE i.type != 'crafting_material'
  ORDER BY RANDOM()
  LIMIT 5
`)).rows;

console.log('Example Drops (After):');
examplesAfter.forEach(e => {
  console.log(`  ${e.mob_name} → ${e.item_name}: ${(e.drop_chance * 100).toFixed(2)}%`);
});

// Calculate actual reduction
const actualReduction = ((beforeStats.avg_drop - afterStats.avg_drop) / beforeStats.avg_drop * 100).toFixed(2);
console.log(`\n✅ Average drop rate reduced by ${actualReduction}%`);
console.log(`   (${(beforeStats.avg_drop * 100).toFixed(2)}% → ${(afterStats.avg_drop * 100).toFixed(2)}%)`);

console.log('\n📝 Note: Crafting materials and named mob drops were NOT affected.');
