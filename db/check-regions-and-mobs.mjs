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

async function checkRegionsAndMobs() {
  const regions = await db.execute('SELECT * FROM regions ORDER BY id');
  
  for (const region of regions.rows) {
    console.log(`\n=== ${region.name} ===`);
    console.log(`Level Range: ${region.min_level}-${region.max_level}`);
    
    // Get mobs in this region
    const mobs = await db.execute(`
      SELECT m.* FROM mobs m
      JOIN region_mobs rm ON m.id = rm.mob_id
      WHERE rm.region_id = ${region.id}
      ORDER BY m.level
    `);
    
    console.log(`Mobs (${mobs.rows.length}):`);
    for (const mob of mobs.rows) {
      console.log(`  - ${mob.name} (Level ${mob.level})`);
    }
    
    // Get dungeons in this region
    const dungeons = await db.execute(`
      SELECT d.*, nm.name as boss_name, nm.level as boss_level
      FROM dungeons d
      JOIN named_mobs nm ON d.boss_mob_id = nm.id
      WHERE d.region_id = ${region.id}
    `);
    
    if (dungeons.rows.length > 0) {
      console.log(`Dungeons:`);
      for (const dungeon of dungeons.rows) {
        console.log(`  - ${dungeon.name} (Boss: ${dungeon.boss_name} Level ${dungeon.boss_level})`);
      }
    }
  }
}

checkRegionsAndMobs().catch(console.error);
