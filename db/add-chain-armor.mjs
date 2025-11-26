#!/usr/bin/env node

/**
 * Add Chain Armor Equipment for STR/DEX Hybrid Builds
 * Levels 1-60, all slots (head, chest, hands, feet)
 * Provides balanced STR and DEX bonuses with moderate armor
 */

import Database from 'better-sqlite3';

const db = new Database('rpg.db');

console.log('🔗 Adding Chain Armor Equipment...\n');

// Chain armor items - balanced STR/DEX bonuses, moderate armor (between leather and plate)
const chainItems = [
  // LEVEL 1-10 - Common tier
  // Head
  { name: 'Rusty Chain Coif', slot: 'head', level: 1, armor: 3, str: 1, dex: 1, rarity: 'common', value: 15 },
  { name: 'Chain Coif', slot: 'head', level: 5, armor: 5, str: 2, dex: 2, rarity: 'common', value: 35 },
  { name: 'Reinforced Chain Coif', slot: 'head', level: 8, armor: 7, str: 3, dex: 3, rarity: 'common', value: 55 },
  
  // Chest
  { name: 'Rusty Chainmail', slot: 'chest', level: 1, armor: 5, str: 2, dex: 1, rarity: 'common', value: 20 },
  { name: 'Chainmail Hauberk', slot: 'chest', level: 5, armor: 8, str: 3, dex: 2, rarity: 'common', value: 50 },
  { name: 'Reinforced Chainmail', slot: 'chest', level: 8, armor: 11, str: 4, dex: 3, rarity: 'common', value: 75 },
  
  // Hands
  { name: 'Chain Gloves', slot: 'hands', level: 1, armor: 2, str: 1, dex: 1, rarity: 'common', value: 12 },
  { name: 'Chain Gauntlets', slot: 'hands', level: 5, armor: 4, str: 2, dex: 2, rarity: 'common', value: 30 },
  { name: 'Reinforced Chain Gauntlets', slot: 'hands', level: 8, armor: 5, str: 3, dex: 3, rarity: 'common', value: 50 },
  
  // Feet
  { name: 'Chain Boots', slot: 'feet', level: 1, armor: 2, str: 1, dex: 1, rarity: 'common', value: 12 },
  { name: 'Chain Sabatons', slot: 'feet', level: 5, armor: 4, str: 2, dex: 2, rarity: 'common', value: 30 },
  { name: 'Reinforced Chain Sabatons', slot: 'feet', level: 8, armor: 5, str: 3, dex: 3, rarity: 'common', value: 50 },

  // LEVEL 11-20 - Uncommon tier
  // Head
  { name: 'Steel Chain Coif', slot: 'head', level: 11, armor: 9, str: 4, dex: 4, rarity: 'uncommon', value: 80 },
  { name: 'Linked Chain Helm', slot: 'head', level: 15, armor: 12, str: 6, dex: 5, rarity: 'uncommon', value: 120 },
  { name: 'Veteran\'s Chain Helm', slot: 'head', level: 18, armor: 15, str: 7, dex: 6, rarity: 'uncommon', value: 160 },
  
  // Chest
  { name: 'Steel Chainmail', slot: 'chest', level: 11, armor: 14, str: 5, dex: 4, rarity: 'uncommon', value: 110 },
  { name: 'Linked Chainmail', slot: 'chest', level: 15, armor: 18, str: 7, dex: 6, rarity: 'uncommon', value: 160 },
  { name: 'Veteran\'s Chainmail', slot: 'chest', level: 18, armor: 22, str: 9, dex: 7, rarity: 'uncommon', value: 210 },
  
  // Hands
  { name: 'Steel Chain Gauntlets', slot: 'hands', level: 11, armor: 7, str: 4, dex: 4, rarity: 'uncommon', value: 65 },
  { name: 'Linked Chain Gauntlets', slot: 'hands', level: 15, armor: 9, str: 6, dex: 5, rarity: 'uncommon', value: 95 },
  { name: 'Veteran\'s Chain Gauntlets', slot: 'hands', level: 18, armor: 11, str: 7, dex: 6, rarity: 'uncommon', value: 125 },
  
  // Feet
  { name: 'Steel Chain Sabatons', slot: 'feet', level: 11, armor: 7, str: 4, dex: 4, rarity: 'uncommon', value: 65 },
  { name: 'Linked Chain Sabatons', slot: 'feet', level: 15, armor: 9, str: 6, dex: 5, rarity: 'uncommon', value: 95 },
  { name: 'Veteran\'s Chain Sabatons', slot: 'feet', level: 18, armor: 11, str: 7, dex: 6, rarity: 'uncommon', value: 125 },

  // LEVEL 21-30 - Rare tier
  // Head
  { name: 'Knight\'s Chain Helm', slot: 'head', level: 21, armor: 18, str: 9, dex: 7, rarity: 'rare', value: 220 },
  { name: 'Dragonscale Chain Helm', slot: 'head', level: 25, armor: 22, str: 11, dex: 9, rarity: 'rare', value: 300 },
  { name: 'Tempest Chain Helm', slot: 'head', level: 28, armor: 26, str: 13, dex: 11, rarity: 'rare', value: 380 },
  
  // Chest
  { name: 'Knight\'s Chainmail', slot: 'chest', level: 21, armor: 26, str: 11, dex: 9, rarity: 'rare', value: 280 },
  { name: 'Dragonscale Chainmail', slot: 'chest', level: 25, armor: 32, str: 14, dex: 11, rarity: 'rare', value: 380 },
  { name: 'Tempest Chainmail', slot: 'chest', level: 28, armor: 38, str: 16, dex: 13, rarity: 'rare', value: 480 },
  
  // Hands
  { name: 'Knight\'s Chain Gauntlets', slot: 'hands', level: 21, armor: 13, str: 9, dex: 7, rarity: 'rare', value: 170 },
  { name: 'Dragonscale Chain Gauntlets', slot: 'hands', level: 25, armor: 16, str: 11, dex: 9, rarity: 'rare', value: 230 },
  { name: 'Tempest Chain Gauntlets', slot: 'hands', level: 28, armor: 19, str: 13, dex: 11, rarity: 'rare', value: 290 },
  
  // Feet
  { name: 'Knight\'s Chain Sabatons', slot: 'feet', level: 21, armor: 13, str: 9, dex: 7, rarity: 'rare', value: 170 },
  { name: 'Dragonscale Chain Sabatons', slot: 'feet', level: 25, armor: 16, str: 11, dex: 9, rarity: 'rare', value: 230 },
  { name: 'Tempest Chain Sabatons', slot: 'feet', level: 28, armor: 19, str: 13, dex: 11, rarity: 'rare', value: 290 },

  // LEVEL 31-40 - Epic tier
  // Head
  { name: 'Warlord\'s Chain Helm', slot: 'head', level: 31, armor: 30, str: 15, dex: 12, rarity: 'epic', value: 480 },
  { name: 'Titanforged Chain Helm', slot: 'head', level: 35, armor: 35, str: 18, dex: 15, rarity: 'epic', value: 620 },
  { name: 'Stormbringer Chain Helm', slot: 'head', level: 38, armor: 40, str: 21, dex: 17, rarity: 'epic', value: 760 },
  
  // Chest
  { name: 'Warlord\'s Chainmail', slot: 'chest', level: 31, armor: 44, str: 19, dex: 15, rarity: 'epic', value: 600 },
  { name: 'Titanforged Chainmail', slot: 'chest', level: 35, armor: 52, str: 23, dex: 18, rarity: 'epic', value: 780 },
  { name: 'Stormbringer Chainmail', slot: 'chest', level: 38, armor: 60, str: 26, dex: 21, rarity: 'epic', value: 960 },
  
  // Hands
  { name: 'Warlord\'s Chain Gauntlets', slot: 'hands', level: 31, armor: 22, str: 15, dex: 12, rarity: 'epic', value: 370 },
  { name: 'Titanforged Chain Gauntlets', slot: 'hands', level: 35, armor: 26, str: 18, dex: 15, rarity: 'epic', value: 480 },
  { name: 'Stormbringer Chain Gauntlets', slot: 'hands', level: 38, armor: 30, str: 21, dex: 17, rarity: 'epic', value: 590 },
  
  // Feet
  { name: 'Warlord\'s Chain Sabatons', slot: 'feet', level: 31, armor: 22, str: 15, dex: 12, rarity: 'epic', value: 370 },
  { name: 'Titanforged Chain Sabatons', slot: 'feet', level: 35, armor: 26, str: 18, dex: 15, rarity: 'epic', value: 480 },
  { name: 'Stormbringer Chain Sabatons', slot: 'feet', level: 38, armor: 30, str: 21, dex: 17, rarity: 'epic', value: 590 },

  // LEVEL 41-50 - Epic tier (high-end)
  // Head
  { name: 'Dreadnought Chain Helm', slot: 'head', level: 41, armor: 45, str: 24, dex: 19, rarity: 'epic', value: 920 },
  { name: 'Vanguard Chain Helm', slot: 'head', level: 45, armor: 52, str: 28, dex: 22, rarity: 'epic', value: 1100 },
  { name: 'Adamant Chain Helm', slot: 'head', level: 48, armor: 58, str: 32, dex: 25, rarity: 'epic', value: 1280 },
  
  // Chest
  { name: 'Dreadnought Chainmail', slot: 'chest', level: 41, armor: 68, str: 30, dex: 24, rarity: 'epic', value: 1160 },
  { name: 'Vanguard Chainmail', slot: 'chest', level: 45, armor: 78, str: 35, dex: 28, rarity: 'epic', value: 1380 },
  { name: 'Adamant Chainmail', slot: 'chest', level: 48, armor: 88, str: 40, dex: 31, rarity: 'epic', value: 1600 },
  
  // Hands
  { name: 'Dreadnought Chain Gauntlets', slot: 'hands', level: 41, armor: 34, str: 24, dex: 19, rarity: 'epic', value: 710 },
  { name: 'Vanguard Chain Gauntlets', slot: 'hands', level: 45, armor: 39, str: 28, dex: 22, rarity: 'epic', value: 850 },
  { name: 'Adamant Chain Gauntlets', slot: 'hands', level: 48, armor: 44, str: 32, dex: 25, rarity: 'epic', value: 990 },
  
  // Feet
  { name: 'Dreadnought Chain Sabatons', slot: 'feet', level: 41, armor: 34, str: 24, dex: 19, rarity: 'epic', value: 710 },
  { name: 'Vanguard Chain Sabatons', slot: 'feet', level: 45, armor: 39, str: 28, dex: 22, rarity: 'epic', value: 850 },
  { name: 'Adamant Chain Sabatons', slot: 'feet', level: 48, armor: 44, str: 32, dex: 25, rarity: 'epic', value: 990 },

  // LEVEL 51-60 - Legendary tier
  // Head
  { name: 'Mythril Chain Helm', slot: 'head', level: 51, armor: 65, str: 36, dex: 28, rarity: 'legendary', value: 1500 },
  { name: 'Godforged Chain Helm', slot: 'head', level: 55, armor: 74, str: 42, dex: 33, rarity: 'legendary', value: 1800 },
  { name: 'Eternal Warlord\'s Chain Helm', slot: 'head', level: 60, armor: 85, str: 50, dex: 38, rarity: 'legendary', value: 2200 },
  
  // Chest
  { name: 'Mythril Chainmail', slot: 'chest', level: 51, armor: 98, str: 45, dex: 35, rarity: 'legendary', value: 1900 },
  { name: 'Godforged Chainmail', slot: 'chest', level: 55, armor: 112, str: 52, dex: 41, rarity: 'legendary', value: 2300 },
  { name: 'Eternal Warlord\'s Chainmail', slot: 'chest', level: 60, armor: 130, str: 62, dex: 48, rarity: 'legendary', value: 2800 },
  
  // Hands
  { name: 'Mythril Chain Gauntlets', slot: 'hands', level: 51, armor: 49, str: 36, dex: 28, rarity: 'legendary', value: 1160 },
  { name: 'Godforged Chain Gauntlets', slot: 'hands', level: 55, armor: 56, str: 42, dex: 33, rarity: 'legendary', value: 1400 },
  { name: 'Eternal Warlord\'s Chain Gauntlets', slot: 'hands', level: 60, armor: 65, str: 50, dex: 38, rarity: 'legendary', value: 1700 },
  
  // Feet
  { name: 'Mythril Chain Sabatons', slot: 'feet', level: 51, armor: 49, str: 36, dex: 28, rarity: 'legendary', value: 1160 },
  { name: 'Godforged Chain Sabatons', slot: 'feet', level: 55, armor: 56, str: 42, dex: 33, rarity: 'legendary', value: 1400 },
  { name: 'Eternal Warlord\'s Chain Sabatons', slot: 'feet', level: 60, armor: 65, str: 50, dex: 38, rarity: 'legendary', value: 1700 },
];

console.log(`📊 Adding ${chainItems.length} chain armor items...\n`);

const insertItem = db.prepare(`
  INSERT INTO items (
    name, type, slot, rarity, value,
    armor,
    strength_bonus, dexterity_bonus,
    required_level,
    description
  ) VALUES (
    @name, 'armor', @slot, @rarity, @value,
    @armor,
    @str, @dex,
    @level,
    @description
  )
`);

let addedCount = 0;
let skippedCount = 0;

for (const item of chainItems) {
  try {
    // Check if item already exists
    const existing = db.prepare('SELECT id FROM items WHERE name = ?').get(item.name);
    if (existing) {
      console.log(`⏭️  Skipped (exists): ${item.name}`);
      skippedCount++;
      continue;
    }

    const description = `Chain armor providing balanced protection and mobility. Requires level ${item.level}.`;
    
    insertItem.run({
      name: item.name,
      slot: item.slot,
      rarity: item.rarity,
      value: item.value,
      armor: item.armor,
      str: item.str,
      dex: item.dex,
      level: item.level,
      description
    });
    
    console.log(`✅ Added: ${item.name} (Lvl ${item.level}, ${item.armor} armor, +${item.str} STR, +${item.dex} DEX)`);
    addedCount++;
  } catch (error) {
    console.error(`❌ Error adding ${item.name}:`, error.message);
  }
}

console.log(`\n✨ Chain Armor Addition Complete!`);
console.log(`   Added: ${addedCount}`);
console.log(`   Skipped: ${skippedCount}`);
console.log(`   Total: ${chainItems.length}`);

db.close();
