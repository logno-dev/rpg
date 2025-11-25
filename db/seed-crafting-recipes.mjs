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

// Material mapping
const MATERIALS = {
  // Common
  'Iron Ore': 1,
  'Copper Ore': 2,
  'Rough Leather': 3,
  'Cured Leather': 4,
  'Linen Cloth': 5,
  'Wool Cloth': 6,
  'Wooden Planks': 7,
  'Feathers': 8,
  'Minor Gemstone': 9,
  'Herbs': 10,
  // Uncommon
  'Steel Ingot': 11,
  'Mithril Ore': 12,
  'Silk Cloth': 13,
  'Enchanted Thread': 14,
  'Ancient Wood': 15,
  'Major Gemstone': 16,
  'Rare Herbs': 17,
  // Rare
  'Dragon Scale': 18,
  'Adamantite Ore': 19,
  'Ethereal Silk': 20
};

async function seedRecipes() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  console.log('🔨 Seeding crafting recipes...\n');

  try {
    // Get all items to map recipes to actual equipment
    const itemsResult = await client.execute('SELECT id, name, type, armor_type, required_level FROM items ORDER BY required_level, name');
    const items = itemsResult.rows;

    let totalRecipes = 0;

    // ========== BLACKSMITHING ==========
    console.log('Creating Blacksmithing recipes...');
    const blacksmithingRecipes = [];
    
    for (let craftLevel = 1; craftLevel <= 30; craftLevel++) {
      const itemLevel = craftLevel * 2; // Crafting level 1 = item level 2, etc.
      
      // Find 2-3 items for this level (weapons, plate, chain)
      const levelItems = items.filter(i => 
        i.required_level === itemLevel && 
        (i.type === 'weapon' || i.armor_type === 'plate' || i.armor_type === 'chain')
      ).slice(0, 3);
      
      for (const item of levelItems) {
        const materials = getBlacksmithingMaterials(craftLevel);
        blacksmithingRecipes.push({
          name: item.name,
          profession: 'blacksmithing',
          level: craftLevel,
          itemId: item.id,
          materials
        });
      }
    }
    
    for (const recipe of blacksmithingRecipes) {
      await insertRecipe(client, recipe);
      totalRecipes++;
    }
    console.log(`✅ Created ${blacksmithingRecipes.length} Blacksmithing recipes\n`);

    // ========== LEATHERWORKING ==========
    console.log('Creating Leatherworking recipes...');
    const leatherworkingRecipes = [];
    
    for (let craftLevel = 1; craftLevel <= 30; craftLevel++) {
      const itemLevel = craftLevel * 2;
      
      // Find 2-3 leather items for this level
      const levelItems = items.filter(i => 
        i.required_level === itemLevel && i.armor_type === 'leather'
      ).slice(0, 3);
      
      for (const item of levelItems) {
        const materials = getLeatherworkingMaterials(craftLevel);
        leatherworkingRecipes.push({
          name: item.name,
          profession: 'leatherworking',
          level: craftLevel,
          itemId: item.id,
          materials
        });
      }
    }
    
    for (const recipe of leatherworkingRecipes) {
      await insertRecipe(client, recipe);
      totalRecipes++;
    }
    console.log(`✅ Created ${leatherworkingRecipes.length} Leatherworking recipes\n`);

    // ========== TAILORING ==========
    console.log('Creating Tailoring recipes...');
    const tailoringRecipes = [];
    
    for (let craftLevel = 1; craftLevel <= 30; craftLevel++) {
      const itemLevel = craftLevel * 2;
      
      // Find 2-3 cloth items for this level
      const levelItems = items.filter(i => 
        i.required_level === itemLevel && i.armor_type === 'cloth'
      ).slice(0, 3);
      
      for (const item of levelItems) {
        const materials = getTailoringMaterials(craftLevel);
        tailoringRecipes.push({
          name: item.name,
          profession: 'tailoring',
          level: craftLevel,
          itemId: item.id,
          materials
        });
      }
    }
    
    for (const recipe of tailoringRecipes) {
      await insertRecipe(client, recipe);
      totalRecipes++;
    }
    console.log(`✅ Created ${tailoringRecipes.length} Tailoring recipes\n`);

    // ========== FLETCHING ==========
    console.log('Creating Fletching recipes...');
    const fletchingRecipes = [];
    
    for (let craftLevel = 1; craftLevel <= 30; craftLevel++) {
      const itemLevel = craftLevel * 2;
      
      // Find 2-3 bow/ranged items for this level
      const levelItems = items.filter(i => 
        i.required_level === itemLevel && 
        (i.name.includes('Bow') || i.name.includes('Crossbow'))
      ).slice(0, 3);
      
      for (const item of levelItems) {
        const materials = getFletchingMaterials(craftLevel);
        fletchingRecipes.push({
          name: item.name,
          profession: 'fletching',
          level: craftLevel,
          itemId: item.id,
          materials
        });
      }
    }
    
    for (const recipe of fletchingRecipes) {
      await insertRecipe(client, recipe);
      totalRecipes++;
    }
    console.log(`✅ Created ${fletchingRecipes.length} Fletching recipes\n`);

    // ========== ALCHEMY ==========
    console.log('Creating Alchemy recipes...');
    const alchemyRecipes = [];
    
    for (let craftLevel = 1; craftLevel <= 30; craftLevel++) {
      // Alchemy creates consumables (potions)
      // Create 2-3 potion types per level
      
      // Health Potion variant
      const healthPotionValue = craftLevel * 50; // Level 1 = 50 HP, Level 30 = 1500 HP
      alchemyRecipes.push({
        name: `Health Potion (${healthPotionValue} HP)`,
        profession: 'alchemy',
        level: craftLevel,
        itemId: null, // Will be created dynamically
        itemType: 'consumable',
        itemData: JSON.stringify({
          effectType: 'heal',
          value: healthPotionValue
        }),
        materials: getAlchemyMaterials(craftLevel, 'health')
      });
      
      // Mana Potion variant
      const manaPotionValue = craftLevel * 40; // Level 1 = 40 MP, Level 30 = 1200 MP
      alchemyRecipes.push({
        name: `Mana Potion (${manaPotionValue} MP)`,
        profession: 'alchemy',
        level: craftLevel,
        itemId: null,
        itemType: 'consumable',
        itemData: JSON.stringify({
          effectType: 'mana',
          value: manaPotionValue
        }),
        materials: getAlchemyMaterials(craftLevel, 'mana')
      });
      
      // Buff potion (every 5 levels)
      if (craftLevel % 5 === 0) {
        const buffValue = Math.floor(craftLevel / 5) * 2; // +2, +4, +6, etc.
        alchemyRecipes.push({
          name: `Strength Elixir (+${buffValue} STR)`,
          profession: 'alchemy',
          level: craftLevel,
          itemId: null,
          itemType: 'consumable',
          itemData: JSON.stringify({
            effectType: 'buff_strength',
            value: buffValue,
            duration: 300 // 5 minutes
          }),
          materials: getAlchemyMaterials(craftLevel, 'buff')
        });
      }
    }
    
    for (const recipe of alchemyRecipes) {
      await insertRecipe(client, recipe);
      totalRecipes++;
    }
    console.log(`✅ Created ${alchemyRecipes.length} Alchemy recipes\n`);

    console.log(`\n🎉 Total recipes created: ${totalRecipes}`);
  } catch (error) {
    console.error('❌ Recipe seeding failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

async function insertRecipe(client, recipe) {
  // Insert recipe
  await client.execute({
    sql: `INSERT OR IGNORE INTO recipes 
          (name, profession_type, level_required, item_id, craft_time_seconds, base_experience, item_type, item_data)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      recipe.name,
      recipe.profession,
      recipe.level,
      recipe.itemId,
      15, // 15 seconds craft time
      recipe.level * 50, // XP scales with level
      recipe.itemType || null,
      recipe.itemData || null
    ]
  });

  // Get the recipe ID (either just inserted or existing)
  const recipeResult = await client.execute({
    sql: 'SELECT id FROM recipes WHERE name = ? AND profession_type = ?',
    args: [recipe.name, recipe.profession]
  });

  if (recipeResult.rows.length === 0) {
    return; // Recipe already existed, materials likely already set
  }

  const recipeId = recipeResult.rows[0].id;

  // Insert material requirements
  for (const [materialName, quantity] of Object.entries(recipe.materials)) {
    const materialId = MATERIALS[materialName];
    if (materialId) {
      await client.execute({
        sql: 'INSERT OR IGNORE INTO recipe_materials (recipe_id, material_id, quantity) VALUES (?, ?, ?)',
        args: [recipeId, materialId, quantity]
      });
    }
  }
}

function getBlacksmithingMaterials(level) {
  if (level <= 5) {
    return { 'Iron Ore': 3 + level, 'Copper Ore': 2 };
  } else if (level <= 10) {
    return { 'Iron Ore': 5 + level, 'Minor Gemstone': 1 };
  } else if (level <= 15) {
    return { 'Steel Ingot': level - 5, 'Iron Ore': 5 };
  } else if (level <= 20) {
    return { 'Steel Ingot': level - 5, 'Minor Gemstone': 2 };
  } else if (level <= 25) {
    return { 'Mithril Ore': level - 15, 'Steel Ingot': 5, 'Major Gemstone': 1 };
  } else {
    return { 'Mithril Ore': level - 15, 'Adamantite Ore': level - 25, 'Major Gemstone': 2 };
  }
}

function getLeatherworkingMaterials(level) {
  if (level <= 10) {
    return { 'Rough Leather': 4 + level };
  } else if (level <= 20) {
    return { 'Cured Leather': level - 5, 'Rough Leather': 5 };
  } else if (level <= 25) {
    return { 'Cured Leather': level - 5, 'Minor Gemstone': 2 };
  } else {
    return { 'Cured Leather': 15, 'Dragon Scale': level - 25, 'Major Gemstone': 1 };
  }
}

function getTailoringMaterials(level) {
  if (level <= 8) {
    return { 'Linen Cloth': 5 + level };
  } else if (level <= 15) {
    return { 'Wool Cloth': level - 3, 'Linen Cloth': 5 };
  } else if (level <= 22) {
    return { 'Silk Cloth': level - 10, 'Wool Cloth': 8 };
  } else if (level <= 28) {
    return { 'Silk Cloth': 15, 'Enchanted Thread': level - 20 };
  } else {
    return { 'Ethereal Silk': level - 25, 'Enchanted Thread': 10, 'Major Gemstone': 2 };
  }
}

function getFletchingMaterials(level) {
  if (level <= 10) {
    return { 'Wooden Planks': 4 + level, 'Feathers': 3 + level };
  } else if (level <= 20) {
    return { 'Wooden Planks': 15, 'Feathers': 10, 'Minor Gemstone': 1 };
  } else if (level <= 25) {
    return { 'Ancient Wood': level - 15, 'Feathers': 15, 'Minor Gemstone': 2 };
  } else {
    return { 'Ancient Wood': 15, 'Feathers': 20, 'Major Gemstone': level - 25 };
  }
}

function getAlchemyMaterials(level, type) {
  if (type === 'health') {
    if (level <= 10) {
      return { 'Herbs': 2 + level };
    } else if (level <= 20) {
      return { 'Herbs': 12, 'Rare Herbs': level - 10 };
    } else {
      return { 'Rare Herbs': level - 5 };
    }
  } else if (type === 'mana') {
    if (level <= 10) {
      return { 'Herbs': 2 + level, 'Minor Gemstone': 1 };
    } else if (level <= 20) {
      return { 'Herbs': 12, 'Rare Herbs': level - 10, 'Minor Gemstone': 1 };
    } else {
      return { 'Rare Herbs': level - 5, 'Major Gemstone': 1 };
    }
  } else if (type === 'buff') {
    return { 'Rare Herbs': level, 'Major Gemstone': Math.floor(level / 5) };
  }
}

seedRecipes();
