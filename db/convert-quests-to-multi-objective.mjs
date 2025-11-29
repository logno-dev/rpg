import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function convertQuests() {
  console.log('🔄 Converting quests to multi-objective...\n');

  try {
    // First, let's add quest items as crafting materials
    console.log('📦 Creating quest items...');
    
    const questItems = [
      { name: 'Fox Pelt', description: 'A soft fox pelt for the quest giver' },
      { name: 'Wraith Essence', description: 'Mystical essence from defeated wraiths' },
      { name: 'Bear Claw', description: 'Sharp claw from a young bear' },
      { name: 'Rat Tail', description: 'Disgusting rat tail' },
      { name: 'Bandit Badge', description: 'Badge taken from a bandit chief' },
    ];

    const itemIds = {};
    for (const item of questItems) {
      const result = await db.execute({
        sql: `INSERT INTO crafting_materials (name, description, is_quest_item) 
              VALUES (?, ?, 1)`,
        args: [item.name, item.description],
      });
      itemIds[item.name] = result.lastInsertRowid;
      console.log(`  ✓ Created: ${item.name} (ID: ${result.lastInsertRowid})`);
    }

    console.log('\n📝 Converting quests...\n');

    // ============================================
    // SEQUENTIAL QUEST: Fox Hunter
    // ============================================
    console.log('1️⃣  Converting "Fox Hunter" to sequential quest...');
    
    // Get the quest ID
    const foxQuest = await db.execute({
      sql: 'SELECT id FROM quests WHERE name = ?',
      args: ['Fox Hunter'],
    });
    
    if (foxQuest.rows.length > 0) {
      const questId = foxQuest.rows[0].id;
      
      // Current objective is order 1, keep it
      // Add objective 2: Collect Fox Pelts
      await db.execute({
        sql: `INSERT INTO quest_objectives 
              (quest_id, objective_order, type, description, target_item_id, target_region_id, required_count, auto_complete)
              VALUES (?, 2, 'collect', 'Collect 3 Fox Pelts from Wild Foxes', ?, 1, 3, 1)`,
        args: [questId, itemIds['Fox Pelt']],
      });
      
      console.log('  ✓ Added objective 2: Collect 3 Fox Pelts');
      console.log('  ✓ Quest now has 2 sequential objectives\n');
    }

    // ============================================
    // SEQUENTIAL QUEST: Bandit Menace
    // ============================================
    console.log('2️⃣  Converting "Bandit Menace" to sequential quest...');
    
    const banditQuest = await db.execute({
      sql: 'SELECT id FROM quests WHERE name = ?',
      args: ['Bandit Menace'],
    });
    
    if (banditQuest.rows.length > 0) {
      const questId = banditQuest.rows[0].id;
      
      // Update existing objective to be clearer
      await db.execute({
        sql: `UPDATE quest_objectives 
              SET description = 'Defeat 5 Bandits in Darkwood Forest',
                  required_count = 5
              WHERE quest_id = ? AND objective_order = 1`,
        args: [questId],
      });
      
      // Get Bandit Chief mob ID
      const banditChief = await db.execute({
        sql: 'SELECT id FROM mobs WHERE name = ?',
        args: ['Bandit Chief'],
      });
      
      if (banditChief.rows.length > 0) {
        // Add objective 2: Defeat Bandit Chief
        await db.execute({
          sql: `INSERT INTO quest_objectives 
                (quest_id, objective_order, type, description, target_mob_id, target_region_id, required_count, auto_complete)
                VALUES (?, 2, 'kill', 'Defeat 2 Bandit Chiefs', ?, 2, 2, 1)`,
          args: [questId, banditChief.rows[0].id],
        });
        
        console.log('  ✓ Updated objective 1: Defeat 5 Bandits');
        console.log('  ✓ Added objective 2: Defeat 2 Bandit Chiefs');
        console.log('  ✓ Quest now has 2 sequential objectives\n');
      }
    }

    // ============================================
    // PARALLEL QUEST: Create new "Beast Hunter"
    // ============================================
    console.log('3️⃣  Creating new parallel quest "Beast Hunter"...');
    
    // Create the quest
    const beastHunterQuest = await db.execute({
      sql: `INSERT INTO quests (name, description, region_id, min_level, repeatable)
            VALUES (?, ?, 1, 5, 0)`,
      args: [
        'Beast Hunter',
        'The local wildlife has become aggressive. Help thin their numbers by hunting both foxes and rabid dogs.',
      ],
    });
    
    const beastQuestId = beastHunterQuest.lastInsertRowid;
    
    // Get mob IDs
    const wildFox = await db.execute({
      sql: 'SELECT id FROM mobs WHERE name = ?',
      args: ['Wild Fox'],
    });
    
    const rabidDog = await db.execute({
      sql: 'SELECT id FROM mobs WHERE name = ?',
      args: ['Rabid Dog'],
    });
    
    if (wildFox.rows.length > 0 && rabidDog.rows.length > 0) {
      // Add PARALLEL objectives (both order 1)
      await db.execute({
        sql: `INSERT INTO quest_objectives 
              (quest_id, objective_order, type, description, target_mob_id, target_region_id, required_count, auto_complete)
              VALUES (?, 1, 'kill', 'Defeat 6 Wild Foxes', ?, 1, 6, 1)`,
        args: [beastQuestId, wildFox.rows[0].id],
      });
      
      await db.execute({
        sql: `INSERT INTO quest_objectives 
              (quest_id, objective_order, type, description, target_mob_id, target_region_id, required_count, auto_complete)
              VALUES (?, 1, 'kill', 'Defeat 6 Rabid Dogs', ?, 1, 6, 1)`,
        args: [beastQuestId, rabidDog.rows[0].id],
      });
      
      // Add rewards
      await db.execute({
        sql: `INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
              VALUES (?, 'xp', 350), (?, 'gold', 50)`,
        args: [beastQuestId, beastQuestId],
      });
      
      console.log('  ✓ Created quest "Beast Hunter"');
      console.log('  ✓ Added 2 PARALLEL objectives (both order 1)');
      console.log('  ✓ Players can complete both objectives simultaneously\n');
    }

    // ============================================
    // PARALLEL QUEST: Create "Supply Run"
    // ============================================
    console.log('4️⃣  Creating new parallel quest "Supply Run"...');
    
    const supplyQuest = await db.execute({
      sql: `INSERT INTO quests (name, description, region_id, min_level, repeatable)
            VALUES (?, ?, 1, 6, 0)`,
      args: [
        'Supply Run',
        'We need materials from the wildlife. Collect both wolf pelts and bear claws for us.',
      ],
    });
    
    const supplyQuestId = supplyQuest.lastInsertRowid;
    
    // Wolf Pelt already exists (ID 22), get Bear Claw
    await db.execute({
      sql: `INSERT INTO quest_objectives 
            (quest_id, objective_order, type, description, target_item_id, target_region_id, required_count, auto_complete)
            VALUES (?, 1, 'collect', 'Collect 5 Wolf Pelts', 22, 1, 5, 1)`,
      args: [supplyQuestId],
    });
    
    await db.execute({
      sql: `INSERT INTO quest_objectives 
            (quest_id, objective_order, type, description, target_item_id, target_region_id, required_count, auto_complete)
            VALUES (?, 1, 'collect', 'Collect 3 Bear Claws', ?, 1, 3, 1)`,
      args: [supplyQuestId, itemIds['Bear Claw']],
    });
    
    // Add rewards
    await db.execute({
      sql: `INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
            VALUES (?, 'xp', 400), (?, 'gold', 60)`,
      args: [supplyQuestId, supplyQuestId],
    });
    
    console.log('  ✓ Created quest "Supply Run"');
    console.log('  ✓ Added 2 PARALLEL collection objectives\n');

    // ============================================
    // SEQUENTIAL + PARALLEL: Rat Extermination
    // ============================================
    console.log('5️⃣  Creating mixed quest "Rat Extermination"...');
    
    const ratQuest = await db.execute({
      sql: `INSERT INTO quests (name, description, region_id, min_level, repeatable)
            VALUES (?, ?, 1, 3, 0)`,
      args: [
        'Rat Extermination',
        'Giant rats are infesting the area. First clear them out, then collect proof of your deed.',
      ],
    });
    
    const ratQuestId = ratQuest.lastInsertRowid;
    
    const giantRat = await db.execute({
      sql: 'SELECT id FROM mobs WHERE name = ?',
      args: ['Giant Rat'],
    });
    
    if (giantRat.rows.length > 0) {
      // Stage 1: Kill rats
      await db.execute({
        sql: `INSERT INTO quest_objectives 
              (quest_id, objective_order, type, description, target_mob_id, target_region_id, required_count, auto_complete)
              VALUES (?, 1, 'kill', 'Defeat 8 Giant Rats', ?, 1, 8, 1)`,
        args: [ratQuestId, giantRat.rows[0].id],
      });
      
      // Stage 2: Collect rat tails (objective 2)
      await db.execute({
        sql: `INSERT INTO quest_objectives 
              (quest_id, objective_order, type, description, target_item_id, target_region_id, required_count, auto_complete)
              VALUES (?, 2, 'collect', 'Collect 5 Rat Tails as proof', ?, 1, 5, 1)`,
        args: [ratQuestId, itemIds['Rat Tail']],
      });
      
      // Add rewards
      await db.execute({
        sql: `INSERT INTO quest_rewards (quest_id, reward_type, reward_amount)
              VALUES (?, 'xp', 250), (?, 'gold', 30)`,
        args: [ratQuestId, ratQuestId],
      });
      
      console.log('  ✓ Created quest "Rat Extermination"');
      console.log('  ✓ Stage 1: Kill 8 rats');
      console.log('  ✓ Stage 2: Collect 5 rat tails (sequential)\n');
    }

    console.log('\n✅ Quest conversion complete!\n');
    console.log('Summary:');
    console.log('  • 2 existing quests converted to multi-objective');
    console.log('  • 3 new multi-objective quests created');
    console.log('  • 5 new quest items added');
    console.log('  • Sequential and parallel objectives demonstrated\n');

  } catch (error) {
    console.error('❌ Error converting quests:', error);
    throw error;
  }
}

convertQuests();
