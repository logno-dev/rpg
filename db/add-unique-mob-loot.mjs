#!/usr/bin/env node
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log('🎁 Generating loot tables for unique signature mobs...\n');

// Get all unique mobs that need loot
const uniqueMobs = await db.execute(`
  SELECT m.id, m.name, m.level
  FROM mobs m
  WHERE m.name IN (
    'Feral Hound', 'Meadow Sprite', 'Crop Blight', 'Plains Warden', 'Bandit Chief', 'Ruined Sentinel',
    'Edge Prowler', 'Young Treant', 'Thorn Beast', 'Grove Guardian', 'Forest Stalker', 'Hexed Familiar', 'Depth Lurker',
    'Mountain Goat', 'Foothill Howler', 'Base Camp Raider', 'Slope Climber', 'Peak Wyvern', 'Mountain Titan', 'Matriarch Harpy', 'Titan Remnant',
    'Dungeon Rat Swarm', 'Crypt Keeper', 'Hall Phantom', 'Void Spawn', 'Shadow Reaper', 'Forbidden Horror',
    'Ash Crawler', 'Ember Serpent', 'Alpha Hellhound', 'Infernal Warden', 'Badlands Tyrant', 'Scorched Demon',
    'Tundra Wanderer', 'Frost Stalker', 'Frost Giant Berserker', 'Glacial Wyrm', 'Ice Colossus', 'Eternal Freeze',
    'Corrupted Dryad', 'Garden Abomination', 'Grove Specter', 'Dark Heart Guardian', 'Fallen Elven Lord', 'Sanctum Desecrator',
    'Drake Scout', 'Wyrmling Broodling', 'Territorial Drake', 'Ancient Wyrm', 'Dragon Warlord', 'Primordial Dragon',
    'Deep Dweller', 'Trench Horror', 'Leviathan Spawn', 'Abyssal Entity', 'Kraken Lord', 'Depth God',
    'Sky Patrol', 'Divine Champion', 'Celestial Arbiter', 'Fallen Seraph',
    'Imp Swarm', 'Rampart Demon', 'Demon Lord Elite', 'Throne Guardian', 'Arch-Demon', 'Demon Overlord',
    'Astral Drifter', 'Reality Shifter', 'Nexus Guardian', 'Void Aberration', 'Astral Warden', 'Planar Devourer',
    'Chaos Spawn', 'War Elemental', 'Elemental Titan', 'Storm Core', 'Chaos Lord', 'Primordial Incarnate',
    'Void Touched', 'Entropy Beast', 'Oblivion Wraith', 'Void Avatar', 'Void Sovereign',
    'Hall Watcher', 'Titan Guardian', 'War Construct', 'Titan King Echo',
    'End Walker', 'Eternal Gatekeeper', 'Cosmic Entity'
  )
  AND NOT EXISTS (
    SELECT 1 FROM mob_loot ml WHERE ml.mob_id = m.id
  )
  ORDER BY m.level
`);

console.log(`Found ${uniqueMobs.rows.length} unique mobs without loot\n`);

// Get all items categorized by level ranges
const itemRanges = {
  '1-7': [1433, 1434, 1435, 1455, 1468, 1482, 1500, 1501, 1502, 1522, 1536, 1549],
  '5-18': [1436, 1437, 1438, 1456, 1469, 1470, 1483, 1503, 1504, 1523, 1537, 1550],
  '15-30': [1439, 1440, 1441, 1442, 1457, 1471, 1484, 1505, 1506, 1507, 1524, 1538, 1551],
  '27-42': [1443, 1444, 1445, 1458, 1459, 1472, 1473, 1485, 1486, 1508, 1509, 1525, 1526, 1539, 1540, 1552, 1553],
  '40-54': [1446, 1447, 1448, 1460, 1461, 1474, 1475, 1487, 1488, 1510, 1511, 1527, 1528, 1541, 1542, 1554, 1555],
  '51-60': [1449, 1450, 1451, 1452, 1462, 1463, 1476, 1477, 1489, 1490, 1512, 1513, 1514, 1529, 1530, 1543, 1544, 1556, 1557, 1558]
};

// Also get equipment items by level
const equipmentQuery = await db.execute(`
  SELECT id, required_level, type, rarity
  FROM items
  WHERE type IN ('weapon', 'armor', 'helmet', 'gloves', 'boots', 'offhand', 'ring', 'amulet')
  AND required_level IS NOT NULL
  ORDER BY required_level
`);

const equipmentByLevel = {};
for (const item of equipmentQuery.rows) {
  const level = item.required_level;
  if (!equipmentByLevel[level]) {
    equipmentByLevel[level] = [];
  }
  equipmentByLevel[level].push(item);
}

// Get consumables (potions, scrolls)
const consumablesQuery = await db.execute(`
  SELECT id, name, type
  FROM items
  WHERE type IN ('consumable', 'scroll')
`);

const consumables = consumablesQuery.rows;

let totalLootAdded = 0;

for (const mob of uniqueMobs.rows) {
  const mobId = mob.id;
  const mobLevel = mob.level;
  const mobName = mob.name;
  
  console.log(`Adding loot for ${mobName} (Lv ${mobLevel})...`);
  
  let lootCount = 0;
  
  // 1. Add crafting materials (appropriate level range)
  for (const [range, itemIds] of Object.entries(itemRanges)) {
    const [minLevel, maxLevel] = range.split('-').map(Number);
    
    if (mobLevel >= minLevel - 5 && mobLevel <= maxLevel + 5) {
      // Add 30-50% of materials from this range
      const numMaterials = Math.floor(itemIds.length * (0.3 + Math.random() * 0.2));
      const selectedItems = itemIds.sort(() => 0.5 - Math.random()).slice(0, numMaterials);
      
      for (const itemId of selectedItems) {
        const dropChance = 0.05 + (Math.random() * 0.1); // 5-15%
        await db.execute({
          sql: 'INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max) VALUES (?, ?, ?, ?, ?)',
          args: [mobId, itemId, dropChance, 1, 1]
        });
        lootCount++;
      }
    }
  }
  
  // 2. Add equipment drops (at-level and slightly lower)
  const equipmentLevels = [mobLevel - 2, mobLevel - 1, mobLevel, mobLevel + 1].filter(l => l > 0);
  for (const level of equipmentLevels) {
    if (equipmentByLevel[level]) {
      // Add 20-40% of equipment at this level
      const numEquipment = Math.floor(equipmentByLevel[level].length * (0.2 + Math.random() * 0.2));
      const selectedEquipment = equipmentByLevel[level].sort(() => 0.5 - Math.random()).slice(0, numEquipment);
      
      for (const item of selectedEquipment) {
        let dropChance = 0.03; // Base 3%
        
        // Adjust by rarity
        if (item.rarity === 'common') dropChance = 0.08;
        else if (item.rarity === 'uncommon') dropChance = 0.05;
        else if (item.rarity === 'rare') dropChance = 0.03;
        else if (item.rarity === 'epic') dropChance = 0.015;
        else if (item.rarity === 'legendary') dropChance = 0.008;
        
        await db.execute({
          sql: 'INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max) VALUES (?, ?, ?, ?, ?)',
          args: [mobId, item.id, dropChance, 1, 1]
        });
        lootCount++;
      }
    }
  }
  
  // 3. Add consumables (potions and scrolls)
  // Add 5-10 random consumables
  const numConsumables = 5 + Math.floor(Math.random() * 6);
  const selectedConsumables = consumables.sort(() => 0.5 - Math.random()).slice(0, numConsumables);
  
  for (const item of selectedConsumables) {
    let dropChance = 0.04; // 4% base
    if (item.type === 'scroll') dropChance = 0.02; // Scrolls are rarer
    
    const quantity = item.type === 'consumable' ? Math.floor(1 + Math.random() * 3) : 1;
    
    await db.execute({
      sql: 'INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max) VALUES (?, ?, ?, ?, ?)',
      args: [mobId, item.id, dropChance, 1, quantity]
    });
    lootCount++;
  }
  
  console.log(`  ✓ Added ${lootCount} loot items to ${mobName}`);
  totalLootAdded += lootCount;
}

console.log(`\n✅ Successfully added ${totalLootAdded} total loot entries!`);
console.log(`📊 ${uniqueMobs.rows.length} unique signature mobs now have complete loot tables!\n`);

process.exit(0);
