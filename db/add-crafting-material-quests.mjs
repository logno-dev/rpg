import { createClient } from '@libsql/client';
import 'dotenv/config';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Repeatable quests that reward special crafting materials
// Very short cooldowns (30min - 2 hours) for material gathering
const materialQuests = [
  // Level 1-15 quests - Greenfield Plains (region 1)
  {
    name: 'Gather Iron Components',
    description: 'The local blacksmith needs iron rivets for repairs. Defeat Wild Boars and collect the materials they drop.',
    region_id: 1,
    min_level: 1,
    repeatable: 1,
    cooldown_hours: 0.5, // 30 minutes
    objectives: [
      { type: 'kill', target_mob_id: 1, quantity: 5, description: 'Defeat 5 Wild Boars' }
    ],
    rewards: [
      { type: 'crafting_material', item_id: 35, quantity: 3 }, // Iron Rivets
      { type: 'experience', amount: 50 },
      { type: 'gold', amount: 10 }
    ]
  },
  {
    name: 'Reinforced Leather Acquisition',
    description: 'A leatherworker seeks hardened leather strips for a special commission. Hunt Forest Wolves and gather what they leave behind.',
    region_id: 1,
    min_level: 5,
    repeatable: 1,
    cooldown_hours: 1,
    objectives: [
      { type: 'kill', target_mob_id: 3, quantity: 6, description: 'Defeat 6 Forest Wolves' }
    ],
    rewards: [
      { type: 'crafting_material', item_id: 28, quantity: 2 }, // Hardened Leather Strip
      { type: 'experience', amount: 75 },
      { type: 'gold', amount: 15 }
    ]
  },
  {
    name: 'Enchantment Stones',
    description: 'A mage needs polished stones for enchantment practice. Defeat Rock Elementals in the area.',
    region_id: 1,
    min_level: 8,
    repeatable: 1,
    cooldown_hours: 1,
    objectives: [
      { type: 'kill', target_mob_id: 5, quantity: 4, description: 'Defeat 4 Rock Elementals' }
    ],
    rewards: [
      { type: 'crafting_material', item_id: 29, quantity: 2 }, // Polished Stone
      { type: 'experience', amount: 100 },
      { type: 'gold', amount: 20 }
    ]
  },
  
  // Level 10-25 quests - Darkwood Forest (region 2)
  {
    name: 'Silver Thread Collection',
    description: 'The tailor guild needs silver thread for fine garments. Defeat Shadow Spiders and collect their silvery webbing.',
    region_id: 2,
    min_level: 12,
    repeatable: 1,
    cooldown_hours: 1.5,
    objectives: [
      { type: 'kill', target_mob_id: 11, quantity: 8, description: 'Defeat 8 Shadow Spiders' }
    ],
    rewards: [
      { type: 'crafting_material', item_id: 30, quantity: 3 }, // Silver Thread
      { type: 'experience', amount: 150 },
      { type: 'gold', amount: 25 }
    ]
  },
  {
    name: 'Blessed Wood Harvest',
    description: 'Ancient Treants in the sacred grove drop blessed oak. Defeat them to collect this holy material.',
    region_id: 2,
    min_level: 15,
    repeatable: 1,
    cooldown_hours: 2,
    objectives: [
      { type: 'kill', target_mob_id: 14, quantity: 5, description: 'Defeat 5 Ancient Treants' }
    ],
    rewards: [
      { type: 'crafting_material', item_id: 31, quantity: 2 }, // Blessed Oak
      { type: 'experience', amount: 200 },
      { type: 'gold', amount: 30 }
    ]
  },
  {
    name: 'Durable Hides',
    description: 'Hunters need thick hides from the tougher beasts of the forest. Defeat Cave Bears for their prized pelts.',
    region_id: 2,
    min_level: 18,
    repeatable: 1,
    cooldown_hours: 1.5,
    objectives: [
      { type: 'kill', target_mob_id: 13, quantity: 6, description: 'Defeat 6 Cave Bears' }
    ],
    rewards: [
      { type: 'crafting_material', item_id: 36, quantity: 3 }, // Thick Hide
      { type: 'experience', amount: 225 },
      { type: 'gold', amount: 35 }
    ]
  },
  
  // Level 20-35 quests - Ironpeak Mountains (region 3)
  {
    name: 'Moonstone Recovery',
    description: 'Lunar Wisps in the mountain peaks drop moonstone shards. Collect these rare magical fragments.',
    region_id: 3,
    min_level: 22,
    repeatable: 1,
    cooldown_hours: 2,
    objectives: [
      { type: 'kill', target_mob_id: 22, quantity: 7, description: 'Defeat 7 Lunar Wisps' }
    ],
    rewards: [
      { type: 'crafting_material', item_id: 32, quantity: 2 }, // Moonstone Shard
      { type: 'experience', amount: 275 },
      { type: 'gold', amount: 40 }
    ]
  },
  {
    name: 'Alchemical Extraction',
    description: 'Toxic Slimes contain valuable alchemical resin. Defeat them carefully to extract the material.',
    region_id: 3,
    min_level: 25,
    repeatable: 1,
    cooldown_hours: 1.5,
    objectives: [
      { type: 'kill', target_mob_id: 24, quantity: 10, description: 'Defeat 10 Toxic Slimes' }
    ],
    rewards: [
      { type: 'crafting_material', item_id: 33, quantity: 3 }, // Alchemical Resin
      { type: 'experience', amount: 300 },
      { type: 'gold', amount: 45 }
    ]
  },
  {
    name: 'Tempered Steel Forging',
    description: 'Forge Golems in the mountains contain tempered steel bars. Defeat them to collect the refined metal.',
    region_id: 3,
    min_level: 28,
    repeatable: 1,
    cooldown_hours: 2,
    objectives: [
      { type: 'kill', target_mob_id: 27, quantity: 5, description: 'Defeat 5 Forge Golems' }
    ],
    rewards: [
      { type: 'crafting_material', item_id: 34, quantity: 2 }, // Tempered Steel Bar
      { type: 'experience', amount: 350 },
      { type: 'gold', amount: 50 }
    ]
  },
  
  // Level 30-45 quests - Scorched Badlands (region 5)
  {
    name: 'Phoenix Plumes',
    description: 'Fire Phoenixes occasionally drop their legendary feathers. Hunt them for this rare material.',
    region_id: 5,
    min_level: 32,
    repeatable: 1,
    cooldown_hours: 2,
    objectives: [
      { type: 'kill', target_mob_id: 41, quantity: 4, description: 'Defeat 4 Fire Phoenixes' }
    ],
    rewards: [
      { type: 'crafting_material', item_id: 37, quantity: 1 }, // Phoenix Feather
      { type: 'experience', amount: 400 },
      { type: 'gold', amount: 60 }
    ]
  },
  {
    name: 'Essence of Flame',
    description: 'Lava Elementals contain pure essence of fire. Defeat them to extract this powerful crafting component.',
    region_id: 5,
    min_level: 35,
    repeatable: 1,
    cooldown_hours: 2,
    objectives: [
      { type: 'kill', target_mob_id: 43, quantity: 6, description: 'Defeat 6 Lava Elementals' }
    ],
    rewards: [
      { type: 'crafting_material', item_id: 39, quantity: 2 }, // Essence of Fire
      { type: 'experience', amount: 450 },
      { type: 'gold', amount: 70 }
    ]
  },
  {
    name: 'Titanium Extraction',
    description: 'Crystal Golems in the badlands contain deposits of rare titanium ore. Mine them for this precious material.',
    region_id: 5,
    min_level: 38,
    repeatable: 1,
    cooldown_hours: 2,
    objectives: [
      { type: 'kill', target_mob_id: 46, quantity: 5, description: 'Defeat 5 Crystal Golems' }
    ],
    rewards: [
      { type: 'crafting_material', item_id: 41, quantity: 2 }, // Titanium Ore
      { type: 'experience', amount: 500 },
      { type: 'gold', amount: 75 }
    ]
  },
  
  // Level 40-55 quests - Frostpeak Glaciers (region 6) and higher
  {
    name: 'Void Crystal Harvest',
    description: 'Void Wraiths carry dark void crystals. Defeat these dangerous entities to claim their power.',
    region_id: 9, // Abyssal Depths
    min_level: 42,
    repeatable: 1,
    cooldown_hours: 2,
    objectives: [
      { type: 'kill', target_mob_id: 71, quantity: 5, description: 'Defeat 5 Void Wraiths' }
    ],
    rewards: [
      { type: 'crafting_material', item_id: 38, quantity: 1 }, // Void Crystal
      { type: 'experience', amount: 550 },
      { type: 'gold', amount: 80 }
    ]
  },
  {
    name: 'Ancient Runestones',
    description: 'Runic Guardians protect ancient runestone fragments. Defeat them to acquire these powerful inscribed stones.',
    region_id: 7, // Elven Sanctum
    min_level: 45,
    repeatable: 1,
    cooldown_hours: 2,
    objectives: [
      { type: 'kill', target_mob_id: 56, quantity: 4, description: 'Defeat 4 Runic Guardians' }
    ],
    rewards: [
      { type: 'crafting_material', item_id: 40, quantity: 2 }, // Runestone Fragment
      { type: 'experience', amount: 600 },
      { type: 'gold', amount: 90 }
    ]
  },
  {
    name: 'Essence of Frost',
    description: 'Ice Elementals contain pure essence of ice. Brave the cold to extract this elemental power.',
    region_id: 6, // Frostpeak Glaciers
    min_level: 48,
    repeatable: 1,
    cooldown_hours: 2,
    objectives: [
      { type: 'kill', target_mob_id: 51, quantity: 6, description: 'Defeat 6 Ice Elementals' }
    ],
    rewards: [
      { type: 'crafting_material', item_id: 46, quantity: 2 }, // Essence of Ice
      { type: 'experience', amount: 650 },
      { type: 'gold', amount: 100 }
    ]
  },
  {
    name: 'Celestial Weaving',
    description: 'Star Weavers create celestial fabric from starlight. Defeat them to claim this divine material.',
    region_id: 10, // Celestial Spire
    min_level: 52,
    repeatable: 1,
    cooldown_hours: 2,
    objectives: [
      { type: 'kill', target_mob_id: 81, quantity: 4, description: 'Defeat 4 Star Weavers' }
    ],
    rewards: [
      { type: 'crafting_material', item_id: 43, quantity: 1 }, // Celestial Fabric
      { type: 'experience', amount: 700 },
      { type: 'gold', amount: 110 }
    ]
  },
  {
    name: 'Demonic Horns',
    description: 'Greater Demons possess powerful horns radiating dark energy. Slay them to collect these trophies.',
    region_id: 11, // Demon Citadel
    min_level: 55,
    repeatable: 1,
    cooldown_hours: 2,
    objectives: [
      { type: 'kill', target_mob_id: 88, quantity: 3, description: 'Defeat 3 Greater Demons' }
    ],
    rewards: [
      { type: 'crafting_material', item_id: 44, quantity: 1 }, // Demon Horn
      { type: 'experience', amount: 750 },
      { type: 'gold', amount: 120 }
    ]
  },
  {
    name: 'Prismatic Treasures',
    description: 'Prismatic Drakes hoard gems that refract light perfectly. Defeat them to claim these prismatic treasures.',
    region_id: 8, // Dragon Aerie
    min_level: 58,
    repeatable: 1,
    cooldown_hours: 2,
    objectives: [
      { type: 'kill', target_mob_id: 66, quantity: 3, description: 'Defeat 3 Prismatic Drakes' }
    ],
    rewards: [
      { type: 'crafting_material', item_id: 45, quantity: 1 }, // Prismatic Gem
      { type: 'experience', amount: 800 },
      { type: 'gold', amount: 130 }
    ]
  },
];

console.log('Creating crafting material quests...\n');

let questsCreated = 0;

for (const quest of materialQuests) {
  try {
    // Insert quest
    const questResult = await turso.execute({
      sql: `INSERT INTO quests (name, description, region_id, min_level, repeatable, cooldown_hours)
            VALUES (?, ?, ?, ?, ?, ?)
            RETURNING id`,
      args: [
        quest.name,
        quest.description,
        quest.region_id,
        quest.min_level,
        quest.repeatable,
        quest.cooldown_hours
      ]
    });
    
    const questId = questResult.rows[0].id;
    
    // Insert objectives
    for (let i = 0; i < quest.objectives.length; i++) {
      const obj = quest.objectives[i];
      await turso.execute({
        sql: `INSERT INTO quest_objectives (quest_id, objective_order, type, target_mob_id, required_count, description)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [questId, i + 1, obj.type, obj.target_mob_id, obj.quantity, obj.description]
      });
    }
    
    // Insert rewards
    for (const reward of quest.rewards) {
      if (reward.type === 'crafting_material') {
        await turso.execute({
          sql: `INSERT INTO quest_rewards (quest_id, reward_type, reward_material_id, reward_amount)
                VALUES (?, ?, ?, ?)`,
          args: [questId, reward.type, reward.item_id, reward.quantity]
        });
      } else if (reward.type === 'experience') {
        await turso.execute({
          sql: `INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
                VALUES (?, ?, ?)`,
          args: [questId, reward.type, reward.amount]
        });
      } else if (reward.type === 'gold') {
        await turso.execute({
          sql: `INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
                VALUES (?, ?, ?)`,
          args: [questId, reward.type, reward.amount]
        });
      }
    }
    
    console.log(`✓ Created: ${quest.name} (Level ${quest.min_level}, Region ${quest.region_id}, Cooldown: ${quest.cooldown_hours}h)`);
    questsCreated++;
    
  } catch (error) {
    console.error(`✗ Error creating quest "${quest.name}":`, error.message);
  }
}

console.log(`\n✓ Successfully created ${questsCreated} repeatable crafting material quests`);

// Show summary
console.log('\nQuests by level range:');
const levelRanges = [
  { min: 1, max: 15, count: materialQuests.filter(q => q.min_level >= 1 && q.min_level <= 15).length },
  { min: 16, max: 30, count: materialQuests.filter(q => q.min_level >= 16 && q.min_level <= 30).length },
  { min: 31, max: 45, count: materialQuests.filter(q => q.min_level >= 31 && q.min_level <= 45).length },
  { min: 46, max: 60, count: materialQuests.filter(q => q.min_level >= 46 && q.min_level <= 60).length },
];

levelRanges.forEach(range => {
  console.log(`  Level ${range.min}-${range.max}: ${range.count} quests`);
});
