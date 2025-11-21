import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnv() {
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
}

loadEnv();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const mobs = await db.execute('SELECT name, level, max_health, damage_min, damage_max, defense, experience_reward, gold_min, gold_max FROM mobs ORDER BY level');

console.log('Current Mob Stats:\n');
console.log('Lvl | Name                 | HP    | Damage     | Def | XP  | Gold');
console.log('----|----------------------|-------|------------|-----|-----|--------');
for (const mob of mobs.rows) {
  const dmg = `${mob.damage_min}-${mob.damage_max}`;
  const gold = `${mob.gold_min}-${mob.gold_max}`;
  console.log(`${String(mob.level).padEnd(3)} | ${mob.name.padEnd(20)} | ${String(mob.max_health).padEnd(5)} | ${dmg.padEnd(10)} | ${String(mob.defense).padEnd(3)} | ${String(mob.experience_reward).padEnd(3)} | ${gold}`);
}

process.exit(0);
