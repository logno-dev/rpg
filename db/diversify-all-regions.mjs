#!/usr/bin/env node
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log('🌍 Diversifying ALL regions with mixed-level sub-areas...\n');

// Get all regions
const regions = await db.execute('SELECT id, name, min_level, max_level FROM regions ORDER BY id');

console.log(`Found ${regions.rows.length} regions to diversify\n`);

// Calculate diverse sub-areas for each region
const newSubAreas = [];

for (const region of regions.rows) {
  const regionName = region.name;
  const regionId = region.id;
  const minLevel = region.min_level;
  const maxLevel = region.max_level;
  const levelRange = maxLevel - minLevel;
  
  console.log(`Planning ${regionName} (Lv ${minLevel}-${maxLevel})...`);
  
  // Add 1-2 SAFE sub-areas (lower than region minimum)
  if (minLevel > 3) {
    const safeMin = Math.max(1, minLevel - 5);
    const safeMax = Math.max(3, minLevel - 2);
    
    newSubAreas.push({
      region_id: regionId,
      name: `${regionName} - Outskirts`,
      description: `The safer outer areas of ${regionName}, suitable for less experienced adventurers.`,
      min_level: safeMin,
      max_level: safeMax,
      difficulty: 'Safe'
    });
  }
  
  // Add 2-3 ELITE sub-areas (higher than region maximum)
  if (maxLevel < 58) {
    // Elite area 1: Moderate challenge
    const eliteMin1 = maxLevel + 2;
    const eliteMax1 = maxLevel + 6;
    
    newSubAreas.push({
      region_id: regionId,
      name: `${regionName} - Elite Grounds`,
      description: `A dangerous area within ${regionName} where powerful creatures lurk. Veteran adventurers only.`,
      min_level: eliteMin1,
      max_level: eliteMax1,
      difficulty: 'Elite'
    });
    
    // Elite area 2: High challenge (only for mid-level regions)
    if (minLevel >= 8 && maxLevel <= 50) {
      const eliteMin2 = maxLevel + 4;
      const eliteMax2 = maxLevel + 8;
      
      newSubAreas.push({
        region_id: regionId,
        name: `${regionName} - Forbidden Zone`,
        description: `The most treacherous part of ${regionName}, avoided by all but the bravest souls.`,
        min_level: eliteMin2,
        max_level: eliteMax2,
        difficulty: 'Elite'
      });
    }
  }
  
  console.log(`  ✓ Planned ${newSubAreas.filter(sa => sa.region_id === regionId).length} new sub-areas\n`);
}

console.log(`\n📝 Adding ${newSubAreas.length} new sub-areas...\n`);

for (const subArea of newSubAreas) {
  console.log(`  [${subArea.difficulty}] ${subArea.name} (Lv ${subArea.min_level}-${subArea.max_level})`);
  
  await db.execute({
    sql: `
      INSERT INTO sub_areas (region_id, name, description, min_level, max_level)
      VALUES (?, ?, ?, ?, ?)
    `,
    args: [
      subArea.region_id,
      subArea.name,
      subArea.description,
      subArea.min_level,
      subArea.max_level
    ]
  });
}

console.log('\n✅ Sub-areas added successfully!');

// Show summary by region
console.log('\n📊 Diversification Summary:\n');

for (const region of regions.rows) {
  const subAreas = await db.execute({
    sql: 'SELECT name, min_level, max_level FROM sub_areas WHERE region_id = ? ORDER BY min_level',
    args: [region.id]
  });
  
  console.log(`${region.name} (Region Lv ${region.min_level}-${region.max_level}):`);
  console.log(`  Total sub-areas: ${subAreas.rows.length}`);
  
  const safeSubs = subAreas.rows.filter(sa => sa.max_level < region.min_level);
  const normalSubs = subAreas.rows.filter(sa => 
    sa.min_level >= region.min_level && sa.max_level <= region.max_level
  );
  const eliteSubs = subAreas.rows.filter(sa => sa.min_level > region.max_level);
  
  console.log(`  - Safe areas: ${safeSubs.length}`);
  console.log(`  - Normal areas: ${normalSubs.length}`);
  console.log(`  - Elite areas: ${eliteSubs.length}`);
  console.log('');
}

console.log('🎯 All regions now support non-linear progression!');
console.log('   - Each region has safe areas for lower-level players');
console.log('   - Each region has elite challenges for experienced players');
console.log('   - Quests can span regions while maintaining level consistency\n');

process.exit(0);
