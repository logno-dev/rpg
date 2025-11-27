#!/usr/bin/env node
import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnv() {
  try {
    const envPath = join(__dirname, '..', '..', '.env');
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
  url: process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:local.db',
  authToken: process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN,
});

console.log('Fixing crafting output weight system...\n');
console.log('New system: Cubic curve that strongly rewards masterwork quality\n');

// Get all non-named recipe outputs grouped by recipe_group_id
const outputsResult = await db.execute(`
  SELECT ro.*, i.required_level, rg.name as recipe_name
  FROM recipe_outputs ro
  JOIN items i ON ro.item_id = i.id
  JOIN recipe_groups rg ON ro.recipe_group_id = rg.id
  WHERE ro.is_named = 0
  ORDER BY ro.recipe_group_id, ro.min_profession_level
`);

const outputs = outputsResult.rows;

// Group by recipe_group_id
const byGroup = {};
outputs.forEach(output => {
  if (!byGroup[output.recipe_group_id]) {
    byGroup[output.recipe_group_id] = [];
  }
  byGroup[output.recipe_group_id].push(output);
});

let updates = 0;

// New weight system (percentage-based with CUBIC curve):
// - Use position as percentage: 0.0 (first) to 1.0 (last)
// - Apply CUBIC transformation: position³
// - base_weight = 15 + (position³ × 185) → range 15-200
// - quality_bonus = 15 + (position³ × 785) → range 15-800
// 
// Results at masterwork quality:
// - 5 outputs: ~60% chance for highest tier
// - 10 outputs: ~33% chance for highest tier
// - 17 outputs: ~20% chance for highest tier
//
// This strongly rewards skilled crafting while still allowing variety

for (const [, items] of Object.entries(byGroup)) {
  if (items.length === 0) continue;
  
  console.log(`${items[0].recipe_name} (${items.length} outputs):`);
  
  // Sort by min_profession_level to assign weights
  items.sort((a, b) => a.min_profession_level - b.min_profession_level);
  
  for (const [index, item] of items.entries()) {
    const position = items.length === 1 ? 1.0 : index / (items.length - 1);
    const posCubed = position * position * position;
    
    const newBaseWeight = Math.round(15 + (posCubed * 185));
    const newQualityBonus = Math.round(15 + (posCubed * 785));
    const newWeightPerLevel = 0; // Remove per-level system
    
    console.log(`  Lv${String(item.min_profession_level).padStart(2)} → base:${String(newBaseWeight).padStart(3)}, quality:${String(newQualityBonus).padStart(3)}`);
    
    await db.execute({
      sql: `UPDATE recipe_outputs
            SET base_weight = ?,
                quality_bonus_weight = ?,
                weight_per_level = ?
            WHERE id = ?`,
      args: [newBaseWeight, newQualityBonus, newWeightPerLevel, item.id]
    });
    
    updates++;
  }
  console.log('');
}

console.log(`✓ Updated ${updates} recipe outputs\n`);

// Show example for Moderate Chain Chest
console.log('Example: Moderate Chain Chest at profession level 11');
const exampleResult = await db.execute(`
  SELECT ro.*, i.name as item_name, i.required_level
  FROM recipe_outputs ro
  JOIN recipe_groups rg ON ro.recipe_group_id = rg.id
  JOIN items i ON ro.item_id = i.id
  WHERE rg.name = 'Moderate Chain Chest'
  AND ro.is_named = 0
  ORDER BY ro.min_profession_level
`);

const example = exampleResult.rows;

if (example.length > 0) {
  console.log('\nCommon quality:');
  let total = example.reduce((sum, o) => sum + o.base_weight, 0);
  example.forEach(o => {
    const pct = ((o.base_weight / total) * 100).toFixed(1);
    console.log(`  ${String(o.item_name).padEnd(30)} ${String(pct).padStart(5)}%`);
  });
  
  console.log('\nMasterwork quality:');
  total = example.reduce((sum, o) => sum + o.base_weight + o.quality_bonus_weight, 0);
  example.forEach(o => {
    const weight = o.base_weight + o.quality_bonus_weight;
    const pct = ((weight / total) * 100).toFixed(1);
    console.log(`  ${String(o.item_name).padEnd(30)} ${String(pct).padStart(5)}%`);
  });
}

process.exit(0);
