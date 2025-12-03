import { createClient } from '@libsql/client';
import 'dotenv/config';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log('Analyzing Item Level vs Recipe Level Mismatches\n');
console.log('='.repeat(80));

// Get all special outputs with their levels
const result = await turso.execute(`
  SELECT 
    rg.id as recipe_group_id,
    rg.name as recipe_group,
    rg.min_level as recipe_prof_level,
    rg.max_level as recipe_max_prof,
    i.id as item_id,
    i.name as item_name,
    i.required_level as item_char_level,
    cm.name as material_name
  FROM recipe_groups rg
  JOIN recipe_outputs ro ON rg.id = ro.recipe_group_id
  JOIN items i ON ro.item_id = i.id
  LEFT JOIN crafting_materials cm ON ro.requires_rare_material_id = cm.id
  WHERE ro.requires_rare_material_id IS NOT NULL
  ORDER BY rg.min_level, i.required_level
`);

console.log('\nKEY INSIGHT:');
console.log('  Recipe min_level = PROFESSION level required');
console.log('  Profession level = Character level / 2');
console.log('  So recipe min_level 10 = character level 20\n');

const problems = [];

result.rows.forEach(row => {
  const recipeProfLevel = row.recipe_prof_level;
  const recipeCharLevel = recipeProfLevel * 2; // Character level needed
  const itemCharLevel = row.item_char_level;
  const maxProfLevel = row.recipe_max_prof;
  const maxCharLevel = maxProfLevel * 2;
  
  // Problem 1: Item level is too LOW (underpowered when craftable)
  const levelGap = recipeCharLevel - itemCharLevel;
  
  // Problem 2: Item level is too HIGH (can't equip what you craft)
  const exceedsMax = itemCharLevel > maxCharLevel;
  
  if (levelGap >= 5 || exceedsMax) {
    problems.push({
      recipe: row.recipe_group,
      recipeProfLevel,
      recipeCharLevel,
      maxCharLevel,
      item: row.item_name,
      itemLevel: itemCharLevel,
      material: row.material_name,
      levelGap,
      exceedsMax,
      severity: exceedsMax ? 'CRITICAL' : levelGap >= 10 ? 'HIGH' : 'MEDIUM'
    });
  }
});

// Sort by severity
const critical = problems.filter(p => p.severity === 'CRITICAL');
const high = problems.filter(p => p.severity === 'HIGH');
const medium = problems.filter(p => p.severity === 'MEDIUM');

console.log(`\nFOUND ${problems.length} PROBLEMATIC SPECIAL OUTPUTS:\n`);

if (critical.length > 0) {
  console.log('=== CRITICAL: Item level EXCEEDS recipe max ===');
  console.log('(Player crafts item but CANNOT EQUIP IT!)\n');
  critical.forEach(p => {
    console.log(`✗ ${p.recipe.padEnd(30)} (prof ${p.recipeProfLevel}-${p.maxProfLevel / 2}) → char ${p.recipeCharLevel}-${p.maxCharLevel}`);
    console.log(`  Crafts: ${p.item} (requires level ${p.itemLevel})`);
    console.log(`  Material: ${p.material}`);
    console.log(`  Problem: Item requires level ${p.itemLevel} but max craftable at ${p.maxCharLevel}!\n`);
  });
}

if (high.length > 0) {
  console.log('=== HIGH: Item level is 10+ levels BELOW recipe requirement ===');
  console.log('(Item is severely underpowered by the time player can craft it)\n');
  high.forEach(p => {
    console.log(`⚠ ${p.recipe.padEnd(30)} (needs char lv ${p.recipeCharLevel})`);
    console.log(`  Crafts: ${p.item} (level ${p.itemLevel} item)`);
    console.log(`  Material: ${p.material}`);
    console.log(`  Problem: ${p.levelGap} levels underpowered\n`);
  });
}

if (medium.length > 0) {
  console.log('=== MEDIUM: Item level is 5-9 levels BELOW recipe requirement ===');
  console.log('(Item is noticeably underpowered)\n');
  medium.forEach(p => {
    console.log(`• ${p.recipe.padEnd(30)} (needs char lv ${p.recipeCharLevel})`);
    console.log(`  Crafts: ${p.item} (level ${p.itemLevel} item)`);
    console.log(`  Material: ${p.material}`);
    console.log(`  Problem: ${p.levelGap} levels underpowered\n`);
  });
}

console.log('='.repeat(80));
console.log('\nRECOMMENDATION:');
console.log('  Special outputs should have item levels close to recipe CHARACTER level requirement');
console.log('  Formula: item.required_level should be near recipe.min_level * 2');
console.log('  Acceptable range: ±3 levels\n');

console.log('SUMMARY:');
console.log(`  Total special outputs: ${result.rows.length}`);
console.log(`  Critical problems: ${critical.length}`);
console.log(`  High priority: ${high.length}`);
console.log(`  Medium priority: ${medium.length}`);
console.log(`  Acceptable: ${result.rows.length - problems.length}`);
