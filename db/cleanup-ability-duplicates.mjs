import { createClient } from '@libsql/client';
import 'dotenv/config';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function cleanupDuplicates() {
  console.log('🔍 Finding duplicate abilities...\n');
  
  // Find all duplicates
  const duplicatesResult = await db.execute(`
    SELECT name, COUNT(*) as count 
    FROM abilities 
    GROUP BY name 
    HAVING count > 1 
    ORDER BY count DESC
  `);
  
  console.log(`Found ${duplicatesResult.rows.length} ability names with duplicates:\n`);
  
  for (const dup of duplicatesResult.rows) {
    console.log(`📦 ${dup.name} (${dup.count} copies)`);
    
    // Get all abilities with this name, ordered by ID (keep the first one)
    const abilitiesResult = await db.execute({
      sql: 'SELECT * FROM abilities WHERE name = ? ORDER BY id ASC',
      args: [dup.name],
    });
    
    const abilities = abilitiesResult.rows;
    const keepId = abilities[0].id;
    const deleteIds = abilities.slice(1).map(a => a.id);
    
    console.log(`   Keeping ID ${keepId}, deleting IDs: ${deleteIds.join(', ')}`);
    
    // Delete the duplicates
    for (const id of deleteIds) {
      // First, update any character_abilities references to point to the kept ability
      await db.execute({
        sql: 'UPDATE character_abilities SET ability_id = ? WHERE ability_id = ?',
        args: [keepId, id],
      });
      
      // Delete the duplicate ability
      await db.execute({
        sql: 'DELETE FROM abilities WHERE id = ?',
        args: [id],
      });
    }
    
    console.log(`   ✅ Deleted ${deleteIds.length} duplicate(s)\n`);
  }
  
  console.log('✨ Cleanup complete!');
  
  // Verify no more duplicates
  const verifyResult = await db.execute(`
    SELECT name, COUNT(*) as count 
    FROM abilities 
    GROUP BY name 
    HAVING count > 1
  `);
  
  if (verifyResult.rows.length === 0) {
    console.log('✅ No duplicates remaining!');
  } else {
    console.log('⚠️  Still have duplicates:', verifyResult.rows);
  }
}

cleanupDuplicates().catch(console.error);
