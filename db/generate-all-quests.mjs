#!/usr/bin/env node
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log('🎯 Generating comprehensive quest system across all regions...\n');

// Get all sub-areas with their regions and mobs
const subAreasQuery = await db.execute(`
  SELECT 
    sa.id,
    sa.name as sub_area_name,
    sa.min_level,
    sa.max_level,
    r.id as region_id,
    r.name as region_name
  FROM sub_areas sa
  JOIN regions r ON sa.region_id = r.id
  ORDER BY r.min_level, sa.min_level
`);

const subAreas = subAreasQuery.rows;

// Get all mobs with their sub-areas
const mobsQuery = await db.execute(`
  SELECT 
    m.id,
    m.name as mob_name,
    m.level,
    sa.id as sub_area_id,
    sa.name as sub_area_name,
    r.name as region_name
  FROM mobs m
  JOIN sub_area_mobs sam ON m.id = sam.mob_id
  JOIN sub_areas sa ON sam.sub_area_id = sa.id
  JOIN regions r ON sa.region_id = r.id
`);

// Group mobs by sub-area
const mobsBySubArea = {};
for (const mob of mobsQuery.rows) {
  if (!mobsBySubArea[mob.sub_area_id]) {
    mobsBySubArea[mob.sub_area_id] = [];
  }
  mobsBySubArea[mob.sub_area_id].push(mob);
}

// Get all equipment items
const equipmentQuery = await db.execute(`
  SELECT id, name, type, slot, rarity, required_level
  FROM items
  WHERE type IN ('weapon', 'armor')
  AND required_level IS NOT NULL
  ORDER BY required_level
`);

const equipmentByLevel = {};
for (const item of equipmentQuery.rows) {
  const level = item.required_level;
  if (!equipmentByLevel[level]) {
    equipmentByLevel[level] = [];
  }
  equipmentByLevel[level].push(item);
}

// Get all ability scrolls
const scrollsQuery = await db.execute(`
  SELECT id, name, required_level
  FROM items
  WHERE type = 'scroll'
  AND teaches_ability_id IS NOT NULL
  ORDER BY required_level
`);

const scrollsByLevel = {};
for (const scroll of scrollsQuery.rows) {
  const level = scroll.required_level || 1;
  if (!scrollsByLevel[level]) {
    scrollsByLevel[level] = [];
  }
  scrollsByLevel[level].push(scroll);
}

// Get stackable items for collection quests
const collectiblesQuery = await db.execute(`
  SELECT DISTINCT i.id, i.name
  FROM items i
  JOIN mob_loot ml ON i.id = ml.item_id
  WHERE i.stackable = 1
  AND i.type IN ('consumable', 'scroll')
`);

const collectibles = collectiblesQuery.rows;

console.log(`📊 Data Summary:`);
console.log(`  - Sub-areas: ${subAreas.length}`);
console.log(`  - Equipment items: ${equipmentQuery.rows.length}`);
console.log(`  - Ability scrolls: ${scrollsQuery.rows.length}`);
console.log(`  - Collectible items: ${collectibles.length}\n`);

// Helper functions
function getRandomMob(excludeSubAreaId = null) {
  const availableSubAreas = Object.keys(mobsBySubArea).filter(id => id != excludeSubAreaId);
  if (availableSubAreas.length === 0) return null;
  
  const randomSubAreaId = availableSubAreas[Math.floor(Math.random() * availableSubAreas.length)];
  const mobs = mobsBySubArea[randomSubAreaId];
  if (!mobs || mobs.length === 0) return null;
  
  return mobs[Math.floor(Math.random() * mobs.length)];
}

function getRewardEquipment(questLevel) {
  // Get equipment 0-2 levels above quest level
  const rewardLevel = questLevel + Math.floor(Math.random() * 3);
  const availableLevels = [rewardLevel, rewardLevel + 1, rewardLevel + 2, rewardLevel - 1].filter(l => l > 0);
  
  for (const level of availableLevels) {
    if (equipmentByLevel[level] && equipmentByLevel[level].length > 0) {
      return equipmentByLevel[level][Math.floor(Math.random() * equipmentByLevel[level].length)];
    }
  }
  
  return null;
}

function getRewardScroll(questLevel) {
  // Get scroll at or slightly above quest level
  const rewardLevel = questLevel + Math.floor(Math.random() * 2);
  const availableLevels = [rewardLevel, rewardLevel + 1, rewardLevel - 1, questLevel].filter(l => l > 0);
  
  for (const level of availableLevels) {
    if (scrollsByLevel[level] && scrollsByLevel[level].length > 0) {
      return scrollsByLevel[level][Math.floor(Math.random() * scrollsByLevel[level].length)];
    }
  }
  
  return null;
}

function getCooldownHours(questLevel) {
  if (questLevel <= 10) return 2;
  if (questLevel <= 20) return 4;
  if (questLevel <= 35) return 8;
  if (questLevel <= 50) return 12;
  return 24;
}

let questsCreated = 0;

// Generate quests for each sub-area
for (const subArea of subAreas) {
  const subAreaMobs = mobsBySubArea[subArea.id] || [];
  
  if (subAreaMobs.length === 0) {
    console.log(`⚠️  Skipping ${subArea.sub_area_name} (no mobs)`);
    continue;
  }
  
  const avgLevel = Math.floor((subArea.min_level + subArea.max_level) / 2);
  const cooldownHours = getCooldownHours(avgLevel);
  
  console.log(`\n📍 ${subArea.region_name} - ${subArea.sub_area_name} (Lv ${subArea.min_level}-${subArea.max_level})`);
  
  // Decide how many quests for this sub-area (2-4 quests each)
  const numQuests = 2 + Math.floor(Math.random() * 3); // 2-4 quests
  
  for (let i = 0; i < numQuests; i++) {
    const questType = Math.random() < 0.7 ? 'hunt' : 'collection'; // 70% hunt, 30% collection
    
    if (questType === 'hunt') {
      // Hunt quest - can target local OR cross-region mob
      const useCrossRegion = Math.random() < 0.4; // 40% chance of cross-region
      let targetMob;
      
      if (useCrossRegion) {
        targetMob = getRandomMob(subArea.id);
      } else {
        targetMob = subAreaMobs[Math.floor(Math.random() * subAreaMobs.length)];
      }
      
      if (!targetMob) continue;
      
      const killCount = Math.min(5 + Math.floor(Math.random() * 11), 15); // 5-15 kills
      const xpReward = avgLevel * 100 + (killCount * 25);
      const goldReward = avgLevel * 10 + (killCount * 5);
      
      // 80% equipment, 20% scroll
      const rewardType = Math.random() < 0.8 ? 'equipment' : 'scroll';
      const rewardItem = rewardType === 'equipment' ? getRewardEquipment(avgLevel) : getRewardScroll(avgLevel);
      
      if (!rewardItem) continue;
      
      const questTitle = useCrossRegion 
        ? `Bounty: ${targetMob.mob_name} in ${targetMob.region_name}`
        : `Clear the ${targetMob.mob_name}s`;
      
      const questDescription = useCrossRegion
        ? `Travel to ${targetMob.sub_area_name} in ${targetMob.region_name} and eliminate ${killCount} ${targetMob.mob_name}s. They've been causing trouble and need to be dealt with.`
        : `The ${subArea.sub_area_name} is overrun with ${targetMob.mob_name}s. Defeat ${killCount} of them to help secure the area.`;
      
      // Insert quest
      const questResult = await db.execute({
        sql: `
          INSERT INTO quests (
            name, description, region_id, 
            min_level, cooldown_hours, repeatable
          ) VALUES (?, ?, ?, ?, ?, 1)
        `,
        args: [
          questTitle,
          questDescription,
          subArea.region_id,
          subArea.min_level,
          cooldownHours
        ]
      });
      
      const questId = Number(questResult.lastInsertRowid);
      
      if (!questId) {
        console.log(`  ⚠️  Failed to create quest: ${questTitle}`);
        continue;
      }
      
      try {
        // Add hunt objective
        await db.execute({
          sql: 'INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_mob_id, required_count) VALUES (?, ?, ?, ?, ?, ?)',
          args: [questId, 1, 'hunt', `Defeat ${killCount} ${targetMob.mob_name}s`, targetMob.id, killCount]
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
        
        // Add item reward
        await db.execute({
          sql: 'INSERT INTO quest_rewards (quest_id, reward_type, reward_item_id, reward_amount) VALUES (?, ?, ?, ?)',
          args: [questId, 'item', rewardItem.id, 1]
        });
      } catch (error) {
        console.log(`  ❌ Error adding objectives/rewards for quest ${questId}: ${error.message}`);
        continue;
      }
      
      questsCreated++;
      console.log(`  ✓ Hunt: ${questTitle} → ${rewardItem.name}`);
      
    } else {
      // Collection quest
      const collectible = collectibles[Math.floor(Math.random() * collectibles.length)];
      const collectCount = Math.min(3 + Math.floor(Math.random() * 13), 15); // 3-15 items
      const xpReward = avgLevel * 80 + (collectCount * 20);
      const goldReward = avgLevel * 8 + (collectCount * 4);
      
      // 75% equipment, 25% scroll
      const rewardType = Math.random() < 0.75 ? 'equipment' : 'scroll';
      const rewardItem = rewardType === 'equipment' ? getRewardEquipment(avgLevel) : getRewardScroll(avgLevel);
      
      if (!rewardItem) continue;
      
      const questTitle = `Gather ${collectible.name}`;
      const questDescription = `Collect ${collectCount} ${collectible.name} from enemies in the region and return them. These items are valuable for ongoing efforts.`;
      
      // Insert quest
      const questResult = await db.execute({
        sql: `
          INSERT INTO quests (
            name, description, region_id,
            min_level, cooldown_hours, repeatable
          ) VALUES (?, ?, ?, ?, ?, 1)
        `,
        args: [
          questTitle,
          questDescription,
          subArea.region_id,
          subArea.min_level,
          cooldownHours
        ]
      });
      
      const questId = Number(questResult.lastInsertRowid);
      
      if (!questId) {
        console.log(`  ⚠️  Failed to create quest: ${questTitle}`);
        continue;
      }
      
      try {
        // Add collection objective
        await db.execute({
          sql: 'INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_item_id, required_count) VALUES (?, ?, ?, ?, ?, ?)',
          args: [questId, 1, 'collection', `Collect ${collectCount} ${collectible.name}`, collectible.id, collectCount]
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
        
        // Add item reward
        await db.execute({
          sql: 'INSERT INTO quest_rewards (quest_id, reward_type, reward_item_id, reward_amount) VALUES (?, ?, ?, ?)',
          args: [questId, 'item', rewardItem.id, 1]
        });
      } catch (error) {
        console.log(`  ❌ Error adding objectives/rewards for quest ${questId}: ${error.message}`);
        continue;
      }
      
      questsCreated++;
      console.log(`  ✓ Collect: ${questTitle} → ${rewardItem.name}`);
    }
  }
}

console.log(`\n✅ Successfully created ${questsCreated} quests!`);
console.log(`📊 Quest distribution:`);
console.log(`  - Average of ${(questsCreated / subAreas.length).toFixed(1)} quests per sub-area`);
console.log(`  - Estimated ~70% hunt quests, ~30% collection quests`);
console.log(`  - Rewards: Majority equipment and scrolls\n`);

process.exit(0);
