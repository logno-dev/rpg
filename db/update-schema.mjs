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

async function update() {
  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    console.error('❌ Error: Missing environment variables!');
    process.exit(1);
  }

  console.log('📡 Connecting to database:', process.env.TURSO_DATABASE_URL);

  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  console.log('🚀 Running schema update...\n');

  try {
    const updateSql = readFileSync(join(__dirname, 'migrations', '003_add_attack_speed.sql'), 'utf-8');
    const statements = updateSql.split(';').filter(stmt => stmt.trim());
    
    console.log(`📝 Executing ${statements.length} statements...`);
    for (const statement of statements) {
      if (statement.trim()) {
        await client.execute(statement);
      }
    }
    console.log('✅ Schema updated\n');

    console.log('🎉 Update completed successfully!');
  } catch (error) {
    console.error('❌ Update failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

update();
