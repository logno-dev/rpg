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

console.log('Checking for duplicate dungeons...\n');

const dungeons = await db.execute({
  sql: `SELECT 
          dungeons.id,
          dungeons.name,
          dungeons.region_id,
          regions.name as region_name,
          COUNT(*) OVER (PARTITION BY dungeons.name, dungeons.region_id) as count
        FROM dungeons
        JOIN regions ON dungeons.region_id = regions.id
        ORDER BY dungeons.region_id, dungeons.name, dungeons.id`,
  args: []
});

const duplicates = dungeons.rows.filter(d => d.count > 1);

if (duplicates.length > 0) {
  console.log('🚨 Found duplicate dungeons:\n');
  const grouped = {};
  duplicates.forEach(d => {
    const key = `${d.region_id}-${d.name}`;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(d);
  });
  
  Object.values(grouped).forEach(group => {
    console.log(`Region ${group[0].region_id} (${group[0].region_name}) - ${group[0].name}:`);
    group.forEach(d => {
      console.log(`  - Dungeon ID: ${d.id}`);
    });
    console.log('');
  });
} else {
  console.log('✓ No duplicate dungeons found');
}

// Also check for duplicate Brimstone bosses
console.log('Checking for duplicate named mobs...\n');
const namedMobs = await db.execute({
  sql: `SELECT id, name, title, region_id FROM named_mobs WHERE name = 'Brimstone' ORDER BY id`,
  args: []
});

if (namedMobs.rows.length > 1) {
  console.log('🚨 Found duplicate Brimstone bosses:\n');
  namedMobs.rows.forEach(mob => {
    console.log(`  ID ${mob.id}: ${mob.name} ${mob.title} (Region ${mob.region_id})`);
  });
}
