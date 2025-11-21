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

async function runMigration() {
  console.log('Creating loot tables...\n');
  
  try {
    // Create mob_loot table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS mob_loot (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mob_id INTEGER NOT NULL,
        item_id INTEGER NOT NULL,
        drop_chance REAL NOT NULL,
        min_quantity INTEGER DEFAULT 1,
        max_quantity INTEGER DEFAULT 1,
        FOREIGN KEY (mob_id) REFERENCES mobs(id) ON DELETE CASCADE,
        FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Created mob_loot table');
    
    // Create named_mob_loot table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS named_mob_loot (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        named_mob_id INTEGER NOT NULL,
        item_id INTEGER NOT NULL,
        drop_chance REAL NOT NULL,
        min_quantity INTEGER DEFAULT 1,
        max_quantity INTEGER DEFAULT 1,
        FOREIGN KEY (named_mob_id) REFERENCES named_mobs(id) ON DELETE CASCADE,
        FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Created named_mob_loot table');
    
    // Create region_rare_loot table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS region_rare_loot (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        region_id INTEGER NOT NULL,
        item_id INTEGER NOT NULL,
        drop_chance REAL NOT NULL,
        min_level INTEGER NOT NULL,
        FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE CASCADE,
        FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Created region_rare_loot table');
    
    // Create indexes
    await db.execute('CREATE INDEX IF NOT EXISTS idx_mob_loot_mob ON mob_loot(mob_id)');
    console.log('✓ Created index on mob_loot');
    
    await db.execute('CREATE INDEX IF NOT EXISTS idx_named_mob_loot_named_mob ON named_mob_loot(named_mob_id)');
    console.log('✓ Created index on named_mob_loot');
    
    await db.execute('CREATE INDEX IF NOT EXISTS idx_region_rare_loot_region ON region_rare_loot(region_id)');
    console.log('✓ Created index on region_rare_loot');
    
    console.log('\n✅ Migration 031 completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

runMigration().catch(console.error);
