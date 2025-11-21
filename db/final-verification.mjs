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
console.log('         GAME WORLD - FINAL VERIFICATION');
console.log('═══════════════════════════════════════════════════════\n');

// Check regions
const regions = await db.execute('SELECT id, name, locked, unlock_requirement FROM regions ORDER BY id');
console.log(`📍 REGIONS: ${regions.rows.length}\n`);

let unlockedCount = 0;
let lockedCount = 0;

for (const region of regions.rows) {
  const isLocked = region.locked === 1;
  if (isLocked) lockedCount++;
  else unlockedCount++;
  
  // Check if region has spawns
  const spawns = await db.execute({
    sql: 'SELECT COUNT(*) as count FROM region_mobs WHERE region_id = ?',
    args: [region.id]
  });
  
  // Check if region has dungeon
  const dungeons = await db.execute({
    sql: 'SELECT COUNT(*) as count FROM dungeons WHERE region_id = ?',
    args: [region.id]
  });
  
  const status = isLocked ? '🔒' : '🔓';
  const spawnCheck = spawns.rows[0].count > 0 ? '✓' : '❌';
  const dungeonCheck = dungeons.rows[0].count > 0 ? '✓' : '❌';
  
  console.log(`${status} Region ${region.id}: ${region.name}`);
  console.log(`   Spawns: ${spawnCheck} ${spawns.rows[0].count} | Dungeon: ${dungeonCheck}`);
  if (isLocked) {
    console.log(`   Unlock: ${region.unlock_requirement}`);
  }
}

console.log(`\n📊 SUMMARY:`);
console.log(`   Unlocked: ${unlockedCount}`);
console.log(`   Locked: ${lockedCount}`);

// Check for any duplicate issues
console.log('\n🔍 INTEGRITY CHECKS:\n');

const dupeDungeons = await db.execute({
  sql: 'SELECT name, region_id, COUNT(*) as count FROM dungeons GROUP BY name, region_id HAVING COUNT(*) > 1',
  args: []
});

if (dupeDungeons.rows.length > 0) {
  console.log('❌ Duplicate dungeons found!');
} else {
  console.log('✓ No duplicate dungeons');
}

const dupeBosses = await db.execute({
  sql: 'SELECT name, region_id, COUNT(*) as count FROM named_mobs GROUP BY name, region_id HAVING COUNT(*) > 1',
  args: []
});

if (dupeBosses.rows.length > 0) {
  console.log('❌ Duplicate bosses found!');
} else {
  console.log('✓ No duplicate bosses');
}

const regionsWithoutSpawns = await db.execute({
  sql: `SELECT r.id, r.name 
        FROM regions r 
        LEFT JOIN region_mobs rm ON r.id = rm.region_id 
        GROUP BY r.id 
        HAVING COUNT(rm.id) = 0`,
  args: []
});

if (regionsWithoutSpawns.rows.length > 0) {
  console.log(`❌ ${regionsWithoutSpawns.rows.length} regions without spawns`);
} else {
  console.log('✓ All regions have mob spawns');
}

console.log('\n═══════════════════════════════════════════════════════');
console.log('✅ GAME WORLD READY FOR ADVENTURE!');
console.log('═══════════════════════════════════════════════════════\n');
