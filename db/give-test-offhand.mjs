import Database from 'better-sqlite3';

const db = new Database('rpg.db');

console.log('🔮 Giving test character some offhand items...\n');

// Get the first character
const character = db.prepare('SELECT * FROM characters LIMIT 1').get();
if (!character) {
  console.log('❌ No character found!');
  process.exit(1);
}

console.log(`Found character: ${character.name} (Level ${character.level})`);

// Get a few offhand items at appropriate levels
const offhandItems = db.prepare(`
  SELECT * FROM items 
  WHERE slot = 'offhand' 
  AND required_level <= ?
  ORDER BY required_level
  LIMIT 5
`).all(character.level);

console.log(`\nGiving ${offhandItems.length} offhand items:\n`);

for (const item of offhandItems) {
  // Check if already in inventory
  const existing = db.prepare(`
    SELECT * FROM character_inventory 
    WHERE character_id = ? AND item_id = ?
  `).get(character.id, item.id);
  
  if (existing) {
    console.log(`  ⏭️  Already have: ${item.name}`);
    continue;
  }
  
  // Add to inventory
  db.prepare(`
    INSERT INTO character_inventory (character_id, item_id, quantity, equipped)
    VALUES (?, ?, 1, 0)
  `).run(character.id, item.id);
  
  console.log(`  ✅ Added: ${item.name} (Level ${item.required_level} ${item.rarity})`);
}

console.log('\n✨ Done! Check your inventory in-game.');

db.close();
