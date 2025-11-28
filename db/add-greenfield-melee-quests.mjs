#!/usr/bin/env node
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log('⚔️  Creating melee ability quests in Greenfield Plains...\n');

// Get Greenfield Plains region
const region = await db.execute(
  "SELECT id, name FROM regions WHERE name = 'Greenfield Plains'"
);

if (!region.rows.length) {
  console.error('❌ Greenfield Plains region not found!');
  process.exit(1);
}

const regionId = region.rows[0].id;
console.log(`Found region: ${region.rows[0].name} (ID: ${regionId})\n`);

// Get all melee ability scrolls (level 1-10 for starter region)
const scrolls = await db.execute(`
  SELECT i.id, i.name, i.required_level, a.name as ability_name
  FROM items i
  JOIN abilities a ON i.teaches_ability_id = a.id
  WHERE i.type = 'scroll'
  AND a.primary_stat IN ('strength', 'dexterity')
  AND i.required_level <= 10
  ORDER BY i.required_level, i.name
`);

console.log(`Found ${scrolls.rows.length} melee scrolls for level 1-10\n`);

// Get mobs from Greenfield Plains for hunt quests
const mobs = await db.execute({
  sql: `
    SELECT DISTINCT m.id, m.name, m.level, sa.id as sub_area_id, sa.name as sub_area_name
    FROM mobs m
    JOIN sub_area_mobs sam ON m.id = sam.mob_id
    JOIN sub_areas sa ON sam.sub_area_id = sa.id
    WHERE sa.region_id = ?
    AND m.level <= 10
    ORDER BY m.level
  `,
  args: [regionId]
});

console.log(`Found ${mobs.rows.length} mobs in Greenfield Plains\n`);

// Quest templates for each scroll
const questTemplates = [
  {
    titlePattern: 'Prove Your Strength',
    descPattern: 'Defeat {count} {mobName}s to prove you are ready to learn {abilityName}.',
    type: 'hunt'
  },
  {
    titlePattern: 'Training Exercise',
    descPattern: 'The village trainer needs you to defeat {count} {mobName}s. Complete this task to earn training in {abilityName}.',
    type: 'hunt'
  },
  {
    titlePattern: 'Combat Training',
    descPattern: 'Demonstrate your combat prowess by defeating {count} {mobName}s. Upon success, you will be taught {abilityName}.',
    type: 'hunt'
  },
  {
    titlePattern: 'Warrior\'s Trial',
    descPattern: 'To master {abilityName}, you must first defeat {count} {mobName}s in combat.',
    type: 'hunt'
  },
  {
    titlePattern: 'Test of Skill',
    descPattern: 'The path to {abilityName} requires defeating {count} {mobName}s. Show your mettle!',
    type: 'hunt'
  }
];

let questsCreated = 0;

// Create a quest for each scroll
for (const scroll of scrolls.rows) {
  // Pick a random mob appropriate for the scroll level
  const appropriateMobs = mobs.rows.filter(m => 
    m.level >= scroll.required_level - 2 && 
    m.level <= scroll.required_level + 2
  );
  
  if (appropriateMobs.length === 0) {
    console.log(`⚠️  No appropriate mobs for ${scroll.name} (Lv ${scroll.required_level})`);
    continue;
  }
  
  const targetMob = appropriateMobs[Math.floor(Math.random() * appropriateMobs.length)];
  const template = questTemplates[questsCreated % questTemplates.length];
  
  // Calculate quest parameters
  const killCount = 5 + Math.floor(Math.random() * 6); // 5-10 kills
  const xpReward = scroll.required_level * 100 + killCount * 20;
  const goldReward = scroll.required_level * 15 + killCount * 5;
  
  // Create quest title and description
  const questTitle = template.titlePattern;
  const questDesc = template.descPattern
    .replace('{count}', killCount)
    .replace('{mobName}', targetMob.name)
    .replace('{abilityName}', scroll.ability_name);
  
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
        regionId,
        scroll.required_level
      ]
    });
    
    const questId = Number(questResult.lastInsertRowid);
    
    // Add hunt objective
    await db.execute({
      sql: 'INSERT INTO quest_objectives (quest_id, objective_order, type, description, target_mob_id, required_count) VALUES (?, ?, ?, ?, ?, ?)',
      args: [questId, 1, 'hunt', `Defeat ${killCount} ${targetMob.name}s`, targetMob.id, killCount]
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
    console.log(`  ✓ Quest: ${questTitle} → ${scroll.name}`);
    console.log(`    Defeat ${killCount} ${targetMob.name}s (Lv ${targetMob.level}) in ${targetMob.sub_area_name}`);
    
  } catch (err) {
    console.error(`  ❌ Failed to create quest for ${scroll.name}:`, err.message);
  }
}

console.log(`\n✅ Created ${questsCreated} melee ability quests in Greenfield Plains!`);
console.log(`📊 All quests are one-time (non-repeatable) rewards`);
console.log(`🎯 Players can now learn melee abilities by completing quests!\n`);

process.exit(0);
