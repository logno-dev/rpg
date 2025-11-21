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

async function addMob(mob) {
  const result = await db.execute({
    sql: `INSERT INTO mobs (
      name, level, area, region_id, max_health, damage_min, damage_max, 
      defense, attack_speed, experience_reward, gold_min, gold_max
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
    args: [
      mob.name, mob.level, mob.area, mob.region_id, mob.health,
      mob.dmgMin, mob.dmgMax, mob.defense, mob.atkSpeed, mob.exp,
      mob.goldMin, mob.goldMax
    ]
  });
  return result.rows[0].id;
}

async function addRegion(region) {
  // Build unlock_requirement text based on the unlock type
  let unlockRequirement = null;
  if (region.unlockType === 'named_mob_defeat' && region.unlockValue) {
    // Look up the named mob name by ID
    const namedMobResult = await db.execute({
      sql: 'SELECT name FROM named_mobs WHERE id = ?',
      args: [region.unlockValue]
    });
    if (namedMobResult.rows.length > 0) {
      const bossName = namedMobResult.rows[0].name;
      unlockRequirement = `Defeat ${bossName}`;
    }
  } else if (region.unlockType === 'level' && region.unlockValue) {
    unlockRequirement = `Reach level ${region.unlockValue}`;
  }
  
  const result = await db.execute({
    sql: `INSERT INTO regions (
      name, description, min_level, max_level, locked, unlock_requirement
    ) VALUES (?, ?, ?, ?, ?, ?) RETURNING id`,
    args: [
      region.name, region.description, region.minLevel, region.maxLevel,
      unlockRequirement ? 1 : 0, unlockRequirement
    ]
  });
  return result.rows[0].id;
}

async function addNamedMob(boss) {
  // Calculate gold_min and gold_max from single gold value (use ±20% variance)
  const goldMin = Math.floor(boss.gold * 0.8);
  const goldMax = Math.floor(boss.gold * 1.2);
  
  const result = await db.execute({
    sql: `INSERT INTO named_mobs (
      name, title, region_id, level, max_health, damage_min, damage_max,
      defense, attack_speed, experience_reward, gold_min, gold_max
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
    args: [
      boss.name, boss.title, boss.region_id, boss.level, boss.health,
      boss.dmgMin, boss.dmgMax, boss.defense, boss.atkSpeed, boss.exp, goldMin, goldMax
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

async function addDungeonEncounter(encounter) {
  await db.execute({
    sql: `INSERT INTO dungeon_encounters (
      dungeon_id, encounter_order, mob_id, is_boss
    ) VALUES (?, ?, ?, ?)`,
    args: [
      encounter.dungeonId, encounter.number, encounter.mobId, encounter.isBoss ? 1 : 0
    ]
  });
}

async function expandWorld() {
  console.log('🌍 EXPANDING THE WORLD...\n');
  
  // ========================================
  // STEP 1: Add more mobs to existing regions
  // ========================================
  console.log('=== Adding Mob Variety to Existing Regions ===\n');
  
  // Region 1: Greenfield Plains (1-4)
  console.log('Region 1 - Greenfield Plains:');
  const snakeId = await addMob({
    name: 'Grass Snake', level: 1, area: 'Greenfield Plains', region_id: 1,
    health: 85, dmgMin: 2, dmgMax: 5, defense: 0, atkSpeed: 1.2,
    exp: 8, goldMin: 1, goldMax: 3
  });
  console.log('  ✓ Grass Snake (Level 1)');
  
  const beetleId = await addMob({
    name: 'Giant Beetle', level: 2, area: 'Greenfield Plains', region_id: 1,
    health: 95, dmgMin: 4, dmgMax: 7, defense: 1, atkSpeed: 1.5,
    exp: 12, goldMin: 2, goldMax: 4
  });
  console.log('  ✓ Giant Beetle (Level 2)');
  
  const rabbitId = await addMob({
    name: 'Rabid Rabbit', level: 2, area: 'Greenfield Plains', region_id: 1,
    health: 90, dmgMin: 3, dmgMax: 6, defense: 0, atkSpeed: 0.9,
    exp: 11, goldMin: 1, goldMax: 3
  });
  console.log('  ✓ Rabid Rabbit (Level 2)');
  
  const foxId = await addMob({
    name: 'Wild Fox', level: 3, area: 'Greenfield Plains', region_id: 1,
    health: 105, dmgMin: 5, dmgMax: 9, defense: 1, atkSpeed: 1.0,
    exp: 16, goldMin: 3, goldMax: 6
  });
  console.log('  ✓ Wild Fox (Level 3)');
  
  const bearId = await addMob({
    name: 'Young Bear', level: 4, area: 'Greenfield Plains', region_id: 1,
    health: 140, dmgMin: 8, dmgMax: 12, defense: 2, atkSpeed: 1.8,
    exp: 22, goldMin: 5, goldMax: 10
  });
  console.log('  ✓ Young Bear (Level 4)');
  
  // Region 2: Darkwood Forest (3-7)
  console.log('\nRegion 2 - Darkwood Forest:');
  const bandItid = await addMob({
    name: 'Bandit', level: 4, area: 'Darkwood Forest', region_id: 2,
    health: 130, dmgMin: 7, dmgMax: 11, defense: 2, atkSpeed: 1.1,
    exp: 20, goldMin: 8, goldMax: 15
  });
  console.log('  ✓ Bandit (Level 4)');
  
  const batId = await addMob({
    name: 'Dire Bat', level: 5, area: 'Darkwood Forest', region_id: 2,
    health: 145, dmgMin: 9, dmgMax: 13, defense: 1, atkSpeed: 0.8,
    exp: 25, goldMin: 6, goldMax: 12
  });
  console.log('  ✓ Dire Bat (Level 5)');
  
  const entId = await addMob({
    name: 'Treant Sapling', level: 6, area: 'Darkwood Forest', region_id: 2,
    health: 180, dmgMin: 11, dmgMax: 16, defense: 3, atkSpeed: 2.0,
    exp: 32, goldMin: 8, goldMax: 15
  });
  console.log('  ✓ Treant Sapling (Level 6)');
  
  const wraithId = await addMob({
    name: 'Forest Wraith', level: 7, area: 'Darkwood Forest', region_id: 2,
    health: 165, dmgMin: 14, dmgMax: 19, defense: 2, atkSpeed: 1.3,
    exp: 38, goldMin: 10, goldMax: 18
  });
  console.log('  ✓ Forest Wraith (Level 7)');
  
  // Region 3: Ironpeak Mountains (5-11)
  console.log('\nRegion 3 - Ironpeak Mountains:');
  const dwarfId = await addMob({
    name: 'Mountain Dwarf Raider', level: 7, area: 'Ironpeak Mountains', region_id: 3,
    health: 200, dmgMin: 13, dmgMax: 18, defense: 3, atkSpeed: 1.4,
    exp: 36, goldMin: 12, goldMax: 20
  });
  console.log('  ✓ Mountain Dwarf Raider (Level 7)');
  
  const golemId = await addMob({
    name: 'Stone Golem', level: 9, area: 'Ironpeak Mountains', region_id: 3,
    health: 280, dmgMin: 18, dmgMax: 25, defense: 5, atkSpeed: 2.2,
    exp: 50, goldMin: 15, goldMax: 25
  });
  console.log('  ✓ Stone Golem (Level 9)');
  
  const harpyId = await addMob({
    name: 'Harpy', level: 10, area: 'Ironpeak Mountains', region_id: 3,
    health: 240, dmgMin: 20, dmgMax: 28, defense: 3, atkSpeed: 1.0,
    exp: 55, goldMin: 18, goldMax: 30
  });
  console.log('  ✓ Harpy (Level 10)');
  
  const wyvernId = await addMob({
    name: 'Young Wyvern', level: 11, area: 'Ironpeak Mountains', region_id: 3,
    health: 300, dmgMin: 24, dmgMax: 32, defense: 4, atkSpeed: 1.5,
    exp: 65, goldMin: 22, goldMax: 38
  });
  console.log('  ✓ Young Wyvern (Level 11)');
  
  // Region 4: Shadowdeep Dungeon (8-15)
  console.log('\nRegion 4 - Shadowdeep Dungeon:');
  const zombieId = await addMob({
    name: 'Shambling Zombie', level: 9, area: 'Shadowdeep Dungeon', region_id: 4,
    health: 220, dmgMin: 16, dmgMax: 22, defense: 2, atkSpeed: 1.8,
    exp: 48, goldMin: 10, goldMax: 18
  });
  console.log('  ✓ Shambling Zombie (Level 9)');
  
  const ghoulId = await addMob({
    name: 'Flesh Ghoul', level: 11, area: 'Shadowdeep Dungeon', region_id: 4,
    health: 265, dmgMin: 22, dmgMax: 30, defense: 3, atkSpeed: 1.2,
    exp: 60, goldMin: 15, goldMax: 25
  });
  console.log('  ✓ Flesh Ghoul (Level 11)');
  
  const lichlingId = await addMob({
    name: 'Lichling', level: 12, area: 'Shadowdeep Dungeon', region_id: 4,
    health: 240, dmgMin: 28, dmgMax: 36, defense: 2, atkSpeed: 1.4,
    exp: 70, goldMin: 20, goldMax: 35
  });
  console.log('  ✓ Lichling (Level 12)');
  
  const abomId = await addMob({
    name: 'Shadow Abomination', level: 14, area: 'Shadowdeep Dungeon', region_id: 4,
    health: 380, dmgMin: 38, dmgMax: 50, defense: 5, atkSpeed: 1.8,
    exp: 90, goldMin: 30, goldMax: 50
  });
  console.log('  ✓ Shadow Abomination (Level 14)');
  
  // ========================================
  // STEP 2: Create New Regions
  // ========================================
  console.log('\n=== Creating New Regions ===\n');
  
  // Region 5: Scorched Badlands (13-18)
  const region5Id = await addRegion({
    name: 'Scorched Badlands',
    description: 'A desolate wasteland of ash and fire, home to demons and fire elementals.',
    minLevel: 13,
    maxLevel: 18,
    unlockType: 'named_mob_defeat',
    unlockValue: 4 // Vexmora
  });
  console.log('✓ Region 5: Scorched Badlands (13-18)');
  
  // Region 6: Frostpeak Glaciers (16-22)
  const region6Id = await addRegion({
    name: 'Frostpeak Glaciers',
    description: 'Frozen peaks where ice dragons roost and frost giants dwell.',
    minLevel: 16,
    maxLevel: 22,
    unlockType: null,
    unlockValue: null
  });
  console.log('✓ Region 6: Frostpeak Glaciers (16-22)');
  
  // Region 7: Elven Sanctum (20-26)
  const region7Id = await addRegion({
    name: 'Elven Sanctum',
    description: 'Ancient forest protected by corrupted elven guardians and magical beasts.',
    minLevel: 20,
    maxLevel: 26,
    unlockType: null,
    unlockValue: null
  });
  console.log('✓ Region 7: Elven Sanctum (20-26)');
  
  // Region 8: Dragon Aerie (24-30)
  const region8Id = await addRegion({
    name: 'Dragon Aerie',
    description: 'The highest peaks where ancient dragons make their lairs.',
    minLevel: 24,
    maxLevel: 30,
    unlockType: null,
    unlockValue: null
  });
  console.log('✓ Region 8: Dragon Aerie (24-30)');
  
  // ========================================
  // STEP 3: Add Mobs for New Regions
  // ========================================
  console.log('\n=== Adding Mobs to New Regions ===\n');
  
  // Region 5: Scorched Badlands (13-18)
  console.log('Region 5 - Scorched Badlands:');
  const impId = await addMob({
    name: 'Lesser Imp', level: 13, area: 'Scorched Badlands', region_id: region5Id,
    health: 320, dmgMin: 30, dmgMax: 40, defense: 4, atkSpeed: 1.0,
    exp: 75, goldMin: 25, goldMax: 40
  });
  console.log('  ✓ Lesser Imp (Level 13)');
  
  const elementalId = await addMob({
    name: 'Fire Elemental', level: 15, area: 'Scorched Badlands', region_id: region5Id,
    health: 360, dmgMin: 36, dmgMax: 48, defense: 3, atkSpeed: 1.2,
    exp: 85, goldMin: 30, goldMax: 50
  });
  console.log('  ✓ Fire Elemental (Level 15)');
  
  const hellhoundId = await addMob({
    name: 'Hellhound', level: 16, area: 'Scorched Badlands', region_id: region5Id,
    health: 400, dmgMin: 40, dmgMax: 54, defense: 4, atkSpeed: 1.1,
    exp: 95, goldMin: 35, goldMax: 55
  });
  console.log('  ✓ Hellhound (Level 16)');
  
  const demonId = await addMob({
    name: 'Flame Demon', level: 17, area: 'Scorched Badlands', region_id: region5Id,
    health: 440, dmgMin: 45, dmgMax: 60, defense: 5, atkSpeed: 1.3,
    exp: 105, goldMin: 40, goldMax: 65
  });
  console.log('  ✓ Flame Demon (Level 17)');
  
  const ifritId = await addMob({
    name: 'Ifrit', level: 18, area: 'Scorched Badlands', region_id: region5Id,
    health: 500, dmgMin: 52, dmgMax: 68, defense: 6, atkSpeed: 1.4,
    exp: 120, goldMin: 50, goldMax: 80
  });
  console.log('  ✓ Ifrit (Level 18)');
  
  // Region 6: Frostpeak Glaciers (16-22)
  console.log('\nRegion 6 - Frostpeak Glaciers:');
  const yetId = await addMob({
    name: 'Yeti', level: 16, area: 'Frostpeak Glaciers', region_id: region6Id,
    health: 420, dmgMin: 38, dmgMax: 52, defense: 5, atkSpeed: 1.6,
    exp: 95, goldMin: 35, goldMax: 60
  });
  console.log('  ✓ Yeti (Level 16)');
  
  const iceElemId = await addMob({
    name: 'Ice Elemental', level: 18, area: 'Frostpeak Glaciers', region_id: region6Id,
    health: 450, dmgMin: 44, dmgMax: 58, defense: 4, atkSpeed: 1.2,
    exp: 110, goldMin: 40, goldMax: 65
  });
  console.log('  ✓ Ice Elemental (Level 18)');
  
  const giantId = await addMob({
    name: 'Frost Giant', level: 20, area: 'Frostpeak Glaciers', region_id: region6Id,
    health: 550, dmgMin: 55, dmgMax: 72, defense: 6, atkSpeed: 2.0,
    exp: 135, goldMin: 50, goldMax: 85
  });
  console.log('  ✓ Frost Giant (Level 20)');
  
  const drakeId = await addMob({
    name: 'Ice Drake', level: 21, area: 'Frostpeak Glaciers', region_id: region6Id,
    health: 600, dmgMin: 60, dmgMax: 80, defense: 7, atkSpeed: 1.5,
    exp: 150, goldMin: 60, goldMax: 100
  });
  console.log('  ✓ Ice Drake (Level 21)');
  
  const mammothId = await addMob({
    name: 'Frost Mammoth', level: 22, area: 'Frostpeak Glaciers', region_id: region6Id,
    health: 680, dmgMin: 68, dmgMax: 90, defense: 8, atkSpeed: 1.8,
    exp: 165, goldMin: 70, goldMax: 120
  });
  console.log('  ✓ Frost Mammoth (Level 22)');
  
  // Region 7: Elven Sanctum (20-26)
  console.log('\nRegion 7 - Elven Sanctum:');
  const guardianId = await addMob({
    name: 'Corrupted Guardian', level: 20, area: 'Elven Sanctum', region_id: region7Id,
    health: 520, dmgMin: 52, dmgMax: 68, defense: 6, atkSpeed: 1.1,
    exp: 130, goldMin: 55, goldMax: 90
  });
  console.log('  ✓ Corrupted Guardian (Level 20)');
  
  const centaurId = await addMob({
    name: 'Dark Centaur', level: 22, area: 'Elven Sanctum', region_id: region7Id,
    health: 600, dmgMin: 62, dmgMax: 82, defense: 6, atkSpeed: 1.2,
    exp: 155, goldMin: 65, goldMax: 110
  });
  console.log('  ✓ Dark Centaur (Level 22)');
  
  const archerId = await addMob({
    name: 'Elven Shadow Archer', level: 24, area: 'Elven Sanctum', region_id: region7Id,
    health: 560, dmgMin: 72, dmgMax: 95, defense: 5, atkSpeed: 0.9,
    exp: 175, goldMin: 75, goldMax: 125
  });
  console.log('  ✓ Elven Shadow Archer (Level 24)');
  
  const treeantId = await addMob({
    name: 'Ancient Treeant', level: 25, area: 'Elven Sanctum', region_id: region7Id,
    health: 750, dmgMin: 75, dmgMax: 100, defense: 9, atkSpeed: 2.0,
    exp: 190, goldMin: 85, goldMax: 140
  });
  console.log('  ✓ Ancient Treeant (Level 25)');
  
  const unicornId = await addMob({
    name: 'Corrupted Unicorn', level: 26, area: 'Elven Sanctum', region_id: region7Id,
    health: 680, dmgMin: 85, dmgMax: 112, defense: 7, atkSpeed: 1.3,
    exp: 210, goldMin: 95, goldMax: 160
  });
  console.log('  ✓ Corrupted Unicorn (Level 26)');
  
  // Region 8: Dragon Aerie (24-30)
  console.log('\nRegion 8 - Dragon Aerie:');
  const wyrmlingId = await addMob({
    name: 'Dragon Wyrmling', level: 24, area: 'Dragon Aerie', region_id: region8Id,
    health: 650, dmgMin: 70, dmgMax: 92, defense: 7, atkSpeed: 1.4,
    exp: 180, goldMin: 80, goldMax: 135
  });
  console.log('  ✓ Dragon Wyrmling (Level 24)');
  
  const wyvernAdultId = await addMob({
    name: 'Adult Wyvern', level: 26, area: 'Dragon Aerie', region_id: region8Id,
    health: 720, dmgMin: 82, dmgMax: 108, defense: 8, atkSpeed: 1.5,
    exp: 200, goldMin: 90, goldMax: 150
  });
  console.log('  ✓ Adult Wyvern (Level 26)');
  
  const dragonKnightId = await addMob({
    name: 'Dragonkin Warrior', level: 27, area: 'Dragon Aerie', region_id: region8Id,
    health: 780, dmgMin: 90, dmgMax: 118, defense: 9, atkSpeed: 1.3,
    exp: 220, goldMin: 100, goldMax: 170
  });
  console.log('  ✓ Dragonkin Warrior (Level 27)');
  
  const elderWyrmId = await addMob({
    name: 'Elder Wyrm', level: 28, area: 'Dragon Aerie', region_id: region8Id,
    health: 880, dmgMin: 100, dmgMax: 130, defense: 10, atkSpeed: 1.6,
    exp: 245, goldMin: 120, goldMax: 200
  });
  console.log('  ✓ Elder Wyrm (Level 28)');
  
  const dragonId = await addMob({
    name: 'Ancient Dragon', level: 30, area: 'Dragon Aerie', region_id: region8Id,
    health: 1000, dmgMin: 115, dmgMax: 150, defense: 12, atkSpeed: 1.7,
    exp: 280, goldMin: 150, goldMax: 250
  });
  console.log('  ✓ Ancient Dragon (Level 30)');
  
  console.log('\n✅ World expansion complete!');
  console.log('\nSummary:');
  console.log('  - Added 17 new mobs to existing regions');
  console.log('  - Created 4 new regions (5-8)');
  console.log('  - Added 25 new mobs to new regions');
  console.log('  - Total new mobs: 42');
}

expandWorld().catch(console.error);
