import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function migrate() {
  // Verify environment variables are loaded
  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    console.error('Error: Missing environment variables!');
    console.error('Please ensure TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are set in your .env file');
    process.exit(1);
  }

  console.log('Connecting to database:', process.env.TURSO_DATABASE_URL);

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
