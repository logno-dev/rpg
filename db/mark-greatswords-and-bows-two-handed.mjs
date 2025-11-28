#!/usr/bin/env node
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  console.log('Checking current weapon classifications...\n');
  
  // Check for greatswords
  const greatswords = await db.execute(`
    SELECT name, weapon_type, is_two_handed 
    FROM items 
    WHERE slot = 'weapon' 
    AND (name LIKE '%greatsword%' OR name LIKE '%Greatsword%')
    ORDER BY name
  `);
  
  console.log(`Found ${greatswords.rows.length} greatswords:`);
  greatswords.rows.forEach(row => {
    console.log(`  - ${row.name} (type: ${row.weapon_type}, 2H: ${row.is_two_handed})`);
  });
  
  // Check all bows
  const bows = await db.execute(`
    SELECT name, weapon_type, is_two_handed 
    FROM items 
    WHERE slot = 'weapon' 
    AND weapon_type = 'bow'
    ORDER BY name
  `);
  
  console.log(`\nFound ${bows.rows.length} bows:`);
  bows.rows.forEach(row => {
    console.log(`  - ${row.name} (2H: ${row.is_two_handed})`);
  });
  
  console.log('\n--- Applying Updates ---\n');
  
  // Mark all greatswords as 2-handed
  if (greatswords.rows.length > 0) {
    const result1 = await db.execute(`
      UPDATE items 
      SET is_two_handed = 1, weapon_type = 'greatsword'
      WHERE slot = 'weapon' 
      AND (name LIKE '%greatsword%' OR name LIKE '%Greatsword%')
    `);
    console.log(`✅ Marked ${result1.rowsAffected} greatswords as 2-handed`);
  }
  
  // Ensure all bows are 1-handed (is_two_handed = 0)
  if (bows.rows.length > 0) {
    const result2 = await db.execute(`
      UPDATE items 
      SET is_two_handed = 0
      WHERE slot = 'weapon' 
      AND weapon_type = 'bow'
    `);
    console.log(`✅ Marked ${result2.rowsAffected} bows as 1-handed`);
  }
  
  console.log('\n--- Verification ---\n');
  
  // Verify greatswords
  const verifyGreatswords = await db.execute(`
    SELECT name, weapon_type, is_two_handed 
    FROM items 
    WHERE slot = 'weapon' 
    AND weapon_type = 'greatsword'
    ORDER BY name
  `);
  
  console.log(`Greatswords (all should be 2H):`);
  verifyGreatswords.rows.forEach(row => {
    const check = row.is_two_handed === 1 ? '✅' : '❌';
    console.log(`  ${check} ${row.name} (2H: ${row.is_two_handed})`);
  });
  
  // Verify bows
  const verifyBows = await db.execute(`
    SELECT name, is_two_handed 
    FROM items 
    WHERE slot = 'weapon' 
    AND weapon_type = 'bow'
    ORDER BY name
    LIMIT 10
  `);
  
  console.log(`\nBows (all should be 1H, showing first 10):`);
  verifyBows.rows.forEach(row => {
    const check = row.is_two_handed === 0 ? '✅' : '❌';
    console.log(`  ${check} ${row.name} (2H: ${row.is_two_handed})`);
  });
  
  console.log('\n✅ Done!');
}

main().catch(console.error);
