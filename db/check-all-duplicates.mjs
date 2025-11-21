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

console.log('Checking for any remaining duplicates...\n');

// Check for duplicate dungeons by name+region
const dungeonDupes = await db.execute({
  sql: `SELECT name, region_id, COUNT(*) as count 
        FROM dungeons 
        GROUP BY name, region_id 
        HAVING COUNT(*) > 1`,
  args: []
});

if (dungeonDupes.rows.length > 0) {
  console.log('🚨 Duplicate dungeons found:');
  dungeonDupes.rows.forEach(d => {
    console.log(`  ${d.name} in region ${d.region_id}: ${d.count} copies`);
  });
} else {
  console.log('✓ No duplicate dungeons found');
}

// Check for duplicate named mobs by name+region
const mobDupes = await db.execute({
  sql: `SELECT name, region_id, COUNT(*) as count 
        FROM named_mobs 
        GROUP BY name, region_id 
        HAVING COUNT(*) > 1`,
  args: []
});

if (mobDupes.rows.length > 0) {
  console.log('\n🚨 Duplicate named mobs found:');
  mobDupes.rows.forEach(m => {
    console.log(`  ${m.name} in region ${m.region_id}: ${m.count} copies`);
  });
  
  // Show details
  for (const dupe of mobDupes.rows) {
    const details = await db.execute({
      sql: 'SELECT id, name, title FROM named_mobs WHERE name = ? AND region_id = ?',
      args: [dupe.name, dupe.region_id]
    });
    console.log(`    IDs: ${details.rows.map(r => r.id).join(', ')}`);
  }
} else {
  console.log('✓ No duplicate named mobs found');
}

console.log('\n');
