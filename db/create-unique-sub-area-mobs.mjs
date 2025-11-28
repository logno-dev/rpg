#!/usr/bin/env node
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log('🎨 Creating unique mobs for each sub-area...\n');

// Get all sub-areas
const subAreas = await db.execute(`
  SELECT sa.id, sa.name, sa.min_level, sa.max_level, r.name as region_name
  FROM sub_areas sa
  JOIN regions r ON sa.region_id = r.id
  ORDER BY r.id, sa.min_level
`);

console.log(`Found ${subAreas.rows.length} sub-areas\n`);

// Function to generate a unique mob based on sub-area theme
function generateUniqueMob(subArea) {
  const avgLevel = Math.floor((subArea.min_level + subArea.max_level) / 2);
  const name = subArea.name;
  const region = subArea.region_name;
  
  // Generate thematic names based on sub-area
  let mobName = '';
  let description = '';
  
  // Greenfield Plains
  if (region === 'Greenfield Plains') {
    if (name.includes('Village')) {
      mobName = 'Feral Hound';
      description = 'A wild dog that has been terrorizing the village outskirts.';
    } else if (name.includes('Meadow')) {
      mobName = 'Meadow Sprite';
      description = 'A mischievous nature spirit that protects the open meadows.';
    } else if (name.includes('Farmland')) {
      mobName = 'Crop Blight';
      description = 'A corrupted scarecrow animated by dark magic.';
    } else if (name.includes('Elite Grounds')) {
      mobName = 'Plains Warden';
      description = 'An elite guardian protecting the grasslands.';
    } else if (name.includes('Bandit')) {
      mobName = 'Bandit Chief';
      description = 'The cunning leader of the bandit encampment.';
    } else if (name.includes('Cursed Ruins')) {
      mobName = 'Ruined Sentinel';
      description = 'An ancient construct still guarding the cursed ruins.';
    }
  }
  
  // Darkwood Forest
  else if (region === 'Darkwood Forest') {
    if (name.includes('Forest Edge')) {
      mobName = 'Edge Prowler';
      description = 'A stealthy predator that hunts at the forest edge.';
    } else if (name.includes('Forest Outskirts')) {
      mobName = 'Young Treant';
      description = 'A juvenile tree creature learning to protect the forest.';
    } else if (name.includes('Dense Thicket')) {
      mobName = 'Thorn Beast';
      description = 'A creature covered in deadly thorns native to dense forests.';
    } else if (name.includes('Ancient Grove')) {
      mobName = 'Grove Guardian';
      description = 'A mystical protector of the ancient trees.';
    } else if (name.includes('Elite Grounds')) {
      mobName = 'Forest Stalker';
      description = 'An apex predator of the dark woods.';
    } else if (name.includes('Witch')) {
      mobName = 'Hexed Familiar';
      description = "A corrupted creature bound to the witch's will.";
    } else if (name.includes('Cursed Depths')) {
      mobName = 'Depth Lurker';
      description = 'A shadowy horror from the darkest parts of the forest.';
    }
  }
  
  // Ironpeak Mountains
  else if (region === 'Ironpeak Mountains') {
    if (name.includes('Outskirts') && avgLevel < 5) {
      mobName = 'Mountain Goat';
      description = 'A hardy goat adapted to rocky terrain.';
    } else if (name.includes('Foothills')) {
      mobName = 'Foothill Howler';
      description = 'A wolf-like creature with a bone-chilling howl.';
    } else if (name.includes('Mountain Base')) {
      mobName = 'Base Camp Raider';
      description = 'A mountain bandit preying on travelers.';
    } else if (name.includes('Rocky Slopes')) {
      mobName = 'Slope Climber';
      description = 'An agile predator that navigates steep cliffs.';
    } else if (name.includes('High Peaks')) {
      mobName = 'Peak Wyvern';
      description = 'A lesser wyvern that nests in high altitudes.';
    } else if (name.includes('Elite Grounds')) {
      mobName = 'Mountain Titan';
      description = 'A massive stone giant from the peaks.';
    } else if (name.includes('Harpy')) {
      mobName = 'Matriarch Harpy';
      description = 'The queen of the harpy nest, fierce and cunning.';
    } else if (name.includes('Titan Ruins')) {
      mobName = 'Titan Remnant';
      description = 'An ancient construct left behind by the titans.';
    }
  }
  
  // Shadowdeep Dungeon
  else if (region === 'Shadowdeep Dungeon') {
    if (name.includes('Outskirts')) {
      mobName = 'Dungeon Rat Swarm';
      description = 'A writhing mass of diseased rats.';
    } else if (name.includes('Crypts')) {
      mobName = 'Crypt Keeper';
      description = 'An undead guardian of the burial chambers.';
    } else if (name.includes('Shadow Halls')) {
      mobName = 'Hall Phantom';
      description = 'A tormented spirit haunting the shadowy corridors.';
    } else if (name.includes('Void Chamber')) {
      mobName = 'Void Spawn';
      description = 'A creature birthed from the void itself.';
    } else if (name.includes('Elite Grounds')) {
      mobName = 'Shadow Reaper';
      description = 'An elite undead warrior wielding shadow magic.';
    } else if (name.includes('Forbidden Zone')) {
      mobName = 'Forbidden Horror';
      description = 'An abomination that should never have been awakened.';
    }
  }
  
  // Scorched Badlands
  else if (region === 'Scorched Badlands') {
    if (name.includes('Outskirts')) {
      mobName = 'Ash Crawler';
      description = 'A scavenger adapted to the scorched wastelands.';
    } else if (name.includes('Burning Wastes')) {
      mobName = 'Ember Serpent';
      description = 'A snake-like creature that thrives in intense heat.';
    } else if (name.includes('Hellhound')) {
      mobName = 'Alpha Hellhound';
      description = 'The pack leader of the hellhound territories.';
    } else if (name.includes('Infernal')) {
      mobName = 'Infernal Warden';
      description = 'A demonic guardian of the deepest inferno.';
    } else if (name.includes('Elite Grounds')) {
      mobName = 'Badlands Tyrant';
      description = 'A fearsome ruler of the scorched lands.';
    } else if (name.includes('Forbidden Zone')) {
      mobName = 'Scorched Demon';
      description = 'A high-ranking demon from the burning depths.';
    }
  }
  
  // Frostpeak Glaciers
  else if (region === 'Frostpeak Glaciers') {
    if (name.includes('Outskirts')) {
      mobName = 'Tundra Wanderer';
      description = 'A nomadic creature adapted to frozen wastelands.';
    } else if (name.includes('Frozen Tundra')) {
      mobName = 'Frost Stalker';
      description = 'A white-furred predator nearly invisible in snow.';
    } else if (name.includes('Giant')) {
      mobName = 'Frost Giant Berserker';
      description = 'An enraged frost giant warrior.';
    } else if (name.includes('Glacial')) {
      mobName = 'Glacial Wyrm';
      description = 'An ancient ice dragon dwelling in the peaks.';
    } else if (name.includes('Elite Grounds')) {
      mobName = 'Ice Colossus';
      description = 'A massive elemental made of pure ice.';
    } else if (name.includes('Forbidden Zone')) {
      mobName = 'Eternal Freeze';
      description = 'An entity of absolute zero, death incarnate.';
    }
  }
  
  // Elven Sanctum
  else if (region === 'Elven Sanctum') {
    if (name.includes('Outskirts')) {
      mobName = 'Corrupted Dryad';
      description = 'A nature spirit twisted by dark magic.';
    } else if (name.includes('Corrupted Gardens')) {
      mobName = 'Garden Abomination';
      description = 'A grotesque fusion of plants and flesh.';
    } else if (name.includes('Haunted Groves')) {
      mobName = 'Grove Specter';
      description = 'The ghost of a fallen elven ranger.';
    } else if (name.includes('Heart of Darkness')) {
      mobName = 'Dark Heart Guardian';
      description = 'A powerful entity protecting the source of corruption.';
    } else if (name.includes('Elite Grounds')) {
      mobName = 'Fallen Elven Lord';
      description = 'A corrupted elven noble of immense power.';
    } else if (name.includes('Forbidden Zone')) {
      mobName = 'Sanctum Desecrator';
      description = 'A demon lord responsible for the sanctum\'s fall.';
    }
  }
  
  // Dragon Aerie
  else if (region === 'Dragon Aerie') {
    if (name.includes('Outskirts')) {
      mobName = 'Drake Scout';
      description = 'A young drake patrolling the territory.';
    } else if (name.includes('Wyrmling')) {
      mobName = 'Wyrmling Broodling';
      description = 'A freshly hatched dragon, still dangerous.';
    } else if (name.includes('Dragon Territories')) {
      mobName = 'Territorial Drake';
      description = 'An aggressive drake defending its domain.';
    } else if (name.includes('Ancient Dragon Lairs')) {
      mobName = 'Ancient Wyrm';
      description = 'A millennia-old dragon of terrible power.';
    } else if (name.includes('Elite Grounds')) {
      mobName = 'Dragon Warlord';
      description = 'A battle-hardened dragon of legendary strength.';
    } else if (name.includes('Forbidden Zone')) {
      mobName = 'Primordial Dragon';
      description = 'One of the first dragons, a living force of nature.';
    }
  }
  
  // Abyssal Depths
  else if (region === 'Abyssal Depths') {
    if (name.includes('Outskirts')) {
      mobName = 'Deep Dweller';
      description = 'A creature from the lightless depths.';
    } else if (name.includes('Murky Trenches')) {
      mobName = 'Trench Horror';
      description = 'An unspeakable thing from the ocean floor.';
    } else if (name.includes('Leviathan')) {
      mobName = 'Leviathan Spawn';
      description = 'Offspring of the legendary sea monster.';
    } else if (name.includes('Deepest Abyss')) {
      mobName = 'Abyssal Entity';
      description = 'A being from beyond comprehension.';
    } else if (name.includes('Elite Grounds')) {
      mobName = 'Kraken Lord';
      description = 'A massive tentacled nightmare.';
    } else if (name.includes('Forbidden Zone')) {
      mobName = 'Depth God';
      description = 'An ancient deity of the crushing depths.';
    }
  }
  
  // Celestial Spire
  else if (region === 'Celestial Spire') {
    if (name.includes('Outskirts')) {
      mobName = 'Sky Patrol';
      description = 'A winged guardian of the lower spire.';
    } else if (name.includes('Sky Gardens')) {
      mobName = 'Cloud Elemental';
      description = 'A being formed from the sky itself.';
    } else if (name.includes('Storm Peaks')) {
      mobName = 'Storm Titan';
      description = 'A giant wielding the power of storms.';
    } else if (name.includes('Divine Sanctum')) {
      mobName = 'Divine Champion';
      description = 'A holy warrior blessed by the gods.';
    } else if (name.includes('Elite Grounds')) {
      mobName = 'Celestial Arbiter';
      description = 'A judge of mortal souls.';
    } else if (name.includes('Forbidden Zone')) {
      mobName = 'Fallen Seraph';
      description = 'A corrupted angel of terrible beauty.';
    }
  }
  
  // Demon Citadel
  else if (region === 'Demon Citadel') {
    if (name.includes('Outskirts')) {
      mobName = 'Imp Swarm';
      description = 'A cluster of lesser demons.';
    } else if (name.includes('Hellfire Ramparts')) {
      mobName = 'Rampart Demon';
      description = 'A demonic soldier defending the citadel.';
    } else if (name.includes('Demon Lord Chambers')) {
      mobName = 'Demon Lord Elite';
      description = 'A high-ranking demon lord\'s personal guard.';
    } else if (name.includes('Throne of Demons')) {
      mobName = 'Throne Guardian';
      description = 'The ultimate defender of the demon throne.';
    } else if (name.includes('Elite Grounds')) {
      mobName = 'Arch-Demon';
      description = 'A demon of supreme power and cruelty.';
    } else if (name.includes('Forbidden Zone')) {
      mobName = 'Demon Overlord';
      description = 'A ruler of demon legions.';
    }
  }
  
  // Astral Plane
  else if (region === 'Astral Plane') {
    if (name.includes('Outskirts')) {
      mobName = 'Astral Drifter';
      description = 'A lost soul wandering the astral plane.';
    } else if (name.includes('Shifting Boundaries')) {
      mobName = 'Reality Shifter';
      description = 'A being that bends the fabric of reality.';
    } else if (name.includes('Reality Nexus')) {
      mobName = 'Nexus Guardian';
      description = 'A protector of the reality junction.';
    } else if (name.includes('Void Between')) {
      mobName = 'Void Aberration';
      description = 'A creature from the spaces between realities.';
    } else if (name.includes('Elite Grounds')) {
      mobName = 'Astral Warden';
      description = 'A keeper of the astral plane\'s laws.';
    } else if (name.includes('Forbidden Zone')) {
      mobName = 'Planar Devourer';
      description = 'An entity that consumes entire realities.';
    }
  }
  
  // Elemental Chaos
  else if (region === 'Elemental Chaos') {
    if (name.includes('Outskirts')) {
      mobName = 'Chaos Spawn';
      description = 'A creature born from elemental instability.';
    } else if (name.includes('Primordial Battlefield')) {
      mobName = 'War Elemental';
      description = 'An elemental forged in eternal conflict.';
    } else if (name.includes('Titan Territories')) {
      mobName = 'Elemental Titan';
      description = 'A primordial titan of pure elemental energy.';
    } else if (name.includes('Eye of the Storm')) {
      mobName = 'Storm Core';
      description = 'The living heart of the eternal tempest.';
    } else if (name.includes('Elite Grounds')) {
      mobName = 'Chaos Lord';
      description = 'A master of all elemental forces.';
    } else if (name.includes('Forbidden Zone')) {
      mobName = 'Primordial Incarnate';
      description = 'The physical form of raw creation.';
    }
  }
  
  // Void Nexus
  else if (region === 'Void Nexus') {
    if (name.includes('Outskirts')) {
      mobName = 'Void Touched';
      description = 'A creature corrupted by void energy.';
    } else if (name.includes('Entropic Wastes')) {
      mobName = 'Entropy Beast';
      description = 'A manifestation of decay and dissolution.';
    } else if (name.includes('Realm of Oblivion')) {
      mobName = 'Oblivion Wraith';
      description = 'A specter of absolute nothingness.';
    } else if (name.includes('Heart of Nothingness')) {
      mobName = 'Void Avatar';
      description = 'The embodiment of the void itself.';
    } else if (name.includes('Elite Grounds')) {
      mobName = 'Void Sovereign';
      description = 'A ruler of the empty spaces.';
    }
  }
  
  // Titan Halls
  else if (region === 'Titan Halls') {
    if (name.includes('Outskirts')) {
      mobName = 'Hall Watcher';
      description = 'An ancient automaton still on patrol.';
    } else if (name.includes('Guardian Chambers')) {
      mobName = 'Titan Guardian';
      description = 'A colossal construct built to protect the titans.';
    } else if (name.includes('War Halls')) {
      mobName = 'War Construct';
      description = 'A titan-forged weapon of war.';
    } else if (name.includes('Throne of the Titan King')) {
      mobName = 'Titan King Echo';
      description = 'A magical echo of the last Titan King.';
    }
  }
  
  // Eternity's End
  else if (region === "Eternity's End") {
    if (name.includes('Outskirts')) {
      mobName = 'End Walker';
      description = 'A being from the edge of existence.';
    } else if (name.includes('Gates of Eternity')) {
      mobName = 'Eternal Gatekeeper';
      description = 'The guardian of time\'s final threshold.';
    } else if (name.includes('Cosmic Void')) {
      mobName = 'Cosmic Entity';
      description = 'A creature from beyond the universe.';
    }
  }
  
  // Fallback for any missed areas
  if (!mobName) {
    mobName = `${region} Unique ${avgLevel}`;
    description = `A unique creature found only in ${name}.`;
  }
  
  // Calculate stats based on level
  const maxHealth = 100 + (avgLevel * 50);
  const damage = 5 + (avgLevel * 3);
  const defense = 2 + avgLevel;
  const attackSpeed = 1.0 + (avgLevel * 0.05);
  const evasiveness = 10 + avgLevel;
  
  // Determine area based on region
  let area = 'plains';
  if (region.includes('Forest')) area = 'forest';
  else if (region.includes('Mountains')) area = 'mountains';
  else if (region.includes('Dungeon') || region.includes('Depths') || region.includes('Citadel')) area = 'dungeon';
  else if (region.includes('Badlands') || region.includes('Infernal')) area = 'desert';
  else if (region.includes('Glacier') || region.includes('Frost')) area = 'tundra';
  
  return {
    name: mobName,
    level: avgLevel,
    area: area,
    max_health: maxHealth,
    damage_min: Math.floor(damage * 0.8),
    damage_max: Math.floor(damage * 1.2),
    defense: defense,
    attack_speed: Math.min(2.0, attackSpeed),
    experience_reward: avgLevel * 25,
    gold_min: avgLevel * 2,
    gold_max: avgLevel * 5,
    aggressive: 1,
    evasiveness: evasiveness,
    region_id: null // These are sub-area specific
  };
}

// Generate and insert unique mobs
console.log('Generating unique mobs for each sub-area...\n');

let mobsCreated = 0;
const mobInserts = [];

for (const subArea of subAreas.rows) {
  const mob = generateUniqueMob(subArea);
  
  // Check if a unique mob already exists for this sub-area
  const existing = await db.execute({
    sql: 'SELECT id FROM mobs WHERE name = ?',
    args: [mob.name]
  });
  
  let mobId;
  
  if (existing.rows.length > 0) {
    mobId = existing.rows[0].id;
    console.log(`  ✓ ${mob.name} (Lv ${mob.level}) - Already exists`);
  } else {
    // Insert the mob
    const result = await db.execute({
      sql: `
        INSERT INTO mobs (
          name, level, area, max_health,
          damage_min, damage_max, defense, attack_speed,
          experience_reward, gold_min, gold_max, aggressive, evasiveness, region_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        mob.name, mob.level, mob.area, mob.max_health,
        mob.damage_min, mob.damage_max, mob.defense, mob.attack_speed,
        mob.experience_reward, mob.gold_min, mob.gold_max, mob.aggressive, mob.evasiveness, mob.region_id
      ]
    });
    
    mobId = result.lastInsertRowid;
    mobsCreated++;
    console.log(`  + ${mob.name} (Lv ${mob.level}) for ${subArea.name}`);
  }
  
  // Add mob to sub-area with high weight (it's the signature mob)
  const mobInArea = await db.execute({
    sql: 'SELECT id FROM sub_area_mobs WHERE sub_area_id = ? AND mob_id = ?',
    args: [subArea.id, mobId]
  });
  
  if (mobInArea.rows.length === 0) {
    await db.execute({
      sql: 'INSERT INTO sub_area_mobs (sub_area_id, mob_id, spawn_weight, level_variance) VALUES (?, ?, ?, ?)',
      args: [subArea.id, mobId, 50, 1] // High spawn weight for unique mobs
    });
  }
}

console.log(`\n✅ Created ${mobsCreated} new unique mobs!`);
console.log(`📊 All ${subAreas.rows.length} sub-areas now have unique signature mobs!\n`);

process.exit(0);
