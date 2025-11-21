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
      line = line.trim();
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

console.log('🧹 Cleaning up duplicate dungeons and bosses...\n');

// Keep Brimstone ID 11, delete 12 and 13
console.log('Step 1: Deleting duplicate Brimstone bosses (keeping ID 11)...');

// First, check if any dungeons reference the duplicates
const dungeonsCheck = await db.execute({
  sql: 'SELECT id, name, boss_mob_id FROM dungeons WHERE boss_mob_id IN (12, 13)',
  args: []
});

if (dungeonsCheck.rows.length > 0) {
  console.log('  Found dungeons referencing duplicate bosses:');
  dungeonsCheck.rows.forEach(d => {
    console.log(`    Dungeon ${d.id}: ${d.name} -> Boss ${d.boss_mob_id}`);
  });
  
  // Update these dungeons to reference boss ID 11 instead
  console.log('  Updating dungeons to reference boss ID 11...');
  await db.execute({
    sql: 'UPDATE dungeons SET boss_mob_id = 11 WHERE boss_mob_id IN (12, 13)',
    args: []
  });
  console.log('  ✓ Updated dungeons');
}

// Delete duplicate named mobs
console.log('  Deleting duplicate Brimstone bosses (IDs 12, 13)...');
await db.execute({
  sql: 'DELETE FROM named_mobs WHERE id IN (12, 13)',
  args: []
});
console.log('  ✓ Deleted duplicate bosses\n');

// Keep dungeon ID 11, delete dungeon ID 12
console.log('Step 2: Deleting duplicate Inferno Citadel dungeon (keeping ID 11)...');

// Check if there are any dungeon encounters for dungeon 12
const encountersCheck = await db.execute({
  sql: 'SELECT * FROM dungeon_encounters WHERE dungeon_id = 12',
  args: []
});

if (encountersCheck.rows.length > 0) {
  console.log('  Found encounters for dungeon 12, deleting them...');
  await db.execute({
    sql: 'DELETE FROM dungeon_encounters WHERE dungeon_id = 12',
    args: []
  });
  console.log('  ✓ Deleted encounters');
}

// Check if anyone has progress in dungeon 12
const progressCheck = await db.execute({
  sql: 'SELECT * FROM character_dungeon_progress WHERE dungeon_id = 12',
  args: []
});

if (progressCheck.rows.length > 0) {
  console.log('  Found character progress for dungeon 12, deleting it...');
  await db.execute({
    sql: 'DELETE FROM character_dungeon_progress WHERE dungeon_id = 12',
    args: []
  });
  console.log('  ✓ Deleted progress');
}

// Delete the duplicate dungeon
console.log('  Deleting duplicate Inferno Citadel (ID 12)...');
await db.execute({
  sql: 'DELETE FROM dungeons WHERE id = 12',
  args: []
});
console.log('  ✓ Deleted duplicate dungeon\n');

// Verify cleanup
console.log('Step 3: Verifying cleanup...\n');

const remainingBrimstones = await db.execute({
  sql: 'SELECT id, name, title FROM named_mobs WHERE name = "Brimstone"',
  args: []
});

console.log(`Remaining Brimstone bosses: ${remainingBrimstones.rows.length}`);
remainingBrimstones.rows.forEach(mob => {
  console.log(`  ID ${mob.id}: ${mob.name} ${mob.title}`);
});

const remainingDungeons = await db.execute({
  sql: 'SELECT id, name, boss_mob_id FROM dungeons WHERE name = "Inferno Citadel"',
  args: []
});

console.log(`\nRemaining Inferno Citadel dungeons: ${remainingDungeons.rows.length}`);
remainingDungeons.rows.forEach(dungeon => {
  console.log(`  ID ${dungeon.id}: ${dungeon.name} (Boss ID: ${dungeon.boss_mob_id})`);
});

console.log('\n✅ Cleanup complete!');
