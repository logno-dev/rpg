import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnv() {
  try {
    const envPath = join(__dirname, '..', '.env');
    const envFile = readFileSync(envPath, 'utf-8');
    envFile.split('\n').forEach(line => {
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').trim();
        process.env[key.trim()] = value;
      }
    });
  } catch (error) {
    console.error('Could not load .env file:', error.message);
  }
}

loadEnv();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log('=== FIXING TRAINING QUESTS ===\n');

// Get all training quests
const trainingQuests = (await db.execute(`
  SELECT 
    q.id,
    q.name,
    q.min_level,
    q.region_id,
    i.id as current_scroll_id,
    i.name as current_scroll_name,
    i.required_level as current_scroll_level
  FROM quests q
  JOIN quest_rewards qr ON q.id = qr.quest_id
  JOIN items i ON qr.reward_item_id = i.id
  WHERE i.type = 'scroll'
    AND q.name LIKE 'Training:%'
  ORDER BY q.name
`)).rows;

console.log(`Found ${trainingQuests.length} training quests\n`);

// Get all scrolls
const allScrolls = (await db.execute(`
  SELECT id, name, required_level
  FROM items
  WHERE type = 'scroll'
`)).rows;

function extractTierFromQuestName(questName) {
  const match = questName.match(/\s+(I|II|III|IV|V)$/);
  return match ? match[1] : null;
}

function extractAbilityFromQuestName(questName) {
  return questName
    .replace(/^Training:\s+/, '')
    .replace(/\s+(I|II|III|IV|V)$/, '')
    .trim();
}

function findScroll(abilityName, tier) {
  const pattern1 = `Scroll: ${abilityName} ${tier}`;
  const pattern2 = `Scroll of ${abilityName} ${tier}`;
  
  return allScrolls.find(s => s.name === pattern1 || s.name === pattern2);
}

const updates = [];

console.log('=== ANALYZING TRAINING QUESTS ===\n');

for (const quest of trainingQuests) {
  const tier = extractTierFromQuestName(quest.name);
  const ability = extractAbilityFromQuestName(quest.name);
  
  if (!tier || !ability) {
    console.log(`⚠️  Could not parse: "${quest.name}"`);
    continue;
  }
  
  const correctScroll = findScroll(ability, tier);
  
  if (!correctScroll) {
    console.log(`⚠️  No scroll found for: ${ability} ${tier}`);
    continue;
  }
  
  const needsFix = correctScroll.id !== quest.current_scroll_id;
  
  if (needsFix) {
    // Calculate ideal quest level: 3 levels before scroll requirement
    const idealQuestLevel = Math.max(1, correctScroll.required_level - 3);
    
    console.log(`Quest: "${quest.name}" (Level ${quest.min_level})`);
    console.log(`  Current: ${quest.current_scroll_name} (Level ${quest.current_scroll_level})`);
    console.log(`  Correct: ${correctScroll.name} (Level ${correctScroll.required_level})`);
    console.log(`  Proposed Quest Level: ${idealQuestLevel}\n`);
    
    updates.push({
      questId: quest.id,
      questName: quest.name,
      oldLevel: quest.min_level,
      newLevel: idealQuestLevel,
      oldScrollId: quest.current_scroll_id,
      newScrollId: correctScroll.id,
      scrollName: correctScroll.name
    });
  }
}

console.log(`\n=== SUMMARY ===`);
console.log(`Training quests needing fixes: ${updates.length}\n`);

if (updates.length === 0) {
  console.log('✅ All training quests are correct!');
  process.exit(0);
}

console.log('=== APPLYING FIXES ===\n');

for (const update of updates) {
  // Update quest level
  await db.execute({
    sql: 'UPDATE quests SET min_level = ? WHERE id = ?',
    args: [update.newLevel, update.questId]
  });
  
  // Update quest reward
  await db.execute({
    sql: 'UPDATE quest_rewards SET reward_item_id = ? WHERE quest_id = ? AND reward_item_id = ?',
    args: [update.newScrollId, update.questId, update.oldScrollId]
  });
  
  console.log(`✅ "${update.questName}"`);
  console.log(`   Level: ${update.oldLevel} → ${update.newLevel}`);
  console.log(`   Reward: ${update.scrollName}\n`);
}

console.log(`\n✅ Fixed ${updates.length} training quests!`);
