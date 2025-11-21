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

async function addLegendaryItem(item) {
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

async function addLegendaryItems() {
  console.log('Adding legendary boss-specific items...\n');
  
  // === GNARLROOT THE ANCIENT (Level 5 Boss) ===
  console.log('Gnarlroot the Ancient drops:');
  
  const barkshieldId = await addLegendaryItem({
    name: "Gnarlroot's Barkshield",
    description: "A shield hewn from the ancient treant's bark. Its surface writhes with living wood that absorbs blows.",
    type: 'armor', slot: 'chest', rarity: 'legendary',
    armor: 14, con: 4, wis: 3,
    value: 800, reqCon: 14, reqLvl: 5
  });
  console.log("  ✓ Gnarlroot's Barkshield (14 armor, +4 CON, +3 WIS)");
  
  const rootstaffId = await addLegendaryItem({
    name: "Living Rootstaff",
    description: "A twisted staff that still draws life from the earth. Nature magic flows through it like sap.",
    type: 'weapon', slot: 'weapon', rarity: 'legendary',
    dmgMin: 10, dmgMax: 16, atkSpeed: 1.4,
    int: 3, wis: 4,
    value: 750, reqInt: 12, reqWis: 12, reqLvl: 5
  });
  console.log("  ✓ Living Rootstaff (10-16 dmg, +3 INT, +4 WIS)");
  
  // === SHADOWFANG ALPHA (Level 8 Boss) ===
  console.log('\nShadowfang Alpha of the Dark drops:');
  
  const shadowfangId = await addLegendaryItem({
    name: "Shadowfang Blade",
    description: "Forged from a fang of the great alpha wolf. The blade seems to drink in light, leaving trails of shadow.",
    type: 'weapon', slot: 'weapon', rarity: 'legendary',
    dmgMin: 20, dmgMax: 32, atkSpeed: 0.9,
    str: 4, dex: 5,
    value: 1400, reqStr: 16, reqDex: 18, reqLvl: 8
  });
  console.log("  ✓ Shadowfang Blade (20-32 dmg, +4 STR, +5 DEX)");
  
  const darkpeltId = await addLegendaryItem({
    name: "Darkpelt Armor",
    description: "Crafted from the alpha's midnight fur. Those who wear it move with lupine grace.",
    type: 'armor', slot: 'chest', rarity: 'legendary',
    armor: 15, dex: 6, con: 3,
    value: 1300, reqDex: 16, reqLvl: 8
  });
  console.log("  ✓ Darkpelt Armor (15 armor, +6 DEX, +3 CON)");
  
  // === GORAK STONEFIST (Level 12 Boss) ===
  console.log('\nGorak Stonefist, Chieftain of the Peak drops:');
  
  const stonebreakerAxeId = await addLegendaryItem({
    name: "Stonebreaker Greataxe",
    description: "Gorak's legendary axe, said to have split mountains. Its weight is immense, but so is its power.",
    type: 'weapon', slot: 'weapon', rarity: 'legendary',
    dmgMin: 35, dmgMax: 55, atkSpeed: 2.0,
    str: 8, con: 4,
    value: 2500, reqStr: 24, reqCon: 18, reqLvl: 12
  });
  console.log("  ✓ Stonebreaker Greataxe (35-55 dmg, +8 STR, +4 CON)");
  
  const chieftainPlateId = await addLegendaryItem({
    name: "Chieftain's Warplate",
    description: "The armor of the orc chieftain, forged from iron found in the mountain's heart. Dented but unbroken.",
    type: 'armor', slot: 'chest', rarity: 'legendary',
    armor: 30, str: 5, con: 7,
    value: 2400, reqStr: 20, reqCon: 22, reqLvl: 12
  });
  console.log("  ✓ Chieftain's Warplate (30 armor, +5 STR, +7 CON)");
  
  // === VEXMORA THE ETERNAL SHADOW (Level 16 Boss) ===
  console.log('\nVexmora, The Eternal Shadow drops:');
  
  const voidstaffId = await addLegendaryItem({
    name: "Voidheart Staff",
    description: "Vexmora's personal staff, carved from a meteorite and infused with dark magic. Reality bends around it.",
    type: 'weapon', slot: 'weapon', rarity: 'legendary',
    dmgMin: 28, dmgMax: 42, atkSpeed: 1.3,
    int: 10, wis: 6, cha: 4,
    value: 3500, reqInt: 26, reqWis: 18, reqLvl: 16
  });
  console.log("  ✓ Voidheart Staff (28-42 dmg, +10 INT, +6 WIS, +4 CHA)");
  
  const shadowrobesId = await addLegendaryItem({
    name: "Eternal Shadow Robes",
    description: "Woven from pure shadowstuff, these robes existed before Vexmora and will exist after. They whisper secrets.",
    type: 'armor', slot: 'chest', rarity: 'legendary',
    armor: 16, int: 8, wis: 7, cha: 3,
    value: 3400, reqInt: 24, reqLvl: 16
  });
  console.log("  ✓ Eternal Shadow Robes (16 armor, +8 INT, +7 WIS, +3 CHA)");
  
  // Add some other legendary items as ultra-rare world drops
  console.log('\nAdding ultra-rare world drops:');
  
  await addLegendaryItem({
    name: "Dragonscale Hauberk",
    description: "Armor made from scales of an ancient wyrm. Nearly impervious to both blade and flame.",
    type: 'armor', slot: 'chest', rarity: 'legendary',
    armor: 26, str: 6, con: 6, cha: 2,
    value: 3000, reqStr: 20, reqCon: 20, reqLvl: 13
  });
  console.log("  ✓ Dragonscale Hauberk (26 armor, +6 STR, +6 CON, +2 CHA)");
  
  await addLegendaryItem({
    name: "Moonwhisper Bow",
    description: "An elven bow blessed by moonlight. Arrows fired from it strike true and silent.",
    type: 'weapon', slot: 'weapon', rarity: 'legendary',
    dmgMin: 28, dmgMax: 44, atkSpeed: 0.8,
    dex: 8, wis: 4,
    value: 2800, reqDex: 24, reqWis: 16, reqLvl: 13
  });
  console.log("  ✓ Moonwhisper Bow (28-44 dmg, +8 DEX, +4 WIS)");
  
  await addLegendaryItem({
    name: "Crown of the Fallen King",
    description: "A tarnished crown from a forgotten kingdom. Those who wear it command respect and fear.",
    type: 'armor', slot: 'head', rarity: 'legendary',
    armor: 5, cha: 8, int: 3, wis: 3,
    value: 2200, reqCha: 18, reqLvl: 11
  });
  console.log("  ✓ Crown of the Fallen King (5 armor, +8 CHA, +3 INT, +3 WIS)");
  
  console.log('\n✅ All legendary items added!');
}

addLegendaryItems().catch(console.error);
