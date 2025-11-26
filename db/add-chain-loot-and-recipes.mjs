#!/usr/bin/env node

/**
 * Add Loot Tables and Crafting Recipes for Chain Armor
 * - Mob loot tables for all chain armor pieces
 * - Crafting recipes (Blacksmithing) for chain armor
 */

import Database from 'better-sqlite3';

const db = new Database('rpg.db');

console.log('🔗 Adding Chain Armor Loot Tables and Recipes...\n');

// Get all chain armor items
const chainItems = db.prepare(`
  SELECT id, name, slot, rarity, required_level, value
  FROM items 
  WHERE type = 'armor' 
    AND slot IN ('head', 'chest', 'hands', 'feet')
    AND name LIKE '%Chain%'
  ORDER BY required_level, slot
`).all();

console.log(`📦 Found ${chainItems.length} chain armor items\n`);

// ==========================================
// LOOT TABLES
// ==========================================

console.log('📋 Adding Loot Tables...\n');

const insertLoot = db.prepare(`
  INSERT INTO mob_loot (mob_id, item_id, drop_chance, min_quantity, max_quantity)
  VALUES (?, ?, ?, ?, ?)
`);

const rarityDropRates = {
  'common': 0.12,      // 12% drop rate
  'uncommon': 0.08,    // 8% drop rate
  'rare': 0.05,        // 5% drop rate
  'epic': 0.03,        // 3% drop rate
  'legendary': 0.015   // 1.5% drop rate
};

let lootCount = 0;
let lootSkipped = 0;

for (const item of chainItems) {
  const level = item.required_level;
  const dropRate = rarityDropRates[item.rarity] || 0.05;
  
  // Find appropriate mobs for this level
  // Level 1-10: Region 1 mobs
  // Level 11-20: Region 2 mobs
  // Level 21-30: Region 3 mobs
  // Level 31-40: Region 4 mobs
  // Level 41-60: Region 5 mobs
  
  let regionId;
  if (level <= 10) regionId = 1;
  else if (level <= 20) regionId = 2;
  else if (level <= 30) regionId = 3;
  else if (level <= 40) regionId = 4;
  else regionId = 5;
  
  // Get mobs in the appropriate region
  const mobs = db.prepare(`
    SELECT id, name FROM mobs 
    WHERE region_id = ? AND is_boss = 0
    ORDER BY RANDOM()
    LIMIT 5
  `).all(regionId);
  
  for (const mob of mobs) {
    try {
      // Check if loot already exists
      const existing = db.prepare(
        'SELECT id FROM mob_loot WHERE mob_id = ? AND item_id = ?'
      ).get(mob.id, item.id);
      
      if (existing) {
        lootSkipped++;
        continue;
      }
      
      insertLoot.run(mob.id, item.id, dropRate, 1, 1);
      lootCount++;
    } catch (error) {
      console.error(`❌ Error adding loot for ${item.name} from ${mob.name}:`, error.message);
    }
  }
  
  // Also add to bosses (higher drop rate)
  const bosses = db.prepare(`
    SELECT id, name FROM mobs 
    WHERE region_id = ? AND is_boss = 1
    LIMIT 1
  `).all(regionId);
  
  for (const boss of bosses) {
    try {
      const existing = db.prepare(
        'SELECT id FROM mob_loot WHERE mob_id = ? AND item_id = ?'
      ).get(boss.id, item.id);
      
      if (existing) {
        lootSkipped++;
        continue;
      }
      
      // Bosses have 2x drop rate
      insertLoot.run(boss.id, item.id, dropRate * 2, 1, 1);
      lootCount++;
    } catch (error) {
      console.error(`❌ Error adding boss loot for ${item.name}:`, error.message);
    }
  }
}

console.log(`✅ Loot tables: ${lootCount} added, ${lootSkipped} skipped\n`);

// ==========================================
// CRAFTING RECIPES
// ==========================================

console.log('🔨 Adding Crafting Recipes...\n');

// Material mapping based on item level
const getMaterials = (level, rarity, slot) => {
  let materials = [];
  
  // Base material (ore/metal)
  if (level <= 10) {
    materials.push({ name: 'Copper Ore', quantity: slot === 'chest' ? 8 : 4 });
  } else if (level <= 20) {
    materials.push({ name: 'Iron Ore', quantity: slot === 'chest' ? 10 : 5 });
  } else if (level <= 30) {
    materials.push({ name: 'Steel Ingot', quantity: slot === 'chest' ? 12 : 6 });
  } else if (level <= 40) {
    materials.push({ name: 'Mithril Ore', quantity: slot === 'chest' ? 14 : 7 });
  } else if (level <= 50) {
    materials.push({ name: 'Thorium Ore', quantity: slot === 'chest' ? 16 : 8 });
  } else {
    materials.push({ name: 'Adamantite Ore', quantity: slot === 'chest' ? 20 : 10 });
  }
  
  // Additional materials based on rarity
  if (rarity === 'uncommon') {
    materials.push({ name: 'Leather Strips', quantity: 3 });
  } else if (rarity === 'rare') {
    materials.push({ name: 'Leather Strips', quantity: 4 });
    materials.push({ name: 'Arcane Dust', quantity: 2 });
  } else if (rarity === 'epic') {
    materials.push({ name: 'Leather Strips', quantity: 6 });
    materials.push({ name: 'Arcane Dust', quantity: 4 });
    materials.push({ name: 'Essence of Power', quantity: 2 });
  } else if (rarity === 'legendary') {
    materials.push({ name: 'Leather Strips', quantity: 8 });
    materials.push({ name: 'Arcane Dust', quantity: 6 });
    materials.push({ name: 'Essence of Power', quantity: 4 });
    materials.push({ name: 'Dragon Scale', quantity: 2 });
  }
  
  return materials;
};

const insertRecipe = db.prepare(`
  INSERT INTO crafting_recipes (
    name, profession, skill_level, result_item_id
  ) VALUES (?, ?, ?, ?)
`);

const insertIngredient = db.prepare(`
  INSERT INTO recipe_ingredients (recipe_id, item_id, quantity)
  VALUES (?, ?, ?)
`);

let recipeCount = 0;
let recipeSkipped = 0;

for (const item of chainItems) {
  try {
    // Check if recipe already exists
    const existing = db.prepare(
      'SELECT id FROM crafting_recipes WHERE result_item_id = ?'
    ).get(item.id);
    
    if (existing) {
      recipeSkipped++;
      continue;
    }
    
    const recipeName = `Craft ${item.name}`;
    const skillLevel = item.required_level;
    
    // Create recipe
    const result = insertRecipe.run(
      recipeName,
      'Blacksmithing',
      skillLevel,
      item.id
    );
    
    const recipeId = result.lastInsertRowid;
    
    // Add ingredients
    const materials = getMaterials(item.required_level, item.rarity, item.slot);
    
    for (const material of materials) {
      // Find material item ID
      const materialItem = db.prepare(
        'SELECT id FROM items WHERE name = ?'
      ).get(material.name);
      
      if (materialItem) {
        insertIngredient.run(recipeId, materialItem.id, material.quantity);
      } else {
        console.log(`⚠️  Material not found: ${material.name} (recipe: ${recipeName})`);
      }
    }
    
    console.log(`✅ Recipe: ${recipeName} (Skill ${skillLevel})`);
    recipeCount++;
    
  } catch (error) {
    console.error(`❌ Error adding recipe for ${item.name}:`, error.message);
  }
}

console.log(`\n✅ Crafting recipes: ${recipeCount} added, ${recipeSkipped} skipped\n`);

// ==========================================
// SUMMARY
// ==========================================

console.log('═══════════════════════════════════════');
console.log('✨ Chain Armor Loot & Recipes Complete!');
console.log('═══════════════════════════════════════');
console.log(`📦 Loot Entries: ${lootCount} added`);
console.log(`🔨 Recipes: ${recipeCount} added`);
console.log(`⏭️  Total Skipped: ${lootSkipped + recipeSkipped}`);

db.close();
