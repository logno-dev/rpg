import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simple .env file parser
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

async function migrate() {
  // Verify environment variables are loaded
  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    console.error('❌ Error: Missing environment variables!');
    console.error('Please ensure TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are set in your .env file');
    console.error('\nYour .env file should look like:');
    console.error('TURSO_DATABASE_URL=libsql://your-db.turso.io');
    console.error('TURSO_AUTH_TOKEN=your-token-here');
    process.exit(1);
  }

  console.log('📡 Connecting to database:', process.env.TURSO_DATABASE_URL);

  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  console.log('🚀 Running database migrations...\n');

  try {
    const migrations = [
      '001_initial_schema.sql',
      '002_seed_data.sql',
      '003_add_attack_speed.sql',
      '004_add_regions.sql',
      '005_seed_regions.sql',
      '006_add_region_locks.sql',
      '007_update_region_locks.sql',
      '008_adjust_region_levels.sql',
      '009_add_consumable_effects.sql',
      '010_fix_bread_consumable.sql',
      '011_nerf_equipment.sql',
      '012_create_abilities_system.sql',
      '013_seed_abilities.sql',
      '014_increase_scroll_drops.sql',
      '015_balance_independent_loot.sql',
      '016_drastically_reduce_drop_rates.sql',
      '017_trim_loot_tables.sql',
      '018_fix_loot_quantities.sql',
      '019_remove_duplicate_loot_entries.sql',
      '020_nuclear_loot_reset.sql',
      '021_boost_scroll_drop_rates.sql',
      '022_add_early_spell_scrolls.sql',
      '023_guarantee_scroll_drops.sql',
      '024_force_add_scrolls.sql',
      '025_create_merchants.sql',
      '026_seed_merchant_items.sql',
      '027_add_requirements.sql',
      '028_create_dungeons_system.sql',
      '029_add_named_mob_combat.sql',
      '030_fix_combat_sessions_mob_id.sql',
      '031_create_loot_tables.sql',
      '032_add_region_id_to_mobs.sql',
    ];

    for (const migrationFile of migrations) {
      console.log(`📝 Running migration: ${migrationFile}`);
      const migrationPath = join(__dirname, 'migrations', migrationFile);
      
      try {
        const migration = readFileSync(migrationPath, 'utf-8');
        const statements = migration.split(';').filter(stmt => stmt.trim());
        
        for (const statement of statements) {
          const trimmed = statement.trim();
          // Skip empty statements and comment-only statements
          if (trimmed && !trimmed.startsWith('--') && trimmed.length > 0) {
            await client.execute(statement);
          }
        }
        console.log(`✅ ${migrationFile} completed\n`);
      } catch (error) {
        // If migration already ran (e.g., table exists), continue
        if (error.message.includes('already exists') || 
            error.message.includes('duplicate column') ||
            error.message.includes('UNIQUE constraint failed') ||
            error.message.includes('SQLITE_CONSTRAINT')) {
          console.log(`⚠️  ${migrationFile} - already applied (skipping)\n`);
        } else {
          throw error;
        }
      }
    }

    console.log('🎉 All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

migrate();
