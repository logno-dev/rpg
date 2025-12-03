import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function query(sql) {
  const { stdout } = await execAsync(`turso db shell rpg "${sql.replace(/"/g, '\\"')}"`);
  return stdout;
}

console.log('Auditing Recipe Groups vs Item Levels');
console.log('================================================================================\n');

console.log('KEY CHANGE:');
console.log('  Profession level NOW EQUALS character level (changed from char_level / 2)');
console.log('  Recipe min_level = profession level = character level required\n');

// Get all recipe groups with their outputs
const recipeGroupsData = await query(`
  SELECT 
    rg.id,
    rg.name,
    rg.profession_type,
    rg.category,
    rg.min_level as recipe_min_level,
    rg.max_level as recipe_max_level
  FROM recipe_groups rg
  ORDER BY rg.min_level, rg.name
`);

// Parse the turso output (it's in a table format)
const recipeGroups = [];
const lines = recipeGroupsData.trim().split('\n');
for (let i = 2; i < lines.length; i++) { // Skip header lines
  const line = lines[i].trim();
  if (!line || line.startsWith('─') || line.startsWith('│')) continue;
  const match = line.match(/│\s*(\d+)\s*│\s*([^│]+?)\s*│\s*([^│]+?)\s*│\s*([^│]+?)\s*│\s*(\d+)\s*│\s*(\d+)\s*│/);
  if (match) {
    recipeGroups.push({
      id: parseInt(match[1]),
      name: match[2].trim(),
      profession_type: match[3].trim(),
      category: match[4].trim(),
      min_level: parseInt(match[5]),
      max_level: parseInt(match[6])
    });
  }
}

async function getAllOutputs(recipeGroupId) {
  const outputsData = await query(`
    SELECT 
      ro.recipe_group_id,
      ro.item_id,
      ro.min_profession_level,
      ro.is_named,
      ro.requires_rare_material_id,
      i.name as item_name,
      i.required_level as item_level,
      i.rarity,
      cm.name as rare_material_name
    FROM recipe_outputs ro
    JOIN items i ON ro.item_id = i.id
    LEFT JOIN crafting_materials cm ON ro.requires_rare_material_id = cm.id
    WHERE ro.recipe_group_id = ${recipeGroupId}
    ORDER BY ro.min_profession_level, i.required_level
  `);
  
  const outputs = [];
  const lines = outputsData.trim().split('\n');
  for (let i = 2; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('─') || line.startsWith('│')) continue;
    const parts = line.split('│').filter(p => p.trim()).map(p => p.trim());
    if (parts.length >= 7) {
      outputs.push({
        item_name: parts[5],
        item_level: parseInt(parts[6]),
        requires_rare_material_id: parts[4] !== '' ? parseInt(parts[4]) : null,
        rare_material_name: parts[8] || null
      });
    }
  }
  return outputs;
}

console.log('================================================================================');
console.log('AUDIT RESULTS\n');

let totalRecipes = 0;
let totalOutputs = 0;
let problemRecipes = [];
let problemOutputs = [];

for (const recipe of recipeGroups) {
  totalRecipes++;
  const outputs = await getAllOutputs(recipe.id);
  
  if (outputs.length === 0) {
    console.log(`⚠️  ${recipe.name} (Lv ${recipe.min_level}-${recipe.max_level})`);
    console.log(`    NO OUTPUTS DEFINED!\n`);
    problemRecipes.push({
      recipe: recipe.name,
      level: recipe.min_level,
      issue: 'No outputs'
    });
    continue;
  }

  totalOutputs += outputs.length;
  
  // Check if any outputs are problematic
  const minItemLevel = Math.min(...outputs.map(o => o.item_level));
  const maxItemLevel = Math.max(...outputs.map(o => o.item_level));
  
  // Recipe min_level should align with output item levels (±5 levels is acceptable)
  const hasProblems = outputs.some(o => {
    const levelDiff = Math.abs(o.item_level - recipe.min_level);
    return levelDiff > 5;
  });
  
  if (hasProblems) {
    console.log(`❌ ${recipe.name} (Recipe Lv ${recipe.min_level}-${recipe.max_level})`);
    console.log(`   Item Level Range: ${minItemLevel}-${maxItemLevel}\n`);
    
    // Show problematic outputs
    for (const output of outputs) {
      const levelDiff = output.item_level - recipe.min_level;
      if (Math.abs(levelDiff) > 5) {
        const status = levelDiff > 5 ? '⚠️  TOO HIGH' : '⚠️  TOO LOW';
        const special = output.requires_rare_material_id ? ` [${output.rare_material_name}]` : '';
        console.log(`   ${status}: ${output.item_name} (Lv ${output.item_level}, diff: ${levelDiff > 0 ? '+' : ''}${levelDiff})${special}`);
        
        problemOutputs.push({
          recipe: recipe.name,
          recipeLevel: recipe.min_level,
          item: output.item_name,
          itemLevel: output.item_level,
          diff: levelDiff,
          isSpecial: !!output.requires_rare_material_id,
          material: output.rare_material_name
        });
      }
    }
    console.log('');
  }
}

console.log('================================================================================');
console.log('SUMMARY\n');

console.log(`Total Recipe Groups: ${totalRecipes}`);
console.log(`Total Outputs: ${totalOutputs}`);
console.log(`Recipes with Problems: ${problemRecipes.length + (problemOutputs.length > 0 ? new Set(problemOutputs.map(p => p.recipe)).size : 0)}`);
console.log(`Problematic Outputs: ${problemOutputs.length}\n`);

if (problemOutputs.length > 0) {
  console.log('================================================================================');
  console.log('RECOMMENDATIONS\n');
  
  // Group by severity
  const tooLow = problemOutputs.filter(p => p.diff < -5);
  const tooHigh = problemOutputs.filter(p => p.diff > 5);
  
  console.log(`Items TOO LOW (${tooLow.length}): Item level is much lower than recipe level`);
  console.log('  Fix: Either move these outputs to lower-level recipes OR increase item required_level\n');
  
  console.log(`Items TOO HIGH (${tooHigh.length}): Item level is much higher than recipe level`);
  console.log('  Fix: Either move these outputs to higher-level recipes OR decrease item required_level\n');
  
  // Show suggested recipe tier mapping
  console.log('================================================================================');
  console.log('SUGGESTED RECIPE TIER STRUCTURE:\n');
  console.log('Simple recipes (min_level 1-15):   Craft items level 1-15');
  console.log('Moderate recipes (min_level 10-30): Craft items level 10-30');
  console.log('Advanced recipes (min_level 25-50): Craft items level 25-50\n');
  
  console.log('SPECIAL OUTPUTS: Should be 0-10 levels ABOVE recipe min_level');
  console.log('  (Player unlocks recipe, farms material, crafts slightly better gear)\n');
}

// Check current recipe tier distribution
console.log('================================================================================');
console.log('CURRENT RECIPE TIER DISTRIBUTION:\n');

const tierStats = {
  'Simple (1-15)': recipeGroups.filter(r => r.min_level >= 1 && r.min_level <= 15).length,
  'Moderate (10-30)': recipeGroups.filter(r => r.min_level > 15 && r.min_level <= 30).length,
  'Advanced (25-50)': recipeGroups.filter(r => r.min_level > 30).length
};

for (const [tier, count] of Object.entries(tierStats)) {
  console.log(`${tier}: ${count} recipes`);
}

console.log('\n================================================================================');

// Detailed breakdown by profession type
console.log('BREAKDOWN BY PROFESSION TYPE:\n');

const professions = [...new Set(recipeGroups.map(r => r.profession_type))];
for (const prof of professions) {
  const profRecipes = recipeGroups.filter(r => r.profession_type === prof);
  const profProblems = problemOutputs.filter(p => {
    const recipe = recipeGroups.find(r => r.name === p.recipe);
    return recipe && recipe.profession_type === prof;
  });
  
  console.log(`${prof}: ${profRecipes.length} recipes, ${profProblems.length} problem outputs`);
}
