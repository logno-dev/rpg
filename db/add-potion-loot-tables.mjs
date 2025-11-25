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
      line = line.trim();
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

async function addPotionLoot() {
  console.log('🧪 Adding potions to mob loot tables...\n');

  try {
    // Get all potions
    const potionsResult = await db.execute({
      sql: `SELECT id, name, health_restore, mana_restore FROM items 
            WHERE type = 'consumable' 
            AND (health_restore > 0 OR mana_restore > 0)
            ORDER BY health_restore + mana_restore`,
      args: []
    });

    const potions = potionsResult.rows;
    console.log(`Found ${potions.length} potions to distribute\n`);

    // Get all mobs grouped by level ranges
    const mobsResult = await db.execute({
      sql: 'SELECT id, name, level FROM mobs ORDER BY level',
      args: []
    });

    const mobs = mobsResult.rows;

    // Potion distribution by level
    const potionTiers = [
      { name: 'Minor Health Potion', levels: [1, 10], dropRate: 0.15, quantity: [1, 2] },
      { name: 'Minor Mana Potion', levels: [1, 10], dropRate: 0.12, quantity: [1, 2] },
      { name: 'Minor Rejuvenation Potion', levels: [5, 15], dropRate: 0.05, quantity: [1, 1] },
      
      { name: 'Lesser Health Potion', levels: [10, 20], dropRate: 0.12, quantity: [1, 2] },
      { name: 'Lesser Mana Potion', levels: [10, 20], dropRate: 0.10, quantity: [1, 2] },
      
      { name: 'Health Potion', levels: [20, 30], dropRate: 0.10, quantity: [1, 2] },
      { name: 'Mana Potion', levels: [20, 30], dropRate: 0.08, quantity: [1, 2] },
      { name: 'Rejuvenation Potion', levels: [20, 35], dropRate: 0.04, quantity: [1, 1] },
      
      { name: 'Greater Health Potion', levels: [30, 40], dropRate: 0.08, quantity: [1, 2] },
      { name: 'Greater Mana Potion', levels: [30, 40], dropRate: 0.06, quantity: [1, 2] },
      
      { name: 'Superior Health Potion', levels: [40, 50], dropRate: 0.06, quantity: [1, 1] },
      { name: 'Superior Mana Potion', levels: [40, 50], dropRate: 0.05, quantity: [1, 1] },
      { name: 'Greater Rejuvenation Potion', levels: [40, 55], dropRate: 0.03, quantity: [1, 1] },
      
      { name: 'Supreme Health Potion', levels: [50, 60], dropRate: 0.05, quantity: [1, 1] },
      { name: 'Supreme Mana Potion', levels: [50, 60], dropRate: 0.04, quantity: [1, 1] },
    ];

    let added = 0;

    for (const tier of potionTiers) {
      const potion = potions.find(p => p.name === tier.name);
      if (!potion) {
        console.log(`⚠️  Potion not found: ${tier.name}`);
        continue;
      }

      // Find mobs in level range
      const eligibleMobs = mobs.filter(m => 
        m.level >= tier.levels[0] && m.level <= tier.levels[1]
      );

      for (const mob of eligibleMobs) {
        // Check if loot entry already exists
        const existingResult = await db.execute({
          sql: 'SELECT id FROM mob_loot WHERE mob_id = ? AND item_id = ?',
          args: [mob.id, potion.id]
        });

        if (existingResult.rows.length === 0) {
          await db.execute({
            sql: `INSERT INTO mob_loot (mob_id, item_id, drop_rate, quantity_min, quantity_max)
                  VALUES (?, ?, ?, ?, ?)`,
            args: [mob.id, potion.id, tier.dropRate, tier.quantity[0], tier.quantity[1]]
          });
          added++;
        }
      }

      console.log(`✅ Added ${tier.name} to ${eligibleMobs.length} mobs (Levels ${tier.levels[0]}-${tier.levels[1]}, ${(tier.dropRate * 100).toFixed(0)}% drop rate)`);
    }

    console.log(`\n🎉 Added ${added} new potion loot entries!`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

addPotionLoot();
