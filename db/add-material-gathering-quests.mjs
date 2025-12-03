import { createClient } from '@libsql/client';
import 'dotenv/config';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Repeatable material gathering quests with valid mob IDs from sub_areas
// Short cooldowns (30min - 2 hours) for frequent farming
const quests = [
  // Level 1-10: Basic materials
  {
    name: 'Gather Iron Rivets',
    description: 'Wild Boars in the Farmland sometimes carry iron rivets. Defeat them to collect these basic components.',
    region_id: 1,
    min_level: 3,
    repeatable: 1,
    cooldown_hours: 0.5,
    mob_id: 6, // Wild Boar (in Farmland sub_area 3)
    mob_count: 6,
    material_id: 35, // Iron Rivets
    material_count: 2,
    exp: 50,
    gold: 10
  },
  {
    name: 'Collect Polished Stones',
    description: 'Stone Golems in the mountains drop polished stones suitable for enchantments.',
    region_id: 3,
    min_level: 9,
    repeatable: 1,
    cooldown_hours: 1,
    mob_id: 131, // Stone Golem
    mob_count: 5,
    material_id: 29, // Polished Stone
    material_count: 2,
    exp: 100,
    gold: 20
  },
  
  // Level 11-20: Uncommon materials
  {
    name: 'Hardened Leather Strips',
    description: 'Forest Trolls possess thick, hardened leather strips useful for armor crafting.',
    region_id: 2,
    min_level: 7,
    repeatable: 1,
    cooldown_hours: 1,
    mob_id: 250, // Forest Troll
    mob_count: 5,
    material_id: 28, // Hardened Leather Strip
    material_count: 2,
    exp: 125,
    gold: 25
  },
  {
    name: 'Silver Thread from Wraiths',
    description: 'Forest Wraiths leave behind silvery residue that can be woven into thread.',
    region_id: 2,
    min_level: 7,
    repeatable: 1,
    cooldown_hours: 1,
    mob_id: 129, // Forest Wraith
    mob_count: 6,
    material_id: 30, // Silver Thread
    material_count: 3,
    exp: 125,
    gold: 25
  },
  {
    name: 'Thick Hides from Yetis',
    description: 'Yetis in the frozen peaks have incredibly thick hides perfect for durable gear.',
    region_id: 6,
    min_level: 16,
    repeatable: 1,
    cooldown_hours: 1.5,
    mob_id: 163, // Yeti
    mob_count: 5,
    material_id: 36, // Thick Hide
    material_count: 2,
    exp: 200,
    gold: 35
  },
  
  // Level 21-35: Rare materials
  {
    name: 'Blessed Oak Harvest',
    description: 'Ancient Treeants in the Elven Sanctum drop blessed oak, sacred wood for crafting.',
    region_id: 7,
    min_level: 25,
    repeatable: 1,
    cooldown_hours: 2,
    mob_id: 175, // Ancient Treeant
    mob_count: 4,
    material_id: 31, // Blessed Oak
    material_count: 2,
    exp: 300,
    gold: 45
  },
  {
    name: 'Moonstone Shards',
    description: 'Cloud Elementals in the Celestial Spire carry moonstone shards.',
    region_id: 10,
    min_level: 33,
    repeatable: 1,
    cooldown_hours: 2,
    mob_id: 192, // Cloud Elemental
    mob_count: 5,
    material_id: 32, // Moonstone Shard
    material_count: 2,
    exp: 400,
    gold: 60
  },
  {
    name: 'Alchemical Resin Extraction',
    description: 'Abyssal Horrors contain valuable alchemical resin within their forms.',
    region_id: 9,
    min_level: 33,
    repeatable: 1,
    cooldown_hours: 2,
    mob_id: 189, // Abyssal Horror
    mob_count: 6,
    material_id: 33, // Alchemical Resin
    material_count: 2,
    exp: 425,
    gold: 65
  },
  {
    name: 'Tempered Steel Bars',
    description: 'Dragonkin Warriors forge tempered steel. Defeat them to claim their materials.',
    region_id: 8,
    min_level: 27,
    repeatable: 1,
    cooldown_hours: 2,
    mob_id: 180, // Dragonkin Warrior
    mob_count: 5,
    material_id: 34, // Tempered Steel Bar
    material_count: 2,
    exp: 350,
    gold: 50
  },
  {
    name: 'Enchanted Ink Collection',
    description: 'Dark Cultists use enchanted ink in their rituals. Take it from them.',
    region_id: 4,
    min_level: 12,
    repeatable: 1,
    cooldown_hours: 1.5,
    mob_id: 241, // Dark Cultist
    mob_count: 7,
    material_id: 42, // Enchanted Ink
    material_count: 3,
    exp: 175,
    gold: 30
  },
  
  // Level 36-50: Very rare materials
  {
    name: 'Phoenix Feathers',
    description: 'Storm Phoenixes occasionally drop their legendary feathers.',
    region_id: 10,
    min_level: 35,
    repeatable: 1,
    cooldown_hours: 2,
    mob_id: 194, // Storm Phoenix
    mob_count: 3,
    material_id: 37, // Phoenix Feather
    material_count: 1,
    exp: 500,
    gold: 75
  },
  {
    name: 'Void Crystal Harvesting',
    description: 'Void Walkers carry dark void crystals pulsing with otherworldly energy.',
    region_id: 4,
    min_level: 15,
    repeatable: 1,
    cooldown_hours: 2,
    mob_id: 138, // Void Walker
    mob_count: 5,
    material_id: 38, // Void Crystal
    material_count: 1,
    exp: 225,
    gold: 40
  },
  {
    name: 'Essence of Fire',
    description: 'Fire Elementals contain pure essence of fire within their forms.',
    region_id: 5,
    min_level: 15,
    repeatable: 1,
    cooldown_hours: 2,
    mob_id: 159, // Fire Elemental
    mob_count: 6,
    material_id: 39, // Essence of Fire
    material_count: 2,
    exp: 225,
    gold: 40
  },
  {
    name: 'Essence of Ice',
    description: 'Ice Elementals contain pure essence of ice, frozen elemental power.',
    region_id: 6,
    min_level: 18,
    repeatable: 1,
    cooldown_hours: 2,
    mob_id: 165, // Ice Elemental
    mob_count: 6,
    material_id: 46, // Essence of Ice
    material_count: 2,
    exp: 250,
    gold: 45
  },
  {
    name: 'Runestone Fragments',
    description: 'Corrupted Guardians protect ancient runestone fragments.',
    region_id: 7,
    min_level: 20,
    repeatable: 1,
    cooldown_hours: 2,
    mob_id: 170, // Corrupted Guardian
    mob_count: 5,
    material_id: 40, // Runestone Fragment
    material_count: 2,
    exp: 275,
    gold: 50
  },
  {
    name: 'Titanium Ore Extraction',
    description: 'Drake Guardians hoard titanium ore in their lairs.',
    region_id: 8,
    min_level: 29,
    repeatable: 1,
    cooldown_hours: 2,
    mob_id: 182, // Drake Guardian
    mob_count: 4,
    material_id: 41, // Titanium Ore
    material_count: 2,
    exp: 375,
    gold: 55
  },
  {
    name: 'Celestial Fabric Weaving',
    description: 'Radiant Seraphs create celestial fabric from divine light.',
    region_id: 10,
    min_level: 34,
    repeatable: 1,
    cooldown_hours: 2,
    mob_id: 193, // Radiant Seraph
    mob_count: 4,
    material_id: 43, // Celestial Fabric
    material_count: 1,
    exp: 450,
    gold: 70
  },
  {
    name: 'Demonic Horns',
    description: 'Greater Demons possess powerful horns radiating dark energy.',
    region_id: 11,
    min_level: 42,
    repeatable: 1,
    cooldown_hours: 2,
    mob_id: 204, // Greater Demon
    mob_count: 3,
    material_id: 44, // Demon Horn
    material_count: 1,
    exp: 600,
    gold: 90
  },
  {
    name: 'Prismatic Gems',
    description: 'Ancient Dragons hoard prismatic gems that refract light perfectly.',
    region_id: 8,
    min_level: 30,
    repeatable: 1,
    cooldown_hours: 2,
    mob_id: 183, // Ancient Dragon
    mob_count: 2,
    material_id: 45, // Prismatic Gem
    material_count: 1,
    exp: 400,
    gold: 65
  },
  {
    name: 'Living Vines',
    description: 'Corrupted Unicorns are entwined with magical vines that never wither.',
    region_id: 7,
    min_level: 26,
    repeatable: 1,
    cooldown_hours: 2,
    mob_id: 176, // Corrupted Unicorn
    mob_count: 4,
    material_id: 47, // Living Vine
    material_count: 2,
    exp: 325,
    gold: 55
  },
];

console.log('Creating material gathering quests...\n');

let created = 0;
let failed = 0;

for (const q of quests) {
  try {
    // Insert quest
    const questResult = await turso.execute({
      sql: `INSERT INTO quests (name, description, region_id, min_level, repeatable, cooldown_hours)
            VALUES (?, ?, ?, ?, ?, ?)
            RETURNING id`,
      args: [q.name, q.description, q.region_id, q.min_level, q.repeatable, q.cooldown_hours]
    });
    
    const questId = questResult.rows[0].id;
    
    // Insert objective
    await turso.execute({
      sql: `INSERT INTO quest_objectives (quest_id, objective_order, type, target_mob_id, required_count, description)
            VALUES (?, 1, 'kill', ?, ?, ?)`,
      args: [questId, q.mob_id, q.mob_count, `Defeat ${q.mob_count} enemies`]
    });
    
    // Insert material reward
    await turso.execute({
      sql: `INSERT INTO quest_rewards (quest_id, reward_type, reward_material_id, reward_amount)
            VALUES (?, 'crafting_material', ?, ?)`,
      args: [questId, q.material_id, q.material_count]
    });
    
    // Insert exp reward
    await turso.execute({
      sql: `INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
            VALUES (?, 'experience', ?)`,
      args: [questId, q.exp]
    });
    
    // Insert gold reward
    await turso.execute({
      sql: `INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
            VALUES (?, 'gold', ?)`,
      args: [questId, q.gold]
    });
    
    console.log(`✓ ${q.name} (Lv${q.min_level}, ${q.cooldown_hours}h cooldown)`);
    created++;
    
  } catch (error) {
    console.error(`✗ ${q.name}: ${error.message}`);
    failed++;
  }
}

console.log(`\n✓ Created ${created} quests, ${failed} failed`);

// Summary
const summary = await turso.execute(`
  SELECT 
    CASE 
      WHEN min_level <= 10 THEN '1-10'
      WHEN min_level <= 20 THEN '11-20'
      WHEN min_level <= 30 THEN '21-30'
      WHEN min_level <= 40 THEN '31-40'
      ELSE '41+'
    END as level_range,
    COUNT(*) as count
  FROM quests
  WHERE repeatable = 1 AND cooldown_hours > 0 AND cooldown_hours <= 2
  GROUP BY level_range
  ORDER BY min_level
`);

console.log('\nRepeatable Material Quests by Level:');
summary.rows.forEach(row => {
  console.log(`  Level ${row.level_range}: ${row.count} quests`);
});
