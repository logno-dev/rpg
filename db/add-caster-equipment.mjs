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

// Formula for stat bonuses based on level
function getStatBonus(level, slot) {
  // Head, hands, feet give 60% of chest stats
  const multiplier = 0.6;
  const baseInt = Math.floor((level * 0.35 + 1) * multiplier);
  const baseWis = Math.floor((level * 0.25 + 0.5) * multiplier);
  return { int: baseInt, wis: baseWis };
}

function getArmor(level, slot) {
  // Cloth armor is light, head/hands/feet are ~40% of chest
  return Math.floor(level * 0.3 * 0.4);
}

async function addCasterEquipment() {
  console.log('🧙 Adding caster equipment (head, hands, feet)...\n');

  const items = [];

  // TIER 1: Early game (Levels 1-10)
  items.push(
    // Level 1 - Starting gear
    { name: 'Cloth Hood', slot: 'head', level: 1, int: 0, wis: 1, armor: 0, rarity: 'common', value: 5 },
    { name: 'Cloth Wraps', slot: 'hands', level: 1, int: 1, wis: 0, armor: 0, rarity: 'common', value: 5 },
    { name: 'Cloth Shoes', slot: 'feet', level: 1, int: 0, wis: 1, armor: 0, rarity: 'common', value: 5 },
    
    // Level 3
    { name: 'Apprentice Hood', slot: 'head', level: 3, int: 1, wis: 1, armor: 1, rarity: 'common', value: 15 },
    { name: 'Apprentice Gloves', slot: 'hands', level: 3, int: 1, wis: 1, armor: 1, rarity: 'common', value: 15 },
    { name: 'Apprentice Boots', slot: 'feet', level: 3, int: 1, wis: 1, armor: 1, rarity: 'common', value: 15 },
    
    // Level 5
    { name: 'Adept Cowl', slot: 'head', level: 5, int: 2, wis: 2, armor: 2, rarity: 'uncommon', value: 30 },
    { name: 'Adept Handwraps', slot: 'hands', level: 5, int: 2, wis: 2, armor: 2, rarity: 'uncommon', value: 30 },
    { name: 'Adept Sandals', slot: 'feet', level: 5, int: 2, wis: 2, armor: 2, rarity: 'uncommon', value: 30 },
    
    // Level 8
    { name: 'Mage Circlet', slot: 'head', level: 8, int: 3, wis: 2, armor: 2, rarity: 'uncommon', value: 50 },
    { name: 'Mage Gloves', slot: 'hands', level: 8, int: 3, wis: 2, armor: 2, rarity: 'uncommon', value: 50 },
    { name: 'Mage Boots', slot: 'feet', level: 8, int: 3, wis: 2, armor: 2, rarity: 'uncommon', value: 50 },
  );

  // TIER 2: Mid-early game (Levels 10-20) - Boss drops
  items.push(
    // Level 10 - Craftable
    { name: 'Enchanted Hood', slot: 'head', level: 10, int: 4, wis: 3, armor: 3, rarity: 'uncommon', value: 75 },
    { name: 'Enchanted Gloves', slot: 'hands', level: 10, int: 4, wis: 3, armor: 3, rarity: 'uncommon', value: 75 },
    { name: 'Enchanted Boots', slot: 'feet', level: 10, int: 4, wis: 3, armor: 3, rarity: 'uncommon', value: 75 },
    
    // Level 12 - Boss drop
    { name: 'Shadowfang Crown', slot: 'head', level: 12, int: 5, wis: 4, armor: 4, rarity: 'rare', value: 150, bossOnly: true },
    { name: 'Shadowfang Grips', slot: 'hands', level: 12, int: 5, wis: 4, armor: 4, rarity: 'rare', value: 150, bossOnly: true },
    { name: 'Shadowfang Treads', slot: 'feet', level: 12, int: 5, wis: 4, armor: 4, rarity: 'rare', value: 150, bossOnly: true },
    
    // Level 15 - Craftable
    { name: 'Runic Cowl', slot: 'head', level: 15, int: 6, wis: 4, armor: 4, rarity: 'rare', value: 120 },
    { name: 'Runic Handguards', slot: 'hands', level: 15, int: 6, wis: 4, armor: 4, rarity: 'rare', value: 120 },
    { name: 'Runic Footwraps', slot: 'feet', level: 15, int: 6, wis: 4, armor: 4, rarity: 'rare', value: 120 },
    
    // Level 18 - Boss drop
    { name: 'Gorak\'s Wisdom Crown', slot: 'head', level: 18, int: 7, wis: 5, armor: 5, rarity: 'rare', value: 200, bossOnly: true },
    { name: 'Gorak\'s Crushing Grips', slot: 'hands', level: 18, int: 7, wis: 5, armor: 5, rarity: 'rare', value: 200, bossOnly: true },
    { name: 'Gorak\'s Stone Treads', slot: 'feet', level: 18, int: 7, wis: 5, armor: 5, rarity: 'rare', value: 200, bossOnly: true },
  );

  // TIER 3: Mid game (Levels 20-35)
  items.push(
    // Level 20 - Craftable
    { name: 'Sorcerer\'s Diadem', slot: 'head', level: 20, int: 8, wis: 5, armor: 5, rarity: 'rare', value: 180 },
    { name: 'Sorcerer\'s Gloves', slot: 'hands', level: 20, int: 8, wis: 5, armor: 5, rarity: 'rare', value: 180 },
    { name: 'Sorcerer\'s Slippers', slot: 'feet', level: 20, int: 8, wis: 5, armor: 5, rarity: 'rare', value: 180 },
    
    // Level 25 - Boss drop
    { name: 'Vexmora\'s Dark Crown', slot: 'head', level: 25, int: 10, wis: 7, armor: 7, rarity: 'epic', value: 350, bossOnly: true },
    { name: 'Vexmora\'s Shadow Wraps', slot: 'hands', level: 25, int: 10, wis: 7, armor: 7, rarity: 'epic', value: 350, bossOnly: true },
    { name: 'Vexmora\'s Void Walkers', slot: 'feet', level: 25, int: 10, wis: 7, armor: 7, rarity: 'epic', value: 350, bossOnly: true },
    
    // Level 30 - Craftable
    { name: 'Archmage Circlet', slot: 'head', level: 30, int: 11, wis: 8, armor: 8, rarity: 'epic', value: 300 },
    { name: 'Archmage Handguards', slot: 'hands', level: 30, int: 11, wis: 8, armor: 8, rarity: 'epic', value: 300 },
    { name: 'Archmage Boots', slot: 'feet', level: 30, int: 11, wis: 8, armor: 8, rarity: 'epic', value: 300 },
  );

  // TIER 4: Late mid game (Levels 35-50)
  items.push(
    // Level 35 - Craftable
    { name: 'Starwoven Diadem', slot: 'head', level: 35, int: 13, wis: 9, armor: 9, rarity: 'epic', value: 400 },
    { name: 'Starwoven Grips', slot: 'hands', level: 35, int: 13, wis: 9, armor: 9, rarity: 'epic', value: 400 },
    { name: 'Starwoven Treads', slot: 'feet', level: 35, int: 13, wis: 9, armor: 9, rarity: 'epic', value: 400 },
    
    // Level 40 - Boss drop
    { name: 'Crown of the Flame Lord', slot: 'head', level: 40, int: 15, wis: 10, armor: 11, rarity: 'epic', value: 600, bossOnly: true },
    { name: 'Flame Lord\'s Grasp', slot: 'hands', level: 40, int: 15, wis: 10, armor: 11, rarity: 'epic', value: 600, bossOnly: true },
    { name: 'Flame Lord\'s Stride', slot: 'feet', level: 40, int: 15, wis: 10, armor: 11, rarity: 'epic', value: 600, bossOnly: true },
    
    // Level 45 - Craftable
    { name: 'Celestial Crown', slot: 'head', level: 45, int: 16, wis: 11, armor: 12, rarity: 'epic', value: 550 },
    { name: 'Celestial Handwraps', slot: 'hands', level: 45, int: 16, wis: 11, armor: 12, rarity: 'epic', value: 550 },
    { name: 'Celestial Sandals', slot: 'feet', level: 45, int: 16, wis: 11, armor: 12, rarity: 'epic', value: 550 },
  );

  // TIER 5: End game (Levels 50-60)
  items.push(
    // Level 50 - Craftable
    { name: 'Primordial Headdress', slot: 'head', level: 50, int: 18, wis: 12, armor: 13, rarity: 'legendary', value: 750 },
    { name: 'Primordial Grips', slot: 'hands', level: 50, int: 18, wis: 12, armor: 13, rarity: 'legendary', value: 750 },
    { name: 'Primordial Walkers', slot: 'feet', level: 50, int: 18, wis: 12, armor: 13, rarity: 'legendary', value: 750 },
    
    // Level 55 - Boss drop (Inferno Citadel)
    { name: 'Infernal Crown of Dominion', slot: 'head', level: 55, int: 20, wis: 14, armor: 15, rarity: 'legendary', value: 1200, bossOnly: true },
    { name: 'Infernal Grips of Power', slot: 'hands', level: 55, int: 20, wis: 14, armor: 15, rarity: 'legendary', value: 1200, bossOnly: true },
    { name: 'Infernal Treads of Cinders', slot: 'feet', level: 55, int: 20, wis: 14, armor: 15, rarity: 'legendary', value: 1200, bossOnly: true },
    
    // Level 60 - Craftable (Best in slot craftable)
    { name: 'Ascendant Diadem', slot: 'head', level: 60, int: 22, wis: 15, armor: 16, rarity: 'legendary', value: 1000 },
    { name: 'Ascendant Gloves', slot: 'hands', level: 60, int: 22, wis: 15, armor: 16, rarity: 'legendary', value: 1000 },
    { name: 'Ascendant Boots', slot: 'feet', level: 60, int: 22, wis: 15, armor: 16, rarity: 'legendary', value: 1000 },
  );

  console.log(`Creating ${items.length} caster equipment items...\n`);

  let created = 0;
  const itemIds = {};

  for (const item of items) {
    // Check if item already exists
    const exists = await db.execute({
      sql: 'SELECT id FROM items WHERE name = ?',
      args: [item.name]
    });

    if (exists.rows.length > 0) {
      console.log(`⏭️  ${item.name} already exists, skipping`);
      itemIds[item.name] = exists.rows[0].id;
      continue;
    }

    const result = await db.execute({
      sql: `INSERT INTO items (name, description, type, slot, armor_type, rarity, required_level, value, stackable, armor, intelligence_bonus, wisdom_bonus)
            VALUES (?, ?, 'armor', ?, 'cloth', ?, ?, ?, 0, ?, ?, ?)`,
      args: [
        item.name,
        `${item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)} cloth ${item.slot} armor for casters${item.bossOnly ? ' - boss drop' : ''}`,
        item.slot,
        item.rarity,
        item.level,
        item.value,
        item.armor,
        item.int,
        item.wis
      ]
    });

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

  // Get all named mobs (bosses)
  const bossesResult = await db.execute('SELECT id, name, level FROM named_mobs ORDER BY level');
  const bosses = bossesResult.rows;

  // Get all regular mobs
  const mobsResult = await db.execute('SELECT id, name, level FROM mobs ORDER BY level');
  const mobs = mobsResult.rows;

  // Add boss-only items to appropriate bosses
  const bossItems = items.filter(i => i.bossOnly);
  for (const item of bossItems) {
    const itemId = typeof itemIds[item.name] === 'bigint' 
      ? Number(itemIds[item.name]) 
      : itemIds[item.name];
    
    // Find bosses in appropriate level range (+/- 3 levels)
    const eligibleBosses = bosses.filter(b => 
      b.level >= item.level - 3 && b.level <= item.level + 3
    );

    for (const boss of eligibleBosses) {
      const bossId = typeof boss.id === 'bigint' ? Number(boss.id) : boss.id;
      
      // Check if loot entry already exists
      const exists = await db.execute({
        sql: 'SELECT id FROM named_mob_loot WHERE named_mob_id = ? AND item_id = ?',
        args: [bossId, itemId]
      });

      if (exists.rows.length === 0) {
        await db.execute({
          sql: `INSERT INTO named_mob_loot (named_mob_id, item_id, drop_chance, min_quantity, max_quantity)
                VALUES (?, ?, ?, 1, 1)`,
          args: [bossId, itemId, 0.15] // 15% drop rate for boss items
        });
        added++;
      }
    }
    
    console.log(`✅ Added ${item.name} to ${eligibleBosses.length} boss loot tables`);
  }

  // Add regular items to mob loot tables
  const regularItems = items.filter(i => !i.bossOnly);
  for (const item of regularItems) {
    const itemId = typeof itemIds[item.name] === 'bigint' 
      ? Number(itemIds[item.name]) 
      : itemIds[item.name];
    
    // Find mobs in appropriate level range
    const eligibleMobs = mobs.filter(m => 
      m.level >= item.level - 2 && m.level <= item.level + 5
    );

    // Only add to a subset of mobs (not all)
    const mobsToAddTo = eligibleMobs.filter((_, index) => index % 3 === 0); // Every 3rd mob

    for (const mob of mobsToAddTo) {
      const mobId = typeof mob.id === 'bigint' ? Number(mob.id) : mob.id;
      
      // Check if loot entry already exists
      const exists = await db.execute({
        sql: 'SELECT id FROM mob_loot WHERE mob_id = ? AND item_id = ?',
        args: [mobId, itemId]
      });

      if (exists.rows.length === 0) {
        // Lower drop rates for higher rarity
        const dropRate = item.rarity === 'legendary' ? 0.02 :
                        item.rarity === 'epic' ? 0.04 :
                        item.rarity === 'rare' ? 0.06 :
                        item.rarity === 'uncommon' ? 0.08 : 0.10;

        await db.execute({
          sql: `INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max)
                VALUES (?, ?, ?, 1, 1)`,
          args: [mobId, itemId, dropRate]
        });
        added++;
      }
    }
    
    console.log(`✅ Added ${item.name} to ${mobsToAddTo.length} mob loot tables`);
  }

  console.log(`\n🎉 Added ${added} loot table entries!\n`);
}

async function addCraftingRecipes(items, itemIds) {
  console.log('⚒️ Adding crafting recipes...\n');

  let created = 0;

  // Only craftable items (not boss-only)
  const craftableItems = items.filter(i => !i.bossOnly);

  for (const item of craftableItems) {
    const itemId = typeof itemIds[item.name] === 'bigint' 
      ? Number(itemIds[item.name]) 
      : itemIds[item.name];
    
    // Determine profession and craft level
    const craftLevel = Math.ceil(item.level / 2); // Craft level is half item level
    const profession = 'tailoring'; // All cloth items are tailoring

    // Check if recipe already exists
    const exists = await db.execute({
      sql: 'SELECT id FROM recipes WHERE name = ? AND profession_type = ?',
      args: [item.name, profession]
    });

    if (exists.rows.length > 0) {
      console.log(`⏭️  Recipe for ${item.name} already exists, skipping`);
      continue;
    }

    // Create recipe
    const recipeResult = await db.execute({
      sql: `INSERT INTO recipes (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
            VALUES (?, ?, ?, ?, 20, ?)`,
      args: [item.name, profession, craftLevel, itemId, craftLevel * 60]
    });

    const recipeId = recipeResult.lastInsertRowid;

    // Add materials based on level and rarity
    const clothAmount = Math.max(2, Math.floor(item.level / 5) + 1);
    const threadAmount = item.rarity === 'legendary' ? 3 : item.rarity === 'epic' ? 2 : 1;

    // Silk Cloth (material_id 13) for levels 15+, Wool Cloth (6) for 8+, Linen Cloth (5) for early
    const clothMaterialId = item.level >= 15 ? 13 : item.level >= 8 ? 6 : 5;
    
    await db.execute({
      sql: `INSERT INTO recipe_materials (recipe_id, material_id, quantity)
            VALUES (?, ?, ?)`,
      args: [recipeId, clothMaterialId, clothAmount]
    });

    // Enchanted Thread (material_id 14) for high tier items
    if (item.level >= 15) {
      await db.execute({
        sql: `INSERT INTO recipe_materials (recipe_id, material_id, quantity)
              VALUES (?, ?, ?)`,
        args: [recipeId, 14, threadAmount]
      });
    }

    console.log(`✅ Created recipe for ${item.name} (Tailoring ${craftLevel})`);
    created++;
  }

  console.log(`\n🎉 Created ${created} crafting recipes!\n`);
}

async function main() {
  try {
    const { items, itemIds } = await addCasterEquipment();
    await addToLootTables(items, itemIds);
    await addCraftingRecipes(items, itemIds);
    
    console.log('\n✨ All done! Caster equipment system complete.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
