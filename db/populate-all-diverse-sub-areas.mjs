#!/usr/bin/env node
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log('🦾 Populating all diverse sub-areas with appropriate mobs...\n');

// Get all mobs grouped by level
const allMobs = await db.execute('SELECT id, name, level FROM mobs ORDER BY level');
console.log(`Found ${allMobs.rows.length} total mobs\n`);

// Get all sub-areas that need mob populations (Outskirts, Elite Grounds, Forbidden Zone)
const subAreasToPopulate = await db.execute(`
  SELECT sa.id, sa.name, sa.min_level, sa.max_level, sa.region_id, r.name as region_name
  FROM sub_areas sa
  JOIN regions r ON sa.region_id = r.id
  WHERE sa.name LIKE '% - Outskirts' 
     OR sa.name LIKE '% - Elite Grounds'
     OR sa.name LIKE '% - Forbidden Zone'
  ORDER BY sa.min_level
`);

console.log(`Found ${subAreasToPopulate.rows.length} sub-areas to populate\n`);

// Function to find appropriate mobs for a level range
function findMobsForLevelRange(minLevel, maxLevel) {
  const rangeMobs = allMobs.rows.filter(mob => {
    // Include mobs that are within +/- 3 levels of the range
    const mobLevel = mob.level;
    return mobLevel >= (minLevel - 3) && mobLevel <= (maxLevel + 3);
  });
  
  // If we don't have enough mobs, expand the search
  if (rangeMobs.length < 3) {
    return allMobs.rows.filter(mob => {
      const mobLevel = mob.level;
      return mobLevel >= (minLevel - 5) && mobLevel <= (maxLevel + 5);
    });
  }
  
  return rangeMobs;
}

let totalSpawnsAdded = 0;

for (const subArea of subAreasToPopulate.rows) {
  console.log(`\n${subArea.name} (Lv ${subArea.min_level}-${subArea.max_level}):`);
  
  // Check if this sub-area already has mobs
  const existingMobs = await db.execute({
    sql: 'SELECT COUNT(*) as count FROM sub_area_mobs WHERE sub_area_id = ?',
    args: [subArea.id]
  });
  
  if (existingMobs.rows[0].count > 0) {
    console.log(`  ✓ Already populated (${existingMobs.rows[0].count} mobs)`);
    continue;
  }
  
  // Find appropriate mobs
  const suitableMobs = findMobsForLevelRange(subArea.min_level, subArea.max_level);
  
  if (suitableMobs.length === 0) {
    console.log(`  ⚠ No suitable mobs found!`);
    continue;
  }
  
  // Select 3-5 mobs for this sub-area
  const mobCount = Math.min(5, Math.max(3, suitableMobs.length));
  const selectedMobs = [];
  
  // Try to get a good distribution
  if (suitableMobs.length <= mobCount) {
    selectedMobs.push(...suitableMobs);
  } else {
    // Pick mobs spread across the level range
    const step = Math.floor(suitableMobs.length / mobCount);
    for (let i = 0; i < mobCount; i++) {
      const index = Math.min(i * step, suitableMobs.length - 1);
      selectedMobs.push(suitableMobs[index]);
    }
  }
  
  // Assign spawn weights (higher weight for mobs closer to target level)
  const targetLevel = (subArea.min_level + subArea.max_level) / 2;
  
  for (const mob of selectedMobs) {
    const levelDiff = Math.abs(mob.level - targetLevel);
    const weight = Math.max(10, 40 - (levelDiff * 5)); // Closer = higher weight
    
    console.log(`  + ${mob.name} (Lv ${mob.level}) [${weight}%]`);
    
    await db.execute({
      sql: `
        INSERT INTO sub_area_mobs (sub_area_id, mob_id, spawn_weight, level_variance)
        VALUES (?, ?, ?, 2)
      `,
      args: [subArea.id, mob.id, weight]
    });
    
    totalSpawnsAdded++;
  }
}

console.log(`\n\n✅ Mob population complete!`);
console.log(`   Total spawns added: ${totalSpawnsAdded}`);

// Show summary by region
console.log(`\n📊 Final Summary:\n`);

const regions = await db.execute('SELECT id, name, min_level, max_level FROM regions ORDER BY id');

for (const region of regions.rows) {
  const subAreas = await db.execute({
    sql: `
      SELECT sa.name, sa.min_level, sa.max_level, COUNT(sam.id) as mob_count
      FROM sub_areas sa
      LEFT JOIN sub_area_mobs sam ON sa.id = sam.sub_area_id
      WHERE sa.region_id = ?
      GROUP BY sa.id
      ORDER BY sa.min_level
    `,
    args: [region.id]
  });
  
  console.log(`${region.name} (Lv ${region.min_level}-${region.max_level}):`);
  console.log(`  Total sub-areas: ${subAreas.rows.length}`);
  
  const populated = subAreas.rows.filter(sa => sa.mob_count > 0).length;
  console.log(`  Populated with mobs: ${populated}`);
  console.log('');
}

console.log('🎉 All regions fully diversified and populated!');
console.log('   Ready for quest generation!\n');

process.exit(0);
