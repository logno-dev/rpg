import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function addQuestItemLoot() {
  console.log('🎁 Adding quest item loot drops...\n');

  try {
    // Get quest item IDs
    const foxPelt = await db.execute({
      sql: 'SELECT id FROM crafting_materials WHERE name = ?',
      args: ['Fox Pelt'],
    });
    
    const bearClaw = await db.execute({
      sql: 'SELECT id FROM crafting_materials WHERE name = ?',
      args: ['Bear Claw'],
    });
    
    const ratTail = await db.execute({
      sql: 'SELECT id FROM crafting_materials WHERE name = ?',
      args: ['Rat Tail'],
    });
    
    // Get mob IDs
    const wildFox = await db.execute({
      sql: 'SELECT id FROM mobs WHERE name = ?',
      args: ['Wild Fox'],
    });
    
    const youngBear = await db.execute({
      sql: 'SELECT id FROM mobs WHERE name = ?',
      args: ['Young Bear'],
    });
    
    const giantRat = await db.execute({
      sql: 'SELECT id FROM mobs WHERE name = ?',
      args: ['Giant Rat'],
    });

    console.log('📦 Adding quest item drops...\n');

    // Fox Pelt from Wild Fox (30% drop chance for quest)
    if (foxPelt.rows.length > 0 && wildFox.rows.length > 0) {
      await db.execute({
        sql: `INSERT INTO mob_crafting_loot (mob_id, material_id, drop_chance, min_quantity, max_quantity)
              VALUES (?, ?, 0.4, 1, 1)`,
        args: [wildFox.rows[0].id, foxPelt.rows[0].id],
      });
      console.log('  ✓ Wild Fox → Fox Pelt (40% drop chance)');
    }

    // Bear Claw from Young Bear (35% drop chance)
    if (bearClaw.rows.length > 0 && youngBear.rows.length > 0) {
      await db.execute({
        sql: `INSERT INTO mob_crafting_loot (mob_id, material_id, drop_chance, min_quantity, max_quantity)
              VALUES (?, ?, 0.35, 1, 1)`,
        args: [youngBear.rows[0].id, bearClaw.rows[0].id],
      });
      console.log('  ✓ Young Bear → Bear Claw (35% drop chance)');
    }

    // Rat Tail from Giant Rat (50% drop chance, easier quest)
    if (ratTail.rows.length > 0 && giantRat.rows.length > 0) {
      await db.execute({
        sql: `INSERT INTO mob_crafting_loot (mob_id, material_id, drop_chance, min_quantity, max_quantity)
              VALUES (?, ?, 0.5, 1, 1)`,
        args: [giantRat.rows[0].id, ratTail.rows[0].id],
      });
      console.log('  ✓ Giant Rat → Rat Tail (50% drop chance)');
    }

    console.log('\n✅ Quest item loot added!\n');
    console.log('Summary:');
    console.log('  • Fox Pelt drops from Wild Fox (40%)');
    console.log('  • Bear Claw drops from Young Bear (35%)');
    console.log('  • Rat Tail drops from Giant Rat (50%)');
    console.log('  • Wolf Pelt already exists in game\n');

  } catch (error) {
    console.error('❌ Error adding quest item loot:', error);
    throw error;
  }
}

addQuestItemLoot();
