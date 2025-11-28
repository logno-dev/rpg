import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log('Fixing mob region_id values...');

// Map areas to regions
const areaToRegion = {
  'plains': 1,
  'Greenfield Plains': 1,
  'forest': 2,
  'Darkwood Forest': 2,
  'mountains': 3,
  'Ironpeak Mountains': 3,
  'dungeon': 1, // Default dungeons to region 1 for now
};

// Update mobs based on area
for (const [area, regionId] of Object.entries(areaToRegion)) {
  const result = await db.execute({
    sql: 'UPDATE mobs SET region_id = ? WHERE (area = ? OR area LIKE ?) AND region_id IS NULL',
    args: [regionId, area, `%${area}%`]
  });
  console.log(`Updated ${result.rowsAffected} mobs in ${area} to region ${regionId}`);
}

// Verify
const nullCount = await db.execute('SELECT COUNT(*) as count FROM mobs WHERE region_id IS NULL');
console.log(`\nMobs still with null region_id: ${nullCount.rows[0].count}`);

// Show some examples
const updated = await db.execute('SELECT id, name, area, region_id FROM mobs WHERE id IN (1, 2, 3, 4, 5) ORDER BY id');
console.log('\nSample updated mobs:');
updated.rows.forEach(m => {
  console.log(`  ${m.id}: ${m.name} (${m.area}) -> Region ${m.region_id}`);
});

console.log('\nDone!');
