import { createClient } from '@libsql/client';
import { config } from 'dotenv';

config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log('=== RECALCULATING MANA FOR ALL CHARACTERS ===\n');

// New formula: Base + (Level × 20) + (INT - 10) × 5
function calculateMaxMana(level, intelligence) {
  const baseMana = 100;
  const levelBonus = level * 20;
  const intelligenceBonus = (intelligence - 10) * 5;
  return baseMana + levelBonus + intelligenceBonus;
}

// Get all characters
const chars = await db.execute({
  sql: 'SELECT id, name, level, intelligence, max_mana, current_mana FROM characters',
  args: []
});

console.log(`Found ${chars.rows.length} characters to update:\n`);

for (const char of chars.rows) {
  const newMaxMana = calculateMaxMana(char.level, char.intelligence);
  const manaIncrease = newMaxMana - char.max_mana;
  const newCurrentMana = char.current_mana + manaIncrease;
  
  console.log(`${char.name} (Lvl ${char.level}, ${char.intelligence} INT):`);
  console.log(`  Old max mana: ${char.max_mana}`);
  console.log(`  New max mana: ${newMaxMana} (+${manaIncrease})`);
  console.log(`  Current mana: ${char.current_mana} → ${newCurrentMana}`);
  
  // Update the character
  await db.execute({
    sql: 'UPDATE characters SET max_mana = ?, current_mana = ? WHERE id = ?',
    args: [newMaxMana, newCurrentMana, char.id]
  });
  
  console.log(`  ✓ Updated!\n`);
}

console.log('=== COMPLETE ===');
console.log('All characters have been updated with the new mana formula!');

db.close();
