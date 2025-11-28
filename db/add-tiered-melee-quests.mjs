#!/usr/bin/env node
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log('⚔️  Creating properly tiered melee ability quests...\n');

// Define ability tier distribution across regions
const abilityTierPlan = {
  // Tier I: Greenfield Plains (Lv 1-4)
  1: { regionName: 'Greenfield Plains', levelRange: [1, 4] },
  
  // Tier II: Darkwood Forest & Ironpeak Mountains (Lv 5-11)
  2: { regionName: 'Darkwood Forest', levelRange: [5, 11] },
  
  // Tier III: Shadowdeep Dungeon & Scorched Badlands (Lv 12-18)
  3: { regionName: 'Scorched Badlands', levelRange: [12, 18] },
  
  // Tier IV: Frostpeak Glaciers & Elven Sanctum (Lv 19-26)
  4: { regionName: 'Elven Sanctum', levelRange: [19, 26] },
  
  // Tier V: Dragon Aerie & beyond (Lv 27+)
  5: { regionName: 'Dragon Aerie', levelRange: [27, 40] }
};

// Get all regions
const regions = await db.execute('SELECT id, name, min_level, max_level FROM regions ORDER BY min_level');
const regionMap = {};
regions.rows.forEach(r => {
  regionMap[r.name] = r;
});

console.log('📊 Tier Distribution Plan:');
Object.entries(abilityTierPlan).forEach(([tier, plan]) => {
  console.log(`  Tier ${tier}: ${plan.regionName} (Lv ${plan.levelRange[0]}-${plan.levelRange[1]})`);
});
console.log('');

// Get melee ability scrolls grouped by ability family
const scrolls = await db.execute(`
  SELECT 
    i.id, 
    i.name, 
    i.required_level, 
    a.name as ability_name,
    a.level as ability_level,
    a.base_id,
    a.primary_stat
  FROM items i
  JOIN abilities a ON i.teaches_ability_id = a.id
  WHERE i.type = 'scroll'
  AND a.primary_stat IN ('strength', 'dexterity')
  ORDER BY a.base_id, a.level
`);

// Group scrolls by base_id
const scrollsByFamily = {};
scrolls.rows.forEach(scroll => {
  if (!scrollsByFamily[scroll.base_id]) {
    scrollsByFamily[scroll.base_id] = [];
  }
  scrollsByFamily[scroll.base_id].push(scroll);
});

console.log(`Found ${Object.keys(scrollsByFamily).length} ability families\n`);

let questsCreated = 0;

// Create quests for each ability family
for (const [baseId, familyScrolls] of Object.entries(scrollsByFamily)) {
  if (familyScrolls.length === 0) continue;
  
  const familyName = familyScrolls[0].ability_name.replace(/ [IVX]+$/, '');
  console.log(`\n📖 ${familyName} (${familyScrolls[0].primary_stat}):`);
  
  // Process each tier
  for (let tier = 1; tier <= Math.min(5, familyScrolls.length); tier++) {
    const scroll = familyScrolls[tier - 1];
    if (!scroll) continue;
    
    const plan = abilityTierPlan[tier];
    const region = regionMap[plan.regionName];
    
    if (!region) {
      console.log(`  ⚠️  Region ${plan.regionName} not found for tier ${tier}`);
      continue;
    }
    
    // Get appropriate mobs from this region
    const mobsResult = await db.execute({
      sql: `
        SELECT DISTINCT m.id, m.name, m.level, sa.id as sub_area_id, sa.name as sub_area_name
        FROM mobs m
        JOIN sub_area_mobs sam ON m.id = sam.mob_id
        JOIN sub_areas sa ON sam.sub_area_id = sa.id
        WHERE sa.region_id = ?
        AND m.level >= ? AND m.level <= ?
        ORDER BY RANDOM()
        LIMIT 20
      `,
      args: [region.id, plan.levelRange[0], plan.levelRange[1]]
    });
    
    if (mobsResult.rows.length === 0) {
      console.log(`  ⚠️  No mobs found in ${plan.regionName} for tier ${tier}`);
      continue;
    }
    
    // Pick a random mob
    const targetMob = mobsResult.rows[Math.floor(Math.random() * mobsResult.rows.length)];
    const killCount = 8 + Math.floor(Math.random() * 8); // 8-15 kills
    const xpReward = scroll.required_level * 150 + killCount * 25;
    const goldReward = scroll.required_level * 20 + killCount * 10;
    
    // Create quest with variety in titles
    const questTitles = [
      `Master ${scroll.ability_name}`,
      `Learn ${scroll.ability_name}`,
      `Training: ${scroll.ability_name}`,
      `Path to ${scroll.ability_name}`,
      `Unlock ${scroll.ability_name}`
    ];
    
    const questTitle = questTitles[tier % questTitles.length];
    const questDesc = `Prove your combat prowess by defeating ${killCount} ${targetMob.name}s in ${targetMob.sub_area_name}. Upon completion, you will be granted the knowledge of ${scroll.ability_name}.`;
    
    try {
      // Insert quest
      const questResult = await db.execute({
        sql: `
          INSERT INTO quests (
            name, description, region_id,
            min_level, cooldown_hours, repeatable
          ) VALUES (?, ?, ?, ?, 0, 0)
        `,
        args: [
          questTitle,
          questDesc,
          region.id,
          scroll.required_level
        ]
      });
      
      const questId = Number(questResult.lastInsertRowid);
      
      // Add hunt objective
      await db.execute({
        sql: 'INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_mob_id, required_count) VALUES (?, ?, ?, ?, ?, ?)',
        args: [questId, 1, 'hunt', `Defeat ${killCount} ${targetMob.name}s in ${targetMob.sub_area_name}`, targetMob.id, killCount]
      });
      
      // Add XP reward
      await db.execute({
        sql: 'INSERT INTO quest_rewards (quest_id, reward_type, reward_amount) VALUES (?, ?, ?)',
        args: [questId, 'xp', xpReward]
      });
      
      // Add gold reward
      await db.execute({
        sql: 'INSERT INTO quest_rewards (quest_id, reward_type, reward_amount) VALUES (?, ?, ?)',
        args: [questId, 'gold', goldReward]
      });
      
      // Add scroll reward
      await db.execute({
        sql: 'INSERT INTO quest_rewards (quest_id, reward_type, reward_item_id, reward_amount) VALUES (?, ?, ?, ?)',
        args: [questId, 'item', scroll.id, 1]
      });
      
      questsCreated++;
      console.log(`  ✓ Tier ${tier} (Lv ${scroll.required_level}) in ${region.name} → ${scroll.name}`);
      
    } catch (err) {
      console.error(`  ❌ Failed to create quest for ${scroll.name}:`, err.message);
    }
  }
}

console.log(`\n✅ Created ${questsCreated} properly tiered melee ability quests!`);
console.log(`📊 Distribution:`);
console.log(`  Tier I   (Lv 1-4):   Greenfield Plains`);
console.log(`  Tier II  (Lv 5-11):  Darkwood Forest`);
console.log(`  Tier III (Lv 12-18): Scorched Badlands`);
console.log(`  Tier IV  (Lv 19-26): Elven Sanctum`);
console.log(`  Tier V   (Lv 27+):   Dragon Aerie`);
console.log(`\n🎯 Players now progress through regions to unlock higher tier abilities!\n`);

process.exit(0);
