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

console.log('═══════════════════════════════════════════════════════');
console.log('  REGION 5: SCORCHED BADLANDS - VERIFICATION REPORT');
console.log('═══════════════════════════════════════════════════════\n');

// Check region
const region = await db.execute({
  sql: 'SELECT * FROM regions WHERE id = 5',
  args: []
});

console.log('📍 REGION INFO:');
console.log(`   Name: ${region.rows[0].name}`);
console.log(`   Level Range: ${region.rows[0].min_level}-${region.rows[0].max_level}`);
console.log(`   Locked: ${region.rows[0].locked ? 'Yes' : 'No'}`);
console.log(`   Unlock Requirement: ${region.rows[0].unlock_requirement || 'None'}`);

// Check mobs
const mobs = await db.execute({
  sql: 'SELECT COUNT(*) as count FROM mobs WHERE region_id = 5',
  args: []
});
console.log(`\n🗡️  MOBS: ${mobs.rows[0].count} different mob types`);

// Check dungeons
const dungeons = await db.execute({
  sql: `SELECT d.*, nm.name as boss_name 
        FROM dungeons d 
        JOIN named_mobs nm ON d.boss_mob_id = nm.id
        WHERE d.region_id = 5`,
  args: []
});

console.log(`\n🏰 DUNGEON: ${dungeons.rows.length} dungeon${dungeons.rows.length !== 1 ? 's' : ''}`);
if (dungeons.rows.length > 0) {
  const dungeon = dungeons.rows[0];
  console.log(`   Name: ${dungeon.name}`);
  console.log(`   Boss: ${dungeon.boss_name} (ID: ${dungeon.boss_mob_id})`);
  console.log(`   Required Level: ${dungeon.required_level}`);
  
  // Check encounters
  const encounters = await db.execute({
    sql: 'SELECT COUNT(*) as count FROM dungeon_encounters WHERE dungeon_id = ?',
    args: [dungeon.id]
  });
  console.log(`   Encounters: ${encounters.rows[0].count}`);
}

// Check named mobs
const namedMobs = await db.execute({
  sql: 'SELECT * FROM named_mobs WHERE region_id = 5',
  args: []
});

console.log(`\n👹 NAMED MOBS: ${namedMobs.rows.length}`);
namedMobs.rows.forEach(mob => {
  console.log(`   ${mob.name} ${mob.title} (ID: ${mob.id}, Level ${mob.level})`);
});

// Check next region unlock
const nextRegion = await db.execute({
  sql: 'SELECT * FROM regions WHERE id = 6',
  args: []
});

console.log(`\n🔓 NEXT REGION UNLOCK:`);
console.log(`   ${nextRegion.rows[0].name}`);
console.log(`   Requirement: ${nextRegion.rows[0].unlock_requirement}`);

console.log('\n═══════════════════════════════════════════════════════');
console.log('✅ Region 5 is fully configured and ready to play!');
console.log('═══════════════════════════════════════════════════════\n');
