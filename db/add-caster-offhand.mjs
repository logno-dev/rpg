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

async function addCasterOffhand() {
  console.log('🔮 Adding caster offhand items (orbs, tomes)...\n');

  const items = [];

  // TIER 1: Early game (Levels 1-10) - Orbs
  items.push(
    { name: 'Cracked Crystal Orb', level: 1, int: 1, wis: 0, armor: 0, rarity: 'common', value: 8 },
    { name: 'Apprentice Tome', level: 3, int: 1, wis: 1, armor: 0, rarity: 'common', value: 20 },
    { name: 'Polished Orb', level: 5, int: 2, wis: 1, armor: 0, rarity: 'uncommon', value: 35 },
    { name: 'Tome of Minor Mysteries', level: 8, int: 3, wis: 2, armor: 0, rarity: 'uncommon', value: 55 },
    { name: 'Mage\'s Focus Orb', level: 10, int: 4, wis: 2, armor: 0, rarity: 'uncommon', value: 80 },
  );

  // TIER 2: Mid-early game (Levels 10-20)
  items.push(
    // Level 12 - Boss drop
    { name: 'Shadowfang\'s Dark Orb', level: 12, int: 5, wis: 3, armor: 0, rarity: 'rare', value: 160, bossOnly: true },
    
    { name: 'Enchanted Tome', level: 15, int: 6, wis: 3, armor: 0, rarity: 'rare', value: 130 },
    
    // Level 18 - Boss drop
    { name: 'Gorak\'s Rune Stone', level: 18, int: 7, wis: 4, armor: 0, rarity: 'rare', value: 210, bossOnly: true },
    
    { name: 'Crystal Orb of Power', level: 20, int: 8, wis: 4, armor: 0, rarity: 'rare', value: 190 },
  );

  // TIER 3: Mid game (Levels 20-35)
  items.push(
    { name: 'Sorcerer\'s Grimoire', level: 22, int: 9, wis: 5, armor: 0, rarity: 'rare', value: 220 },
    
    // Level 25 - Boss drop
    { name: 'Vexmora\'s Void Orb', level: 25, int: 10, wis: 6, armor: 0, rarity: 'epic', value: 380, bossOnly: true },
    
    { name: 'Tome of Arcane Secrets', level: 28, int: 11, wis: 7, armor: 0, rarity: 'epic', value: 320 },
    { name: 'Radiant Orb', level: 32, int: 12, wis: 7, armor: 0, rarity: 'epic', value: 380 },
    { name: 'Ancient Spellbook', level: 35, int: 13, wis: 8, armor: 0, rarity: 'epic', value: 430 },
  );

  // TIER 4: Late mid game (Levels 35-50)
  items.push(
    { name: 'Starwoven Orb', level: 38, int: 14, wis: 9, armor: 0, rarity: 'epic', value: 480 },
    
    // Level 40 - Boss drop
    { name: 'Flame Lord\'s Ember Orb', level: 40, int: 15, wis: 10, armor: 0, rarity: 'epic', value: 650, bossOnly: true },
    
    { name: 'Celestial Tome', level: 45, int: 16, wis: 11, armor: 0, rarity: 'epic', value: 580 },
    { name: 'Prismatic Crystal', level: 48, int: 17, wis: 11, armor: 0, rarity: 'epic', value: 630 },
  );

  // TIER 5: End game (Levels 50-60)
  items.push(
    { name: 'Primordial Codex', level: 50, int: 18, wis: 12, armor: 0, rarity: 'legendary', value: 800 },
    { name: 'Orb of Eternity', level: 52, int: 19, wis: 12, armor: 0, rarity: 'legendary', value: 850 },
    
    // Level 55 - Boss drop (Inferno Citadel)
    { name: 'Infernal Tome of Dominion', level: 55, int: 20, wis: 14, armor: 0, rarity: 'legendary', value: 1300, bossOnly: true },
    
    { name: 'Tome of Infinite Knowledge', level: 58, int: 21, wis: 14, armor: 0, rarity: 'legendary', value: 1100 },
    { name: 'Ascendant Orb', level: 60, int: 22, wis: 15, armor: 0, rarity: 'legendary', value: 1200 },
  );

  console.log(`Creating ${items.length} caster offhand items...\n`);

  let created = 0;
  const itemIds = {};

  for (const item of items) {
    const exists = await db.execute('SELECT id FROM items WHERE name = ?', [item.name]);

    if (exists.rows.length > 0) {
      console.log(`⏭️  ${item.name} already exists, skipping`);
      itemIds[item.name] = exists.rows[0].id;
      continue;
    }

    const result = await db.execute(
      `INSERT INTO items (name, description, type, slot, rarity, required_level, value, stackable, armor, intelligence_bonus, wisdom_bonus)
       VALUES (?, ?, 'armor', 'offhand', ?, ?, ?, 0, ?, ?, ?)`,
      [
        item.name,
        `${item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)} magical focus for casters${item.bossOnly ? ' - boss drop' : ''}`,
        item.rarity,
        item.level,
        item.value,
        item.armor,
        item.int,
        item.wis
      ]
    );

    itemIds[item.name] = result.lastInsertRowid;
    console.log(`✅ Created ${item.name} (Level ${item.level} ${item.rarity})`);
    created++;
  }

  console.log(`\n🎉 Created ${created} new items!\n`);
  return { items, itemIds };
}

async function addToLootTables(items, itemIds) {
  console.log('📦 Adding items to loot tables...\n');

  let added = 0;

  const bossesResult = await db.execute('SELECT id, name, level FROM named_mobs ORDER BY level');
  const bosses = bossesResult.rows;

  const mobsResult = await db.execute('SELECT id, name, level FROM mobs ORDER BY level');
  const mobs = mobsResult.rows;

  // Boss items
  const bossItems = items.filter(i => i.bossOnly);
  for (const item of bossItems) {
    const itemId = typeof itemIds[item.name] === 'bigint' ? Number(itemIds[item.name]) : itemIds[item.name];
    const eligibleBosses = bosses.filter(b => b.level >= item.level - 3 && b.level <= item.level + 3);

    for (const boss of eligibleBosses) {
      const bossId = typeof boss.id === 'bigint' ? Number(boss.id) : boss.id;
      const exists = await db.execute(
        'SELECT id FROM named_mob_loot WHERE named_mob_id = ? AND item_id = ?',
        [bossId, itemId]
      );

      if (exists.rows.length === 0) {
        await db.execute(
          'INSERT INTO named_mob_loot (named_mob_id, item_id, drop_chance, min_quantity, max_quantity) VALUES (?, ?, ?, 1, 1)',
          [bossId, itemId, 0.15]
        );
        added++;
      }
    }
    
    console.log(`✅ Added ${item.name} to ${eligibleBosses.length} boss loot tables`);
  }

  // Regular items
  const regularItems = items.filter(i => !i.bossOnly);
  for (const item of regularItems) {
    const itemId = typeof itemIds[item.name] === 'bigint' ? Number(itemIds[item.name]) : itemIds[item.name];
    const eligibleMobs = mobs.filter(m => m.level >= item.level - 2 && m.level <= item.level + 5);
    const mobsToAddTo = eligibleMobs.filter((_, index) => index % 3 === 0);

    for (const mob of mobsToAddTo) {
      const mobId = typeof mob.id === 'bigint' ? Number(mob.id) : mob.id;
      const exists = await db.execute(
        'SELECT id FROM mob_loot WHERE mob_id = ? AND item_id = ?',
        [mobId, itemId]
      );

      if (exists.rows.length === 0) {
        const dropRate = item.rarity === 'legendary' ? 0.02 :
                        item.rarity === 'epic' ? 0.04 :
                        item.rarity === 'rare' ? 0.06 :
                        item.rarity === 'uncommon' ? 0.08 : 0.10;

        await db.execute(
          'INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max) VALUES (?, ?, ?, 1, 1)',
          [mobId, itemId, dropRate]
        );
        added++;
      }
    }
    
    console.log(`✅ Added ${item.name} to ${mobsToAddTo.length} mob loot tables`);
  }

  console.log(`\n🎉 Added ${added} loot table entries!\n`);
}

async function addCraftingRecipes(items, itemIds) {
  console.log('⚒️ Adding crafting recipes (Alchemy)...\n');

  let created = 0;
  const craftableItems = items.filter(i => !i.bossOnly);

  for (const item of craftableItems) {
    const itemId = typeof itemIds[item.name] === 'bigint' ? Number(itemIds[item.name]) : itemIds[item.name];
    const craftLevel = Math.ceil(item.level / 2);
    const profession = 'alchemy'; // Orbs and tomes are alchemical creations

    const exists = await db.execute(
      'SELECT id FROM recipes WHERE name = ? AND profession_type = ?',
      [item.name, profession]
    );

    if (exists.rows.length > 0) {
      console.log(`⏭️  Recipe for ${item.name} already exists, skipping`);
      continue;
    }

    const recipeResult = await db.execute(
      'INSERT INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience) VALUES (?, ?, ?, ?, 25, ?)',
      [item.name, profession, craftLevel, itemId, craftLevel * 70]
    );

    const recipeId = recipeResult.lastInsertRowid;

    // Materials: Rare Herbs + Major Gemstones
    const herbsAmount = Math.max(3, Math.floor(item.level / 10) + 2);
    const gemstonesAmount = item.rarity === 'legendary' ? 4 : item.rarity === 'epic' ? 3 : 2;

    const herbMaterialId = item.level >= 20 ? 17 : 10; // Rare Herbs (17) or Herbs (10)
    await db.execute(
      'INSERT INTO recipe_materials (recipe_id, material_id, quantity) VALUES (?, ?, ?)',
      [recipeId, herbMaterialId, herbsAmount]
    );

    const gemstoneMaterialId = item.level >= 20 ? 16 : 9; // Major Gemstone (16) or Minor Gemstone (9)
    await db.execute(
      'INSERT INTO recipe_materials (recipe_id, material_id, quantity) VALUES (?, ?, ?)',
      [recipeId, gemstoneMaterialId, gemstonesAmount]
    );

    console.log(`✅ Created recipe for ${item.name} (Alchemy ${craftLevel})`);
    created++;
  }

  console.log(`\n🎉 Created ${created} crafting recipes!\n`);
}

async function main() {
  try {
    const { items, itemIds } = await addCasterOffhand();
    await addToLootTables(items, itemIds);
    await addCraftingRecipes(items, itemIds);
    
    console.log('\n✨ Caster offhand items complete! Casters now have full equipment coverage.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
