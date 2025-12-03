import { createClient } from '@libsql/client';
import 'dotenv/config';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log('Redistributing Special Material Gates\n');
console.log('='.repeat(80));

// Step 1: Clear all existing gates
console.log('\nStep 1: Clearing existing rare material gates...');
await turso.execute(`UPDATE recipe_outputs SET requires_rare_material_id = NULL WHERE requires_rare_material_id >= 28`);
console.log('✓ Cleared all special material gates\n');

// Step 2: Get all recipe groups and their outputs
const groups = await turso.execute(`
  SELECT 
    rg.id,
    rg.name,
    rg.min_level,
    rg.max_level,
    ro.id as output_id,
    i.name as item_name,
    i.rarity,
    CASE i.rarity
      WHEN 'common' THEN 1
      WHEN 'uncommon' THEN 2  
      WHEN 'rare' THEN 3
      WHEN 'epic' THEN 4
      WHEN 'legendary' THEN 5
    END as rarity_priority
  FROM recipe_groups rg
  JOIN recipe_outputs ro ON rg.id = ro.recipe_group_id
  JOIN items i ON ro.item_id = i.id
  WHERE ro.is_named = 0
  ORDER BY rg.id, rarity_priority DESC, i.name
`);

// Get available special materials
const materials = [
  // Level 1-15 (uncommon)
  { id: 28, name: 'Hardened Leather Strip', min: 1, max: 15 },
  { id: 29, name: 'Polished Stone', min: 1, max: 15 },
  { id: 30, name: 'Silver Thread', min: 1, max: 15 },
  { id: 35, name: 'Iron Rivets', min: 1, max: 15 },
  
  // Level 10-30 (rare)
  { id: 31, name: 'Blessed Oak', min: 10, max: 30 },
  { id: 32, name: 'Moonstone Shard', min: 10, max: 30 },
  { id: 33, name: 'Alchemical Resin', min: 10, max: 30 },
  { id: 34, name: 'Tempered Steel Bar', min: 10, max: 30 },
  { id: 36, name: 'Thick Hide', min: 10, max: 30 },
  { id: 42, name: 'Enchanted Ink', min: 10, max: 30 },
  
  // Level 25+ (epic)
  { id: 37, name: 'Phoenix Feather', min: 25, max: 60 },
  { id: 38, name: 'Void Crystal', min: 25, max: 60 },
  { id: 39, name: 'Essence of Fire', min: 25, max: 60 },
  { id: 40, name: 'Runestone Fragment', min: 25, max: 60 },
  { id: 41, name: 'Titanium Ore', min: 25, max: 60 },
  { id: 43, name: 'Celestial Fabric', min: 25, max: 60 },
  { id: 44, name: 'Demon Horn', min: 25, max: 60 },
  { id: 45, name: 'Prismatic Gem', min: 25, max: 60 },
  { id: 46, name: 'Essence of Ice', min: 25, max: 60 },
  { id: 47, name: 'Living Vine', min: 25, max: 60 },
];

// Group outputs by recipe group
const outputsByGroup = {};
groups.rows.forEach(row => {
  if (!outputsByGroup[row.id]) {
    outputsByGroup[row.id] = {
      id: row.id,
      name: row.name,
      min_level: row.min_level,
      max_level: row.max_level,
      outputs: []
    };
  }
  outputsByGroup[row.id].outputs.push(row);
});

// Target ratios
const getTargetRatio = (minLevel) => {
  if (minLevel <= 15) return 0.10; // 10% for simple
  if (minLevel <= 30) return 0.30; // 30% for moderate (was 40%, but we don't have enough materials)
  return 0.50; // 50% for advanced (was 60%)
};

console.log('Step 2: Assigning gates based on target ratios...\n');

let totalAssigned = 0;
const materialUsage = {};
materials.forEach(m => materialUsage[m.id] = 0);

Object.values(outputsByGroup).forEach(group => {
  const targetCount = Math.max(1, Math.ceil(group.outputs.length * getTargetRatio(group.min_level)));
  
  // Get materials appropriate for this level range
  const validMaterials = materials.filter(m => 
    m.min <= group.min_level && m.max >= group.min_level
  );
  
  // Rotate through materials to distribute evenly
  const sortedOutputs = [...group.outputs].slice(0, targetCount);
  
  sortedOutputs.forEach((output) => {
    // Pick material with least usage that fits level range
    const material = validMaterials.sort((a, b) => materialUsage[a.id] - materialUsage[b.id])[0];
    
    if (material) {
      turso.execute({
        sql: `UPDATE recipe_outputs SET requires_rare_material_id = ? WHERE id = ?`,
        args: [material.id, output.output_id]
      });
      
      materialUsage[material.id]++;
      totalAssigned++;
      
      console.log(`  ${group.name.padEnd(35)} ${output.item_name.padEnd(30)} → ${material.name}`);
    }
  });
});

console.log(`\n✓ Assigned ${totalAssigned} special material gates`);

console.log('\nMaterial Usage Distribution:');
materials.forEach(m => {
  console.log(`  ${m.name.padEnd(30)} used ${materialUsage[m.id]} times`);
});

console.log('\n' + '='.repeat(80));
console.log('COMPLETE! All recipe groups now have balanced special output distribution.');
