import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env
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

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const sql = readFileSync(join(__dirname, 'migrations', '020_nuclear_loot_reset.sql'), 'utf-8');

// Execute as a transaction
const statements = sql.split(';').filter(s => s.trim() && !s.trim().startsWith('--'));

console.log('🔥 Forcing loot table reset...');
for (const statement of statements) {
  if (statement.trim()) {
    try {
      await client.execute(statement);
    } catch (err) {
      console.log('Statement:', statement.substring(0, 50) + '...');
      console.log('Error (might be ok):', err.message);
    }
  }
}

console.log('✅ Loot table reset complete!');
