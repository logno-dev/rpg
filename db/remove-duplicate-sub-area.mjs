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

console.log('=== REMOVING DUPLICATE SUB-AREA ===\n');

// IDs of the duplicate sub-areas
const KEEP_ID = 57;
const DELETE_ID = 95;

console.log(`Keeping sub-area ID ${KEEP_ID}`);
console.log(`Deleting sub-area ID ${DELETE_ID}\n`);

// Check both sub-areas
const subAreas = (await db.execute(`
  SELECT id, name, description, region_id
  FROM sub_areas
  WHERE id IN (${KEEP_ID}, ${DELETE_ID})
  ORDER BY id
`)).rows;

console.log('=== SUB-AREAS ===\n');
subAreas.forEach(sa => {
  console.log(`ID ${sa.id}: ${sa.name}`);
  console.log(`  Region: ${sa.region_id}`);
  console.log(`  Description: ${sa.description}\n`);
});

// Check mobs in both
const mobs = (await db.execute(`
  SELECT sam.sub_area_id, m.name, sam.spawn_weight
  FROM sub_area_mobs sam
  JOIN mobs m ON sam.mob_id = m.id
  WHERE sam.sub_area_id IN (${KEEP_ID}, ${DELETE_ID})
  ORDER BY sam.sub_area_id, m.name
`)).rows;

console.log('=== MOBS ===\n');
const keepMobs = mobs.filter(m => m.sub_area_id === KEEP_ID);
const deleteMobs = mobs.filter(m => m.sub_area_id === DELETE_ID);

console.log(`Sub-area ${KEEP_ID}: ${keepMobs.length} mobs`);
keepMobs.forEach(m => console.log(`  - ${m.name} (weight: ${m.spawn_weight})`));

console.log(`\nSub-area ${DELETE_ID}: ${deleteMobs.length} mobs`);
deleteMobs.forEach(m => console.log(`  - ${m.name} (weight: ${m.spawn_weight})`));

// Check for any references
console.log('\n=== CHECKING REFERENCES ===\n');

const questRefs = (await db.execute(`
  SELECT COUNT(*) as count
  FROM quest_objectives
  WHERE target_sub_area_id = ${DELETE_ID}
`)).rows[0];

console.log(`Quest objectives referencing ${DELETE_ID}: ${questRefs.count}`);

if (questRefs.count > 0) {
  console.log('\n⚠️  WARNING: Sub-area has quest references!');
  console.log('Aborting deletion to prevent breaking quests.\n');
  process.exit(1);
}

console.log('\n=== DELETING DUPLICATE ===\n');

// Move any characters from duplicate sub-area to the kept one
const charsUpdated = await db.execute(`
  UPDATE characters
  SET current_sub_area = ${KEEP_ID}
  WHERE current_sub_area = ${DELETE_ID}
`);
if (charsUpdated.rowsAffected > 0) {
  console.log(`✅ Moved ${charsUpdated.rowsAffected} character(s) from sub-area ${DELETE_ID} to ${KEEP_ID}`);
}

// Delete mobs from duplicate sub-area
const mobsDeleted = await db.execute(`
  DELETE FROM sub_area_mobs
  WHERE sub_area_id = ${DELETE_ID}
`);
console.log(`✅ Deleted ${mobsDeleted.rowsAffected} mob entries from sub-area ${DELETE_ID}`);

// Delete the duplicate sub-area
await db.execute(`
  DELETE FROM sub_areas
  WHERE id = ${DELETE_ID}
`);
console.log(`✅ Deleted sub-area ${DELETE_ID}`);

console.log('\n=== VERIFICATION ===\n');

const remaining = (await db.execute(`
  SELECT COUNT(*) as count
  FROM sub_areas
  WHERE region_id = 2 AND name LIKE '%Elite Grounds%'
`)).rows[0];

console.log(`Sub-areas in region 2 with "Elite Grounds": ${remaining.count}`);
console.log('\n✅ Duplicate sub-area removed!');
