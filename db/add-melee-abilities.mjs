#!/usr/bin/env node
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log('⚔️  Creating melee ability sets...\n');

// Define ability sets with 5 tiers each
const abilitySets = [
  {
    baseName: 'Strike',
    category: 'damage',
    type: 'ability',
    primaryStat: 'strength',
    baseDescription: 'A powerful melee attack that deals physical damage.',
    baseMana: 0,
    baseCooldown: 6,
    tiers: [
      { level: 1, reqStr: 10, scaling: 0.5, description: 'A basic melee strike.' },
      { level: 3, reqStr: 15, scaling: 0.7, description: 'An improved strike with increased damage.' },
      { level: 5, reqStr: 20, scaling: 0.9, description: 'A forceful strike that hits hard.' },
      { level: 8, reqStr: 25, scaling: 1.1, description: 'A devastating strike with massive power.' },
      { level: 12, reqStr: 30, scaling: 1.3, description: 'An overwhelming strike that crushes enemies.' }
    ]
  },
  {
    baseName: 'Cleave',
    category: 'damage',
    type: 'ability',
    primaryStat: 'strength',
    baseDescription: 'A wide sweeping attack that can hit multiple enemies.',
    baseMana: 10,
    baseCooldown: 12,
    tiers: [
      { level: 2, reqStr: 12, scaling: 0.6, description: 'Swing your weapon in a wide arc.' },
      { level: 5, reqStr: 18, scaling: 0.8, description: 'A broader cleave with more power.' },
      { level: 8, reqStr: 24, scaling: 1.0, description: 'Cleave through enemies with tremendous force.' },
      { level: 12, reqStr: 30, scaling: 1.2, description: 'A massive cleave that devastates all nearby foes.' },
      { level: 16, reqStr: 36, scaling: 1.4, description: 'An earth-shattering cleave of unmatched power.' }
    ]
  },
  {
    baseName: 'War Cry',
    category: 'buff',
    type: 'buff',
    primaryStat: 'strength',
    baseDescription: 'A rallying shout that increases your damage.',
    baseMana: 15,
    baseCooldown: 30,
    tiers: [
      { level: 3, reqStr: 14, scaling: 0.2, description: 'Let out a war cry, boosting your attack power.' },
      { level: 6, reqStr: 20, scaling: 0.3, description: 'A louder war cry with greater effect.' },
      { level: 10, reqStr: 26, scaling: 0.4, description: 'An inspiring war cry that significantly boosts damage.' },
      { level: 14, reqStr: 32, scaling: 0.5, description: 'A terrifying war cry that greatly empowers you.' },
      { level: 18, reqStr: 38, scaling: 0.6, description: 'A legendary war cry that makes you unstoppable.' }
    ]
  },
  {
    baseName: 'Adrenaline Rush',
    category: 'buff',
    type: 'buff',
    primaryStat: 'dexterity',
    baseDescription: 'Channel adrenaline to increase attack speed and evasion.',
    baseMana: 20,
    baseCooldown: 35,
    tiers: [
      { level: 4, reqDex: 16, scaling: 0.25, description: 'Surge with adrenaline, increasing speed.' },
      { level: 8, reqDex: 22, scaling: 0.35, description: 'A stronger rush that boosts agility further.' },
      { level: 12, reqDex: 28, scaling: 0.45, description: 'An intense rush that makes you lightning fast.' },
      { level: 16, reqDex: 34, scaling: 0.55, description: 'A powerful surge of adrenaline granting superior speed.' },
      { level: 20, reqDex: 40, scaling: 0.65, description: 'Peak adrenaline state with maximum speed and evasion.' }
    ]
  },
  {
    baseName: 'Precise Strike',
    category: 'damage',
    type: 'ability',
    primaryStat: 'dexterity',
    baseDescription: 'A precise attack that always hits critical points.',
    baseMana: 8,
    baseCooldown: 10,
    tiers: [
      { level: 2, reqDex: 12, scaling: 0.6, description: 'Strike with precision at vulnerable points.' },
      { level: 5, reqDex: 18, scaling: 0.8, description: 'An expertly aimed strike for maximum damage.' },
      { level: 9, reqDex: 24, scaling: 1.0, description: 'A masterful precise strike with deadly accuracy.' },
      { level: 13, reqDex: 30, scaling: 1.2, description: 'A surgical strike that never misses vital points.' },
      { level: 17, reqDex: 36, scaling: 1.4, description: 'Perfect precision delivering overwhelming damage.' }
    ]
  },
  {
    baseName: 'Hamstring',
    category: 'damage',
    type: 'ability',
    primaryStat: 'dexterity',
    baseDescription: 'Slash at enemy legs, dealing damage and slowing them.',
    baseMana: 5,
    baseCooldown: 14,
    tiers: [
      { level: 3, reqDex: 14, scaling: 0.4, description: 'Cut at enemy tendons to slow their movement.' },
      { level: 6, reqDex: 20, scaling: 0.6, description: 'A deeper cut that severely hampers mobility.' },
      { level: 10, reqDex: 26, scaling: 0.8, description: 'Expertly sever leg muscles, crippling enemies.' },
      { level: 14, reqDex: 32, scaling: 1.0, description: 'A devastating hamstring that nearly immobilizes foes.' },
      { level: 18, reqDex: 38, scaling: 1.2, description: 'Completely cripple enemies with a perfect hamstring.' }
    ]
  },
  {
    baseName: 'Shield Bash',
    category: 'damage',
    type: 'ability',
    primaryStat: 'strength',
    baseDescription: 'Smash enemies with your shield, dealing damage and stunning.',
    baseMana: 12,
    baseCooldown: 15,
    tiers: [
      { level: 4, reqStr: 16, scaling: 0.5, description: 'Bash enemies with your shield.' },
      { level: 8, reqStr: 22, scaling: 0.7, description: 'A harder bash with increased stunning power.' },
      { level: 12, reqStr: 28, scaling: 0.9, description: 'A powerful shield bash that dazes foes.' },
      { level: 16, reqStr: 34, scaling: 1.1, description: 'A crushing bash that severely stuns enemies.' },
      { level: 20, reqStr: 40, scaling: 1.3, description: 'An overwhelming bash that can knock out opponents.' }
    ]
  },
  {
    baseName: 'Berserker Rage',
    category: 'buff',
    type: 'buff',
    primaryStat: 'strength',
    baseDescription: 'Enter a rage state, increasing damage but reducing defense.',
    baseMana: 25,
    baseCooldown: 45,
    tiers: [
      { level: 6, reqStr: 20, scaling: 0.3, description: 'Enter a berserker rage, boosting damage output.' },
      { level: 10, reqStr: 26, scaling: 0.4, description: 'A deeper rage state with greater power.' },
      { level: 14, reqStr: 32, scaling: 0.5, description: 'Fierce rage that dramatically increases damage.' },
      { level: 18, reqStr: 38, scaling: 0.6, description: 'Wild berserker rage with devastating power.' },
      { level: 22, reqStr: 44, scaling: 0.7, description: 'Uncontrollable rage that obliterates all opposition.' }
    ]
  }
];

let abilitiesCreated = 0;
let scrollsCreated = 0;
const baseIdMap = new Map(); // Map baseName to base_id

for (const abilitySet of abilitySets) {
  console.log(`\n📋 Creating ${abilitySet.baseName} ability set...`);
  
  // Get or create base_id for this ability family
  let baseId = baseIdMap.get(abilitySet.baseName);
  if (!baseId) {
    const maxBaseIdResult = await db.execute('SELECT COALESCE(MAX(base_id), 0) as max_base_id FROM abilities');
    baseId = Number(maxBaseIdResult.rows[0].max_base_id) + 1;
    baseIdMap.set(abilitySet.baseName, baseId);
  }
  
  for (let i = 0; i < abilitySet.tiers.length; i++) {
    const tier = abilitySet.tiers[i];
    const tierNum = i + 1;
    const abilityName = `${abilitySet.baseName} ${['I', 'II', 'III', 'IV', 'V'][i]}`;
    
    // Create ability
    const abilityResult = await db.execute({
      sql: `
        INSERT INTO abilities (
          name, description, type, category, min_level, level,
          strength_required, dexterity_required,
          mana_cost, cooldown, primary_stat, stat_scaling, base_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        abilityName,
        tier.description,
        abilitySet.type,
        abilitySet.category,
        tier.level,
        tier.level,
        tier.reqStr || 0,
        tier.reqDex || 0,
        abilitySet.baseMana,
        abilitySet.baseCooldown,
        abilitySet.primaryStat,
        tier.scaling,
        baseId
      ]
    });
    
    const abilityId = Number(abilityResult.lastInsertRowid);
    abilitiesCreated++;
    
    // Create scroll for this ability
    const scrollName = `Scroll: ${abilityName}`;
    await db.execute({
      sql: `
        INSERT INTO items (
          name, description, type, rarity, stackable,
          teaches_ability_id, required_level, value
        ) VALUES (?, ?, 'scroll', ?, 1, ?, ?, ?)
      `,
      args: [
        scrollName,
        `Teaches you ${abilityName}. ${tier.description}`,
        tierNum <= 2 ? 'common' : tierNum <= 3 ? 'uncommon' : tierNum <= 4 ? 'rare' : 'epic',
        abilityId,
        tier.level,
        tier.level * 10
      ]
    });
    
    scrollsCreated++;
    console.log(`  ✓ ${abilityName} (Lv ${tier.level}) + scroll`);
  }
}

console.log(`\n✅ Created ${abilitiesCreated} melee abilities!`);
console.log(`✅ Created ${scrollsCreated} ability scrolls!`);
console.log(`\n📊 Ability sets created:`);
abilitySets.forEach(set => {
  console.log(`  - ${set.baseName} (${set.primaryStat}): ${set.tiers.length} tiers`);
});

process.exit(0);
