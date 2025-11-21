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

console.log('🌍 Adding mob spawn mappings for all regions...\n');

// Get all regions that need spawns (regions 6-16)
for (let regionId = 6; regionId <= 16; regionId++) {
  // Get region info
  const regionResult = await db.execute({
    sql: 'SELECT name FROM regions WHERE id = ?',
    args: [regionId]
  });
  
  if (regionResult.rows.length === 0) {
    console.log(`⚠️  Region ${regionId} not found, skipping...`);
    continue;
  }
  
  const regionName = regionResult.rows[0].name;
  
  // Get all mobs for this region
  const mobsResult = await db.execute({
    sql: 'SELECT id, name, level FROM mobs WHERE region_id = ? ORDER BY level',
    args: [regionId]
  });
  
  if (mobsResult.rows.length === 0) {
    console.log(`⚠️  No mobs found for Region ${regionId}: ${regionName}`);
    continue;
  }
  
  console.log(`Region ${regionId}: ${regionName}`);
  
  // Add spawn mappings with weighted distribution
  // Lower level = higher weight (more common)
  const mobs = mobsResult.rows;
  for (let i = 0; i < mobs.length; i++) {
    const mob = mobs[i];
    // Weight decreases as level increases: 5, 4, 3, 2, 2, 1
    const weight = Math.max(1, 6 - i);
    
    await db.execute({
      sql: 'INSERT INTO region_mobs (region_id, mob_id, spawn_weight) VALUES (?, ?, ?)',
      args: [regionId, mob.id, weight]
    });
    
    console.log(`  ✓ ${mob.name} (Level ${mob.level}, weight: ${weight})`);
  }
  
  console.log('');
}

console.log('✅ All region mob spawns configured!');
