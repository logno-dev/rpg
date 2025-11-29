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

console.log('=== FIXING PROGRESSION QUEST LEVELS ===\n');

// Get all progression quests (Unlock/Master/Path to) with scroll rewards
const progressionQuests = (await db.execute(`
  SELECT 
    q.id,
    q.name,
    q.min_level,
    i.name as reward_name,
    i.required_level as scroll_required_level
  FROM quests q
  JOIN quest_rewards qr ON q.id = qr.quest_id
  JOIN items i ON qr.reward_item_id = i.id
  WHERE i.type = 'scroll'
    AND (q.name LIKE '%Unlock%' OR q.name LIKE '%Master%' OR q.name LIKE '%Path to%')
  ORDER BY q.min_level
`)).rows;

console.log(`Found ${progressionQuests.length} progression quests\n`);

// Strategy: Adjust quest min_level to be slightly below the scroll requirement
// This allows players to do the quest and get a scroll they can use soon after
const updates = [];

progressionQuests.forEach(q => {
  const gap = q.scroll_required_level - q.min_level;
  
  // Progression quests should unlock scrolls at most 3 levels before they're usable
  // This gives players a sense of progression and something to look forward to
  const idealQuestLevel = Math.max(1, q.scroll_required_level - 3);
  
  if (gap > 5 || gap < -2) {
    console.log(`Quest: "${q.name}" (Level ${q.min_level})`);
    console.log(`  Reward: ${q.reward_name} (Requires Level ${q.scroll_required_level})`);
    console.log(`  Current Gap: ${gap} levels`);
    console.log(`  Proposed: Move quest to Level ${idealQuestLevel} (gap: ${q.scroll_required_level - idealQuestLevel})\n`);
    
    updates.push({
      id: q.id,
      oldLevel: q.min_level,
      newLevel: idealQuestLevel,
      name: q.name
    });
  }
});

console.log(`\n=== SUMMARY ===`);
console.log(`Quests needing level adjustment: ${updates.length}\n`);

if (updates.length === 0) {
  console.log('✅ All progression quests have appropriate levels!');
  process.exit(0);
}

console.log('Do you want to apply these changes? This will:');
console.log('1. Update quest min_level to match scroll requirements better');
console.log('2. Ensure players can use scrolls shortly after completing quests');
console.log('\nTo apply: node db/apply-quest-level-fixes.mjs');
console.log('\nChanges to be made:');
updates.forEach(u => {
  console.log(`  ${u.name}: Level ${u.oldLevel} → ${u.newLevel}`);
});

// Save updates to a file for review
import { writeFileSync } from 'fs';
writeFileSync(
  join(__dirname, 'quest-level-fixes.json'),
  JSON.stringify(updates, null, 2)
);
console.log('\n💾 Proposed changes saved to db/quest-level-fixes.json');
