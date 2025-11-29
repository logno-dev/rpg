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

const REDUCTION_PERCENT = 10;

console.log(`=== REDUCING MOB EXPERIENCE BY ${REDUCTION_PERCENT}% ===\n`);

// Get current stats
const beforeStats = (await db.execute(`
  SELECT 
    COUNT(*) as total_mobs,
    MIN(experience_reward) as min_exp,
    MAX(experience_reward) as max_exp,
    AVG(experience_reward) as avg_exp,
    SUM(experience_reward) as total_exp
  FROM mobs
`)).rows[0];

console.log('Current Experience Stats:');
console.log(`  Total Mobs: ${beforeStats.total_mobs}`);
console.log(`  Min XP: ${beforeStats.min_exp}`);
console.log(`  Max XP: ${beforeStats.max_exp}`);
console.log(`  Avg XP: ${Math.round(beforeStats.avg_exp)}`);
console.log(`  Total XP: ${beforeStats.total_exp}\n`);

// Show some example mobs before
const examples = (await db.execute(`
  SELECT id, name, level, experience_reward
  FROM mobs
  WHERE id IN (1, 50, 100, 150, 200)
  ORDER BY level
`)).rows;

console.log('Example Mobs (Before):');
examples.forEach(m => {
  const newExp = Math.floor(m.experience_reward * (1 - REDUCTION_PERCENT / 100));
  console.log(`  ${m.name} (Lvl ${m.level}): ${m.experience_reward} XP → ${newExp} XP`);
});

console.log('\n=== APPLYING REDUCTION ===\n');

// Reduce experience by 10% (multiply by 0.90)
// Use CAST to ensure integer result
const result = await db.execute(`
  UPDATE mobs
  SET experience_reward = CAST(experience_reward * 0.90 AS INTEGER)
`);

console.log(`✅ Updated ${result.rowsAffected} mobs\n`);

// Get new stats
const afterStats = (await db.execute(`
  SELECT 
    COUNT(*) as total_mobs,
    MIN(experience_reward) as min_exp,
    MAX(experience_reward) as max_exp,
    AVG(experience_reward) as avg_exp,
    SUM(experience_reward) as total_exp
  FROM mobs
`)).rows[0];

console.log('=== NEW EXPERIENCE STATS ===\n');
console.log(`  Total Mobs: ${afterStats.total_mobs}`);
console.log(`  Min XP: ${afterStats.min_exp}`);
console.log(`  Max XP: ${afterStats.max_exp}`);
console.log(`  Avg XP: ${Math.round(afterStats.avg_exp)}`);
console.log(`  Total XP: ${afterStats.total_exp}\n`);

// Show examples after
const examplesAfter = (await db.execute(`
  SELECT id, name, level, experience_reward
  FROM mobs
  WHERE id IN (1, 50, 100, 150, 200)
  ORDER BY level
`)).rows;

console.log('Example Mobs (After):');
examplesAfter.forEach(m => {
  console.log(`  ${m.name} (Lvl ${m.level}): ${m.experience_reward} XP`);
});

// Calculate actual reduction
const actualReduction = ((beforeStats.avg_exp - afterStats.avg_exp) / beforeStats.avg_exp * 100).toFixed(2);
console.log(`\n✅ Average XP reduced by ${actualReduction}%`);
console.log(`   (${Math.round(beforeStats.avg_exp)} → ${Math.round(afterStats.avg_exp)})`);
