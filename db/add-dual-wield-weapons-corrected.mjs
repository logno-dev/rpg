#!/usr/bin/env node

/**
 * Add CORRECT dual-wield weapons (dual daggers, dual swords)
 * These take up BOTH weapon AND offhand slots (like a 2H weapon but uses both slots)
 * Also add 2-handed weapons (greataxes, greatswords) for level 20+
 */

import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Material tiers for level 20+ weapons
const materialTiers = [
  { name: 'Mithril', level: 21, dmgMult: 1.0 },
  { name: 'Enchanted Mithril', level: 24, dmgMult: 1.13 },
  { name: 'Runic', level: 27, dmgMult: 1.26 },
  { name: 'Dragonbone', level: 30, dmgMult: 1.39 },
  { name: 'Obsidian', level: 33, dmgMult: 1.52 },
  { name: 'Starforged', level: 36, dmgMult: 1.65 },
  { name: 'Voidtouched', level: 39, dmgMult: 1.78 },
  { name: 'Celestial', level: 42, dmgMult: 1.91 },
  { name: 'Ethereal', level: 45, dmgMult: 2.04 },
  { name: 'Primordial', level: 48, dmgMult: 2.17 },
  { name: 'Godforged', level: 51, dmgMult: 2.30 },
  { name: 'Timeless', level: 54, dmgMult: 2.43 },
  { name: 'Mythical', level: 57, dmgMult: 2.56 },
  { name: 'Ascendant', level: 60, dmgMult: 2.69 },
];

// Weapon type configurations
const weaponTypes = {
  dualDaggers: {
    baseName: 'Dual Daggers',
    weaponType: 'dual_dagger',
    offhandType: null, // Not used for slot, just for marking it blocks offhand
    slot: 'weapon', // Goes in WEAPON slot
    attackSpeed: 0.5, // Very fast
    baseDmgMin: 12,
    baseDmgMax: 20,
    description: 'A pair of matched daggers wielded together, requiring both hands',
    isTwoHanded: 1, // Marks it as 2H so it unequips offhand
    blocksOffhand: true, // Custom flag - we'll handle this in equip logic
    rarity: 'uncommon',
  },
  dualSwords: {
    baseName: 'Dual Swords',
    weaponType: 'dual_sword',
    offhandType: null,
    slot: 'weapon', // Goes in WEAPON slot
    attackSpeed: 0.6, // Fast
    baseDmgMin: 16,
    baseDmgMax: 26,
    description: 'Twin blades wielded in tandem, requiring both hands for maximum effectiveness',
    isTwoHanded: 1, // Marks it as 2H so it unequips offhand
    blocksOffhand: true,
    rarity: 'uncommon',
  },
  greatsword: {
    baseName: 'Greatsword',
    weaponType: 'greatsword',
    offhandType: null,
    slot: 'weapon',
    attackSpeed: 1.7, // Slow
    baseDmgMin: 28,
    baseDmgMax: 44,
    description: 'A massive two-handed sword requiring great strength to wield',
    isTwoHanded: 1,
    blocksOffhand: false,
    rarity: 'rare',
  },
  greataxe: {
    baseName: 'Greataxe',
    weaponType: 'greataxe',
    offhandType: null,
    slot: 'weapon',
    attackSpeed: 2.0, // Very slow
    baseDmgMin: 32,
    baseDmgMax: 52,
    description: 'A devastating two-handed axe that crushes armor and bone alike',
    isTwoHanded: 1,
    blocksOffhand: false,
    rarity: 'rare',
  },
};

async function addWeapons() {
  console.log('Starting weapon addition...\n');

  const weapons = [];
  let startingId = 1854; // Next available ID

  // Generate all weapon combinations
  for (const typeConfig of Object.values(weaponTypes)) {
    for (const tier of materialTiers) {
      const weapon = {
        id: startingId++,
        name: `${tier.name} ${typeConfig.baseName}`,
        description: typeConfig.description,
        type: 'weapon',
        slot: typeConfig.slot,
        rarity: typeConfig.rarity,
        damage_min: Math.round(typeConfig.baseDmgMin * tier.dmgMult),
        damage_max: Math.round(typeConfig.baseDmgMax * tier.dmgMult),
        attack_speed: typeConfig.attackSpeed,
        weapon_type: typeConfig.weaponType,
        offhand_type: typeConfig.offhandType,
        is_two_handed: typeConfig.isTwoHanded,
        required_level: tier.level,
        required_strength: tier.level * 2, // Scale STR requirement with level
        value: tier.level * 50 * (typeConfig.isTwoHanded ? 2 : 1.5),
        stackable: 0,
      };
      weapons.push(weapon);
    }
  }

  console.log(`Generated ${weapons.length} weapons`);
  console.log('Sample weapons:');
  console.log(weapons.slice(0, 3).map(w => `  ${w.name} (Lvl ${w.required_level}): ${w.damage_min}-${w.damage_max} dmg, ${w.attack_speed}s speed, 2H: ${w.is_two_handed ? 'Yes' : 'No'}`).join('\n'));
  console.log('  ...\n');

  // Insert weapons
  for (const weapon of weapons) {
    await client.execute({
      sql: `INSERT INTO items (
        id, name, description, type, slot, rarity,
        damage_min, damage_max, attack_speed, weapon_type, offhand_type,
        is_two_handed, required_level, required_strength, value, stackable
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        weapon.id,
        weapon.name,
        weapon.description,
        weapon.type,
        weapon.slot,
        weapon.rarity,
        weapon.damage_min,
        weapon.damage_max,
        weapon.attack_speed,
        weapon.weapon_type,
        weapon.offhand_type,
        weapon.is_two_handed,
        weapon.required_level,
        weapon.required_strength,
        weapon.value,
        weapon.stackable,
      ],
    });
  }

  console.log(`✓ Inserted ${weapons.length} weapons\n`);
  return weapons;
}

async function addToLootTables(weapons) {
  console.log('Adding weapons to loot tables...\n');

  // Get level 20+ mobs
  const mobsResult = await client.execute(
    'SELECT id, name, level FROM mobs WHERE level >= 20 ORDER BY level'
  );
  const mobs = mobsResult.rows;

  console.log(`Found ${mobs.length} mobs (level 20+)`);

  let lootCount = 0;

  for (const mob of mobs) {
    // Find weapons appropriate for this mob's level (±3 levels)
    const appropriateWeapons = weapons.filter(
      w => w.required_level >= mob.level - 3 && w.required_level <= mob.level + 3
    );

    if (appropriateWeapons.length === 0) continue;

    // Add 1-2 random weapons per mob
    const numWeapons = Math.random() > 0.6 ? 2 : 1;
    const selectedWeapons = appropriateWeapons
      .sort(() => Math.random() - 0.5)
      .slice(0, numWeapons);

    for (const weapon of selectedWeapons) {
      // Drop chance based on rarity
      let dropChance;
      if (weapon.rarity === 'rare') {
        dropChance = 0.03; // 3% for 2H weapons
      } else if (weapon.rarity === 'uncommon') {
        dropChance = 0.05; // 5% for dual-wield
      } else {
        dropChance = 0.08;
      }

      await client.execute({
        sql: 'INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max) VALUES (?, ?, ?, ?, ?)',
        args: [mob.id, weapon.id, dropChance, 1, 1],
      });
      lootCount++;
    }
  }

  console.log(`✓ Added ${lootCount} loot table entries\n`);
}

async function addCraftingRecipes(weapons) {
  console.log('Adding crafting recipes...\n');

  // Create recipe groups for each weapon type
  const recipeGroups = [
    {
      name: 'Dual Daggers',
      description: 'Forge matched pairs of daggers for dual-wielding combat',
      profession_type: 'blacksmithing',
      category: 'weapon',
      min_level: 21,
      max_level: 60,
      craft_time_seconds: 18,
      base_experience: 200,
    },
    {
      name: 'Dual Swords',
      description: 'Craft twin blades for warriors who master dual-wielding',
      profession_type: 'blacksmithing',
      category: 'weapon',
      min_level: 21,
      max_level: 60,
      craft_time_seconds: 20,
      base_experience: 225,
    },
    {
      name: 'Greatsword',
      description: 'Master the art of crafting massive two-handed swords',
      profession_type: 'blacksmithing',
      category: 'weapon',
      min_level: 21,
      max_level: 60,
      craft_time_seconds: 25,
      base_experience: 275,
    },
    {
      name: 'Greataxe',
      description: 'Forge devastating two-handed axes of immense power',
      profession_type: 'blacksmithing',
      category: 'weapon',
      min_level: 21,
      max_level: 60,
      craft_time_seconds: 28,
      base_experience: 300,
    },
  ];

  // Get current max recipe_group id
  const maxGroupResult = await client.execute('SELECT MAX(id) as max_id FROM recipe_groups');
  let groupId = (maxGroupResult.rows[0].max_id || 3) + 1;

  for (const group of recipeGroups) {
    await client.execute({
      sql: `INSERT INTO recipe_groups (
        id, name, description, profession_type, category,
        min_level, max_level, craft_time_seconds, base_experience
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        groupId,
        group.name,
        group.description,
        group.profession_type,
        group.category,
        group.min_level,
        group.max_level,
        group.craft_time_seconds,
        group.base_experience,
      ],
    });

    console.log(`✓ Created recipe group: ${group.name} (ID: ${groupId})`);

    // Add recipe outputs for this group
    const groupWeapons = weapons.filter(w => w.name.includes(group.name));
    
    for (const weapon of groupWeapons) {
      const profLevel = weapon.required_level;
      
      await client.execute({
        sql: `INSERT INTO recipe_outputs (
          recipe_group_id, item_id, min_profession_level,
          base_weight, weight_per_level, quality_bonus_weight, is_named
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          groupId,
          weapon.id,
          profLevel,
          100, // base_weight
          10,  // weight_per_level
          50,  // quality_bonus_weight
          0,   // is_named
        ],
      });
    }

    console.log(`  Added ${groupWeapons.length} outputs to group`);
    groupId++;
  }

  console.log(`\n✓ Created ${recipeGroups.length} recipe groups\n`);
}

async function verify(weapons) {
  console.log('Verifying additions...\n');

  // Count weapons by type
  const dualDaggers = weapons.filter(w => w.weapon_type === 'dual_dagger');
  const dualSwords = weapons.filter(w => w.weapon_type === 'dual_sword');
  const greatswords = weapons.filter(w => w.weapon_type === 'greatsword');
  const greataxes = weapons.filter(w => w.weapon_type === 'greataxe');

  console.log('Weapon counts:');
  console.log(`  Dual Daggers: ${dualDaggers.length} (all in weapon slot, 2H)`);
  console.log(`  Dual Swords: ${dualSwords.length} (all in weapon slot, 2H)`);
  console.log(`  Greatswords: ${greatswords.length} (2H)`);
  console.log(`  Greataxes: ${greataxes.length} (2H)`);
  console.log(`  Total: ${weapons.length}\n`);

  // Sample check
  const sampleDual = await client.execute({
    sql: 'SELECT * FROM items WHERE name = ? LIMIT 1',
    args: ['Mithril Dual Swords'],
  });

  if (sampleDual.rows.length > 0) {
    const weapon = sampleDual.rows[0];
    console.log('Sample dual-wield weapon:');
    console.log(`  ${weapon.name}`);
    console.log(`  Level: ${weapon.required_level}, STR: ${weapon.required_strength}`);
    console.log(`  Damage: ${weapon.damage_min}-${weapon.damage_max}`);
    console.log(`  Attack Speed: ${weapon.attack_speed}s`);
    console.log(`  Slot: ${weapon.slot}`);
    console.log(`  2H: ${weapon.is_two_handed ? 'Yes' : 'No'} (blocks offhand)`);
    console.log(`  Type: ${weapon.weapon_type}\n`);
  }

  // Check loot tables
  const lootCheck = await client.execute(
    'SELECT COUNT(*) as count FROM mob_loot WHERE item_id >= 1854'
  );
  console.log(`Loot table entries: ${lootCheck.rows[0].count}`);

  // Check recipe groups
  const recipeCheck = await client.execute(
    'SELECT COUNT(*) as count FROM recipe_groups WHERE name IN (\'Dual Daggers\', \'Dual Swords\', \'Greatsword\', \'Greataxe\')'
  );
  console.log(`Recipe groups created: ${recipeCheck.rows[0].count}\n`);
}

async function main() {
  try {
    console.log('=== Adding Dual-Wield and 2-Handed Weapons (CORRECTED) ===\n');
    console.log('Dual weapons now go in WEAPON slot and block offhand (like 2H weapons)\n');

    const weapons = await addWeapons();
    await addToLootTables(weapons);
    await addCraftingRecipes(weapons);
    await verify(weapons);

    console.log('✓ All done!\n');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
