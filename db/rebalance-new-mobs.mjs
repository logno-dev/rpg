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

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Based on the existing pattern, calculate proper stats for level
// Looking at the data: Level 8 Orc has 290 HP, 24-40 damage, 4 def
// Level 10 Skeleton has 350 HP, 30-50 damage, 5 def
// Pattern: ~35 HP per level, ~3-5 damage per level, ~0.3-0.5 def per level

function calculateStats(level, variant = 'normal') {
  // Base formula observed from existing mobs
  const baseHP = 80 + (level * 35);
  const baseDmgMin = Math.floor(3 + (level * 3));
  const baseDmgMax = Math.floor(5 + (level * 5));
  const baseDef = Math.floor(level * 0.5);
  const baseXP = Math.floor(15 + (level * 13));
  const baseGoldMin = Math.floor(2 + (level * 2));
  const baseGoldMax = Math.floor(5 + (level * 5));
  
  // Variants adjust stats
  const variants = {
    'glass_cannon': { hp: 0.7, dmg: 1.3, def: 0.5 },    // Low HP, high damage
    'tank': { hp: 1.4, dmg: 0.8, def: 1.5 },             // High HP, low damage
    'balanced': { hp: 1.0, dmg: 1.0, def: 1.0 },         // Normal
    'fast': { hp: 0.8, dmg: 1.1, def: 0.8 },             // Slightly lower HP, higher damage
    'elite': { hp: 1.2, dmg: 1.2, def: 1.2 },            // All stats higher
  };
  
  const multiplier = variants[variant] || variants['balanced'];
  
  return {
    max_health: Math.floor(baseHP * multiplier.hp),
    damage_min: Math.floor(baseDmgMin * multiplier.dmg),
    damage_max: Math.floor(baseDmgMax * multiplier.dmg),
    defense: Math.floor(baseDef * multiplier.def),
    experience_reward: Math.floor(baseXP * (multiplier.hp + multiplier.dmg) / 2),
    gold_min: baseGoldMin,
    gold_max: baseGoldMax,
  };
}

async function rebalanceMobs() {
  console.log('Rebalancing new mobs to match level-appropriate stats...\n');
  
  // Mobs to rebalance with their variant type
  const mobsToRebalance = [
    // Shadowdeep Dungeon
    { name: 'Zombie', level: 8, variant: 'tank' },              // Slow, tanky
    { name: 'Ghoul', level: 9, variant: 'fast' },               // Fast attacker
    { name: 'Wraith', level: 11, variant: 'glass_cannon' },     // Glass cannon
    { name: 'Dark Cultist', level: 12, variant: 'balanced' },   // Balanced
    { name: 'Gargoyle', level: 14, variant: 'tank' },           // Very tanky
    { name: 'Shadow Fiend', level: 15, variant: 'elite' },      // Elite mob
    
    // Ironpeak Mountains
    { name: 'Mountain Lion', level: 6, variant: 'fast' },       // Fast predator
    { name: 'Hill Giant', level: 7, variant: 'tank' },          // Slow giant
    { name: 'Orc Warrior', level: 9, variant: 'balanced' },     // Balanced warrior
    { name: 'Stone Elemental', level: 10, variant: 'tank' },    // Very tanky
    { name: 'Wyvern', level: 11, variant: 'fast' },             // Flying attacker
    
    // Darkwood Forest
    { name: 'Dire Wolf', level: 4, variant: 'fast' },           // Fast wolf
    { name: 'Forest Troll', level: 7, variant: 'tank' },        // Forest giant
    
    // Greenfield Plains
    { name: 'Rabid Dog', level: 2, variant: 'fast' },           // Fast aggressive
  ];
  
  let updatedCount = 0;
  
  for (const mob of mobsToRebalance) {
    const stats = calculateStats(mob.level, mob.variant);
    
    const result = await client.execute({
      sql: `UPDATE mobs 
            SET max_health = ?, damage_min = ?, damage_max = ?, defense = ?, 
                experience_reward = ?, gold_min = ?, gold_max = ?
            WHERE name = ? AND level = ?`,
      args: [
        stats.max_health, stats.damage_min, stats.damage_max, stats.defense,
        stats.experience_reward, stats.gold_min, stats.gold_max,
        mob.name, mob.level
      ]
    });
    
    if (result.rowsAffected > 0) {
      console.log(`✅ ${mob.name} (Lvl ${mob.level}, ${mob.variant})`);
      console.log(`   HP: ${stats.max_health} | DMG: ${stats.damage_min}-${stats.damage_max} | DEF: ${stats.defense} | XP: ${stats.experience_reward} | Gold: ${stats.gold_min}-${stats.gold_max}`);
      updatedCount++;
    } else {
      console.log(`⚠️  ${mob.name} not found or already updated`);
    }
  }
  
  console.log(`\n✨ Updated ${updatedCount} mobs!`);
  
  // Show comparison with nearby level mobs
  console.log('\n=== Level 8-15 Mobs After Rebalancing ===\n');
  const comparison = await client.execute(`
    SELECT name, level, max_health, damage_min, damage_max, defense, experience_reward
    FROM mobs 
    WHERE level BETWEEN 8 AND 15
    ORDER BY level, name
  `);
  
  console.log('Lvl | Name                 | HP    | Damage     | Def | XP');
  console.log('----|----------------------|-------|------------|-----|----');
  for (const mob of comparison.rows) {
    const dmg = `${mob.damage_min}-${mob.damage_max}`;
    console.log(`${String(mob.level).padEnd(3)} | ${mob.name.padEnd(20)} | ${String(mob.max_health).padEnd(5)} | ${dmg.padEnd(10)} | ${String(mob.defense).padEnd(3)} | ${mob.experience_reward}`);
  }
}

rebalanceMobs().then(() => {
  console.log('\nDone!');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
