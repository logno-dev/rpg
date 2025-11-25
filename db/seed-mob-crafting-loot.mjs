import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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

async function seedMobCraftingLoot() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  console.log('💎 Adding crafting materials to mob loot tables...\n');

  try {
    // Get all mobs
    const mobsResult = await client.execute('SELECT id, name, level FROM mobs ORDER BY level');
    const mobs = mobsResult.rows;

    // Get all crafting materials
    const materialsResult = await client.execute('SELECT id, name, rarity FROM crafting_materials');
    const materials = materialsResult.rows;

    // Organize materials by rarity
    const commonMaterials = materials.filter(m => m.rarity === 'common');
    const uncommonMaterials = materials.filter(m => m.rarity === 'uncommon');
    const rareMaterials = materials.filter(m => m.rarity === 'rare');

    let totalLootAdded = 0;

    for (const mob of mobs) {
      const mobLevel = mob.level;
      const isNamedMob = mob.name.includes('Boss') || mob.name.includes('King') || mob.name.includes('Lord');

      // Add common materials (30-40% drop chance)
      for (const material of commonMaterials) {
        const dropChance = isNamedMob ? 0.5 : 0.35; // Higher drop from bosses
        const minQty = 1;
        const maxQty = isNamedMob ? 5 : 3;

        await client.execute({
          sql: `INSERT OR IGNORE INTO mob_crafting_loot (mob_id, material_id, drop_chance, min_quantity, max_quantity)
                VALUES (?, ?, ?, ?, ?)`,
          args: [mob.id, material.id, dropChance, minQty, maxQty]
        });
        totalLootAdded++;
      }

      // Add uncommon materials for higher level mobs (20-30 drop chance)
      if (mobLevel >= 20) {
        for (const material of uncommonMaterials) {
          const dropChance = isNamedMob ? 0.4 : 0.25;
          const minQty = 1;
          const maxQty = isNamedMob ? 4 : 2;

          await client.execute({
            sql: `INSERT OR IGNORE INTO mob_crafting_loot (mob_id, material_id, drop_chance, min_quantity, max_quantity)
                  VALUES (?, ?, ?, ?, ?)`,
            args: [mob.id, material.id, dropChance, minQty, maxQty]
          });
          totalLootAdded++;
        }
      }

      // Add rare materials only for named/boss mobs (10-15% drop chance)
      if (isNamedMob && mobLevel >= 40) {
        for (const material of rareMaterials) {
          const dropChance = 0.12;
          const minQty = 1;
          const maxQty = 2;

          await client.execute({
            sql: `INSERT OR IGNORE INTO mob_crafting_loot (mob_id, material_id, drop_chance, min_quantity, max_quantity)
                  VALUES (?, ?, ?, ?, ?)`,
            args: [mob.id, material.id, dropChance, minQty, maxQty]
          });
          totalLootAdded++;
        }
      }
    }

    console.log(`✅ Added ${totalLootAdded} crafting material loot entries across ${mobs.length} mobs\n`);

    // Summary
    const lootCount = await client.execute('SELECT COUNT(*) as count FROM mob_crafting_loot');
    console.log(`📊 Total mob crafting loot entries: ${lootCount.rows[0].count}`);
    console.log('🎉 Mob crafting loot seeding complete!');
  } catch (error) {
    console.error('❌ Loot seeding failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seedMobCraftingLoot();
