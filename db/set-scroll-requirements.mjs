#!/usr/bin/env node
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Map ability base names to their primary stat
const abilityStats = {
  // Strength-based
  'Berserker Rage': 'strength',
  'Cleave': 'strength',
  'Execute': 'strength',
  'Kick': 'strength',
  'Rend': 'strength',
  'Shield Bash': 'strength',
  'Strike': 'strength',
  'War Cry': 'strength',
  
  // Dexterity-based
  'Adrenaline Rush': 'dexterity',
  'Backstab': 'dexterity',
  'Dodge': 'dexterity',
  'Hamstring': 'dexterity',
  'Precise Strike': 'dexterity',
  
  // Intelligence-based
  'Arcane Brilliance': 'intelligence',
  'Blizzard': 'intelligence',
  'Fireball': 'intelligence',
  'Frostbolt': 'intelligence',
  'Life Drain': 'intelligence',
  'Shadow Bolt': 'intelligence',
  
  // Wisdom-based
  'Battle Fury': 'wisdom',
  'Blessing': 'wisdom',
  'Heal': 'wisdom',
  'Mend': 'wisdom',
  'Regeneration': 'wisdom',
  'Thorns': 'wisdom',
  
  // Charisma-based (Bard abilities)
  'Ballad of Restoration': 'charisma',
  'Cacophony': 'charisma',
  'Dirge of Despair': 'charisma',
  'Discordant Note': 'charisma',
  'Hymn of Renewal': 'charisma',
  'Melody of Mending': 'charisma',
  'Song of Courage': 'charisma',
  'Song of Fortitude': 'charisma',
  'Song of Swiftness': 'charisma',
  'Taunt': 'charisma',
};

// Level and stat requirements for each tier (based on War Cry pattern)
const tierRequirements = {
  'I': { level: 3, statMultiplier: 16 },
  'II': { level: 16, statMultiplier: 32 },
  'III': { level: 23, statMultiplier: 40 },
  'IV': { level: 36, statMultiplier: 58 },
  'V': { level: 49, statMultiplier: 71 },
};

async function main() {
  console.log('🔍 Finding all ability scrolls...\n');
  
  // Get all scrolls that teach abilities
  const scrolls = await db.execute(`
    SELECT 
      i.id,
      i.name,
      i.teaches_ability_id,
      a.name as ability_name
    FROM items i
    JOIN abilities a ON i.teaches_ability_id = a.id
    WHERE i.type = 'scroll'
      AND i.teaches_ability_id IS NOT NULL
    ORDER BY a.name
  `);

  console.log(`Found ${scrolls.rows.length} ability scrolls\n`);

  let updated = 0;
  let skipped = 0;

  for (const scroll of scrolls.rows) {
    // Extract ability base name and tier
    const match = scroll.ability_name.match(/^(.+?)\s+([IVX]+)$/);
    if (!match) {
      console.log(`⚠️  Skipping ${scroll.name} - couldn't parse tier`);
      skipped++;
      continue;
    }

    const [, baseName, tier] = match;
    const primaryStat = abilityStats[baseName];
    
    if (!primaryStat) {
      console.log(`⚠️  Skipping ${scroll.name} - no stat mapping for ${baseName}`);
      skipped++;
      continue;
    }

    const requirements = tierRequirements[tier];
    if (!requirements) {
      console.log(`⚠️  Skipping ${scroll.name} - unknown tier ${tier}`);
      skipped++;
      continue;
    }

    // Calculate stat requirement
    const statRequirement = requirements.statMultiplier;

    // Build update SQL based on which stat
    const statColumns = {
      strength: 'required_strength',
      dexterity: 'required_dexterity',
      constitution: 'required_constitution',
      intelligence: 'required_intelligence',
      wisdom: 'required_wisdom',
      charisma: 'required_charisma',
    };

    // Set all stats to 0 first, then set the primary stat
    const updates = {
      required_level: requirements.level,
      required_strength: 0,
      required_dexterity: 0,
      required_constitution: 0,
      required_intelligence: 0,
      required_wisdom: 0,
      required_charisma: 0,
    };
    
    updates[statColumns[primaryStat]] = statRequirement;

    await db.execute({
      sql: `UPDATE items SET
        required_level = ?,
        required_strength = ?,
        required_dexterity = ?,
        required_constitution = ?,
        required_intelligence = ?,
        required_wisdom = ?,
        required_charisma = ?
      WHERE id = ?`,
      args: [
        updates.required_level,
        updates.required_strength,
        updates.required_dexterity,
        updates.required_constitution,
        updates.required_intelligence,
        updates.required_wisdom,
        updates.required_charisma,
        scroll.id,
      ],
    });

    console.log(`✅ ${scroll.name.padEnd(35)} Lv${requirements.level} ${primaryStat.substring(0, 3).toUpperCase()}:${statRequirement}`);
    updated++;
  }

  console.log(`\n--- Summary ---`);
  console.log(`✅ Updated: ${updated} scrolls`);
  console.log(`⚠️  Skipped: ${skipped} scrolls`);

  // Verify a few examples
  console.log(`\n--- Verification (Sample) ---`);
  const samples = await db.execute(`
    SELECT 
      i.name,
      i.required_level,
      i.required_strength,
      i.required_dexterity,
      i.required_intelligence,
      i.required_wisdom,
      i.required_charisma
    FROM items i
    WHERE i.name IN (
      'Scroll: War Cry V',
      'Scroll: Backstab V',
      'Scroll: Fireball V',
      'Scroll: Heal V',
      'Scroll: Song of Courage V'
    )
    ORDER BY i.name
  `);

  samples.rows.forEach(row => {
    const stats = [];
    if (row.required_strength > 0) stats.push(`STR:${row.required_strength}`);
    if (row.required_dexterity > 0) stats.push(`DEX:${row.required_dexterity}`);
    if (row.required_intelligence > 0) stats.push(`INT:${row.required_intelligence}`);
    if (row.required_wisdom > 0) stats.push(`WIS:${row.required_wisdom}`);
    if (row.required_charisma > 0) stats.push(`CHA:${row.required_charisma}`);
    console.log(`${row.name.padEnd(35)} Lv${row.required_level} ${stats.join(', ')}`);
  });

  console.log('\n✅ Done!');
}

main().catch(console.error);
