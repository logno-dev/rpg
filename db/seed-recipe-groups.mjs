#!/usr/bin/env node
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'game.db'));

console.log('🔨 Seeding recipe groups system...\n');

// Helper function to create recipe group
function createRecipeGroup(name, description, profession, category, minLevel, maxLevel, materials) {
  const result = db.prepare(`
    INSERT INTO recipe_groups (name, description, profession_type, category, min_level, max_level, craft_time_seconds, base_experience)
    VALUES (?, ?, ?, ?, ?, ?, 12, ?)
  `).run(name, description, profession, category, minLevel, maxLevel, minLevel * 100);
  
  const groupId = result.lastInsertRowid;
  
  // Add material requirements
  for (const material of materials) {
    db.prepare(`
      INSERT INTO recipe_group_materials (recipe_group_id, material_id, quantity)
      VALUES (?, ?, ?)
    `).run(groupId, material.id, material.quantity);
  }
  
  return groupId;
}

// Helper function to add output to recipe group
function addRecipeOutput(groupId, itemId, minLevel, baseWeight, weightPerLevel, qualityBonus) {
  db.prepare(`
    INSERT INTO recipe_outputs (recipe_group_id, item_id, min_profession_level, base_weight, weight_per_level, quality_bonus_weight)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(groupId, itemId, minLevel, baseWeight, weightPerLevel, qualityBonus);
}

// Get material IDs
const ironOre = db.prepare("SELECT id FROM crafting_materials WHERE name = 'Iron Ore'").get();
const leather = db.prepare("SELECT id FROM crafting_materials WHERE name = 'Leather Scraps'").get();
const cloth = db.prepare("SELECT id FROM crafting_materials WHERE name = 'Linen Cloth'").get();
const wood = db.prepare("SELECT id FROM crafting_materials WHERE name = 'Rough Wood'").get();

if (!ironOre || !leather || !cloth || !wood) {
  console.error('❌ Required materials not found. Please seed materials first.');
  process.exit(1);
}

console.log('📋 Creating Blacksmithing Recipe Groups...');

// Simple Weapons (Level 1-15)
const simpleWeaponsGroup = createRecipeGroup(
  'Simple Weapon',
  'Craft basic weapons for new adventurers',
  'blacksmithing',
  'weapon',
  1,
  15,
  [{ id: ironOre.id, quantity: 3 }]
);

// Get some weapon items to add as outputs
const simpleWeapons = db.prepare(`
  SELECT id, name, level_requirement 
  FROM items 
  WHERE type = 'weapon' 
  AND slot IN ('main_hand', 'two_hand')
  AND level_requirement BETWEEN 1 AND 15
  ORDER BY level_requirement
  LIMIT 10
`).all();

console.log(`  Found ${simpleWeapons.length} simple weapons`);

simpleWeapons.forEach(weapon => {
  // Lower level weapons: high base weight, low scaling
  // Higher level weapons: low base weight, high scaling + quality bonus
  const isLowTier = weapon.level_requirement <= 5;
  
  addRecipeOutput(
    simpleWeaponsGroup,
    weapon.id,
    weapon.level_requirement, // Can only get this weapon at appropriate level
    isLowTier ? 200 : 50,     // Base weight (low tier more common at min level)
    isLowTier ? 5 : 20,        // Weight per level (high tier scales better)
    isLowTier ? 30 : 100       // Quality bonus (high tier rewards good performance)
  );
  
  console.log(`    ✓ ${weapon.name} (Lv${weapon.level_requirement})`);
});

// Moderate Weapons (Level 10-30)
const moderateWeaponsGroup = createRecipeGroup(
  'Moderate Weapon',
  'Craft intermediate weapons for experienced fighters',
  'blacksmithing',
  'weapon',
  10,
  30,
  [{ id: ironOre.id, quantity: 5 }]
);

const moderateWeapons = db.prepare(`
  SELECT id, name, level_requirement 
  FROM items 
  WHERE type = 'weapon' 
  AND slot IN ('main_hand', 'two_hand')
  AND level_requirement BETWEEN 10 AND 30
  ORDER BY level_requirement
  LIMIT 15
`).all();

console.log(`  Found ${moderateWeapons.length} moderate weapons`);

moderateWeapons.forEach(weapon => {
  const isMidTier = weapon.level_requirement <= 20;
  
  addRecipeOutput(
    moderateWeaponsGroup,
    weapon.id,
    weapon.level_requirement,
    isMidTier ? 150 : 40,
    isMidTier ? 10 : 25,
    isMidTier ? 50 : 120
  );
  
  console.log(`    ✓ ${weapon.name} (Lv${weapon.level_requirement})`);
});

console.log('\n📋 Creating Tailoring Recipe Groups...');

// Simple Robes (Level 1-15)
const simpleRobesGroup = createRecipeGroup(
  'Simple Robe',
  'Weave basic robes for apprentice mages',
  'tailoring',
  'armor',
  1,
  15,
  [{ id: cloth.id, quantity: 4 }]
);

const simpleRobes = db.prepare(`
  SELECT id, name, level_requirement 
  FROM items 
  WHERE type = 'armor' 
  AND slot = 'chest'
  AND (name LIKE '%Robe%' OR name LIKE '%Tunic%')
  AND level_requirement BETWEEN 1 AND 15
  ORDER BY level_requirement
  LIMIT 8
`).all();

console.log(`  Found ${simpleRobes.length} simple robes`);

simpleRobes.forEach(robe => {
  const isLowTier = robe.level_requirement <= 5;
  
  addRecipeOutput(
    simpleRobesGroup,
    robe.id,
    robe.level_requirement,
    isLowTier ? 200 : 60,
    isLowTier ? 5 : 18,
    isLowTier ? 30 : 90
  );
  
  console.log(`    ✓ ${robe.name} (Lv${robe.level_requirement})`);
});

console.log('\n📋 Creating Leatherworking Recipe Groups...');

// Simple Armor (Level 1-15)
const simpleLeatherGroup = createRecipeGroup(
  'Simple Leather Armor',
  'Craft basic leather protection',
  'leatherworking',
  'armor',
  1,
  15,
  [{ id: leather.id, quantity: 4 }]
);

const simpleLeather = db.prepare(`
  SELECT id, name, level_requirement 
  FROM items 
  WHERE type = 'armor' 
  AND slot IN ('chest', 'legs', 'head', 'hands', 'feet')
  AND name LIKE '%Leather%'
  AND level_requirement BETWEEN 1 AND 15
  ORDER BY level_requirement
  LIMIT 10
`).all();

console.log(`  Found ${simpleLeather.length} simple leather pieces`);

simpleLeather.forEach(armor => {
  const isLowTier = armor.level_requirement <= 5;
  
  addRecipeOutput(
    simpleLeatherGroup,
    armor.id,
    armor.level_requirement,
    isLowTier ? 180 : 50,
    isLowTier ? 8 : 20,
    isLowTier ? 40 : 100
  );
  
  console.log(`    ✓ ${armor.name} (Lv${armor.level_requirement})`);
});

console.log('\n✅ Recipe groups seeded successfully!');

db.close();
