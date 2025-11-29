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

console.log('=== FIXING DUAL WEAPON RECIPE GROUP LEVELS ===\n');

// Get dual weapon recipe groups
const dualWeaponGroups = (await db.execute(`
  SELECT id, name, min_level, max_level
  FROM recipe_groups
  WHERE name IN ('Dual Daggers', 'Dual Swords', 'Greatsword', 'Greataxe')
`)).rows;

console.log('Current settings:\n');
dualWeaponGroups.forEach(g => {
  console.log(`${g.name}: min_level=${g.min_level}, max_level=${g.max_level}`);
});

console.log('\n=== CHECKING OUTPUT PROFESSION REQUIREMENTS ===\n');

for (const group of dualWeaponGroups) {
  const stats = (await db.execute({
    sql: `SELECT 
            MIN(ro.min_profession_level) as min_prof,
            MAX(ro.min_profession_level) as max_prof,
            COUNT(*) as output_count
          FROM recipe_outputs ro
          WHERE ro.recipe_group_id = ?`,
    args: [group.id]
  })).rows[0];
  
  console.log(`${group.name}:`);
  console.log(`  Outputs: ${stats.output_count} items`);
  console.log(`  Profession level range: ${stats.min_prof} - ${stats.max_prof}`);
  console.log(`  Current recipe group min_level: ${group.min_level}`);
  console.log(`  ❌ Should be: ${stats.min_prof}\n`);
}

console.log('=== APPLYING FIX ===\n');

// Update all four recipe groups to min_level = 10
const updates = await db.execute(`
  UPDATE recipe_groups
  SET min_level = 10
  WHERE name IN ('Dual Daggers', 'Dual Swords', 'Greatsword', 'Greataxe')
`);

console.log(`✅ Updated ${updates.rowsAffected} recipe groups to min_level = 10\n`);

console.log('=== VERIFICATION ===\n');

const verification = (await db.execute(`
  SELECT name, min_level, max_level
  FROM recipe_groups
  WHERE name IN ('Dual Daggers', 'Dual Swords', 'Greatsword', 'Greataxe')
`)).rows;

verification.forEach(g => {
  console.log(`${g.name}: min_level=${g.min_level}, max_level=${g.max_level}`);
});

console.log('\n✅ Dual weapon recipe groups now require blacksmithing level 10!');
