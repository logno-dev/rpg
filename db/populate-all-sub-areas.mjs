import Database from 'better-sqlite3';

const db = new Database('./db/rpg.db');

// Sub-area definitions for all regions 4-16
const subAreas = [
  // Region 4: Shadowdeep Dungeon (8-15)
  {
    region_id: 4,
    name: "Crypts of the Damned",
    description: "Ancient burial chambers filled with undead horrors. The air is thick with decay.",
    min_level: 8,
    max_level: 11,
    mobs: [
      { mob_id: 134, spawn_weight: 40, level_variance: 1 }, // Shambling Zombie
      { mob_id: 135, spawn_weight: 35, level_variance: 1 }, // Flesh Ghoul
      { mob_id: 136, spawn_weight: 25, level_variance: 1 }, // Lichling
    ]
  },
  {
    region_id: 4,
    name: "Shadow Halls",
    description: "Corridors shrouded in impenetrable darkness where shadow creatures dwell.",
    min_level: 12,
    max_level: 14,
    mobs: [
      { mob_id: 136, spawn_weight: 30, level_variance: 1 }, // Lichling
      { mob_id: 137, spawn_weight: 40, level_variance: 1 }, // Shadow Abomination
      { mob_id: 138, spawn_weight: 30, level_variance: 1 }, // Void Walker
    ]
  },
  {
    region_id: 4,
    name: "The Void Chamber",
    description: "The deepest, darkest part of the dungeon where reality itself seems twisted.",
    min_level: 14,
    max_level: 15,
    mobs: [
      { mob_id: 137, spawn_weight: 35, level_variance: 1 }, // Shadow Abomination
      { mob_id: 138, spawn_weight: 65, level_variance: 1 }, // Void Walker
    ]
  },

  // Region 5: Scorched Badlands (13-18)
  {
    region_id: 5,
    name: "Burning Wastes",
    description: "Barren desert with rivers of lava and pools of molten rock.",
    min_level: 13,
    max_level: 15,
    mobs: [
      { mob_id: 157, spawn_weight: 45, level_variance: 1 }, // Lesser Imp
      { mob_id: 158, spawn_weight: 35, level_variance: 1 }, // Ash Wraith
      { mob_id: 159, spawn_weight: 20, level_variance: 1 }, // Fire Elemental
    ]
  },
  {
    region_id: 5,
    name: "Hellhound Territories",
    description: "Hunting grounds of demonic beasts. The ground burns beneath your feet.",
    min_level: 15,
    max_level: 17,
    mobs: [
      { mob_id: 159, spawn_weight: 25, level_variance: 1 }, // Fire Elemental
      { mob_id: 160, spawn_weight: 45, level_variance: 1 }, // Hellhound
      { mob_id: 161, spawn_weight: 30, level_variance: 1 }, // Flame Demon
    ]
  },
  {
    region_id: 5,
    name: "Infernal Depths",
    description: "The hottest, most dangerous area where powerful fire demons reign.",
    min_level: 17,
    max_level: 18,
    mobs: [
      { mob_id: 161, spawn_weight: 40, level_variance: 1 }, // Flame Demon
      { mob_id: 162, spawn_weight: 60, level_variance: 1 }, // Ifrit
    ]
  },

  // Region 6: Frostpeak Glaciers (16-22)
  {
    region_id: 6,
    name: "Frozen Tundra",
    description: "Endless fields of ice and snow. Freezing winds cut through armor.",
    min_level: 16,
    max_level: 18,
    mobs: [
      { mob_id: 163, spawn_weight: 40, level_variance: 1 }, // Yeti
      { mob_id: 164, spawn_weight: 35, level_variance: 1 }, // Ice Wolf
      { mob_id: 165, spawn_weight: 25, level_variance: 1 }, // Ice Elemental
    ]
  },
  {
    region_id: 6,
    name: "Giant's Domain",
    description: "Territory of frost giants and trolls. Massive ice formations tower overhead.",
    min_level: 19,
    max_level: 21,
    mobs: [
      { mob_id: 166, spawn_weight: 30, level_variance: 1 }, // Snow Troll
      { mob_id: 167, spawn_weight: 40, level_variance: 1 }, // Frost Giant
      { mob_id: 168, spawn_weight: 30, level_variance: 1 }, // Ice Drake
    ]
  },
  {
    region_id: 6,
    name: "Glacial Peaks",
    description: "The highest, coldest peaks where only the strongest ice creatures survive.",
    min_level: 21,
    max_level: 22,
    mobs: [
      { mob_id: 168, spawn_weight: 45, level_variance: 1 }, // Ice Drake
      { mob_id: 169, spawn_weight: 55, level_variance: 1 }, // Frost Mammoth
    ]
  },

  // Region 7: Elven Sanctum (20-26)
  {
    region_id: 7,
    name: "Corrupted Gardens",
    description: "Once beautiful gardens now twisted by dark magic. Thorns cover every surface.",
    min_level: 20,
    max_level: 22,
    mobs: [
      { mob_id: 170, spawn_weight: 40, level_variance: 1 }, // Corrupted Guardian
      { mob_id: 171, spawn_weight: 35, level_variance: 1 }, // Wild Sprite
      { mob_id: 172, spawn_weight: 25, level_variance: 1 }, // Dark Centaur
    ]
  },
  {
    region_id: 7,
    name: "Haunted Groves",
    description: "Ancient trees whisper of betrayal. Elven spirits wander, lost and vengeful.",
    min_level: 23,
    max_level: 25,
    mobs: [
      { mob_id: 173, spawn_weight: 35, level_variance: 1 }, // Elven Revenant
      { mob_id: 174, spawn_weight: 35, level_variance: 1 }, // Elven Shadow Archer
      { mob_id: 175, spawn_weight: 30, level_variance: 1 }, // Ancient Treeant
    ]
  },
  {
    region_id: 7,
    name: "Heart of Darkness",
    description: "The source of the corruption. Dark energy pulses from the ground.",
    min_level: 25,
    max_level: 26,
    mobs: [
      { mob_id: 175, spawn_weight: 40, level_variance: 1 }, // Ancient Treeant
      { mob_id: 176, spawn_weight: 60, level_variance: 1 }, // Corrupted Unicorn
    ]
  },

  // Region 8: Dragon Aerie (24-30)
  {
    region_id: 8,
    name: "Wyrmling Nests",
    description: "Young dragons and wyverns make their homes in mountain caves.",
    min_level: 24,
    max_level: 26,
    mobs: [
      { mob_id: 177, spawn_weight: 45, level_variance: 1 }, // Dragon Wyrmling
      { mob_id: 178, spawn_weight: 30, level_variance: 1 }, // Wyvern Matriarch
      { mob_id: 179, spawn_weight: 25, level_variance: 1 }, // Adult Wyvern
    ]
  },
  {
    region_id: 8,
    name: "Dragon Territories",
    description: "Claimed lands of dragonkin warriors. Dragon scales litter the ground.",
    min_level: 27,
    max_level: 29,
    mobs: [
      { mob_id: 180, spawn_weight: 40, level_variance: 1 }, // Dragonkin Warrior
      { mob_id: 181, spawn_weight: 35, level_variance: 1 }, // Elder Wyrm
      { mob_id: 182, spawn_weight: 25, level_variance: 1 }, // Drake Guardian
    ]
  },
  {
    region_id: 8,
    name: "Ancient Dragon Lairs",
    description: "The oldest and most powerful dragons dwell here. Treasure and danger abound.",
    min_level: 29,
    max_level: 30,
    mobs: [
      { mob_id: 182, spawn_weight: 35, level_variance: 1 }, // Drake Guardian
      { mob_id: 183, spawn_weight: 65, level_variance: 1 }, // Ancient Dragon
    ]
  },

  // Region 9: Abyssal Depths (28-34)
  {
    region_id: 9,
    name: "Murky Trenches",
    description: "Deep underwater chasms where light never reaches. Strange creatures lurk.",
    min_level: 28,
    max_level: 30,
    mobs: [
      { mob_id: 184, spawn_weight: 45, level_variance: 1 }, // Deep Lurker
      { mob_id: 185, spawn_weight: 35, level_variance: 1 }, // Abyssal Serpent
      { mob_id: 186, spawn_weight: 20, level_variance: 1 }, // Kraken Spawn
    ]
  },
  {
    region_id: 9,
    name: "Leviathan's Domain",
    description: "Territory of massive sea monsters. The water pressure is crushing.",
    min_level: 31,
    max_level: 33,
    mobs: [
      { mob_id: 187, spawn_weight: 35, level_variance: 1 }, // Leviathan
      { mob_id: 188, spawn_weight: 35, level_variance: 1 }, // Tidecaller
      { mob_id: 189, spawn_weight: 30, level_variance: 1 }, // Abyssal Horror
    ]
  },
  {
    region_id: 9,
    name: "The Deepest Abyss",
    description: "The bottom of the ocean where elder krakens reign supreme.",
    min_level: 33,
    max_level: 34,
    mobs: [
      { mob_id: 189, spawn_weight: 40, level_variance: 1 }, // Abyssal Horror
      { mob_id: 190, spawn_weight: 60, level_variance: 1 }, // Elder Kraken
    ]
  },

  // Region 10: Celestial Spire (32-38)
  {
    region_id: 10,
    name: "Sky Gardens",
    description: "Floating gardens tended by celestial guardians. Clouds drift below.",
    min_level: 32,
    max_level: 34,
    mobs: [
      { mob_id: 191, spawn_weight: 40, level_variance: 1 }, // Skyward Guardian
      { mob_id: 192, spawn_weight: 35, level_variance: 1 }, // Cloud Elemental
      { mob_id: 193, spawn_weight: 25, level_variance: 1 }, // Radiant Seraph
    ]
  },
  {
    region_id: 10,
    name: "Storm Peaks",
    description: "Lightning crackles through the air. Storm phoenixes soar overhead.",
    min_level: 35,
    max_level: 37,
    mobs: [
      { mob_id: 194, spawn_weight: 35, level_variance: 1 }, // Storm Phoenix
      { mob_id: 195, spawn_weight: 40, level_variance: 1 }, // Celestial Enforcer
      { mob_id: 196, spawn_weight: 25, level_variance: 1 }, // Archangel
    ]
  },
  {
    region_id: 10,
    name: "Divine Sanctum",
    description: "The highest reaches where divine avatars dwell in radiant glory.",
    min_level: 37,
    max_level: 38,
    mobs: [
      { mob_id: 196, spawn_weight: 45, level_variance: 1 }, // Archangel
      { mob_id: 197, spawn_weight: 55, level_variance: 1 }, // Divine Avatar
    ]
  },

  // Region 11: Demon Citadel (36-42)
  {
    region_id: 11,
    name: "Hellfire Ramparts",
    description: "Fortified walls patrolled by demonic knights. Flames burn eternally.",
    min_level: 36,
    max_level: 38,
    mobs: [
      { mob_id: 198, spawn_weight: 40, level_variance: 1 }, // Pit Fiend
      { mob_id: 199, spawn_weight: 35, level_variance: 1 }, // Hellknight
      { mob_id: 200, spawn_weight: 25, level_variance: 1 }, // Shadow Demon
    ]
  },
  {
    region_id: 11,
    name: "Demon Lord Chambers",
    description: "Inner sanctums where demon lords plot and scheme.",
    min_level: 39,
    max_level: 41,
    mobs: [
      { mob_id: 201, spawn_weight: 35, level_variance: 1 }, // Demon Lord
      { mob_id: 202, spawn_weight: 35, level_variance: 1 }, // Balrog
      { mob_id: 203, spawn_weight: 30, level_variance: 1 }, // Archdevil
    ]
  },
  {
    region_id: 11,
    name: "Throne of Demons",
    description: "The heart of demonic power. Greater demons command legions from here.",
    min_level: 41,
    max_level: 42,
    mobs: [
      { mob_id: 203, spawn_weight: 40, level_variance: 1 }, // Archdevil
      { mob_id: 204, spawn_weight: 60, level_variance: 1 }, // Greater Demon
    ]
  },

  // Region 12: Astral Plane (40-46)
  {
    region_id: 12,
    name: "Shifting Boundaries",
    description: "Reality bends and twists. Astral wanderers phase in and out of existence.",
    min_level: 40,
    max_level: 42,
    mobs: [
      { mob_id: 205, spawn_weight: 40, level_variance: 1 }, // Astral Wanderer
      { mob_id: 206, spawn_weight: 35, level_variance: 1 }, // Phase Beast
      { mob_id: 207, spawn_weight: 25, level_variance: 1 }, // Dimension Hopper
    ]
  },
  {
    region_id: 12,
    name: "Reality Nexus",
    description: "Where multiple dimensions converge. Reality weavers maintain the balance.",
    min_level: 43,
    max_level: 45,
    mobs: [
      { mob_id: 208, spawn_weight: 35, level_variance: 1 }, // Reality Weaver
      { mob_id: 209, spawn_weight: 40, level_variance: 1 }, // Astral Dragon
      { mob_id: 210, spawn_weight: 25, level_variance: 1 }, // Planar Guardian
    ]
  },
  {
    region_id: 12,
    name: "Void Between Worlds",
    description: "The space between planes where voidborn titans lurk.",
    min_level: 45,
    max_level: 46,
    mobs: [
      { mob_id: 210, spawn_weight: 40, level_variance: 1 }, // Planar Guardian
      { mob_id: 211, spawn_weight: 60, level_variance: 1 }, // Voidborn Titan
    ]
  },

  // Region 13: Elemental Chaos (44-50)
  {
    region_id: 13,
    name: "Primordial Battlefield",
    description: "Elements clash in constant warfare. Fire meets ice, earth meets storm.",
    min_level: 44,
    max_level: 46,
    mobs: [
      { mob_id: 212, spawn_weight: 40, level_variance: 1 }, // Chaos Elemental
      { mob_id: 213, spawn_weight: 30, level_variance: 1 }, // Primordial Flame
      { mob_id: 214, spawn_weight: 30, level_variance: 1 }, // Storm Titan
    ]
  },
  {
    region_id: 13,
    name: "Titan Territories",
    description: "Massive elemental titans wage war. The ground shakes with every step.",
    min_level: 47,
    max_level: 49,
    mobs: [
      { mob_id: 215, spawn_weight: 30, level_variance: 1 }, // Earth Colossus
      { mob_id: 216, spawn_weight: 35, level_variance: 1 }, // Magma Behemoth
      { mob_id: 217, spawn_weight: 35, level_variance: 1 }, // Tsunami Lord
    ]
  },
  {
    region_id: 13,
    name: "Eye of the Storm",
    description: "The center of elemental chaos. Elemental overlords rule with absolute power.",
    min_level: 49,
    max_level: 50,
    mobs: [
      { mob_id: 217, spawn_weight: 35, level_variance: 1 }, // Tsunami Lord
      { mob_id: 218, spawn_weight: 65, level_variance: 1 }, // Elemental Overlord
    ]
  },

  // Region 14: Void Nexus (48-54)
  {
    region_id: 14,
    name: "Entropic Wastes",
    description: "Nothingness spreads. Void stalkers hunt in the darkness.",
    min_level: 48,
    max_level: 50,
    mobs: [
      { mob_id: 219, spawn_weight: 40, level_variance: 1 }, // Void Stalker
      { mob_id: 220, spawn_weight: 35, level_variance: 1 }, // Entropy Beast
      { mob_id: 221, spawn_weight: 25, level_variance: 1 }, // Void Dragon
    ]
  },
  {
    region_id: 14,
    name: "Realm of Oblivion",
    description: "Where existence itself is uncertain. Oblivion walkers consume all.",
    min_level: 51,
    max_level: 53,
    mobs: [
      { mob_id: 222, spawn_weight: 35, level_variance: 1 }, // Nihility
      { mob_id: 223, spawn_weight: 35, level_variance: 1 }, // Oblivion Walker
      { mob_id: 224, spawn_weight: 30, level_variance: 1 }, // Void Reaver
    ]
  },
  {
    region_id: 14,
    name: "Heart of Nothingness",
    description: "The deepest void where nothingness itself takes form.",
    min_level: 53,
    max_level: 54,
    mobs: [
      { mob_id: 224, spawn_weight: 40, level_variance: 1 }, // Void Reaver
      { mob_id: 225, spawn_weight: 60, level_variance: 1 }, // Nothingness Incarnate
    ]
  },

  // Region 15: Titan Halls (52-58)
  {
    region_id: 15,
    name: "Guardian Chambers",
    description: "Massive halls patrolled by titan guardians. Every surface is carved from stone.",
    min_level: 52,
    max_level: 54,
    mobs: [
      { mob_id: 226, spawn_weight: 45, level_variance: 1 }, // Titan Guardian
      { mob_id: 227, spawn_weight: 30, level_variance: 1 }, // Stone Colossus
      { mob_id: 228, spawn_weight: 25, level_variance: 1 }, // War Titan
    ]
  },
  {
    region_id: 15,
    name: "War Halls",
    description: "Battle arenas where war titans train and fight.",
    min_level: 55,
    max_level: 57,
    mobs: [
      { mob_id: 229, spawn_weight: 35, level_variance: 1 }, // Titan Warlord
      { mob_id: 230, spawn_weight: 35, level_variance: 1 }, // Elder Titan
      { mob_id: 231, spawn_weight: 30, level_variance: 1 }, // Primordial Titan
    ]
  },
  {
    region_id: 15,
    name: "Throne of the Titan King",
    description: "The seat of titan power. The king of all titans reigns here.",
    min_level: 57,
    max_level: 58,
    mobs: [
      { mob_id: 231, spawn_weight: 35, level_variance: 1 }, // Primordial Titan
      { mob_id: 232, spawn_weight: 65, level_variance: 1 }, // Titan King
    ]
  },

  // Region 16: Eternity's End (56-60)
  {
    region_id: 16,
    name: "Gates of Eternity",
    description: "The threshold between time and timelessness. Eternity guardians stand watch.",
    min_level: 56,
    max_level: 58,
    mobs: [
      { mob_id: 233, spawn_weight: 50, level_variance: 1 }, // Eternity Guardian
      { mob_id: 234, spawn_weight: 30, level_variance: 1 }, // Time Weaver
      { mob_id: 235, spawn_weight: 20, level_variance: 1 }, // Fate Keeper
    ]
  },
  {
    region_id: 16,
    name: "Cosmic Void",
    description: "Where reality ends and cosmic horrors dwell in the darkness beyond.",
    min_level: 58,
    max_level: 60,
    mobs: [
      { mob_id: 235, spawn_weight: 25, level_variance: 1 }, // Fate Keeper
      { mob_id: 236, spawn_weight: 40, level_variance: 1 }, // Cosmic Horror
      { mob_id: 237, spawn_weight: 35, level_variance: 1 }, // Harbinger of the End
    ]
  },
];

console.log('Starting sub-area population for regions 4-16...\n');

// Begin transaction
db.prepare('BEGIN').run();

try {
  const insertSubArea = db.prepare(`
    INSERT INTO sub_areas (region_id, name, description, min_level, max_level)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertSubAreaMob = db.prepare(`
    INSERT INTO sub_area_mobs (sub_area_id, mob_id, spawn_weight, level_variance)
    VALUES (?, ?, ?, ?)
  `);

  let totalSubAreas = 0;
  let totalSpawns = 0;

  for (const area of subAreas) {
    const result = insertSubArea.run(
      area.region_id,
      area.name,
      area.description,
      area.min_level,
      area.max_level
    );

    const subAreaId = result.lastInsertRowid;
    console.log(`✓ Created: ${area.name} (Region ${area.region_id}, Levels ${area.min_level}-${area.max_level})`);
    totalSubAreas++;

    for (const mob of area.mobs) {
      insertSubAreaMob.run(
        subAreaId,
        mob.mob_id,
        mob.spawn_weight,
        mob.level_variance
      );
      totalSpawns++;
    }
  }

  // Commit transaction
  db.prepare('COMMIT').run();

  console.log(`\n✅ Successfully created ${totalSubAreas} sub-areas with ${totalSpawns} mob spawns!`);

} catch (error) {
  db.prepare('ROLLBACK').run();
  console.error('❌ Error:', error.message);
  throw error;
}

db.close();
