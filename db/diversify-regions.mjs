#!/usr/bin/env node
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log('🌍 Diversifying regions with mixed-level sub-areas...\n');

// Get region IDs
const regions = await db.execute('SELECT id, name FROM regions ORDER BY id LIMIT 3');
const greenfield = regions.rows.find(r => r.name === 'Greenfield Plains');
const darkwood = regions.rows.find(r => r.name === 'Darkwood Forest');
const ironpeak = regions.rows.find(r => r.name === 'Ironpeak Mountains');

console.log(`Found regions:
  - Greenfield Plains (ID: ${greenfield.id})
  - Darkwood Forest (ID: ${darkwood.id})
  - Ironpeak Mountains (ID: ${ironpeak.id})\n`);

// New sub-areas following the design doc
const newSubAreas = [
  // GREENFIELD PLAINS - Add elite areas
  {
    region_id: greenfield.id,
    name: 'Bandit Encampment',
    description: 'A fortified camp where bandits have set up operations. Elite enemies guard stolen goods.',
    min_level: 8,
    max_level: 12,
    difficulty: 'Elite'
  },
  {
    region_id: greenfield.id,
    name: 'Cursed Ruins',
    description: 'Ancient ruins corrupted by dark magic. Undead creatures roam freely.',
    min_level: 10,
    max_level: 14,
    difficulty: 'Elite'
  },
  
  // DARKWOOD FOREST - Add safe area at beginning
  {
    region_id: darkwood.id,
    name: 'Forest Outskirts',
    description: 'The peaceful edge of the forest where sunlight still reaches. Safe for newer adventurers.',
    min_level: 3,
    max_level: 6,
    difficulty: 'Safe'
  },
  
  // DARKWOOD FOREST - Add elite areas
  {
    region_id: darkwood.id,
    name: 'Cursed Depths',
    description: 'The darkest part of the forest where twisted creatures dwell. Veteran adventurers only.',
    min_level: 14,
    max_level: 18,
    difficulty: 'Elite'
  },
  {
    region_id: darkwood.id,
    name: 'Witch\'s Domain',
    description: 'A magically corrupted grove controlled by a powerful witch and her minions.',
    min_level: 12,
    max_level: 16,
    difficulty: 'Elite'
  },
  
  // IRONPEAK MOUNTAINS - Add safe area
  {
    region_id: ironpeak.id,
    name: 'Mountain Foothills',
    description: 'Gentle slopes at the base of the mountain. A safe training ground with mountain wildlife.',
    min_level: 4,
    max_level: 7,
    difficulty: 'Safe'
  },
  
  // IRONPEAK MOUNTAINS - Add elite areas
  {
    region_id: ironpeak.id,
    name: 'Harpy Nesting Grounds',
    description: 'Treacherous cliffs where aggressive harpies have made their nests. Experienced climbers only.',
    min_level: 16,
    max_level: 20,
    difficulty: 'Elite'
  },
  {
    region_id: ironpeak.id,
    name: 'Ancient Titan Ruins',
    description: 'Forgotten ruins guarded by stone golems and earth elementals.',
    min_level: 18,
    max_level: 22,
    difficulty: 'Elite'
  },
];

console.log('📝 Adding new sub-areas:\n');

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

// Show the updated distribution
console.log('\n📊 Updated region breakdown:\n');

for (const region of [greenfield, darkwood, ironpeak]) {
  const subAreas = await db.execute({
    sql: 'SELECT name, min_level, max_level FROM sub_areas WHERE region_id = ? ORDER BY min_level',
    args: [region.id]
  });
  
  console.log(`${region.name}:`);
  for (const sa of subAreas.rows) {
    console.log(`  - ${sa.name} (Lv ${sa.min_level}-${sa.max_level})`);
  }
  console.log('');
}

console.log('🎯 Regions now support non-linear progression!');
console.log('   - Low-level players can access safe areas in higher regions');
console.log('   - High-level players can find challenges in starter regions');
console.log('   - Quests can span regions while maintaining level consistency\n');

process.exit(0);
