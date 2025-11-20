import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function migrate() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  console.log('Running database migrations...');

  try {
    // Read and execute initial schema
    const schema = readFileSync(join(__dirname, 'migrations', '001_initial_schema.sql'), 'utf-8');
    const schemaStatements = schema.split(';').filter(stmt => stmt.trim());
    
    for (const statement of schemaStatements) {
      if (statement.trim()) {
        await client.execute(statement);
      }
    }
    console.log('✓ Initial schema created');

    // Read and execute seed data
    const seedData = readFileSync(join(__dirname, 'migrations', '002_seed_data.sql'), 'utf-8');
    const seedStatements = seedData.split(';').filter(stmt => stmt.trim());
    
    for (const statement of seedStatements) {
      if (statement.trim()) {
        await client.execute(statement);
      }
    }
    console.log('✓ Seed data inserted');

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
