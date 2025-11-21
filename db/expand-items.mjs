import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnv() {
  try {
    const envPath = join(__dirname, '..', '.env');
    const envFile = readFileSync(envPath, 'utf-8');
    envFile.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').trim();
        process.env[key.trim()] = value;
      }
    });
  } catch (error) {
    console.error('Could not load .env file:', error.message);
  }
}

loadEnv();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function addItem(item) {
  await db.execute({
    sql: `INSERT INTO items (
      name, description, type, slot, rarity,
      strength_bonus, dexterity_bonus, constitution_bonus,
      intelligence_bonus, wisdom_bonus, charisma_bonus,
      damage_min, damage_max, armor, attack_speed, value,
      required_strength, required_dexterity, required_constitution,
      required_intelligence, required_wisdom, required_charisma, required_level
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      item.name, item.description, item.type, item.slot, item.rarity,
      item.str || 0, item.dex || 0, item.con || 0,
      item.int || 0, item.wis || 0, item.cha || 0,
      item.dmgMin || 0, item.dmgMax || 0, item.armor || 0, item.atkSpeed || 1.0, item.value,
      item.reqStr || 0, item.reqDex || 0, item.reqCon || 0,
      item.reqInt || 0, item.reqWis || 0, item.reqCha || 0, item.reqLvl || 0
    ]
  });
}

async function expandItems() {
  console.log('Expanding item database...\n');
  
  // ===== WEAPONS =====
  console.log('Adding tiered weapons...');
  
  // SWORDS (STR/DEX hybrid)
  const swords = [
    { prefix: 'Iron', level: 3, dmg: [8, 12], value: 120, reqStr: 12, reqDex: 10 },
    { prefix: 'Steel', level: 5, dmg: [12, 18], value: 250, reqStr: 14, reqDex: 12 },
    { prefix: 'Quality Steel', level: 7, dmg: [16, 24], value: 450, reqStr: 16, reqDex: 14 },
    { prefix: 'Tempered', level: 9, dmg: [20, 30], value: 700, reqStr: 18, reqDex: 16 },
    { prefix: 'Masterwork', level: 11, dmg: [24, 36], value: 1000, reqStr: 20, reqDex: 18 },
    { prefix: 'Pristine', level: 13, dmg: [28, 42], value: 1500, reqStr: 22, reqDex: 20 },
  ];
  
  for (const tier of swords) {
    await addItem({
      name: `${tier.prefix} Longsword`,
      description: `A well-crafted longsword made of ${tier.prefix.toLowerCase()} steel.`,
      type: 'weapon', slot: 'weapon', rarity: tier.level >= 11 ? 'rare' : 'common',
      dmgMin: tier.dmg[0], dmgMax: tier.dmg[1], atkSpeed: 1.2,
      str: Math.floor(tier.level / 3), dex: Math.floor(tier.level / 4),
      value: tier.value, reqStr: tier.reqStr, reqDex: tier.reqDex, reqLvl: tier.level
    });
  }
  console.log(`✓ Added ${swords.length} sword tiers`);
  
  // AXES (Pure STR)
  const axes = [
    { prefix: 'Iron', level: 3, dmg: [10, 14], value: 130, reqStr: 14 },
    { prefix: 'Steel', level: 5, dmg: [15, 21], value: 280, reqStr: 16 },
    { prefix: 'Heavy', level: 7, dmg: [20, 28], value: 500, reqStr: 18 },
    { prefix: 'Greataxe', level: 9, dmg: [25, 35], value: 750, reqStr: 20 },
    { prefix: 'Executioner', level: 11, dmg: [30, 42], value: 1100, reqStr: 22 },
    { prefix: 'Titan', level: 13, dmg: [35, 49], value: 1600, reqStr: 24 },
  ];
  
  for (const tier of axes) {
    await addItem({
      name: `${tier.prefix} Axe`,
      description: `A powerful axe that cleaves through armor.`,
      type: 'weapon', slot: 'weapon', rarity: tier.level >= 11 ? 'rare' : 'common',
      dmgMin: tier.dmg[0], dmgMax: tier.dmg[1], atkSpeed: 1.8,
      str: Math.floor(tier.level / 2),
      value: tier.value, reqStr: tier.reqStr, reqLvl: tier.level
    });
  }
  console.log(`✓ Added ${axes.length} axe tiers`);
  
  // DAGGERS (Pure DEX)
  const daggers = [
    { prefix: 'Sharp', level: 3, dmg: [6, 10], value: 100, reqDex: 14 },
    { prefix: 'Keen', level: 5, dmg: [9, 15], value: 220, reqDex: 16 },
    { prefix: 'Precise', level: 7, dmg: [12, 20], value: 400, reqDex: 18 },
    { prefix: 'Assassin', level: 9, dmg: [15, 25], value: 650, reqDex: 20 },
    { prefix: 'Shadow', level: 11, dmg: [18, 30], value: 950, reqDex: 22 },
    { prefix: 'Viper', level: 13, dmg: [21, 35], value: 1400, reqDex: 24 },
  ];
  
  for (const tier of daggers) {
    await addItem({
      name: `${tier.prefix} Dagger`,
      description: `A deadly dagger perfect for quick strikes.`,
      type: 'weapon', slot: 'weapon', rarity: tier.level >= 11 ? 'rare' : 'common',
      dmgMin: tier.dmg[0], dmgMax: tier.dmg[1], atkSpeed: 0.8,
      dex: Math.floor(tier.level / 2),
      value: tier.value, reqDex: tier.reqDex, reqLvl: tier.level
    });
  }
  console.log(`✓ Added ${daggers.length} dagger tiers`);
  
  // STAVES (INT)
  const staves = [
    { prefix: 'Oak', level: 3, dmg: [5, 8], value: 110, reqInt: 14 },
    { prefix: 'Willow', level: 5, dmg: [8, 12], value: 240, reqInt: 16 },
    { prefix: 'Yew', level: 7, dmg: [11, 16], value: 420, reqInt: 18 },
    { prefix: 'Enchanted', level: 9, dmg: [14, 20], value: 680, reqInt: 20 },
    { prefix: 'Archmage', level: 11, dmg: [17, 24], value: 980, reqInt: 22 },
    { prefix: 'Celestial', level: 13, dmg: [20, 28], value: 1450, reqInt: 24 },
  ];
  
  for (const tier of staves) {
    await addItem({
      name: `${tier.prefix} Staff`,
      description: `A magical staff that channels arcane power.`,
      type: 'weapon', slot: 'weapon', rarity: tier.level >= 11 ? 'rare' : 'common',
      dmgMin: tier.dmg[0], dmgMax: tier.dmg[1], atkSpeed: 1.5,
      int: Math.floor(tier.level / 2), wis: Math.floor(tier.level / 4),
      value: tier.value, reqInt: tier.reqInt, reqLvl: tier.level
    });
  }
  console.log(`✓ Added ${staves.length} staff tiers`);
  
  // BOWS (DEX)
  const bows = [
    { prefix: 'Short', level: 3, dmg: [7, 11], value: 115, reqDex: 13 },
    { prefix: 'Longbow', level: 5, dmg: [10, 16], value: 260, reqDex: 15 },
    { prefix: 'Composite', level: 7, dmg: [14, 22], value: 460, reqDex: 17 },
    { prefix: 'Elven', level: 9, dmg: [18, 28], value: 720, reqDex: 19 },
    { prefix: 'Masterwork', level: 11, dmg: [22, 34], value: 1050, reqDex: 21 },
    { prefix: 'Dragon', level: 13, dmg: [26, 40], value: 1550, reqDex: 23 },
  ];
  
  for (const tier of bows) {
    await addItem({
      name: `${tier.prefix} Bow`,
      description: `A finely crafted bow for ranged combat.`,
      type: 'weapon', slot: 'weapon', rarity: tier.level >= 11 ? 'rare' : 'common',
      dmgMin: tier.dmg[0], dmgMax: tier.dmg[1], atkSpeed: 1.1,
      dex: Math.floor(tier.level / 2), str: Math.floor(tier.level / 5),
      value: tier.value, reqDex: tier.reqDex, reqLvl: tier.level
    });
  }
  console.log(`✓ Added ${bows.length} bow tiers`);
  
  // ===== ARMOR =====
  console.log('\nAdding tiered armor...');
  
  // HEAVY ARMOR (STR/CON)
  const heavyArmor = [
    { prefix: 'Iron', level: 3, armor: 8, value: 200, reqStr: 12, reqCon: 12 },
    { prefix: 'Steel', level: 5, armor: 12, value: 400, reqStr: 14, reqCon: 14 },
    { prefix: 'Quality Steel', level: 7, armor: 16, value: 700, reqStr: 16, reqCon: 16 },
    { prefix: 'Reinforced', level: 9, armor: 20, value: 1100, reqStr: 18, reqCon: 18 },
    { prefix: 'Tempered Plate', level: 11, armor: 24, value: 1600, reqStr: 20, reqCon: 20 },
    { prefix: 'Pristine Plate', level: 13, armor: 28, value: 2300, reqStr: 22, reqCon: 22 },
  ];
  
  for (const tier of heavyArmor) {
    await addItem({
      name: `${tier.prefix} Armor`,
      description: `Heavy armor forged for maximum protection.`,
      type: 'armor', slot: 'chest', rarity: tier.level >= 11 ? 'rare' : 'common',
      armor: tier.armor,
      str: Math.floor(tier.level / 4), con: Math.floor(tier.level / 3),
      value: tier.value, reqStr: tier.reqStr, reqCon: tier.reqCon, reqLvl: tier.level
    });
  }
  console.log(`✓ Added ${heavyArmor.length} heavy armor tiers`);
  
  // LIGHT ARMOR (DEX)
  const lightArmor = [
    { prefix: 'Hardened Leather', level: 3, armor: 5, value: 150, reqDex: 12 },
    { prefix: 'Studded Leather', level: 5, armor: 8, value: 300, reqDex: 14 },
    { prefix: 'Quality Leather', level: 7, armor: 11, value: 550, reqDex: 16 },
    { prefix: 'Shadow Leather', level: 9, armor: 14, value: 850, reqDex: 18 },
    { prefix: 'Rogue', level: 11, armor: 17, value: 1250, reqDex: 20 },
    { prefix: 'Assassin', level: 13, armor: 20, value: 1800, reqDex: 22 },
  ];
  
  for (const tier of lightArmor) {
    await addItem({
      name: `${tier.prefix} Armor`,
      description: `Flexible armor that doesn't restrict movement.`,
      type: 'armor', slot: 'chest', rarity: tier.level >= 11 ? 'rare' : 'common',
      armor: tier.armor,
      dex: Math.floor(tier.level / 3), str: Math.floor(tier.level / 5),
      value: tier.value, reqDex: tier.reqDex, reqLvl: tier.level
    });
  }
  console.log(`✓ Added ${lightArmor.length} light armor tiers`);
  
  // ROBES (INT/WIS)
  const robes = [
    { prefix: 'Apprentice', level: 3, armor: 3, value: 140, reqInt: 12 },
    { prefix: 'Adept', level: 5, armor: 5, value: 280, reqInt: 14 },
    { prefix: 'Magus', level: 7, armor: 7, value: 520, reqInt: 16 },
    { prefix: 'Sorcerer', level: 9, armor: 9, value: 800, reqInt: 18 },
    { prefix: 'Archmage', level: 11, armor: 11, value: 1200, reqInt: 20 },
    { prefix: 'Grandmaster', level: 13, armor: 13, value: 1750, reqInt: 22 },
  ];
  
  for (const tier of robes) {
    await addItem({
      name: `${tier.prefix} Robes`,
      description: `Enchanted robes that enhance magical power.`,
      type: 'armor', slot: 'chest', rarity: tier.level >= 11 ? 'rare' : 'common',
      armor: tier.armor,
      int: Math.floor(tier.level / 3), wis: Math.floor(tier.level / 4),
      value: tier.value, reqInt: tier.reqInt, reqLvl: tier.level
    });
  }
  console.log(`✓ Added ${robes.length} robe tiers`);
  
  console.log('\n✅ Tiered items added successfully!');
}

expandItems().catch(console.error);
