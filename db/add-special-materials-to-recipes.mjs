import { createClient } from '@libsql/client';
import 'dotenv/config';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Add special materials to existing recipe groups
// Distributing them across different level ranges and professions
const recipeMaterials = [
  // Level 1-15 recipes - add basic special materials
  { recipe_group_id: 1, material_id: 35, quantity: 2 }, // Simple Sword + Iron Rivets
  { recipe_group_id: 10, material_id: 35, quantity: 1 }, // Simple Dagger + Iron Rivets
  { recipe_group_id: 11, material_id: 35, quantity: 2 }, // Simple Axe + Iron Rivets
  { recipe_group_id: 6, material_id: 30, quantity: 1 }, // Simple Cloth Chest + Silver Thread
  { recipe_group_id: 9, material_id: 28, quantity: 2 }, // Simple Leather Chest + Hardened Leather Strip
  { recipe_group_id: 12, material_id: 31, quantity: 1 }, // Simple Staff + Blessed Oak
  { recipe_group_id: 67, material_id: 29, quantity: 1 }, // Simple Shield + Polished Stone
  { recipe_group_id: 70, material_id: 31, quantity: 1 }, // Simple Instrument + Blessed Oak
  
  // Level 10-30 recipes - add uncommon special materials
  { recipe_group_id: 2, material_id: 34, quantity: 2 }, // Moderate Sword + Tempered Steel Bar
  { recipe_group_id: 14, material_id: 34, quantity: 1 }, // Moderate Dagger + Tempered Steel Bar
  { recipe_group_id: 15, material_id: 34, quantity: 2 }, // Moderate Axe + Tempered Steel Bar
  { recipe_group_id: 7, material_id: 30, quantity: 2 }, // Moderate Cloth Chest + Silver Thread
  { recipe_group_id: 22, material_id: 36, quantity: 2 }, // Moderate Leather Chest + Thick Hide
  { recipe_group_id: 16, material_id: 31, quantity: 2 }, // Moderate Staff + Blessed Oak
  { recipe_group_id: 68, material_id: 29, quantity: 2 }, // Moderate Shield + Polished Stone
  { recipe_group_id: 71, material_id: 31, quantity: 2 }, // Moderate Instrument + Blessed Oak
  { recipe_group_id: 82, material_id: 33, quantity: 1 }, // Simple Health Potion + Alchemical Resin
  { recipe_group_id: 85, material_id: 32, quantity: 1 }, // Simple Mana Potion + Moonstone Shard
  
  // Level 25-50 recipes - add rare special materials
  { recipe_group_id: 3, material_id: 41, quantity: 2 }, // Advanced Sword + Titanium Ore
  { recipe_group_id: 18, material_id: 41, quantity: 1 }, // Advanced Dagger + Titanium Ore
  { recipe_group_id: 19, material_id: 41, quantity: 2 }, // Advanced Axe + Titanium Ore
  { recipe_group_id: 23, material_id: 43, quantity: 1 }, // Advanced Cloth Chest + Celestial Fabric
  { recipe_group_id: 24, material_id: 36, quantity: 3 }, // Advanced Leather Chest + Thick Hide
  { recipe_group_id: 20, material_id: 40, quantity: 2 }, // Advanced Staff + Runestone Fragment
  { recipe_group_id: 69, material_id: 45, quantity: 1 }, // Advanced Shield + Prismatic Gem
  { recipe_group_id: 72, material_id: 37, quantity: 1 }, // Advanced Instrument + Phoenix Feather
  { recipe_group_id: 76, material_id: 42, quantity: 2 }, // Simple Tome + Enchanted Ink
  { recipe_group_id: 77, material_id: 42, quantity: 3 }, // Moderate Tome + Enchanted Ink
  { recipe_group_id: 78, material_id: 42, quantity: 4 }, // Advanced Tome + Enchanted Ink
  { recipe_group_id: 84, material_id: 39, quantity: 1 }, // Advanced Health Potion + Essence of Fire
  { recipe_group_id: 87, material_id: 46, quantity: 1 }, // Advanced Mana Potion + Essence of Ice
  { recipe_group_id: 90, material_id: 33, quantity: 2 }, // Advanced Rejuvenation Potion + Alchemical Resin
  
  // Dual wield and 2H weapons - add special materials
  { recipe_group_id: 91, material_id: 38, quantity: 1 }, // Dual Daggers + Void Crystal
  { recipe_group_id: 92, material_id: 34, quantity: 3 }, // Dual Swords + Tempered Steel Bar
  { recipe_group_id: 93, material_id: 41, quantity: 3 }, // Greatsword + Titanium Ore
  { recipe_group_id: 94, material_id: 44, quantity: 1 }, // Greataxe + Demon Horn
  
  // Additional armor pieces with special materials
  { recipe_group_id: 31, material_id: 35, quantity: 1 }, // Simple Plate Head + Iron Rivets
  { recipe_group_id: 37, material_id: 34, quantity: 1 }, // Moderate Plate Head + Tempered Steel Bar
  { recipe_group_id: 43, material_id: 41, quantity: 1 }, // Advanced Plate Head + Titanium Ore
  { recipe_group_id: 58, material_id: 30, quantity: 1 }, // Simple Cloth Head + Silver Thread
  { recipe_group_id: 61, material_id: 30, quantity: 2 }, // Moderate Cloth Head + Silver Thread
  { recipe_group_id: 64, material_id: 43, quantity: 1 }, // Advanced Cloth Head + Celestial Fabric
  { recipe_group_id: 49, material_id: 28, quantity: 1 }, // Simple Leather Head + Hardened Leather Strip
  { recipe_group_id: 52, material_id: 36, quantity: 2 }, // Moderate Leather Head + Thick Hide
  { recipe_group_id: 55, material_id: 47, quantity: 1 }, // Advanced Leather Head + Living Vine
];

console.log('Adding special materials to recipe groups...\n');

let added = 0;
let skipped = 0;

for (const rm of recipeMaterials) {
  try {
    await turso.execute({
      sql: `INSERT INTO recipe_group_materials (recipe_group_id, material_id, quantity)
            VALUES (?, ?, ?)`,
      args: [rm.recipe_group_id, rm.material_id, rm.quantity]
    });
    added++;
    console.log(`✓ Added material ${rm.material_id} to recipe group ${rm.recipe_group_id}`);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint')) {
      skipped++;
      console.log(`  Skipped (already exists): recipe ${rm.recipe_group_id} + material ${rm.material_id}`);
    } else {
      console.error(`✗ Error: recipe ${rm.recipe_group_id} + material ${rm.material_id}: ${error.message}`);
    }
  }
}

console.log(`\n✓ Added ${added} special materials to recipes, skipped ${skipped}`);

// Show summary
const summary = await turso.execute(`
  SELECT 
    rg.name,
    rg.min_level,
    rg.max_level,
    GROUP_CONCAT(cm.name, ', ') as materials
  FROM recipe_groups rg
  JOIN recipe_group_materials rgm ON rg.id = rgm.recipe_group_id
  JOIN crafting_materials cm ON rgm.material_id = cm.id
  WHERE cm.rarity IN ('uncommon', 'rare')
  GROUP BY rg.id
  ORDER BY rg.min_level
  LIMIT 15
`);

console.log('\nSample recipes with special materials:');
summary.rows.forEach(row => {
  console.log(`  ${row.name} (Lv${row.min_level}-${row.max_level}): ${row.materials}`);
});
