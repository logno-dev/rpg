import { createClient } from '@libsql/client';
import 'dotenv/config';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log('Analyzing Recipe Group Output Distribution\n');
console.log('='.repeat(80));

// Get all recipe groups with their outputs
const result = await turso.execute(`
  SELECT 
    rg.id,
    rg.name,
    rg.min_level,
    rg.max_level,
    rg.category,
    COUNT(ro.id) as total_outputs,
    SUM(CASE WHEN ro.requires_rare_material_id IS NOT NULL THEN 1 ELSE 0 END) as special_outputs
  FROM recipe_groups rg
  LEFT JOIN recipe_outputs ro ON rg.id = ro.recipe_group_id
  GROUP BY rg.id
  ORDER BY rg.min_level, rg.name
`);

// Define target ratios by level tier
const TARGET_RATIOS = {
  simple: { min: 1, max: 15, ratio: 0.1 },      // 10% special (1/10)
  moderate: { min: 10, max: 30, ratio: 0.4 },   // 40% special (4/10)
  advanced: { min: 25, max: 50, ratio: 0.6 },   // 60% special (6/10)
  special: { min: 10, max: 60, ratio: 0.5 }     // 50% special for dual-wield/2H
};

// Categorize groups
const categories = {
  noOutputs: [],
  noSpecial: [],
  tooFewSpecial: [],
  tooManySpecial: [],
  balanced: []
};

console.log('\nDETAILED ANALYSIS:\n');

result.rows.forEach((row) => {
  const tier = row.min_level <= 15 ? 'simple' : row.min_level <= 30 ? 'moderate' : 'advanced';
  const isSpecialWeapon = ['Dual Daggers', 'Dual Swords', 'Greataxe', 'Greatsword'].includes(row.name);
  const targetRatio = isSpecialWeapon ? TARGET_RATIOS.special.ratio : TARGET_RATIOS[tier].ratio;
  
  const total = Number(row.total_outputs);
  const special = Number(row.special_outputs);
  const currentRatio = total > 0 ? special / total : 0;
  const targetSpecial = Math.ceil(total * targetRatio);
  const missing = targetSpecial - special;
  
  let status = '✓';
  let category = 'balanced';
  
  if (total === 0) {
    status = '✗ NO OUTPUTS';
    category = 'noOutputs';
  } else if (special === 0) {
    status = '✗ NO SPECIAL';
    category = 'noSpecial';
  } else if (missing > 0) {
    status = `⚠ NEED ${missing} MORE`;
    category = 'tooFewSpecial';
  } else if (missing < -1) {
    status = `⚠ ${Math.abs(missing)} TOO MANY`;
    category = 'tooManySpecial';
  }
  
  categories[category].push({ ...row, tier, targetRatio, currentRatio, targetSpecial, missing });
  
  console.log(`${status.padEnd(20)} ${row.name.padEnd(35)} Lv${row.min_level}-${row.max_level} ${total} outputs (${special} special, target: ${targetSpecial})`);
});

console.log('\n' + '='.repeat(80));
console.log('\nSUMMARY BY CATEGORY:\n');

console.log(`No Outputs (${categories.noOutputs.length}):`);
categories.noOutputs.forEach(g => console.log(`  - ${g.name}`));

console.log(`\nNo Special Outputs (${categories.noSpecial.length}):`);
categories.noSpecial.forEach(g => {
  console.log(`  - ${g.name} (Lv${g.min_level}-${g.max_level}): ${g.total_outputs} outputs, need ${g.targetSpecial} special`);
});

console.log(`\nToo Few Special Outputs (${categories.tooFewSpecial.length}):`);
categories.tooFewSpecial.forEach(g => {
  console.log(`  - ${g.name} (Lv${g.min_level}-${g.max_level}): ${g.special_outputs}/${g.total_outputs} special, need ${g.missing} more`);
});

console.log(`\nToo Many Special Outputs (${categories.tooManySpecial.length}):`);
categories.tooManySpecial.forEach(g => {
  console.log(`  - ${g.name} (Lv${g.min_level}-${g.max_level}): ${g.special_outputs}/${g.total_outputs} special, ${Math.abs(g.missing)} too many`);
});

console.log(`\nBalanced (${categories.balanced.length}):`);
console.log(`  Groups with appropriate special output ratios`);

console.log('\n' + '='.repeat(80));
console.log('\nRECOMMENDATIONS:\n');

console.log('1. PRIORITY: Add special outputs to groups with none');
console.log(`   ${categories.noSpecial.length} groups need at least 1 special output each\n`);

console.log('2. Add more special outputs to underserved groups');
console.log(`   ${categories.tooFewSpecial.length} groups need additional special outputs\n`);

console.log('3. Consider redistributing gates from over-served groups');
console.log(`   ${categories.tooManySpecial.length} groups have too many special outputs\n`);

// Calculate totals needed
let totalNeeded = 0;
categories.noSpecial.forEach(g => totalNeeded += g.targetSpecial);
categories.tooFewSpecial.forEach(g => totalNeeded += g.missing);

console.log(`Total additional special outputs needed: ${totalNeeded}`);
console.log(`Available to redistribute: ${categories.tooManySpecial.reduce((sum, g) => sum + Math.abs(g.missing), 0)}`);
