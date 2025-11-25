import Database from 'better-sqlite3';
const db = new Database('rpg.db');

console.log('🛡️ Adding tank equipment (plate armor + shields)...\n');

// Track created item IDs
const createdItems = [];

// SHIELDS (Offhand) - Primary focus for tanks
const shields = [
  // Common/Uncommon - Early game (levels 1-15)
  { name: 'Wooden Buckler', level: 1, rarity: 'common', armor: 2, con: 1, str: 0 },
  { name: 'Iron Buckler', level: 3, rarity: 'common', armor: 3, con: 1, str: 0 },
  { name: 'Steel Shield', level: 5, rarity: 'uncommon', armor: 4, con: 2, str: 1 },
  { name: 'Reinforced Shield', level: 8, rarity: 'uncommon', armor: 5, con: 2, str: 1 },
  { name: 'Tower Shield', level: 10, rarity: 'uncommon', armor: 6, con: 3, str: 2 },
  { name: 'Guardian Shield', level: 12, rarity: 'rare', armor: 7, con: 3, str: 2, bossOnly: true },
  
  // Rare - Mid game (levels 15-30)
  { name: 'Tempered Kite Shield', level: 15, rarity: 'rare', armor: 8, con: 4, str: 2 },
  { name: 'Bulwark of the Mountain', level: 18, rarity: 'rare', armor: 9, con: 5, str: 3, bossOnly: true },
  { name: 'Mithril Shield', level: 21, rarity: 'rare', armor: 10, con: 6, str: 3 },
  { name: 'Enchanted Tower Shield', level: 24, rarity: 'rare', armor: 11, con: 7, str: 4 },
  { name: 'Runic Greatshield', level: 27, rarity: 'rare', armor: 12, con: 8, str: 4 },
  { name: 'Dragonscale Barrier', level: 30, rarity: 'epic', armor: 13, con: 9, str: 5 },
  
  // Epic - Late game (levels 33-48)
  { name: 'Obsidian Bulwark', level: 33, rarity: 'epic', armor: 14, con: 10, str: 5 },
  { name: 'Starforged Aegis', level: 36, rarity: 'epic', armor: 15, con: 11, str: 6 },
  { name: 'Voidplate Shield', level: 39, rarity: 'epic', armor: 16, con: 12, str: 6 },
  { name: 'Celestial Ward', level: 42, rarity: 'epic', armor: 17, con: 13, str: 7 },
  { name: 'Ethereal Bastion', level: 45, rarity: 'epic', armor: 18, con: 14, str: 7 },
  { name: 'Primordial Wall', level: 48, rarity: 'epic', armor: 19, con: 15, str: 8 },
  
  // Legendary - End game (levels 50-60)
  { name: 'Godforged Rampart', level: 51, rarity: 'legendary', armor: 20, con: 16, str: 9 },
  { name: 'Timeless Bulwark', level: 54, rarity: 'legendary', armor: 21, con: 17, str: 9 },
  { name: 'Shield of the Immortal', level: 57, rarity: 'legendary', armor: 22, con: 18, str: 10 },
  { name: 'Ascendant Aegis', level: 60, rarity: 'legendary', armor: 24, con: 20, str: 12 },
];

// PLATE HELMETS
const helmets = [
  { name: 'Iron Helm', level: 5, rarity: 'uncommon', armor: 3, con: 2, str: 1 },
  { name: 'Reinforced Helm', level: 10, rarity: 'uncommon', armor: 4, con: 3, str: 1 },
  { name: 'Tempered Great Helm', level: 15, rarity: 'rare', armor: 5, con: 4, str: 2 },
  { name: 'Mithril Helm', level: 21, rarity: 'rare', armor: 6, con: 5, str: 2 },
  { name: 'Warlord Faceplate', level: 25, rarity: 'epic', armor: 7, con: 6, str: 3, bossOnly: true },
  { name: 'Dragonscale Helm', level: 30, rarity: 'epic', armor: 8, con: 7, str: 3 },
  { name: 'Obsidian Helm', level: 33, rarity: 'epic', armor: 9, con: 8, str: 4 },
  { name: 'Starforged Helm', level: 36, rarity: 'epic', armor: 9, con: 9, str: 4 },
  { name: 'Voidplate Helm', level: 39, rarity: 'epic', armor: 10, con: 10, str: 5 },
  { name: 'Infernal Warhelm', level: 40, rarity: 'epic', armor: 11, con: 11, str: 5, bossOnly: true },
  { name: 'Primordial Helm', level: 48, rarity: 'epic', armor: 12, con: 13, str: 6 },
  { name: 'Godforged Helm', level: 51, rarity: 'legendary', armor: 13, con: 14, str: 7 },
  { name: 'Ascendant Crown', level: 60, rarity: 'legendary', armor: 15, con: 17, str: 9 },
];

// PLATE GAUNTLETS
const gauntlets = [
  { name: 'Iron Gauntlets', level: 5, rarity: 'uncommon', armor: 2, con: 2, str: 1 },
  { name: 'Reinforced Gauntlets', level: 10, rarity: 'uncommon', armor: 3, con: 3, str: 1 },
  { name: 'Tempered Gauntlets', level: 15, rarity: 'rare', armor: 4, con: 4, str: 2 },
  { name: 'Gorak Iron Fists', level: 18, rarity: 'rare', armor: 5, con: 5, str: 3, bossOnly: true },
  { name: 'Mithril Gauntlets', level: 21, rarity: 'rare', armor: 5, con: 5, str: 2 },
  { name: 'Vexmora Crushing Grips', level: 25, rarity: 'epic', armor: 6, con: 6, str: 3, bossOnly: true },
  { name: 'Dragonscale Gauntlets', level: 30, rarity: 'epic', armor: 7, con: 7, str: 3 },
  { name: 'Obsidian Gauntlets', level: 33, rarity: 'epic', armor: 8, con: 8, str: 4 },
  { name: 'Starforged Gauntlets', level: 36, rarity: 'epic', armor: 8, con: 9, str: 4 },
  { name: 'Voidplate Gauntlets', level: 39, rarity: 'epic', armor: 9, con: 10, str: 5 },
  { name: 'Flame Lord Molten Grips', level: 40, rarity: 'epic', armor: 10, con: 11, str: 5, bossOnly: true },
  { name: 'Primordial Gauntlets', level: 48, rarity: 'epic', armor: 11, con: 13, str: 6 },
  { name: 'Godforged Gauntlets', level: 51, rarity: 'legendary', armor: 12, con: 14, str: 7 },
  { name: 'Ascendant Gauntlets', level: 60, rarity: 'legendary', armor: 14, con: 17, str: 9 },
];

// PLATE BOOTS
const boots = [
  { name: 'Iron Greaves', level: 5, rarity: 'uncommon', armor: 2, con: 2, str: 1 },
  { name: 'Reinforced Greaves', level: 10, rarity: 'uncommon', armor: 3, con: 3, str: 1 },
  { name: 'Shadowfang Treads', level: 12, rarity: 'rare', armor: 4, con: 4, str: 2, bossOnly: true },
  { name: 'Tempered Greaves', level: 15, rarity: 'rare', armor: 4, con: 4, str: 2 },
  { name: 'Mithril Greaves', level: 21, rarity: 'rare', armor: 5, con: 5, str: 2 },
  { name: 'Dragonscale Greaves', level: 30, rarity: 'epic', armor: 7, con: 7, str: 3 },
  { name: 'Obsidian Greaves', level: 33, rarity: 'epic', armor: 8, con: 8, str: 4 },
  { name: 'Starforged Greaves', level: 36, rarity: 'epic', armor: 8, con: 9, str: 4 },
  { name: 'Voidplate Greaves', level: 39, rarity: 'epic', armor: 9, con: 10, str: 5 },
  { name: 'Primordial Greaves', level: 48, rarity: 'epic', armor: 11, con: 13, str: 6 },
  { name: 'Godforged Greaves', level: 51, rarity: 'legendary', armor: 12, con: 14, str: 7 },
  { name: 'Infernal Sabatons', level: 55, rarity: 'legendary', armor: 13, con: 16, str: 8, bossOnly: true },
  { name: 'Ascendant Greaves', level: 60, rarity: 'legendary', armor: 14, con: 17, str: 9 },
];

console.log('Creating tank items...\n');

// Helper to create item
function createItem(item, type, slot) {
  const armor_type = slot === 'offhand' ? null : 'plate';
  
  const result = db.prepare(`
    INSERT INTO items (
      name, description, type, slot, armor_type, rarity,
      armor, constitution_bonus, strength_bonus,
      required_level, value, stackable
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
  `).run(
    item.name,
    slot === 'offhand' 
      ? `A sturdy shield that provides protection and enhances defensive capabilities.`
      : `Heavy plate ${slot} that provides excellent protection for tank builds.`,
    type,
    slot,
    armor_type,
    item.rarity,
    item.armor,
    item.con,
    item.str,
    item.level,
    Math.floor(item.level * 15 * (item.rarity === 'legendary' ? 3 : item.rarity === 'epic' ? 2 : item.rarity === 'rare' ? 1.5 : 1))
  );
  
  const itemId = typeof result.lastInsertRowid === 'bigint' 
    ? Number(result.lastInsertRowid) 
    : result.lastInsertRowid;
    
  createdItems.push({ id: itemId, ...item, slot, type });
  console.log(`✅ Created ${item.name} (Level ${item.level} ${item.rarity})`);
  return itemId;
}

// Create all items
shields.forEach(shield => createItem(shield, 'armor', 'offhand'));
helmets.forEach(helm => createItem(helm, 'armor', 'head'));
gauntlets.forEach(gauntlet => createItem(gauntlet, 'armor', 'hands'));
boots.forEach(boot => createItem(boot, 'armor', 'feet'));

console.log(`\n🎉 Created ${createdItems.length} new tank items!`);
console.log(`   - ${shields.length} shields`);
console.log(`   - ${helmets.length} helmets`);
console.log(`   - ${gauntlets.length} gauntlets`);
console.log(`   - ${boots.length} boots`);

// Add to loot tables
console.log('\n📦 Adding items to loot tables...');

// Get all regions and their level ranges
const regions = db.prepare('SELECT * FROM regions ORDER BY level_min').all();

// Get named mobs (bosses) for boss-only items
const bosses = db.prepare('SELECT * FROM named_mobs ORDER BY level').all();

let lootEntriesAdded = 0;

// Add boss loot for boss-only items
const bossItems = createdItems.filter(item => item.bossOnly);
for (const item of bossItems) {
  const suitableBosses = bosses.filter(boss => 
    boss.level >= item.level - 2 && boss.level <= item.level + 2
  );
  
  for (const boss of suitableBosses.slice(0, 2)) { // Max 2 bosses per item
    db.prepare(`
      INSERT INTO named_mob_loot (named_mob_id, item_id, drop_chance, min_quantity, max_quantity)
      VALUES (?, ?, 0.15, 1, 1)
    `).run(boss.id, item.id);
    lootEntriesAdded++;
  }
  console.log(`✅ Added ${item.name} to ${Math.min(suitableBosses.length, 2)} boss loot tables`);
}

// Add mob loot for craftable items
const craftableItems = createdItems.filter(item => !item.bossOnly);
for (const item of craftableItems) {
  const suitableRegions = regions.filter(region =>
    item.level >= region.level_min && item.level <= region.level_max + 5
  );
  
  for (const region of suitableRegions) {
    // Get mobs in this region
    const regionMobs = db.prepare(`
      SELECT m.* FROM mobs m
      JOIN region_mobs rm ON m.id = rm.mob_id
      WHERE rm.region_id = ?
      AND m.level >= ? AND m.level <= ?
      LIMIT 8
    `).all(region.id, item.level - 3, item.level + 3);
    
    const dropChance = item.rarity === 'legendary' ? 0.02 : 
                       item.rarity === 'epic' ? 0.04 :
                       item.rarity === 'rare' ? 0.06 : 0.10;
    
    for (const mob of regionMobs) {
      db.prepare(`
        INSERT INTO mob_loot (mob_id, item_id, drop_chance, min_quantity, max_quantity)
        VALUES (?, ?, ?, 1, 1)
      `).run(mob.id, item.id, dropChance);
      lootEntriesAdded++;
    }
  }
  console.log(`✅ Added ${item.name} to ${Math.min(craftableItems.length, 8)} mob loot tables`);
}

console.log(`\n🎉 Added ${lootEntriesAdded} loot table entries!`);

// Add crafting recipes (Blacksmithing)
console.log('\n⚒️ Adding crafting recipes (Blacksmithing)...');

const craftingMaterials = db.prepare('SELECT * FROM crafting_materials').all();
const ironIngot = craftingMaterials.find(m => m.name === 'Iron Ingot');
const steelIngot = craftingMaterials.find(m => m.name === 'Steel Ingot');
const mithrilOre = craftingMaterials.find(m => m.name === 'Mithril Ore');

let recipesAdded = 0;

for (const item of craftableItems) {
  // Determine skill level (1-30 range)
  const skillLevel = Math.min(30, Math.floor(item.level / 2));
  
  // Create recipe
  const recipeResult = db.prepare(`
    INSERT INTO recipes (name, profession, skill_required, result_item_id, result_quantity)
    VALUES (?, 'Blacksmithing', ?, ?, 1)
  `).run(`Craft ${item.name}`, skillLevel, item.id);
  
  const recipeId = typeof recipeResult.lastInsertRowid === 'bigint'
    ? Number(recipeResult.lastInsertRowid)
    : recipeResult.lastInsertRowid;
  
  // Add materials based on level
  if (item.level <= 10 && ironIngot) {
    db.prepare(`
      INSERT INTO recipe_materials (recipe_id, material_id, quantity)
      VALUES (?, ?, ?)
    `).run(recipeId, ironIngot.id, item.rarity === 'rare' ? 4 : 3);
  } else if (item.level <= 25 && steelIngot) {
    db.prepare(`
      INSERT INTO recipe_materials (recipe_id, material_id, quantity)
      VALUES (?, ?, ?)
    `).run(recipeId, steelIngot.id, item.rarity === 'rare' ? 5 : 4);
  } else if (mithrilOre) {
    db.prepare(`
      INSERT INTO recipe_materials (recipe_id, material_id, quantity)
      VALUES (?, ?, ?)
    `).run(recipeId, mithrilOre.id, item.rarity === 'epic' ? 6 : 5);
  }
  
  recipesAdded++;
  console.log(`✅ Created recipe for ${item.name} (Blacksmithing ${skillLevel})`);
}

console.log(`\n🎉 Created ${recipesAdded} crafting recipes!`);

console.log('\n✨ Tank equipment complete! Tanks now have full coverage from levels 1-60.');

db.close();
