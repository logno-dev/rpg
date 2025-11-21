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
  const result = await db.execute({
    sql: `INSERT INTO items (
      name, description, type, slot, rarity,
      strength_bonus, dexterity_bonus, constitution_bonus,
      intelligence_bonus, wisdom_bonus, charisma_bonus,
      damage_min, damage_max, armor, attack_speed, value,
      required_strength, required_dexterity, required_constitution,
      required_intelligence, required_wisdom, required_charisma, required_level
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    RETURNING id`,
    args: [
      item.name, item.description, item.type, item.slot, item.rarity,
      item.str || 0, item.dex || 0, item.con || 0,
      item.int || 0, item.wis || 0, item.cha || 0,
      item.dmgMin || 0, item.dmgMax || 0, item.armor || 0, item.atkSpeed || 1.0, item.value,
      item.reqStr || 0, item.reqDex || 0, item.reqCon || 0,
      item.reqInt || 0, item.reqWis || 0, item.reqCha || 0, item.reqLvl || 0
    ]
  });
  return result.rows[0].id;
}

async function expandEquipment() {
  console.log('⚔️  EXPANDING EQUIPMENT TO LEVEL 60...\n');
  
  // Define equipment tiers (every 3-5 levels)
  const weaponTiers = [
    // Levels 15-60
    { level: 15, name: 'Reinforced', rarity: 'uncommon', dmgMult: 1.8, value: 400 },
    { level: 18, name: 'Adamantine', rarity: 'uncommon', dmgMult: 2.0, value: 550 },
    { level: 21, name: 'Mithril', rarity: 'rare', dmgMult: 2.3, value: 750 },
    { level: 24, name: 'Enchanted Mithril', rarity: 'rare', dmgMult: 2.6, value: 1000 },
    { level: 27, name: 'Runic', rarity: 'rare', dmgMult: 2.9, value: 1350 },
    { level: 30, name: 'Dragonbone', rarity: 'epic', dmgMult: 3.2, value: 1800 },
    { level: 33, name: 'Obsidian', rarity: 'epic', dmgMult: 3.5, value: 2300 },
    { level: 36, name: 'Starforged', rarity: 'epic', dmgMult: 3.9, value: 2900 },
    { level: 39, name: 'Voidtouched', rarity: 'epic', dmgMult: 4.3, value: 3600 },
    { level: 42, name: 'Celestial', rarity: 'epic', dmgMult: 4.7, value: 4500 },
    { level: 45, name: 'Ethereal', rarity: 'epic', dmgMult: 5.2, value: 5500 },
    { level: 48, name: 'Primordial', rarity: 'epic', dmgMult: 5.7, value: 6800 },
    { level: 51, name: 'Godforged', rarity: 'epic', dmgMult: 6.3, value: 8500 },
    { level: 54, name: 'Timeless', rarity: 'epic', dmgMult: 6.9, value: 10500 },
    { level: 57, name: 'Mythical', rarity: 'epic', dmgMult: 7.6, value: 13000 },
    { level: 60, name: 'Ascendant', rarity: 'legendary', dmgMult: 8.5, value: 16000 },
  ];
  
  const armorTiers = [
    { level: 15, name: 'Reinforced', rarity: 'uncommon', armorMult: 1.8, value: 350 },
    { level: 18, name: 'Adamantine', rarity: 'uncommon', armorMult: 2.0, value: 500 },
    { level: 21, name: 'Mithril', rarity: 'rare', armorMult: 2.3, value: 700 },
    { level: 24, name: 'Enchanted Mithril', rarity: 'rare', armorMult: 2.6, value: 950 },
    { level: 27, name: 'Runic', rarity: 'rare', armorMult: 2.9, value: 1250 },
    { level: 30, name: 'Dragonscale', rarity: 'epic', armorMult: 3.2, value: 1700 },
    { level: 33, name: 'Obsidian', rarity: 'epic', armorMult: 3.5, value: 2200 },
    { level: 36, name: 'Starwoven', rarity: 'epic', armorMult: 3.9, value: 2800 },
    { level: 39, name: 'Voidplate', rarity: 'epic', armorMult: 4.3, value: 3500 },
    { level: 42, name: 'Celestial', rarity: 'epic', armorMult: 4.7, value: 4400 },
    { level: 45, name: 'Ethereal', rarity: 'epic', armorMult: 5.2, value: 5400 },
    { level: 48, name: 'Primordial', rarity: 'epic', armorMult: 5.7, value: 6700 },
    { level: 51, name: 'Godforged', rarity: 'epic', armorMult: 6.3, value: 8300 },
    { level: 54, name: 'Timeless', rarity: 'epic', armorMult: 6.9, value: 10300 },
    { level: 57, name: 'Mythical', rarity: 'epic', armorMult: 7.6, value: 12800 },
    { level: 60, name: 'Ascendant', rarity: 'legendary', armorMult: 8.5, value: 15800 },
  ];
  
  // Weapon types
  const weaponTypes = [
    { type: 'Sword', baseDmgMin: 8, baseDmgMax: 12, speed: 1.0, statReq: 'str' },
    { type: 'Axe', baseDmgMin: 10, baseDmgMax: 15, speed: 1.5, statReq: 'str' },
    { type: 'Dagger', baseDmgMin: 6, baseDmgMax: 10, speed: 0.7, statReq: 'dex' },
    { type: 'Bow', baseDmgMin: 9, baseDmgMax: 13, speed: 1.0, statReq: 'dex' },
    { type: 'Staff', baseDmgMin: 7, baseDmgMax: 11, speed: 1.2, statReq: 'int' },
  ];
  
  // Armor types (Heavy, Medium, Light)
  const armorTypes = [
    { type: 'Plate', baseArmor: 25, statReq: 'str', statType: 'Heavy' },
    { type: 'Chainmail', baseArmor: 18, statReq: 'dex', statType: 'Medium' },
    { type: 'Leather', baseArmor: 12, statReq: 'dex', statType: 'Light' },
    { type: 'Robes', baseArmor: 8, statReq: 'int', statType: 'Cloth' },
  ];
  
  let totalAdded = 0;
  
  // Add weapons for each tier
  console.log('Adding Weapons:\n');
  for (const tier of weaponTiers) {
    console.log(`--- Level ${tier.level} (${tier.name}) ---`);
    
    for (const weapon of weaponTypes) {
      const dmgMin = Math.floor(weapon.baseDmgMin * tier.dmgMult);
      const dmgMax = Math.floor(weapon.baseDmgMax * tier.dmgMult);
      const statBonus = Math.floor(tier.level / 3) + 2;
      const reqStat = Math.floor(tier.level * 1.8);
      
      const item = {
        name: `${tier.name} ${weapon.type}`,
        description: `A powerful ${tier.name.toLowerCase()} ${weapon.type.toLowerCase()} forged for experienced warriors.`,
        type: 'weapon',
        slot: 'weapon',
        rarity: tier.rarity,
        dmgMin,
        dmgMax,
        atkSpeed: weapon.speed,
        value: tier.value,
        reqLvl: tier.level
      };
      
      // Add stat bonuses and requirements
      if (weapon.statReq === 'str') {
        item.str = statBonus;
        item.reqStr = reqStat;
      } else if (weapon.statReq === 'dex') {
        item.dex = statBonus;
        item.reqDex = reqStat;
      } else if (weapon.statReq === 'int') {
        item.int = statBonus;
        item.reqInt = reqStat;
      }
      
      await addItem(item);
      console.log(`  ✓ ${item.name} (${dmgMin}-${dmgMax} dmg)`);
      totalAdded++;
    }
  }
  
  // Add armor for each tier
  console.log('\nAdding Armor:\n');
  for (const tier of armorTiers) {
    console.log(`--- Level ${tier.level} (${tier.name}) ---`);
    
    for (const armor of armorTypes) {
      const armorValue = Math.floor(armor.baseArmor * tier.armorMult);
      const statBonus = Math.floor(tier.level / 3) + 2;
      const reqStat = Math.floor(tier.level * 1.5);
      
      const item = {
        name: `${tier.name} ${armor.type}`,
        description: `${tier.name} ${armor.statType.toLowerCase()} armor providing excellent protection.`,
        type: 'armor',
        slot: 'chest',
        rarity: tier.rarity,
        armor: armorValue,
        value: tier.value,
        reqLvl: tier.level
      };
      
      // Add stat bonuses and requirements
      if (armor.statReq === 'str') {
        item.str = statBonus;
        item.con = Math.floor(statBonus * 0.7);
        item.reqStr = reqStat;
        item.reqCon = Math.floor(reqStat * 0.6);
      } else if (armor.statReq === 'dex') {
        item.dex = statBonus;
        item.con = Math.floor(statBonus * 0.5);
        item.reqDex = reqStat;
      } else if (armor.statReq === 'int') {
        item.int = statBonus;
        item.wis = Math.floor(statBonus * 0.7);
        item.reqInt = reqStat;
      }
      
      await addItem(item);
      console.log(`  ✓ ${item.name} (${armorValue} armor)`);
      totalAdded++;
    }
  }
  
  console.log(`\n✅ Equipment expansion complete!`);
  console.log(`   Total items added: ${totalAdded}`);
  console.log(`   Weapon tiers: ${weaponTiers.length}`);
  console.log(`   Armor tiers: ${armorTiers.length}`);
  console.log(`   Level range: 15-60`);
}

expandEquipment().catch(console.error);
