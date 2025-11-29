#!/usr/bin/env node

/**
 * Fix all tiered abilities (I-V) to have proper level and stat requirements
 * Pattern: Tier I (3/16), II (16/32), III (23/40), IV (36/58), V (49/71)
 */

import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Tier requirements
const tierRequirements = {
  'I': { level: 3, stat: 16 },
  'II': { level: 16, stat: 32 },
  'III': { level: 23, stat: 40 },  
  'IV': { level: 36, stat: 58 },
  'V': { level: 49, stat: 71 },
};

// Stat mapping based on ability type/name
const statMapping = {
  // Strength abilities
  'Strike': 'strength',
  'Cleave': 'strength',
  'Execute': 'strength',
  'War Cry': 'strength',
  'Berserker Rage': 'strength',
  'Shield Bash': 'strength',
  'Taunt': 'strength',
  'Kick': 'strength',
  'Rend': 'strength',
  'Hamstring': 'strength',
  
  // Dexterity abilities
  'Backstab': 'dexterity',
  'Precise Strike': 'dexterity',
  'Dodge': 'dexterity',
  'Adrenaline Rush': 'dexterity',
  
  // Intelligence abilities
  'Fireball': 'intelligence',
  'Blizzard': 'intelligence',
  'Frostbolt': 'intelligence',
  'Shadow Bolt': 'intelligence',
  'Life Drain': 'intelligence',
  'Arcane Brilliance': 'intelligence',
  
  // Wisdom abilities
  'Heal': 'wisdom',
  'Mend': 'wisdom',
  'Regeneration': 'wisdom',
  'Blessing': 'wisdom',
  'Thorns': 'wisdom',
  'Battle Fury': 'wisdom',
  
  // Charisma abilities (Bard)
  'Song of Courage': 'charisma',
  'Song of Fortitude': 'charisma',
  'Song of Swiftness': 'charisma',
  'Ballad of Restoration': 'charisma',
  'Hymn of Renewal': 'charisma',
  'Melody of Mending': 'charisma',
  'Dirge of Despair': 'charisma',
  'Discordant Note': 'charisma',
  'Cacophony': 'charisma',
};

async function fixAbilities() {
  console.log('Fixing tiered ability requirements...\n');

  // Get all tiered abilities
  const result = await client.execute({
    sql: `SELECT id, name FROM abilities 
          WHERE name LIKE '% I' 
             OR name LIKE '% II' 
             OR name LIKE '% III' 
             OR name LIKE '% IV' 
             OR name LIKE '% V'
          ORDER BY name`,
    args: [],
  });

  const abilities = result.rows;
  console.log(`Found ${abilities.length} tiered abilities\n`);

  let updated = 0;
  let skipped = 0;

  for (const ability of abilities) {
    // Extract base name and tier
    const match = ability.name.match(/^(.+)\s+(I|II|III|IV|V)$/);
    if (!match) {
      console.log(`  ⚠️  Skipped ${ability.name} - couldn't parse tier`);
      skipped++;
      continue;
    }

    const [, baseName, tier] = match;
    const requirements = tierRequirements[tier];

    if (!requirements) {
      console.log(`  ⚠️  Skipped ${ability.name} - unknown tier ${tier}`);
      skipped++;
      continue;
    }

    // Find stat type for this ability
    let statType = null;
    for (const [abilityBase, stat] of Object.entries(statMapping)) {
      if (baseName === abilityBase || baseName.startsWith(abilityBase)) {
        statType = stat;
        break;
      }
    }

    if (!statType) {
      console.log(`  ⚠️  Skipped ${ability.name} - couldn't determine stat type`);
      skipped++;
      continue;
    }

    // Build update based on stat type
    const updateSql = `UPDATE abilities 
      SET required_level = ?,
          required_strength = ?,
          required_dexterity = ?,
          required_constitution = 0,
          required_intelligence = ?,
          required_wisdom = ?,
          required_charisma = ?
      WHERE id = ?`;

    const args = [
      requirements.level,
      statType === 'strength' ? requirements.stat : 0,
      statType === 'dexterity' ? requirements.stat : 0,
      statType === 'intelligence' ? requirements.stat : 0,
      statType === 'wisdom' ? requirements.stat : 0,
      statType === 'charisma' ? requirements.stat : 0,
      ability.id
    ];

    await client.execute({ sql: updateSql, args });

    console.log(`  ✓ ${ability.name}: Level ${requirements.level}, ${statType.toUpperCase()} ${requirements.stat}`);
    updated++;
  }

  console.log(`\n✓ Updated ${updated} abilities`);
  console.log(`⚠️  Skipped ${skipped} abilities`);
}

async function fixScrolls() {
  console.log('\nFixing scroll requirements to match abilities...\n');

  // Get all scrolls with their ability IDs
  const scrollsResult = await client.execute({
    sql: `SELECT id, teaches_ability_id FROM items WHERE type = 'scroll' AND teaches_ability_id IS NOT NULL`,
    args: [],
  });

  let updated = 0;

  for (const scroll of scrollsResult.rows) {
    // Get ability requirements
    const abilityResult = await client.execute({
      sql: `SELECT required_level, required_strength, required_dexterity, required_constitution,
                   required_intelligence, required_wisdom, required_charisma
            FROM abilities WHERE id = ?`,
      args: [scroll.teaches_ability_id],
    });

    if (abilityResult.rows.length === 0) continue;

    const ability = abilityResult.rows[0];

    // Update scroll with ability requirements
    await client.execute({
      sql: `UPDATE items 
            SET required_level = ?,
                required_strength = ?,
                required_dexterity = ?,
                required_constitution = ?,
                required_intelligence = ?,
                required_wisdom = ?,
                required_charisma = ?
            WHERE id = ?`,
      args: [
        ability.required_level,
        ability.required_strength,
        ability.required_dexterity,
        ability.required_constitution,
        ability.required_intelligence,
        ability.required_wisdom,
        ability.required_charisma,
        scroll.id
      ],
    });

    updated++;
  }

  console.log(`✓ Updated ${updated} scroll requirements\n`);
}

async function checkResults() {
  console.log('Checking results...\n');

  // Sample a few abilities
  const samples = await client.execute({
    sql: `SELECT name, required_level, required_strength, required_dexterity, 
                 required_intelligence, required_wisdom, required_charisma
          FROM abilities 
          WHERE name IN ('Strike I', 'Strike V', 'Backstab I', 'Backstab V', 
                        'Fireball I', 'Fireball V', 'Heal I', 'Heal V')
          ORDER BY name`,
    args: [],
  });

  console.log('Sample abilities:');
  for (const ability of samples.rows) {
    const stats = [];
    if (ability.required_strength) stats.push(`${ability.required_strength} STR`);
    if (ability.required_dexterity) stats.push(`${ability.required_dexterity} DEX`);
    if (ability.required_intelligence) stats.push(`${ability.required_intelligence} INT`);
    if (ability.required_wisdom) stats.push(`${ability.required_wisdom} WIS`);
    if (ability.required_charisma) stats.push(`${ability.required_charisma} CHA`);
    
    console.log(`  ${ability.name}: Lvl ${ability.required_level}, ${stats.join(', ')}`);
  }
}

async function main() {
  try {
    console.log('=== Fixing Tiered Ability Requirements ===\n');
    
    await fixAbilities();
    await fixScrolls();
    await checkResults();
    
    console.log('\n✓ Done!\n');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
