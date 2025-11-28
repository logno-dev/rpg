#!/usr/bin/env node
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log('🦾 Populating diverse sub-areas with mobs...\n');

// Define mob spawns for each new sub-area
const mobSpawns = [
  // BANDIT ENCAMPMENT (Lv 8-12) - Bandit-themed
  { subAreaId: 48, mobId: 5, weight: 40 },     // Orc (Lv 8)
  { subAreaId: 48, mobId: 246, weight: 35 },   // Orc Warrior (Lv 9)
  { subAreaId: 48, mobId: 126, weight: 25 },   // Bandit (Lv 4) - scouts
  
  // CURSED RUINS (Lv 10-14) - Undead-themed
  { subAreaId: 49, mobId: 4, weight: 30 },     // Skeleton (Lv 10)
  { subAreaId: 49, mobId: 135, weight: 25 },   // Flesh Ghoul (Lv 11)
  { subAreaId: 49, mobId: 240, weight: 25 },   // Wraith (Lv 11)
  { subAreaId: 49, mobId: 136, weight: 20 },   // Lichling (Lv 12)
  
  // FOREST OUTSKIRTS (Lv 3-6) - Safe wildlife
  { subAreaId: 50, mobId: 124, weight: 35 },   // Wild Fox (Lv 3)
  { subAreaId: 50, mobId: 125, weight: 30 },   // Young Bear (Lv 4)
  { subAreaId: 50, mobId: 249, weight: 25 },   // Dire Wolf (Lv 4)
  { subAreaId: 50, mobId: 244, weight: 10 },   // Mountain Lion (Lv 6)
  
  // CURSED DEPTHS (Lv 14-18) - Dark forest elite
  { subAreaId: 51, mobId: 250, weight: 30 },   // Forest Troll (Lv 7) - but buffed
  { subAreaId: 51, mobId: 129, weight: 25 },   // Forest Wraith (Lv 7) - but buffed
  { subAreaId: 51, mobId: 128, weight: 25 },   // Treant Sapling (Lv 6) - but buffed
  { subAreaId: 51, mobId: 7, weight: 20 },     // Forest Spider (Lv 6) - but buffed
  
  // WITCH'S DOMAIN (Lv 12-16) - Magic/corrupted creatures
  { subAreaId: 52, mobId: 241, weight: 35 },   // Dark Cultist (Lv 12)
  { subAreaId: 52, mobId: 240, weight: 30 },   // Wraith (Lv 11)
  { subAreaId: 52, mobId: 129, weight: 20 },   // Forest Wraith (Lv 7) - corrupted
  { subAreaId: 52, mobId: 136, weight: 15 },   // Lichling (Lv 12)
  
  // MOUNTAIN FOOTHILLS (Lv 4-7) - Safe mountain wildlife
  { subAreaId: 53, mobId: 244, weight: 35 },   // Mountain Lion (Lv 6)
  { subAreaId: 53, mobId: 125, weight: 30 },   // Young Bear (Lv 4)
  { subAreaId: 53, mobId: 245, weight: 25 },   // Hill Giant (Lv 7)
  { subAreaId: 53, mobId: 6, weight: 10 },     // Wild Boar (Lv 3)
  
  // HARPY NESTING GROUNDS (Lv 16-20) - Harpy-themed elite
  { subAreaId: 54, mobId: 132, weight: 40 },   // Harpy (Lv 10) - but in packs
  { subAreaId: 54, mobId: 133, weight: 30 },   // Young Wyvern (Lv 11)
  { subAreaId: 54, mobId: 248, weight: 30 },   // Wyvern (Lv 11)
  
  // ANCIENT TITAN RUINS (Lv 18-22) - Golem/elemental-themed
  { subAreaId: 55, mobId: 131, weight: 35 },   // Stone Golem (Lv 9) - but ancient/stronger
  { subAreaId: 55, mobId: 247, weight: 35 },   // Stone Elemental (Lv 10)
  { subAreaId: 55, mobId: 245, weight: 30 },   // Hill Giant (Lv 7) - titan guards
];

console.log('Adding mob spawns to new sub-areas...\n');

for (const spawn of mobSpawns) {
  const mobResult = await db.execute({
    sql: 'SELECT name, level FROM mobs WHERE id = ?',
    args: [spawn.mobId]
  });
  
  const subAreaResult = await db.execute({
    sql: 'SELECT name FROM sub_areas WHERE id = ?',
    args: [spawn.subAreaId]
  });
  
  const mob = mobResult.rows[0];
  const subArea = subAreaResult.rows[0];
  
  console.log(`  ${subArea.name}: ${mob.name} (Lv ${mob.level}) - Weight ${spawn.weight}`);
  
  await db.execute({
    sql: `
      INSERT INTO sub_area_mobs (sub_area_id, mob_id, spawn_weight, level_variance)
      VALUES (?, ?, ?, 2)
    `,
    args: [spawn.subAreaId, spawn.mobId, spawn.weight]
  });
}

console.log('\n✅ Mob spawns added successfully!');

// Verify each sub-area
console.log('\n📊 Sub-area mob distribution:\n');

const newSubAreas = [48, 49, 50, 51, 52, 53, 54, 55];

for (const subAreaId of newSubAreas) {
  const subAreaResult = await db.execute({
    sql: 'SELECT name, min_level, max_level FROM sub_areas WHERE id = ?',
    args: [subAreaId]
  });
  
  const mobsResult = await db.execute({
    sql: `
      SELECT m.name, m.level, sam.spawn_weight
      FROM sub_area_mobs sam
      JOIN mobs m ON sam.mob_id = m.id
      WHERE sam.sub_area_id = ?
      ORDER BY sam.spawn_weight DESC
    `,
    args: [subAreaId]
  });
  
  const subArea = subAreaResult.rows[0];
  console.log(`${subArea.name} (Lv ${subArea.min_level}-${subArea.max_level}):`);
  
  for (const mob of mobsResult.rows) {
    console.log(`  - ${mob.name} (Lv ${mob.level}) [${mob.spawn_weight}% chance]`);
  }
  
  console.log('');
}

console.log('🎉 Region diversification complete!');
console.log('   Players can now:');
console.log('   - Find elite challenges in starter regions (Bandit Encampment, Cursed Ruins)');
console.log('   - Safely explore higher-level regions (Forest Outskirts, Mountain Foothills)');
console.log('   - Experience non-linear world progression\n');

process.exit(0);
