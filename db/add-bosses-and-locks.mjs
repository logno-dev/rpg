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

async function addNamedMob(boss) {
  const result = await db.execute({
    sql: `INSERT INTO named_mobs (
      name, title, region_id, level, max_health, damage_min, damage_max,
      defense, attack_speed, experience_reward, gold_min, gold_max
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
    args: [
      boss.name, boss.title, boss.region_id, boss.level, boss.health,
      boss.dmgMin, boss.dmgMax, boss.defense, boss.atkSpeed, boss.exp, 
      boss.gold, boss.gold * 1.5
    ]
  });
  return result.rows[0].id;
}

async function addDungeon(dungeon) {
  const result = await db.execute({
    sql: `INSERT INTO dungeons (
      name, description, region_id, boss_mob_id, required_level
    ) VALUES (?, ?, ?, ?, ?) RETURNING id`,
    args: [
      dungeon.name, dungeon.description, dungeon.region_id,
      dungeon.namedMobId, dungeon.requiredLevel
    ]
  });
  return result.rows[0].id;
}

async function addDungeonEncounter(dungeonId, encounterNum, mobId, isBoss) {
  await db.execute({
    sql: `INSERT INTO dungeon_encounters (dungeon_id, encounter_order, mob_id, is_boss)
          VALUES (?, ?, ?, ?)`,
    args: [dungeonId, encounterNum, mobId, isBoss ? 1 : 0]
  });
}

async function addBossesAndLocks() {
  console.log('👑 ADDING BOSSES AND REGION LOCKS...\n');
  
  // Get all regions
  const regions = await db.execute('SELECT id, name FROM regions WHERE id >= 5 ORDER BY id');
  
  // Get mobs for dungeon encounters (pick highest level mobs per region)
  const getMobsForRegion = async (regionId) => {
    const result = await db.execute({
      sql: 'SELECT id, level FROM mobs WHERE region_id = ? ORDER BY level DESC LIMIT 5',
      args: [regionId]
    });
    return result.rows;
  };
  
  const bosses = [
    // Region 5: Scorched Badlands (18) - Unlocked by defeating Vexmora
    { 
      region: 5, name: 'Brimstone', title: 'Lord of Flames', level: 20,
      health: 850, dmgMin: 55, dmgMax: 75, defense: 8, atkSpeed: 1.5,
      exp: 250, gold: 300,
      dungeonName: 'Inferno Citadel',
      dungeonDesc: 'A fortress of flame where the demon lord Brimstone commands his fire legions.'
    },
    // Region 6: Frostpeak Glaciers (22) - Unlocked by defeating Brimstone
    { 
      region: 6, name: 'Frostmaw', title: 'The Eternal Winter', level: 24,
      health: 1100, dmgMin: 70, dmgMax: 95, defense: 10, atkSpeed: 1.7,
      exp: 320, gold: 400,
      dungeonName: 'Frozen Throne',
      dungeonDesc: 'The icy lair of Frostmaw, where eternal winter reigns supreme.'
    },
    // Region 7: Elven Sanctum (26) - Unlocked by defeating Frostmaw
    { 
      region: 7, name: 'Sylvanas Darkbow', title: 'Fallen Queen', level: 28,
      health: 1200, dmgMin: 85, dmgMax: 115, defense: 11, atkSpeed: 1.3,
      exp: 400, gold: 500,
      dungeonName: 'Corrupted Throne',
      dungeonDesc: 'The ancient palace where the elven queen fell to darkness.'
    },
    // Region 8: Dragon Aerie (30) - Unlocked by defeating Sylvanas
    { 
      region: 8, name: 'Vermithrax', title: 'The Crimson Wyrm', level: 32,
      health: 1500, dmgMin: 100, dmgMax: 135, defense: 13, atkSpeed: 1.6,
      exp: 500, gold: 650,
      dungeonName: 'Dragon\'s Peak',
      dungeonDesc: 'The highest peak where the ancient dragon Vermithrax guards his hoard.'
    },
    // Region 9: Abyssal Depths (34) - Unlocked by defeating Vermithrax
    { 
      region: 9, name: 'Leviathan Prime', title: 'Terror of the Deep', level: 36,
      health: 1750, dmgMin: 115, dmgMax: 155, defense: 14, atkSpeed: 1.8,
      exp: 600, gold: 800,
      dungeonName: 'Sunken Temple',
      dungeonDesc: 'An ancient underwater temple where Leviathan Prime slumbers.'
    },
    // Region 10: Celestial Spire (38) - Unlocked by defeating Leviathan Prime
    { 
      region: 10, name: 'Azrael', title: 'Fallen Archangel', level: 40,
      health: 2000, dmgMin: 130, dmgMax: 175, defense: 16, atkSpeed: 1.4,
      exp: 720, gold: 1000,
      dungeonName: 'Heavenly Gates',
      dungeonDesc: 'The gates of heaven, now guarded by the fallen archangel Azrael.'
    },
    // Region 11: Demon Citadel (42) - Unlocked by defeating Azrael
    { 
      region: 11, name: 'Diabolus', title: 'Supreme Demon Lord', level: 44,
      health: 2300, dmgMin: 145, dmgMax: 195, defense: 18, atkSpeed: 1.7,
      exp: 850, gold: 1200,
      dungeonName: 'Hell\'s Heart',
      dungeonDesc: 'The throne room of Diabolus, where darkness itself is born.'
    },
    // Region 12: Astral Plane (46) - Unlocked by defeating Diabolus
    { 
      region: 12, name: 'The Paradox', title: 'Timeweaver', level: 48,
      health: 2600, dmgMin: 160, dmgMax: 215, defense: 20, atkSpeed: 1.5,
      exp: 1000, gold: 1500,
      dungeonName: 'Temporal Nexus',
      dungeonDesc: 'A place where time itself fractures, ruled by the enigmatic Paradox.'
    },
    // Region 13: Elemental Chaos (50) - Unlocked by defeating The Paradox
    { 
      region: 13, name: 'Primordius', title: 'First of Elements', level: 52,
      health: 3000, dmgMin: 180, dmgMax: 240, defense: 22, atkSpeed: 1.8,
      exp: 1200, gold: 1800,
      dungeonName: 'Origin Chamber',
      dungeonDesc: 'The birthplace of all elements, where Primordius reigns supreme.'
    },
    // Region 14: Void Nexus (54) - Unlocked by defeating Primordius
    { 
      region: 14, name: 'The Nothingness', title: 'End of All', level: 56,
      health: 3500, dmgMin: 200, dmgMax: 270, defense: 25, atkSpeed: 1.6,
      exp: 1400, gold: 2200,
      dungeonName: 'Event Horizon',
      dungeonDesc: 'The edge of the void where reality ceases to exist.'
    },
    // Region 15: Titan Halls (58) - Unlocked by defeating The Nothingness
    { 
      region: 15, name: 'Kronos', title: 'The First Titan', level: 60,
      health: 4000, dmgMin: 225, dmgMax: 300, defense: 28, atkSpeed: 2.0,
      exp: 1650, gold: 2600,
      dungeonName: 'Titan\'s Throne',
      dungeonDesc: 'The ancient halls where the first titan, Kronos, still rules.'
    },
    // Region 16: Eternity's End (60+) - Unlocked by defeating Kronos
    { 
      region: 16, name: 'Oblivion', title: 'The Final End', level: 65,
      health: 5000, dmgMin: 260, dmgMax: 350, defense: 32, atkSpeed: 1.7,
      exp: 2000, gold: 3500,
      dungeonName: 'The Last Gate',
      dungeonDesc: 'The final challenge - face Oblivion itself at the end of all things.'
    },
  ];
  
  const bossIdMap = {};
  
  for (const bossData of bosses) {
    console.log(`\nRegion ${bossData.region}: ${bossData.name} ${bossData.title}`);
    
    // Add boss
    const bossId = await addNamedMob({
      ...bossData,
      region_id: bossData.region
    });
    bossIdMap[bossData.region] = bossId;
    console.log(`  ✓ Created boss (Level ${bossData.level}, ${bossData.health} HP)`);
    
    // Create dungeon
    const dungeonId = await addDungeon({
      name: bossData.dungeonName,
      description: bossData.dungeonDesc,
      region_id: bossData.region,
      namedMobId: bossId,
      requiredLevel: bossData.level - 2
    });
    console.log(`  ✓ Created dungeon: ${bossData.dungeonName}`);
    
    // Add dungeon encounters (3 regular mobs + boss)
    const regionMobs = await getMobsForRegion(bossData.region);
    for (let i = 0; i < Math.min(3, regionMobs.length); i++) {
      await addDungeonEncounter(dungeonId, i + 1, regionMobs[i].id, false);
    }
    await addDungeonEncounter(dungeonId, 4, bossId, true);
    console.log(`  ✓ Added 4 encounters (3 mobs + boss)`);
  }
  
  // Now update region locks with proper progression
  console.log('\n\n🔒 Setting up region unlock progression...\n');
  
  const unlockChain = [
    { region: 5, locked: 1, unlock: 'Defeat Vexmora in Shadowdeep Dungeon' },
    { region: 6, locked: 1, unlock: 'Defeat Brimstone in Scorched Badlands' },
    { region: 7, locked: 1, unlock: 'Defeat Frostmaw in Frostpeak Glaciers' },
    { region: 8, locked: 1, unlock: 'Defeat Sylvanas Darkbow in Elven Sanctum' },
    { region: 9, locked: 1, unlock: 'Defeat Vermithrax in Dragon Aerie' },
    { region: 10, locked: 1, unlock: 'Defeat Leviathan Prime in Abyssal Depths' },
    { region: 11, locked: 1, unlock: 'Defeat Azrael in Celestial Spire' },
    { region: 12, locked: 1, unlock: 'Defeat Diabolus in Demon Citadel' },
    { region: 13, locked: 1, unlock: 'Defeat The Paradox in Astral Plane' },
    { region: 14, locked: 1, unlock: 'Defeat Primordius in Elemental Chaos' },
    { region: 15, locked: 1, unlock: 'Defeat The Nothingness in Void Nexus' },
    { region: 16, locked: 1, unlock: 'Defeat Kronos in Titan Halls' },
  ];
  
  for (const unlock of unlockChain) {
    await db.execute({
      sql: 'UPDATE regions SET locked = ?, unlock_requirement = ? WHERE id = ?',
      args: [unlock.locked, unlock.unlock, unlock.region]
    });
    console.log(`  ✓ Region ${unlock.region}: ${unlock.unlock}`);
  }
  
  console.log('\n✅ Bosses and region locks complete!');
  console.log(`   Total bosses added: ${bosses.length}`);
  console.log(`   Total dungeons added: ${bosses.length}`);
  console.log(`   Locked regions: ${unlockChain.length}`);
}

addBossesAndLocks().catch(console.error);
