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

console.log('=== ANALYZING QUEST SCROLL REWARDS ===\n');

// Get all quests with scroll rewards
const questsWithScrolls = (await db.execute(`
  SELECT 
    q.id as quest_id,
    q.name as quest_name,
    q.min_level as quest_min_level,
    i.id as reward_item_id,
    i.name as reward_name,
    i.required_level as scroll_level_req,
    i.required_strength,
    i.required_dexterity,
    i.required_intelligence
  FROM quests q
  JOIN quest_rewards qr ON q.id = qr.quest_id
  JOIN items i ON qr.reward_item_id = i.id
  WHERE i.type = 'scroll'
  ORDER BY q.min_level, q.id
`)).rows;

console.log(`Found ${questsWithScrolls.length} quests with scroll rewards\n`);

// Analyze mismatches
const mismatches = [];
const goodMatches = [];

questsWithScrolls.forEach(q => {
  const levelDiff = q.scroll_level_req - q.quest_min_level;
  
  if (levelDiff > 5) {
    mismatches.push(q);
  } else {
    goodMatches.push(q);
  }
});

console.log(`❌ ${mismatches.length} quests with MISMATCHED scroll tiers`);
console.log(`✅ ${goodMatches.length} quests with appropriate scroll tiers\n`);

console.log('=== MISMATCHED QUESTS (showing first 20) ===\n');
mismatches.slice(0, 20).forEach(q => {
  console.log(`Quest: "${q.quest_name}" (Level ${q.quest_min_level})`);
  console.log(`  Reward: ${q.reward_name} (Requires Level ${q.scroll_level_req})`);
  console.log(`  ❌ Gap: ${q.scroll_level_req - q.quest_min_level} levels\n`);
});

console.log('\n=== FIXING QUEST REWARDS ===\n');

// Get all scrolls grouped by ability base name
const allScrolls = (await db.execute(`
  SELECT 
    id,
    name,
    required_level,
    required_strength,
    required_dexterity,
    required_intelligence
  FROM items
  WHERE type = 'scroll'
  ORDER BY name, required_level
`)).rows;

// Build a map of ability name -> tiers
const abilityTiers = {};
allScrolls.forEach(scroll => {
  // Extract base ability name (remove tier suffix and scroll prefix)
  const baseName = scroll.name
    .replace(/\s+I+V?$/, '') // Remove tier suffix (I, II, III, IV, V) - matches I, II, III, IV, V
    .replace(/\s+V$/, '') // Also handle standalone V
    .replace(/^Scroll:\s*/, '') // Remove "Scroll: " prefix
    .replace(/^Scroll of\s*/, ''); // Remove "Scroll of " prefix
  
  if (!abilityTiers[baseName]) {
    abilityTiers[baseName] = [];
  }
  abilityTiers[baseName].push(scroll);
});

console.log(`Found ${Object.keys(abilityTiers).length} unique abilities\n`);

// Helper function to find best scroll tier for a quest level
function findBestScrollForQuestLevel(scrollName, questLevel, questName) {
  const baseName = scrollName
    .replace(/\s+I+V?$/, '') // Remove tier suffix (I, II, III, IV, V)
    .replace(/\s+V$/, '') // Also handle standalone V
    .replace(/^Scroll:\s*/, '')
    .replace(/^Scroll of\s*/, '');
  
  const tiers = abilityTiers[baseName];
  if (!tiers || tiers.length === 0) {
    console.log(`  ⚠️  No tiers found for ${baseName}`);
    return null;
  }
  
  // Check if this is a specific progression quest (Unlock/Master/Path to)
  const isUnlockQuest = questName.includes('Unlock');
  const isMasterQuest = questName.includes('Master');
  const isPathQuest = questName.includes('Path to');
  
  if (isUnlockQuest || isMasterQuest || isPathQuest) {
    // For progression quests, still need reasonable level matching
    // A level 12 quest can't reward a level 49 scroll (player can't use it for 37 levels!)
    // Allow slightly higher gaps but keep it reasonable
    let maxLevelGap = 8; // Default for all progression quests
    
    const suitableTiers = tiers.filter(t => t.required_level <= questLevel + maxLevelGap);
    
    if (suitableTiers.length === 0) {
      // Quest is too low level even with progression allowance, use tier I
      console.log(`    DEBUG: Quest "${questName}" (${questLevel}) has no suitable tiers within +${maxLevelGap}, using tier I`);
      return tiers[0];
    }
    
    // Return the highest suitable tier
    console.log(`    DEBUG: Quest "${questName}" (${questLevel}) found ${suitableTiers.length} suitable tiers, returning ${suitableTiers[suitableTiers.length - 1].name}`);
    return suitableTiers[suitableTiers.length - 1];
  }
  
  // For normal quests, quest rewards should be achievable at or shortly after quest level
  const suitableTiers = tiers.filter(t => t.required_level <= questLevel + 3);
  
  if (suitableTiers.length === 0) {
    // Quest is too low level for any tier, use tier I
    return tiers[0];
  }
  
  // Return the highest suitable tier
  return suitableTiers[suitableTiers.length - 1];
}

// Fix the mismatches
let fixCount = 0;
const updates = [];

mismatches.forEach(q => {
  const bestScroll = findBestScrollForQuestLevel(q.reward_name, q.quest_min_level, q.quest_name);
  
  if (!bestScroll) {
    console.log(`⚠️  Skipping "${q.quest_name}" - no suitable scroll found\n`);
    return;
  }
  
  if (bestScroll.id === q.reward_item_id) {
    console.log(`⏭️  Skipping "${q.quest_name}" - already has correct scroll (${bestScroll.name})\n`);
    return;
  }
  
  console.log(`Fixing: "${q.quest_name}" (Level ${q.quest_min_level})`);
  console.log(`  OLD: ${q.reward_name} (Level ${q.scroll_level_req})`);
  console.log(`  NEW: ${bestScroll.name} (Level ${bestScroll.required_level})\n`);
  
  updates.push({
    questId: q.quest_id,
    oldScrollId: q.reward_item_id,
    newScrollId: bestScroll.id
  });
  fixCount++;
});

console.log(`\n=== APPLYING ${updates.length} UPDATES ===\n`);

for (const u of updates) {
  await db.execute({
    sql: `UPDATE quest_rewards 
          SET reward_item_id = ?
          WHERE quest_id = ? AND reward_item_id = ?`,
    args: [u.newScrollId, u.questId, u.oldScrollId]
  });
}

console.log(`✅ Updated ${updates.length} quest rewards\n`);

// Verify
console.log('=== VERIFICATION ===\n');
const remaining = (await db.execute(`
  SELECT COUNT(*) as count
  FROM quests q
  JOIN quest_rewards qr ON q.id = qr.quest_id
  JOIN items i ON qr.reward_item_id = i.id
  WHERE i.type = 'scroll'
    AND i.required_level > q.min_level + 5
`)).rows[0];

console.log(`Remaining mismatches: ${remaining.count}`);

console.log('\n✅ Quest scroll rewards fixed!');
