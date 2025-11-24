import { createClient } from '@libsql/client';
import { config } from 'dotenv';

config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Calculate what mana should be at level 8, 36 INT
const level = 8;
const intelligence = 36;
const baseMana = 100;
const levelBonus = level * 20;  // 160
const intBonus = (intelligence - 10) * 5;  // 130

const expectedMana = baseMana + levelBonus + intBonus;
console.log('=== MANA CALCULATION ===');
console.log(`Level ${level}, ${intelligence} INT:`);
console.log(`  Base: ${baseMana}`);
console.log(`  Level bonus: ${level} × 20 = ${levelBonus}`);
console.log(`  INT bonus: (${intelligence} - 10) × 5 = ${intBonus}`);
console.log(`  TOTAL: ${expectedMana} mana\n`);

// Check typical spell costs
console.log('=== SPELL MANA COSTS (Level 1-10) ===');
const spells = await db.execute({
  sql: `SELECT name, type, required_level, mana_cost, damage_min, damage_max, healing
        FROM abilities 
        WHERE required_level <= 10 AND mana_cost > 0
        ORDER BY required_level, mana_cost`,
  args: []
});

spells.rows.forEach(spell => {
  const efficiency = spell.damage_max ? (spell.damage_max / spell.mana_cost).toFixed(1) : 
                     spell.healing ? (spell.healing / spell.mana_cost).toFixed(1) : 'N/A';
  console.log(`${spell.name} (Lvl ${spell.required_level}): ${spell.mana_cost} mana`);
  console.log(`  Type: ${spell.type}, Damage: ${spell.damage_min}-${spell.damage_max}, Heal: ${spell.healing || 0}`);
  console.log(`  Efficiency: ${efficiency} dmg/heal per mana`);
  console.log();
});

// Calculate how many casts at 390 mana
console.log(`\n=== CASTS AVAILABLE WITH ${expectedMana} MANA ===`);
const commonCosts = [10, 15, 20, 25, 30, 40, 50];
commonCosts.forEach(cost => {
  const casts = Math.floor(expectedMana / cost);
  console.log(`${cost} mana spell: ${casts} casts`);
});

db.close();
