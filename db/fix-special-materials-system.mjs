import { createClient } from '@libsql/client';
import 'dotenv/config';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log('Fixing special materials system...\n');

// Step 1: Remove special materials from recipe_group_materials
// These should NOT be required to craft, only to unlock special outcomes
console.log('Step 1: Removing special materials from required recipe materials...');

const specialMaterialIds = [28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47];

const deleteResult = await turso.execute({
  sql: `DELETE FROM recipe_group_materials WHERE material_id IN (${specialMaterialIds.join(',')})`,
  args: []
});

console.log(`✓ Removed ${deleteResult.rowsAffected} special material requirements\n`);

// Step 2: Add special materials as gates to rare/epic/legendary outputs
console.log('Step 2: Adding special materials as gates to rare outputs...\n');

// Map special materials to appropriate level ranges and types
const materialGates = [
  // Level 1-15 materials - gate uncommon/rare outputs in simple recipes
  { material_id: 35, level_min: 1, level_max: 15, rarity_types: ['uncommon', 'rare'], description: 'Iron Rivets' },
  { material_id: 28, level_min: 1, level_max: 15, rarity_types: ['uncommon', 'rare'], description: 'Hardened Leather Strip' },
  { material_id: 29, level_min: 1, level_max: 15, rarity_types: ['uncommon', 'rare'], description: 'Polished Stone' },
  { material_id: 30, level_min: 1, level_max: 15, rarity_types: ['uncommon', 'rare'], description: 'Silver Thread' },
  
  // Level 10-30 materials - gate rare/epic outputs in moderate recipes
  { material_id: 34, level_min: 10, level_max: 30, rarity_types: ['rare', 'epic'], description: 'Tempered Steel Bar' },
  { material_id: 36, level_min: 10, level_max: 30, rarity_types: ['rare', 'epic'], description: 'Thick Hide' },
  { material_id: 31, level_min: 10, level_max: 30, rarity_types: ['rare', 'epic'], description: 'Blessed Oak' },
  { material_id: 42, level_min: 10, level_max: 30, rarity_types: ['rare', 'epic'], description: 'Enchanted Ink' },
  { material_id: 32, level_min: 10, level_max: 30, rarity_types: ['rare', 'epic'], description: 'Moonstone Shard' },
  { material_id: 33, level_min: 10, level_max: 30, rarity_types: ['rare', 'epic'], description: 'Alchemical Resin' },
  
  // Level 25-50 materials - gate epic/legendary outputs in advanced recipes
  { material_id: 41, level_min: 25, level_max: 60, rarity_types: ['epic', 'legendary'], description: 'Titanium Ore' },
  { material_id: 37, level_min: 25, level_max: 60, rarity_types: ['epic', 'legendary'], description: 'Phoenix Feather' },
  { material_id: 38, level_min: 25, level_max: 60, rarity_types: ['epic', 'legendary'], description: 'Void Crystal' },
  { material_id: 39, level_min: 25, level_max: 60, rarity_types: ['epic', 'legendary'], description: 'Essence of Fire' },
  { material_id: 40, level_min: 25, level_max: 60, rarity_types: ['epic', 'legendary'], description: 'Runestone Fragment' },
  { material_id: 43, level_min: 25, level_max: 60, rarity_types: ['epic', 'legendary'], description: 'Celestial Fabric' },
  { material_id: 44, level_min: 25, level_max: 60, rarity_types: ['epic', 'legendary'], description: 'Demon Horn' },
  { material_id: 45, level_min: 25, level_max: 60, rarity_types: ['epic', 'legendary'], description: 'Prismatic Gem' },
  { material_id: 46, level_min: 25, level_max: 60, rarity_types: ['epic', 'legendary'], description: 'Essence of Ice' },
  { material_id: 47, level_min: 25, level_max: 60, rarity_types: ['epic', 'legendary'], description: 'Living Vine' },
];

let gatesAdded = 0;

for (const gate of materialGates) {
  // Find outputs in the appropriate level range that match the target rarities
  // and don't already have a rare material requirement
  const outputs = await turso.execute({
    sql: `
      SELECT ro.id, ro.recipe_group_id, rg.name as recipe_name, i.name as item_name, i.rarity
      FROM recipe_outputs ro
      JOIN recipe_groups rg ON ro.recipe_group_id = rg.id
      JOIN items i ON ro.item_id = i.id
      WHERE rg.min_level >= ? 
        AND rg.min_level <= ?
        AND i.rarity IN (${gate.rarity_types.map(() => '?').join(',')})
        AND ro.requires_rare_material_id IS NULL
        AND ro.is_named = 0
      LIMIT 3
    `,
    args: [gate.level_min, gate.level_max, ...gate.rarity_types]
  });
  
  // Update these outputs to require the special material
  for (const output of outputs.rows) {
    await turso.execute({
      sql: `UPDATE recipe_outputs SET requires_rare_material_id = ? WHERE id = ?`,
      args: [gate.material_id, output.id]
    });
    
    console.log(`✓ ${gate.description} → ${output.item_name} (${output.rarity}) in ${output.recipe_name}`);
    gatesAdded++;
  }
}

console.log(`\n✓ Added ${gatesAdded} material gates to rare outputs\n`);

// Step 3: Show summary
console.log('Summary:');
console.log(`  - Removed ${deleteResult.rowsAffected} incorrect required material entries`);
console.log(`  - Added ${gatesAdded} special material gates to rare outputs`);
console.log('\nSpecial materials are now OPTIONAL and unlock better crafting outcomes!');

// Verify the changes
const verification = await turso.execute(`
  SELECT 
    cm.name as material,
    COUNT(DISTINCT ro.id) as gated_outputs
  FROM crafting_materials cm
  LEFT JOIN recipe_outputs ro ON cm.id = ro.requires_rare_material_id
  WHERE cm.id IN (${specialMaterialIds.join(',')})
  GROUP BY cm.id, cm.name
  ORDER BY cm.id
`);

console.log('\nMaterial Usage Verification:');
verification.rows.forEach(row => {
  console.log(`  ${row.material}: gates ${row.gated_outputs} outputs`);
});
