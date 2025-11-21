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

// Helper to calculate mob stats based on level
function calculateMobStats(level) {
  return {
    health: Math.floor(80 + (level * 35)),
    dmgMin: Math.floor(3 + (level * 3.5)),
    dmgMax: Math.floor(5 + (level * 5)),
    defense: Math.floor(level * 0.4),
    exp: Math.floor(10 + (level * 4.5)),
    goldMin: Math.floor(level * 2),
    goldMax: Math.floor(level * 5)
  };
}

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
  const result = await db.execute({
    sql: `INSERT INTO regions (
      name, description, min_level, max_level, locked, unlock_requirement
    ) VALUES (?, ?, ?, ?, ?, ?) RETURNING id`,
    args: [
      region.name, region.description, region.minLevel, region.maxLevel,
      region.locked || 0, region.unlockReq || null
    ]
  });
  return result.rows[0].id;
}

async function expandWorld() {
  console.log('🌍 MASSIVE WORLD EXPANSION TO LEVEL 60...\n');
  
  let totalMobs = 0;
  let totalRegions = 0;
  
  // ========================================
  // STEP 1: Add more mobs to existing regions
  // ========================================
  console.log('=== Adding Mob Variety to Existing Regions ===\n');
  
  const existingRegionMobs = [
    // Region 1: Greenfield Plains (1-4)
    { name: 'Grass Snake', level: 1, region: 1, area: 'Greenfield Plains', atkSpeed: 1.2 },
    { name: 'Giant Beetle', level: 2, region: 1, area: 'Greenfield Plains', atkSpeed: 1.5 },
    { name: 'Rabid Rabbit', level: 2, region: 1, area: 'Greenfield Plains', atkSpeed: 0.9 },
    { name: 'Wild Fox', level: 3, region: 1, area: 'Greenfield Plains', atkSpeed: 1.0 },
    { name: 'Young Bear', level: 4, region: 1, area: 'Greenfield Plains', atkSpeed: 1.8 },
    
    // Region 2: Darkwood Forest (3-7)
    { name: 'Bandit', level: 4, region: 2, area: 'Darkwood Forest', atkSpeed: 1.1 },
    { name: 'Dire Bat', level: 5, region: 2, area: 'Darkwood Forest', atkSpeed: 0.8 },
    { name: 'Treant Sapling', level: 6, region: 2, area: 'Darkwood Forest', atkSpeed: 2.0 },
    { name: 'Forest Wraith', level: 7, region: 2, area: 'Darkwood Forest', atkSpeed: 1.3 },
    
    // Region 3: Ironpeak Mountains (5-11)
    { name: 'Mountain Dwarf Raider', level: 7, region: 3, area: 'Ironpeak Mountains', atkSpeed: 1.4 },
    { name: 'Stone Golem', level: 9, region: 3, area: 'Ironpeak Mountains', atkSpeed: 2.2 },
    { name: 'Harpy', level: 10, region: 3, area: 'Ironpeak Mountains', atkSpeed: 1.0 },
    { name: 'Young Wyvern', level: 11, region: 3, area: 'Ironpeak Mountains', atkSpeed: 1.5 },
    
    // Region 4: Shadowdeep Dungeon (8-15)
    { name: 'Shambling Zombie', level: 9, region: 4, area: 'Shadowdeep Dungeon', atkSpeed: 1.8 },
    { name: 'Flesh Ghoul', level: 11, region: 4, area: 'Shadowdeep Dungeon', atkSpeed: 1.2 },
    { name: 'Lichling', level: 12, region: 4, area: 'Shadowdeep Dungeon', atkSpeed: 1.4 },
    { name: 'Shadow Abomination', level: 14, region: 4, area: 'Shadowdeep Dungeon', atkSpeed: 1.8 },
    { name: 'Void Walker', level: 15, region: 4, area: 'Shadowdeep Dungeon', atkSpeed: 1.3 },
  ];
  
  for (const mobData of existingRegionMobs) {
    const stats = calculateMobStats(mobData.level);
    await addMob({
      ...mobData,
      region_id: mobData.region,
      ...stats,
      atkSpeed: mobData.atkSpeed
    });
    console.log(`  ✓ ${mobData.name} (Lvl ${mobData.level})`);
    totalMobs++;
  }
  
  // ========================================
  // STEP 2: Create New Regions (5-15)
  // ========================================
  console.log('\n=== Creating New Regions ===\n');
  
  const newRegions = [
    { 
      name: 'Scorched Badlands', 
      desc: 'A desolate wasteland of ash and fire, home to demons and fire elementals.',
      min: 13, max: 18, locked: 1, unlockReq: 'Defeat Vexmora' 
    },
    { 
      name: 'Frostpeak Glaciers', 
      desc: 'Frozen peaks where ice dragons roost and frost giants dwell.',
      min: 16, max: 22 
    },
    { 
      name: 'Elven Sanctum', 
      desc: 'Ancient forest protected by corrupted elven guardians.',
      min: 20, max: 26 
    },
    { 
      name: 'Dragon Aerie', 
      desc: 'The highest peaks where ancient dragons make their lairs.',
      min: 24, max: 30 
    },
    { 
      name: 'Abyssal Depths', 
      desc: 'Underwater caverns filled with monstrous sea creatures.',
      min: 28, max: 34 
    },
    { 
      name: 'Celestial Spire', 
      desc: 'Floating islands in the sky, home to angelic guardians.',
      min: 32, max: 38 
    },
    { 
      name: 'Demon Citadel', 
      desc: 'A fortress of darkness where demon lords command their armies.',
      min: 36, max: 42 
    },
    { 
      name: 'Astral Plane', 
      desc: 'A realm between dimensions where reality bends.',
      min: 40, max: 46 
    },
    { 
      name: 'Elemental Chaos', 
      desc: 'The birthplace of all elements, raw and untamed.',
      min: 44, max: 50 
    },
    { 
      name: 'Void Nexus', 
      desc: 'The edge of existence where void creatures lurk.',
      min: 48, max: 54 
    },
    { 
      name: 'Titan Halls', 
      desc: 'Ancient halls where the old gods once walked.',
      min: 52, max: 58 
    },
    { 
      name: 'Eternity\'s End', 
      desc: 'The final frontier, where only the strongest dare venture.',
      min: 56, max: 60 
    },
  ];
  
  const regionIds = {};
  for (let i = 0; i < newRegions.length; i++) {
    const r = newRegions[i];
    const id = await addRegion({
      name: r.name,
      description: r.desc,
      minLevel: r.min,
      maxLevel: r.max,
      unlockType: r.unlock || null,
      unlockValue: r.unlockVal || null
    });
    regionIds[i + 5] = id; // Store region ID (starting from region 5)
    console.log(`✓ Region ${i + 5}: ${r.name} (${r.min}-${r.max})`);
    totalRegions++;
  }
  
  // ========================================
  // STEP 3: Add Mobs for New Regions
  // ========================================
  console.log('\n=== Adding Mobs to New Regions ===\n');
  
  const newRegionMobs = [
    // Region 5: Scorched Badlands (13-18)
    { name: 'Lesser Imp', level: 13, region: 5, atkSpeed: 1.0 },
    { name: 'Ash Wraith', level: 14, region: 5, atkSpeed: 1.1 },
    { name: 'Fire Elemental', level: 15, region: 5, atkSpeed: 1.2 },
    { name: 'Hellhound', level: 16, region: 5, atkSpeed: 1.1 },
    { name: 'Flame Demon', level: 17, region: 5, atkSpeed: 1.3 },
    { name: 'Ifrit', level: 18, region: 5, atkSpeed: 1.4 },
    
    // Region 6: Frostpeak Glaciers (16-22)
    { name: 'Yeti', level: 16, region: 6, atkSpeed: 1.6 },
    { name: 'Ice Wolf', level: 17, region: 6, atkSpeed: 1.0 },
    { name: 'Ice Elemental', level: 18, region: 6, atkSpeed: 1.2 },
    { name: 'Snow Troll', level: 19, region: 6, atkSpeed: 1.7 },
    { name: 'Frost Giant', level: 20, region: 6, atkSpeed: 2.0 },
    { name: 'Ice Drake', level: 21, region: 6, atkSpeed: 1.5 },
    { name: 'Frost Mammoth', level: 22, region: 6, atkSpeed: 1.8 },
    
    // Region 7: Elven Sanctum (20-26)
    { name: 'Corrupted Guardian', level: 20, region: 7, atkSpeed: 1.1 },
    { name: 'Wild Sprite', level: 21, region: 7, atkSpeed: 0.8 },
    { name: 'Dark Centaur', level: 22, region: 7, atkSpeed: 1.2 },
    { name: 'Elven Revenant', level: 23, region: 7, atkSpeed: 1.0 },
    { name: 'Elven Shadow Archer', level: 24, region: 7, atkSpeed: 0.9 },
    { name: 'Ancient Treeant', level: 25, region: 7, atkSpeed: 2.0 },
    { name: 'Corrupted Unicorn', level: 26, region: 7, atkSpeed: 1.3 },
    
    // Region 8: Dragon Aerie (24-30)
    { name: 'Dragon Wyrmling', level: 24, region: 8, atkSpeed: 1.4 },
    { name: 'Wyvern Matriarch', level: 25, region: 8, atkSpeed: 1.5 },
    { name: 'Adult Wyvern', level: 26, region: 8, atkSpeed: 1.5 },
    { name: 'Dragonkin Warrior', level: 27, region: 8, atkSpeed: 1.3 },
    { name: 'Elder Wyrm', level: 28, region: 8, atkSpeed: 1.6 },
    { name: 'Drake Guardian', level: 29, region: 8, atkSpeed: 1.4 },
    { name: 'Ancient Dragon', level: 30, region: 8, atkSpeed: 1.7 },
    
    // Region 9: Abyssal Depths (28-34)
    { name: 'Deep Lurker', level: 28, region: 9, atkSpeed: 1.2 },
    { name: 'Abyssal Serpent', level: 29, region: 9, atkSpeed: 1.1 },
    { name: 'Kraken Spawn', level: 30, region: 9, atkSpeed: 1.5 },
    { name: 'Leviathan', level: 31, region: 9, atkSpeed: 1.8 },
    { name: 'Tidecaller', level: 32, region: 9, atkSpeed: 1.3 },
    { name: 'Abyssal Horror', level: 33, region: 9, atkSpeed: 1.4 },
    { name: 'Elder Kraken', level: 34, region: 9, atkSpeed: 2.0 },
    
    // Region 10: Celestial Spire (32-38)
    { name: 'Skyward Guardian', level: 32, region: 10, atkSpeed: 1.2 },
    { name: 'Cloud Elemental', level: 33, region: 10, atkSpeed: 0.9 },
    { name: 'Radiant Seraph', level: 34, region: 10, atkSpeed: 1.1 },
    { name: 'Storm Phoenix', level: 35, region: 10, atkSpeed: 1.0 },
    { name: 'Celestial Enforcer', level: 36, region: 10, atkSpeed: 1.3 },
    { name: 'Archangel', level: 37, region: 10, atkSpeed: 1.2 },
    { name: 'Divine Avatar', level: 38, region: 10, atkSpeed: 1.4 },
    
    // Region 11: Demon Citadel (36-42)
    { name: 'Pit Fiend', level: 36, region: 11, atkSpeed: 1.3 },
    { name: 'Hellknight', level: 37, region: 11, atkSpeed: 1.4 },
    { name: 'Shadow Demon', level: 38, region: 11, atkSpeed: 1.1 },
    { name: 'Demon Lord', level: 39, region: 11, atkSpeed: 1.5 },
    { name: 'Balrog', level: 40, region: 11, atkSpeed: 1.8 },
    { name: 'Archdevil', level: 41, region: 11, atkSpeed: 1.6 },
    { name: 'Greater Demon', level: 42, region: 11, atkSpeed: 1.7 },
    
    // Region 12: Astral Plane (40-46)
    { name: 'Astral Wanderer', level: 40, region: 12, atkSpeed: 1.0 },
    { name: 'Phase Beast', level: 41, region: 12, atkSpeed: 0.8 },
    { name: 'Dimension Hopper', level: 42, region: 12, atkSpeed: 1.2 },
    { name: 'Reality Weaver', level: 43, region: 12, atkSpeed: 1.3 },
    { name: 'Astral Dragon', level: 44, region: 12, atkSpeed: 1.5 },
    { name: 'Planar Guardian', level: 45, region: 12, atkSpeed: 1.4 },
    { name: 'Voidborn Titan', level: 46, region: 12, atkSpeed: 1.9 },
    
    // Region 13: Elemental Chaos (44-50)
    { name: 'Chaos Elemental', level: 44, region: 13, atkSpeed: 1.2 },
    { name: 'Primordial Flame', level: 45, region: 13, atkSpeed: 1.1 },
    { name: 'Storm Titan', level: 46, region: 13, atkSpeed: 1.6 },
    { name: 'Earth Colossus', level: 47, region: 13, atkSpeed: 2.0 },
    { name: 'Magma Behemoth', level: 48, region: 13, atkSpeed: 1.7 },
    { name: 'Tsunami Lord', level: 49, region: 13, atkSpeed: 1.4 },
    { name: 'Elemental Overlord', level: 50, region: 13, atkSpeed: 1.8 },
    
    // Region 14: Void Nexus (48-54)
    { name: 'Void Stalker', level: 48, region: 14, atkSpeed: 1.0 },
    { name: 'Entropy Beast', level: 49, region: 14, atkSpeed: 1.2 },
    { name: 'Void Dragon', level: 50, region: 14, atkSpeed: 1.5 },
    { name: 'Nihility', level: 51, region: 14, atkSpeed: 1.3 },
    { name: 'Oblivion Walker', level: 52, region: 14, atkSpeed: 1.4 },
    { name: 'Void Reaver', level: 53, region: 14, atkSpeed: 1.6 },
    { name: 'Nothingness Incarnate', level: 54, region: 14, atkSpeed: 1.8 },
    
    // Region 15: Titan Halls (52-58)
    { name: 'Titan Guardian', level: 52, region: 15, atkSpeed: 1.9 },
    { name: 'Stone Colossus', level: 53, region: 15, atkSpeed: 2.0 },
    { name: 'War Titan', level: 54, region: 15, atkSpeed: 1.7 },
    { name: 'Titan Warlord', level: 55, region: 15, atkSpeed: 1.8 },
    { name: 'Elder Titan', level: 56, region: 15, atkSpeed: 1.9 },
    { name: 'Primordial Titan', level: 57, region: 15, atkSpeed: 2.0 },
    { name: 'Titan King', level: 58, region: 15, atkSpeed: 2.1 },
    
    // Region 16: Eternity's End (56-60)
    { name: 'Eternity Guardian', level: 56, region: 16, atkSpeed: 1.5 },
    { name: 'Time Weaver', level: 57, region: 16, atkSpeed: 1.3 },
    { name: 'Fate Keeper', level: 58, region: 16, atkSpeed: 1.4 },
    { name: 'Cosmic Horror', level: 59, region: 16, atkSpeed: 1.6 },
    { name: 'Harbinger of the End', level: 60, region: 16, atkSpeed: 1.7 },
  ];
  
  for (const mobData of newRegionMobs) {
    const stats = calculateMobStats(mobData.level);
    const regionId = regionIds[mobData.region];
    const regionName = newRegions[mobData.region - 5].name;
    
    await addMob({
      name: mobData.name,
      level: mobData.level,
      area: regionName,
      region_id: regionId,
      ...stats,
      atkSpeed: mobData.atkSpeed
    });
    totalMobs++;
  }
  
  console.log(`✓ Added ${newRegionMobs.length} mobs to new regions`);
  
  console.log(`\n✅ WORLD EXPANSION COMPLETE!`);
  console.log(`   Total new regions: ${totalRegions}`);
  console.log(`   Total new mobs: ${totalMobs}`);
  console.log(`   Level range: 1-60`);
  console.log(`   Equipment tiers: 15-60`);
}

expandWorld().catch(console.error);
