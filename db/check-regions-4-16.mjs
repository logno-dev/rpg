import Database from 'better-sqlite3';

const db = new Database('game.db');

console.log('=== REGIONS 4-16 ===\n');
const regions = db.prepare('SELECT id, name, min_level, max_level FROM regions WHERE id >= 4 AND id <= 16 ORDER BY id').all();
regions.forEach(r => {
  console.log(`Region ${r.id}: ${r.name} (Levels ${r.min_level}-${r.max_level})`);
  const mobs = db.prepare('SELECT id, name, level FROM mobs WHERE region_id = ? ORDER BY level').all(r.id);
  console.log(`  Mobs (${mobs.length}):`, mobs.map(m => `${m.name} (L${m.level})`).join(', '));
  console.log('');
});

db.close();
