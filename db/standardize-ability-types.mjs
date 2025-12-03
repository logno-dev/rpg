#!/usr/bin/env node
import Database from 'libsql';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, '..', 'game.db'));

console.log('=== Standardizing Ability Types and Categories ===\n');

// Show current distribution
console.log('Current TYPE distribution:');
const currentTypes = db.prepare('SELECT type, COUNT(*) as count FROM abilities GROUP BY type ORDER BY count DESC').all();
currentTypes.forEach(row => console.log(`  ${row.type}: ${row.count}`));

console.log('\nCurrent CATEGORY distribution:');
const currentCategories = db.prepare('SELECT category, COUNT(*) as count FROM abilities GROUP BY category ORDER BY count DESC').all();
currentCategories.forEach(row => console.log(`  ${row.category}: ${row.count}`));

console.log('\n--- Standardization Plan ---');
console.log('TYPE values should be: damage, heal, buff, debuff, utility, passive');
console.log('CATEGORY values should be: combat, passive, crafting\n');

// Standardize TYPE field
// Map old values to new values
const typeMapping = {
  'ability': 'damage',      // Generic abilities -> damage (most common)
  'active': 'damage',       // Active abilities -> damage (most common)
  'magical': 'damage',      // Magical abilities -> damage
  'spell': 'damage',        // Spells -> damage
  'buff': 'buff',           // Keep buff
  'damage': 'damage',       // Keep damage
  // heal, debuff, utility, passive would stay as-is if they exist
};

console.log('Updating TYPE field...');
for (const [oldType, newType] of Object.entries(typeMapping)) {
  const result = db.prepare('UPDATE abilities SET type = ? WHERE type = ?').run(newType, oldType);
  if (result.changes > 0) {
    console.log(`  Changed ${result.changes} abilities from type '${oldType}' to '${newType}'`);
  }
}

// Standardize CATEGORY field
// Map old values to new values
const categoryMapping = {
  'buff': 'combat',         // Buffs are combat abilities
  'damage': 'combat',       // Damage abilities are combat
  'defense': 'combat',      // Defense abilities are combat
  'heal': 'combat',         // Healing abilities are combat
  'magic': 'combat',        // Magic abilities are combat
  'combat': 'combat',       // Keep combat
  // passive, crafting would stay as-is if they exist
};

console.log('\nUpdating CATEGORY field...');
for (const [oldCategory, newCategory] of Object.entries(categoryMapping)) {
  const result = db.prepare('UPDATE abilities SET category = ? WHERE category = ?').run(newCategory, oldCategory);
  if (result.changes > 0) {
    console.log(`  Changed ${result.changes} abilities from category '${oldCategory}' to '${newCategory}'`);
  }
}

// Now let's intelligently set TYPE based on ability properties
console.log('\n--- Intelligent TYPE Detection ---');

// Abilities with ability_effects that are heal -> set type to heal
const healAbilities = db.prepare(`
  SELECT DISTINCT a.id, a.name, a.type
  FROM abilities a
  JOIN ability_effects ae ON a.id = ae.ability_id
  WHERE ae.effect_type = 'heal'
`).all();

if (healAbilities.length > 0) {
  console.log(`\nFound ${healAbilities.length} abilities with heal effects:`);
  healAbilities.forEach(ability => {
    db.prepare('UPDATE abilities SET type = ? WHERE id = ?').run('heal', ability.id);
    console.log(`  ${ability.name} (${ability.type} -> heal)`);
  });
}

// Abilities with ability_effects that are buff -> set type to buff
const buffAbilities = db.prepare(`
  SELECT DISTINCT a.id, a.name, a.type
  FROM abilities a
  JOIN ability_effects ae ON a.id = ae.ability_id
  WHERE ae.effect_type = 'buff'
  AND NOT EXISTS (
    SELECT 1 FROM ability_effects ae2 
    WHERE ae2.ability_id = a.id 
    AND ae2.effect_type IN ('damage', 'heal')
  )
`).all();

if (buffAbilities.length > 0) {
  console.log(`\nFound ${buffAbilities.length} abilities with ONLY buff effects:`);
  buffAbilities.forEach(ability => {
    db.prepare('UPDATE abilities SET type = ? WHERE id = ?').run('buff', ability.id);
    console.log(`  ${ability.name} (${ability.type} -> buff)`);
  });
}

// Abilities with ability_effects that are debuff -> set type to debuff
const debuffAbilities = db.prepare(`
  SELECT DISTINCT a.id, a.name, a.type
  FROM abilities a
  JOIN ability_effects ae ON a.id = ae.ability_id
  WHERE ae.effect_type = 'debuff'
  AND NOT EXISTS (
    SELECT 1 FROM ability_effects ae2 
    WHERE ae2.ability_id = a.id 
    AND ae2.effect_type IN ('damage', 'heal', 'buff')
  )
`).all();

if (debuffAbilities.length > 0) {
  console.log(`\nFound ${debuffAbilities.length} abilities with ONLY debuff effects:`);
  debuffAbilities.forEach(ability => {
    db.prepare('UPDATE abilities SET type = ? WHERE id = ?').run('debuff', ability.id);
    console.log(`  ${ability.name} (${ability.type} -> debuff)`);
  });
}

// Abilities with ability_effects that are damage -> set type to damage
const damageAbilities = db.prepare(`
  SELECT DISTINCT a.id, a.name, a.type
  FROM abilities a
  JOIN ability_effects ae ON a.id = ae.ability_id
  WHERE ae.effect_type IN ('damage', 'dot')
  AND a.type NOT IN ('heal', 'buff', 'debuff')
`).all();

if (damageAbilities.length > 0) {
  console.log(`\nFound ${damageAbilities.length} abilities with damage effects:`);
  damageAbilities.forEach(ability => {
    db.prepare('UPDATE abilities SET type = ? WHERE id = ?').run('damage', ability.id);
    console.log(`  ${ability.name} (${ability.type} -> damage)`);
  });
}

// Show final distribution
console.log('\n=== Final Distribution ===\n');
console.log('TYPE distribution:');
const finalTypes = db.prepare('SELECT type, COUNT(*) as count FROM abilities GROUP BY type ORDER BY count DESC').all();
finalTypes.forEach(row => console.log(`  ${row.type}: ${row.count}`));

console.log('\nCATEGORY distribution:');
const finalCategories = db.prepare('SELECT category, COUNT(*) as count FROM abilities GROUP BY category ORDER BY count DESC').all();
finalCategories.forEach(row => console.log(`  ${row.category}: ${row.count}`));

console.log('\n✅ Standardization complete!');
db.close();
