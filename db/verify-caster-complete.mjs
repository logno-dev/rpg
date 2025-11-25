import Database from 'better-sqlite3';

const db = new Database('rpg.db');

console.log('🧙‍♂️ CASTER EQUIPMENT VERIFICATION\n');

// Check cloth armor (head, hands, feet)
const clothArmor = db.prepare(`
  SELECT slot, COUNT(*) as count 
  FROM items 
  WHERE type = 'armor' AND subtype = 'cloth' AND slot IN ('head', 'hands', 'feet')
  GROUP BY slot
  ORDER BY slot
`).all();

console.log('📦 Cloth Armor by Slot:');
clothArmor.forEach(row => {
  console.log(`  ${row.slot}: ${row.count} items`);
});

// Check offhand items
const offhand = db.prepare(`
  SELECT COUNT(*) as count 
  FROM items 
  WHERE slot = 'offhand' AND subtype IN ('orb', 'tome')
`).get();

console.log(`\n🔮 Offhand Items (orbs/tomes): ${offhand.count} items`);

// Check weapons that casters can use (staffs)
const staffs = db.prepare(`
  SELECT COUNT(*) as count 
  FROM items 
  WHERE type = 'weapon' AND subtype = 'staff'
`).get();

console.log(`\n🪄 Staffs: ${staffs.count} items`);

// Summary by level range
console.log('\n📊 Caster Offhand Items by Level Range:');
const offhandByLevel = db.prepare(`
  SELECT 
    CASE 
      WHEN level_required <= 10 THEN '1-10'
      WHEN level_required <= 20 THEN '11-20'
      WHEN level_required <= 30 THEN '21-30'
      WHEN level_required <= 40 THEN '31-40'
      WHEN level_required <= 50 THEN '41-50'
      ELSE '51-60'
    END as level_range,
    COUNT(*) as count
  FROM items 
  WHERE slot = 'offhand' AND subtype IN ('orb', 'tome')
  GROUP BY level_range
  ORDER BY level_range
`).all();

offhandByLevel.forEach(row => {
  console.log(`  ${row.level_range}: ${row.count} items`);
});

db.close();
