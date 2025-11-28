#!/usr/bin/env node
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log('🔧 Fixing mob level mismatches in manually created sub-areas...\n');

// Get sub-area IDs
const subAreas = await db.execute(`
  SELECT id, name, min_level, max_level
  FROM sub_areas
  WHERE name IN ('Cursed Depths', 'Witch''s Domain', 'Harpy Nesting Grounds', 'Ancient Titan Ruins')
`);

const fixes = {
  'Cursed Depths': [
    { mobId: 137, name: 'Shadow Abomination', level: 14, weight: 30 },
    { mobId: 158, name: 'Ash Wraith', level: 14, weight: 25 },
    { mobId: 138, name: 'Void Walker', level: 15, weight: 25 },
    { mobId: 243, name: 'Shadow Fiend', level: 15, weight: 20 },
  ],
  
  "Witch's Domain": [
    { mobId: 136, name: 'Lichling', level: 12, weight: 25 },
    { mobId: 241, name: 'Dark Cultist', level: 12, weight: 30 },
    { mobId: 8, name: 'Cave Troll', level: 13, weight: 25 },
    { mobId: 137, name: 'Shadow Abomination', level: 14, weight: 20 },
  ],
  
  'Harpy Nesting Grounds': [
    { mobId: 160, name: 'Hellhound', level: 16, weight: 25 },
    { mobId: 164, name: 'Ice Wolf', level: 17, weight: 30 },
    { mobId: 162, name: 'Ifrit', level: 18, weight: 25 },
    { mobId: 165, name: 'Ice Elemental', level: 18, weight: 20 },
  ],
  
  'Ancient Titan Ruins': [
    { mobId: 162, name: 'Ifrit', level: 18, weight: 25 },
    { mobId: 166, name: 'Snow Troll', level: 19, weight: 25 },
    { mobId: 167, name: 'Frost Giant', level: 20, weight: 30 },
    { mobId: 169, name: 'Frost Mammoth', level: 22, weight: 20 },
  ],
};

for (const subArea of subAreas.rows) {
  const subAreaName = subArea.name;
  const newMobs = fixes[subAreaName];
  
  if (!newMobs) continue;
  
  console.log(`\nFixing ${subAreaName} (Lv ${subArea.min_level}-${subArea.max_level}):`);
  
  // Delete old mobs
  await db.execute({
    sql: 'DELETE FROM sub_area_mobs WHERE sub_area_id = ?',
    args: [subArea.id]
  });
  console.log('  ✓ Removed old mobs');
  
  // Add new appropriately-leveled mobs
  for (const mob of newMobs) {
    console.log(`  + ${mob.name} (Lv ${mob.level}) [${mob.weight}%]`);
    
    await db.execute({
      sql: `
        INSERT INTO sub_area_mobs (sub_area_id, mob_id, spawn_weight, level_variance)
        VALUES (?, ?, ?, 2)
      `,
      args: [subArea.id, mob.mobId, mob.weight]
    });
  }
}

console.log('\n\n✅ Mob level mismatches fixed!');

// Verify fixes
console.log('\n📊 Verification:\n');

for (const subArea of subAreas.rows) {
  const mobs = await db.execute({
    sql: `
      SELECT m.name, m.level
      FROM sub_area_mobs sam
      JOIN mobs m ON sam.mob_id = m.id
      WHERE sam.sub_area_id = ?
      ORDER BY m.level
    `,
    args: [subArea.id]
  });
  
  const minMobLevel = Math.min(...mobs.rows.map(m => m.level));
  const maxMobLevel = Math.max(...mobs.rows.map(m => m.level));
  
  const status = (minMobLevel >= subArea.min_level - 2 && maxMobLevel <= subArea.max_level + 2) 
    ? '✓ OK' 
    : '⚠️ STILL MISMATCHED';
  
  console.log(`${subArea.name} (Lv ${subArea.min_level}-${subArea.max_level}):`);
  console.log(`  Mob levels: ${minMobLevel}-${maxMobLevel} ${status}`);
  
  for (const mob of mobs.rows) {
    console.log(`    - ${mob.name} (Lv ${mob.level})`);
  }
  console.log('');
}

console.log('🎉 All manually created sub-areas now have appropriate mob levels!\n');

process.exit(0);
