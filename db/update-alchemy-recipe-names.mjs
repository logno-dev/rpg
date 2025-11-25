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

async function updateAlchemyRecipes() {
  console.log('🧪 Creating Alchemy recipes with proper item references...\n');

  try {
    // Note: Alchemy recipes should already be cleared
    // If not, uncomment the line below:
    // await db.execute({ sql: "DELETE FROM recipes WHERE profession_type = 'alchemy'", args: [] });

    console.log('Creating new alchemy recipes...\n');

    // Get all potions
    const potionsResult = await db.execute({
      sql: `SELECT id, name, health_restore, mana_restore FROM items 
            WHERE type = 'consumable' 
            AND (health_restore > 0 OR mana_restore > 0)
            ORDER BY name`,
      args: []
    });

    const potions = potionsResult.rows;

    // Recipe configurations - ONE recipe per unique potion
    const recipes = [
      // Tier 1: Minor (Level 1)
      { itemName: 'Minor Health Potion', level: 1, herbs: 2, gemstone: 0 },
      { itemName: 'Minor Mana Potion', level: 1, herbs: 2, gemstone: 0 },
      { itemName: 'Minor Rejuvenation Potion', level: 3, herbs: 3, gemstone: 1 },
      
      // Tier 2: Lesser (Level 5)
      { itemName: 'Lesser Health Potion', level: 5, herbs: 3, gemstone: 0 },
      { itemName: 'Lesser Mana Potion', level: 5, herbs: 3, gemstone: 0 },
      
      // Tier 3: Normal (Level 10)
      { itemName: 'Health Potion', level: 10, herbs: 4, gemstone: 1 },
      { itemName: 'Mana Potion', level: 10, herbs: 4, gemstone: 1 },
      { itemName: 'Rejuvenation Potion', level: 12, herbs: 5, gemstone: 2 },
      
      // Tier 4: Greater (Level 15)
      { itemName: 'Greater Health Potion', level: 15, herbs: 5, gemstone: 1 },
      { itemName: 'Greater Mana Potion', level: 15, herbs: 5, gemstone: 1 },
      
      // Tier 5: Superior (Level 20)
      { itemName: 'Superior Health Potion', level: 20, herbs: 6, gemstone: 2 },
      { itemName: 'Superior Mana Potion', level: 20, herbs: 6, gemstone: 2 },
      { itemName: 'Greater Rejuvenation Potion', level: 22, herbs: 7, gemstone: 3 },
      
      // Tier 6: Supreme (Level 25)
      { itemName: 'Supreme Health Potion', level: 25, herbs: 8, gemstone: 2 },
      { itemName: 'Supreme Mana Potion', level: 25, herbs: 8, gemstone: 2 },
    ];

    let created = 0;

    for (const recipe of recipes) {
      const potion = potions.find(p => p.name === recipe.itemName);
      if (!potion) {
        console.log(`⚠️  Potion not found: ${recipe.itemName}`);
        continue;
      }

      // Insert ONE recipe per potion
      await db.execute({
        sql: `INSERT INTO recipes 
              (name, profession_type, level_required, item_id, craft_time_seconds, base_experience)
              VALUES (?, 'alchemy', ?, ?, ?, ?)`,
        args: [
          potion.name,
          recipe.level,
          potion.id,
          15, // 15 seconds craft time
          recipe.level * 50 // XP scales with level
        ]
      });

      // Get the recipe ID
      const recipeResult = await db.execute({
        sql: 'SELECT id FROM recipes WHERE name = ? AND profession_type = ? AND level_required = ?',
        args: [potion.name, 'alchemy', recipe.level]
      });

      if (recipeResult.rows.length > 0) {
        const recipeId = recipeResult.rows[0].id;

        // Add herbs requirement (material_id 10 = Herbs, 17 = Rare Herbs)
        const herbMaterialId = recipe.level <= 15 ? 10 : 17;
        await db.execute({
          sql: `INSERT INTO recipe_materials (recipe_id, material_id, quantity)
                VALUES (?, ?, ?)`,
          args: [recipeId, herbMaterialId, recipe.herbs]
        });

        // Add gemstone requirement if needed (material_id 9 = Minor Gemstone, 16 = Major Gemstone)
        if (recipe.gemstone > 0) {
          const gemstoneMaterialId = recipe.level <= 15 ? 9 : 16;
          await db.execute({
            sql: `INSERT INTO recipe_materials (recipe_id, material_id, quantity)
                  VALUES (?, ?, ?)`,
            args: [recipeId, gemstoneMaterialId, recipe.gemstone]
          });
        }

        created++;
      }

      console.log(`✅ Created recipe for ${recipe.itemName} (Level ${recipe.level})`);
    }

    console.log(`\n🎉 Created ${created} new alchemy recipes!`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

updateAlchemyRecipes();
