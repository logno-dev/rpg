import { db, type Character, type Mob, type Item, type InventoryItem, type CombatSession, type Region, type NamedMob } from './db';

const STARTING_STAT_POINTS = 15;
const POINTS_PER_LEVEL = 3;
const EXPERIENCE_PER_LEVEL = 125; // Base XP needed, increases per level

// Helper functions to calculate actual max health/mana with new formula
// This ensures consistency across the app
function calculateMaxHealth(level: number, constitution: number): number {
  const baseHealth = 100;
  const levelBonus = level * 20;
  const constitutionBonus = (constitution - 10) * 8;
  return baseHealth + levelBonus + constitutionBonus;
}

function calculateMaxMana(intelligence: number): number {
  return 50 + (intelligence - 10) * 3;
}

// Get total stats including equipment bonuses
async function getTotalStats(characterId: number): Promise<{ constitution: number; intelligence: number; wisdom: number }> {
  const character = await getCharacter(characterId);
  if (!character) throw new Error('Character not found');
  
  // Get equipped items
  const equippedItems = await db.execute({
    sql: `SELECT items.* FROM items 
          JOIN character_inventory ON items.id = character_inventory.item_id
          WHERE character_inventory.character_id = ? AND character_inventory.equipped = 1`,
    args: [characterId],
  });
  
  let constitutionBonus = 0;
  let intelligenceBonus = 0;
  let wisdomBonus = 0;
  
  for (const item of equippedItems.rows) {
    const i = item as any;
    constitutionBonus += i.constitution_bonus || 0;
    intelligenceBonus += i.intelligence_bonus || 0;
    wisdomBonus += i.wisdom_bonus || 0;
  }
  
  return {
    constitution: character.constitution + constitutionBonus,
    intelligence: character.intelligence + intelligenceBonus,
    wisdom: character.wisdom + wisdomBonus,
  };
}

// Character Management
export async function createCharacter(
  userId: number,
  name: string,
  stats: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  }
): Promise<Character> {
  // Validate stats
  const totalPoints = Object.values(stats).reduce((sum, val) => sum + val, 0);
  if (totalPoints !== 60 + STARTING_STAT_POINTS) {
    throw new Error(`Total stat points must equal ${60 + STARTING_STAT_POINTS}`);
  }

  if (Object.values(stats).some(val => val < 5 || val > 25)) {
    throw new Error('Each stat must be between 5 and 25');
  }

  // Calculate derived stats using new formula
  // Base + (Level × 20) + (CON - 10) × 8
  // New characters start at level 1
  const baseHealth = 100;
  const levelBonus = 1 * 20; // Level 1
  const constitutionBonus = (stats.constitution - 10) * 8;
  const maxHealth = baseHealth + levelBonus + constitutionBonus;
  
  const maxMana = 50 + (stats.intelligence - 10) * 3;

  const result = await db.execute({
    sql: `INSERT INTO characters 
      (user_id, name, strength, dexterity, constitution, intelligence, wisdom, charisma, max_health, current_health, max_mana, current_mana, current_region)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *`,
    args: [
      userId,
      name,
      stats.strength,
      stats.dexterity,
      stats.constitution,
      stats.intelligence,
      stats.wisdom,
      stats.charisma,
      maxHealth,
      maxHealth,
      maxMana,
      maxMana,
      1, // Start in Greenfield Plains (region 1)
    ],
  });

  const character = result.rows[0] as Character;

  // Give starting equipment
  await giveStartingEquipment(character.id);

  return character;
}

async function giveStartingEquipment(characterId: number) {
  // Give a rusty sword (item_id: 1) and cloth armor (item_id: 6)
  await db.execute({
    sql: 'INSERT INTO character_inventory (character_id, item_id, quantity, equipped) VALUES (?, ?, 1, 1)',
    args: [characterId, 1], // Rusty Sword
  });

  await db.execute({
    sql: 'INSERT INTO character_inventory (character_id, item_id, quantity, equipped) VALUES (?, ?, 1, 1)',
    args: [characterId, 6], // Cloth Armor
  });

  // Give some starting potions
  await db.execute({
    sql: 'INSERT INTO character_inventory (character_id, item_id, quantity) VALUES (?, ?, 3)',
    args: [characterId, 13], // Health Potions
  });
}

export async function getCharacter(characterId: number): Promise<Character | null> {
  const result = await db.execute({
    sql: 'SELECT * FROM characters WHERE id = ?',
    args: [characterId],
  });

  return result.rows[0] as Character | null;
}

export async function getCharactersByUser(userId: number): Promise<Character[]> {
  const result = await db.execute({
    sql: 'SELECT * FROM characters WHERE user_id = ? ORDER BY created_at DESC',
    args: [userId],
  });

  return result.rows as Character[];
}

export async function assignStatPoints(
  characterId: number,
  stats: Partial<{
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  }>
): Promise<Character> {
  const character = await getCharacter(characterId);
  if (!character) throw new Error('Character not found');

  const pointsToSpend = Object.values(stats).reduce((sum, val) => sum + (val || 0), 0);
  if (pointsToSpend > character.available_points) {
    throw new Error('Not enough available points');
  }

  const updates: string[] = [];
  const args: any[] = [];

  Object.entries(stats).forEach(([stat, value]) => {
    if (value) {
      updates.push(`${stat} = ${stat} + ?`);
      args.push(value);
    }
  });

  updates.push('available_points = available_points - ?');
  args.push(pointsToSpend);

  // Recalculate derived stats if constitution or intelligence changed
  // Note: max_health in DB is the BASE max health (without equipment/buffs)
  // The frontend calculates total max health dynamically
  if (stats.constitution) {
    const newConstitution = character.constitution + stats.constitution;
    
    // New formula: Base + (Level × 20) + (CON - 10) × 8
    const baseHealth = 100;
    const levelBonus = character.level * 20;
    const constitutionBonus = (newConstitution - 10) * 8;
    const newBaseMaxHealth = baseHealth + levelBonus + constitutionBonus;
    
    // Health increase is 8 per CON point
    const healthIncrease = stats.constitution * 8;
    updates.push('max_health = ?', 'current_health = current_health + ?');
    args.push(newBaseMaxHealth, healthIncrease);
  }

  if (stats.intelligence) {
    const newIntelligence = character.intelligence + stats.intelligence;
    const newBaseMaxMana = 50 + (newIntelligence - 10) * 3;
    const manaIncrease = stats.intelligence * 3;
    updates.push('max_mana = ?', 'current_mana = current_mana + ?');
    args.push(newBaseMaxMana, manaIncrease);
  }

  args.push(characterId);

  const result = await db.execute({
    sql: `UPDATE characters SET ${updates.join(', ')} WHERE id = ? RETURNING *`,
    args,
  });

  return result.rows[0] as Character;
}

// Roaming and Encounters
export async function roamField(characterId: number): Promise<{ mobs: Mob[]; initiated: boolean; aggroMob?: Mob; namedMob?: NamedMob }> {
  const character = await getCharacter(characterId);
  if (!character) throw new Error('Character not found');

  // Get mobs from the character's current region using weighted spawn rates
  const result = await db.execute({
    sql: `SELECT mobs.*, region_mobs.spawn_weight 
          FROM mobs 
          JOIN region_mobs ON mobs.id = region_mobs.mob_id
          WHERE region_mobs.region_id = ?`,
    args: [character.current_region || 1], // Default to region 1 if not set
  });

  const mobsWithWeights = result.rows as Array<Mob & { spawn_weight: number }>;
  if (mobsWithWeights.length === 0) {
    throw new Error('No mobs found in this region');
  }

  // Select 3-8 random mobs from the region using weighted selection
  // Higher chance of more mobs (weighted towards 5-6)
  const roll = Math.random();
  let encounterCount;
  if (roll < 0.15) encounterCount = 3;      // 15% chance of 3 mobs
  else if (roll < 0.35) encounterCount = 4; // 20% chance of 4 mobs
  else if (roll < 0.60) encounterCount = 5; // 25% chance of 5 mobs
  else if (roll < 0.80) encounterCount = 6; // 20% chance of 6 mobs
  else if (roll < 0.93) encounterCount = 7; // 13% chance of 7 mobs
  else encounterCount = 8;                  // 7% chance of 8 mobs
  
  const encounteredMobs: Mob[] = [];
  
  // Allow duplicates for more variety in encounters (you might see 2 wolves, 3 goblins, etc.)
  for (let i = 0; i < Math.min(encounterCount, mobsWithWeights.length * 3); i++) {
    const totalWeight = mobsWithWeights.reduce((sum, m) => sum + m.spawn_weight, 0);
    let random = Math.random() * totalWeight;
    
    let selectedMob = mobsWithWeights[0];
    for (const mob of mobsWithWeights) {
      random -= mob.spawn_weight;
      if (random <= 0) {
        selectedMob = mob;
        break;
      }
    }
    
    encounteredMobs.push(selectedMob);
  }

  // Check for named mob spawn (rare, never aggressive)
  const namedMobResult = await db.execute({
    sql: `SELECT * FROM named_mobs WHERE region_id = ?`,
    args: [character.current_region || 1],
  });

  let namedMob: NamedMob | undefined;
  if (namedMobResult.rows.length > 0) {
    const namedMobData = namedMobResult.rows[0] as NamedMob;
    // Check spawn chance (default 1%)
    if (Math.random() < namedMobData.spawn_chance) {
      namedMob = namedMobData;
    }
  }

  // Check if any aggressive mob initiates combat (40% chance)
  // Lower chance since we're spawning more mobs now
  const aggressiveMobs = encounteredMobs.filter(m => m.aggressive === 1);
  const shouldInitiate = Math.random() < 0.4 && aggressiveMobs.length > 0;
  
  if (shouldInitiate) {
    // Pick a random aggressive mob to initiate
    const aggroMob = aggressiveMobs[Math.floor(Math.random() * aggressiveMobs.length)];
    return { mobs: encounteredMobs, initiated: true, aggroMob, namedMob };
  }

  return { mobs: encounteredMobs, initiated: false, namedMob };
}

export async function getMobsInArea(area: string, characterLevel: number): Promise<Mob[]> {
  const result = await db.execute({
    sql: 'SELECT * FROM mobs WHERE area = ? AND level <= ? ORDER BY level',
    args: [area, characterLevel + 3],
  });

  return result.rows as Mob[];
}

// Combat System
export async function startCombat(characterId: number, mobId: number, isDungeon: boolean = false): Promise<CombatSession> {
  const character = await getCharacter(characterId);
  if (!character) throw new Error('Character not found');

  const mobResult = await db.execute({
    sql: 'SELECT * FROM mobs WHERE id = ?',
    args: [mobId],
  });

  const mob = mobResult.rows[0] as Mob;
  if (!mob) throw new Error('Mob not found');

  // Check if already in combat
  const existingCombat = await db.execute({
    sql: 'SELECT * FROM combat_sessions WHERE character_id = ? AND status = ?',
    args: [characterId, 'active'],
  });

  if (existingCombat.rows.length > 0) {
    throw new Error('Already in combat');
  }

  // Create combat session
  const result = await db.execute({
    sql: `INSERT INTO combat_sessions 
      (character_id, mob_id, character_health, mob_health, is_dungeon) 
      VALUES (?, ?, ?, ?, ?) 
      RETURNING *`,
    args: [characterId, mobId, character.current_health, mob.max_health, isDungeon ? 1 : 0],
  });

  return result.rows[0] as CombatSession;
}

export async function startNamedMobCombat(characterId: number, namedMobId: number, isDungeon: boolean = false): Promise<CombatSession> {
  const character = await getCharacter(characterId);
  if (!character) throw new Error('Character not found');

  const namedMob = await getNamedMob(namedMobId);
  if (!namedMob) throw new Error('Named mob not found');

  // Check if already in combat
  const existingCombat = await db.execute({
    sql: 'SELECT * FROM combat_sessions WHERE character_id = ? AND status = ?',
    args: [characterId, 'active'],
  });

  if (existingCombat.rows.length > 0) {
    throw new Error('Already in combat');
  }

  // Create combat session with named mob (mob_id is NULL for named mobs)
  const result = await db.execute({
    sql: `INSERT INTO combat_sessions 
      (character_id, mob_id, named_mob_id, character_health, mob_health, is_dungeon) 
      VALUES (?, NULL, ?, ?, ?, ?) 
      RETURNING *`,
    args: [characterId, namedMobId, character.current_health, namedMob.max_health, isDungeon ? 1 : 0],
  });

  return result.rows[0] as CombatSession;
}

export async function processCombatRound(
  combatId: number,
  abilityId?: number
): Promise<{
  combat: CombatSession;
  character: Character;
  mob: Mob | NamedMob;
  log: string[];
  result?: 'victory' | 'defeat';
  isNamedMob?: boolean;
}> {
  const combatResult = await db.execute({
    sql: 'SELECT * FROM combat_sessions WHERE id = ?',
    args: [combatId],
  });

  const combat = combatResult.rows[0] as CombatSession;
  if (!combat || combat.status !== 'active') {
    throw new Error('Combat not found or not active');
  }

  const character = await getCharacter(combat.character_id);
  if (!character) throw new Error('Character not found');

  // Check if this is a named mob or regular mob
  let mob: Mob | NamedMob;
  let isNamedMob = false;

  if (combat.named_mob_id) {
    const namedMobResult = await db.execute({
      sql: 'SELECT * FROM named_mobs WHERE id = ?',
      args: [combat.named_mob_id],
    });
    mob = namedMobResult.rows[0] as NamedMob;
    isNamedMob = true;
    if (!mob) throw new Error('Named mob not found');
  } else {
    const mobResult = await db.execute({
      sql: 'SELECT * FROM mobs WHERE id = ?',
      args: [combat.mob_id],
    });
    mob = mobResult.rows[0] as Mob;
    if (!mob) throw new Error('Mob not found');
  }

  const log: string[] = [];

  // Calculate equipped weapon damage
  const equippedWeapon = await db.execute({
    sql: `SELECT items.* FROM items 
      JOIN character_inventory ON items.id = character_inventory.item_id
      WHERE character_inventory.character_id = ? AND character_inventory.equipped = 1 AND items.slot = 'weapon'`,
    args: [character.id],
  });

  const weapon = equippedWeapon.rows[0] as Item | undefined;
  const weaponDamageMin = weapon?.damage_min || 1;
  const weaponDamageMax = weapon?.damage_max || 3;

  // Character's turn
  let characterDamage = Math.floor(
    Math.random() * (weaponDamageMax - weaponDamageMin + 1) + weaponDamageMin
  );

  // Add strength bonus
  characterDamage += Math.floor((character.strength - 10) / 2);

  // Use ability if provided
  if (abilityId) {
    const abilityResult = await db.execute({
      sql: 'SELECT * FROM abilities WHERE id = ?',
      args: [abilityId],
    });

    const ability = abilityResult.rows[0] as any;
    if (ability && character.current_mana >= ability.mana_cost) {
      if (ability.type === 'heal') {
        combat.character_health = Math.min(
          combat.character_health + ability.healing,
          character.max_health
        );
        log.push(`You cast ${ability.name} and heal for ${ability.healing} HP!`);
      } else {
        const abilityDamage = Math.floor(
          Math.random() * (ability.damage_max - ability.damage_min + 1) + ability.damage_min
        );
        characterDamage += abilityDamage;
        log.push(`You cast ${ability.name} dealing ${abilityDamage} damage!`);
      }

      // Deduct mana
      await db.execute({
        sql: 'UPDATE characters SET current_mana = current_mana - ? WHERE id = ?',
        args: [ability.mana_cost, character.id],
      });
    }
  }

  combat.mob_health -= characterDamage;
  log.push(`You attack for ${characterDamage} damage!`);

  // Check if mob is defeated
  if (combat.mob_health <= 0) {
    combat.mob_health = 0;
    combat.status = 'victory';
    
    const mobDisplayName = isNamedMob && 'title' in mob && mob.title 
      ? `${mob.name} ${mob.title}` 
      : mob.name;
    
    log.push(`You defeated ${mobDisplayName}!`);

    // Award experience and gold
    const expGained = mob.experience_reward;
    const goldGained = Math.floor(Math.random() * (mob.gold_max - mob.gold_min + 1)) + mob.gold_min;

    await db.execute({
      sql: 'UPDATE characters SET experience = experience + ?, gold = gold + ? WHERE id = ?',
      args: [expGained, goldGained, character.id],
    });

    log.push(`Gained ${expGained} XP and ${goldGained} gold!`);

    // Check for level up
    const newExp = character.experience + expGained;
    const expNeeded = character.level * EXPERIENCE_PER_LEVEL;

    if (newExp >= expNeeded) {
      // On level up, increase max_health and max_mana based on new level
      // New formula: Base + (Level × 20) + (CON - 10) × 8
      const newLevel = character.level + 1;
      const newBaseMaxHealth = 100 + (newLevel * 20) + (character.constitution - 10) * 8;
      const newBaseMaxMana = 50 + (character.intelligence - 10) * 3;
      
      // Give +20 HP and proportional mana increase on level up
      const healthIncrease = 20; // From level bonus
      const manaIncrease = 0; // Mana doesn't scale with level
      
      await db.execute({
        sql: `UPDATE characters 
              SET level = level + 1, 
                  available_points = available_points + ?, 
                  experience = 0,
                  max_health = ?,
                  current_health = current_health + ?,
                  max_mana = ?,
                  current_mana = current_mana + ?
              WHERE id = ?`,
        args: [POINTS_PER_LEVEL, newBaseMaxHealth, healthIncrease, newBaseMaxMana, manaIncrease, character.id],
      });
      log.push(`LEVEL UP! You are now level ${newLevel}! You have ${POINTS_PER_LEVEL} stat points to assign.`);
      log.push(`Your maximum health increased by ${healthIncrease}!`);
    }

    // Roll for loot (only for regular mobs, not named mobs in dungeons)
    if (!isNamedMob) {
      const lootResult = await db.execute({
        sql: 'SELECT * FROM mob_loot WHERE mob_id = ?',
        args: [mob.id],
      });

      const lootTable = lootResult.rows as any[];
      for (const loot of lootTable) {
        if (Math.random() < loot.drop_chance) {
          const quantity = Math.floor(
            Math.random() * (loot.quantity_max - loot.quantity_min + 1) + loot.quantity_min
          );

          const itemResult = await db.execute({
            sql: 'SELECT * FROM items WHERE id = ?',
            args: [loot.item_id],
          });

          const item = itemResult.rows[0] as Item;

          // Add to inventory
          await addItemToInventory(character.id, loot.item_id, quantity);
          log.push(`Looted: ${item.name} x${quantity}`);
        }
      }
    }

    // If this is a named mob and NOT a dungeon fight, record the defeat
    if (isNamedMob && !combat.is_dungeon && combat.named_mob_id) {
      await recordNamedMobDefeat(character.id, combat.named_mob_id);
    }

    await db.execute({
      sql: 'UPDATE combat_sessions SET status = ?, character_health = ?, mob_health = ?, updated_at = unixepoch() WHERE id = ?',
      args: ['victory', combat.character_health, combat.mob_health, combatId],
    });

    return { combat, character, mob, log, result: 'victory', isNamedMob };
  }

  // Mob's turn
  let mobDamage = Math.floor(Math.random() * (mob.damage_max - mob.damage_min + 1)) + mob.damage_min;

  // Calculate defense from equipped armor
  const equippedArmor = await db.execute({
    sql: `SELECT SUM(items.armor) as total_armor FROM items 
      JOIN character_inventory ON items.id = character_inventory.item_id
      WHERE character_inventory.character_id = ? AND character_inventory.equipped = 1 AND items.type = 'armor'`,
    args: [character.id],
  });

  const totalArmor = (equippedArmor.rows[0] as any)?.total_armor || 0;
  mobDamage = Math.max(1, mobDamage - totalArmor);

  combat.character_health -= mobDamage;
  log.push(`${mob.name} attacks for ${mobDamage} damage!`);

  // Check if character is defeated
  if (combat.character_health <= 0) {
    combat.character_health = 0;
    combat.status = 'defeat';
    log.push('You have been defeated...');

    // Calculate actual max health for death penalty (50% of max) with equipment bonuses
    const totalStats = await getTotalStats(character.id);
    const actualMaxHealth = calculateMaxHealth(character.level, totalStats.constitution);
    const respawnHealth = Math.floor(actualMaxHealth * 0.5);

    await db.execute({
      sql: 'UPDATE characters SET current_health = ? WHERE id = ?',
      args: [respawnHealth, character.id],
    });

    // If this is a dungeon combat, fail the dungeon
    if (combat.is_dungeon) {
      await failDungeon(character.id);
    }

    await db.execute({
      sql: 'UPDATE combat_sessions SET status = ?, character_health = ?, mob_health = ?, updated_at = unixepoch() WHERE id = ?',
      args: ['defeat', combat.character_health, combat.mob_health, combatId],
    });

    return { combat, character, mob, log, result: 'defeat', isNamedMob };
  }

  // Update combat session
  await db.execute({
    sql: 'UPDATE combat_sessions SET character_health = ?, mob_health = ?, updated_at = unixepoch() WHERE id = ?',
    args: [combat.character_health, combat.mob_health, combatId],
  });

  // Update character health
  await db.execute({
    sql: 'UPDATE characters SET current_health = ? WHERE id = ?',
    args: [combat.character_health, character.id],
  });

  return { combat, character, mob, log, isNamedMob };
}

export async function getActiveCombat(characterId: number): Promise<CombatSession | null> {
  const result = await db.execute({
    sql: 'SELECT * FROM combat_sessions WHERE character_id = ? AND status = ?',
    args: [characterId, 'active'],
  });

  return result.rows[0] as CombatSession | null;
}

// Inventory Management
export async function getInventory(characterId: number): Promise<Array<InventoryItem & { item: Item }>> {
  const result = await db.execute({
    sql: `SELECT character_inventory.*, items.* 
      FROM character_inventory 
      JOIN items ON character_inventory.item_id = items.id 
      WHERE character_inventory.character_id = ?
      ORDER BY items.type, items.name`,
    args: [characterId],
  });

  return result.rows as any[];
}

export async function addItemToInventory(characterId: number, itemId: number, quantity: number = 1): Promise<void> {
  // Check if item is stackable
  const itemResult = await db.execute({
    sql: 'SELECT * FROM items WHERE id = ?',
    args: [itemId],
  });

  const item = itemResult.rows[0] as Item;

  if (item.stackable) {
    // Check if already in inventory
    const existingResult = await db.execute({
      sql: 'SELECT * FROM character_inventory WHERE character_id = ? AND item_id = ?',
      args: [characterId, itemId],
    });

    if (existingResult.rows.length > 0) {
      await db.execute({
        sql: 'UPDATE character_inventory SET quantity = quantity + ? WHERE character_id = ? AND item_id = ?',
        args: [quantity, characterId, itemId],
      });
      return;
    }
  }

  await db.execute({
    sql: 'INSERT INTO character_inventory (character_id, item_id, quantity) VALUES (?, ?, ?)',
    args: [characterId, itemId, quantity],
  });
}

export async function equipItem(characterId: number, inventoryItemId: number): Promise<void> {
  const invResult = await db.execute({
    sql: `SELECT character_inventory.*, items.* 
      FROM character_inventory 
      JOIN items ON character_inventory.item_id = items.id 
      WHERE character_inventory.id = ?`,
    args: [inventoryItemId],
  });

  const invItem = invResult.rows[0] as any;
  if (!invItem || invItem.character_id !== characterId) {
    throw new Error('Item not found in inventory');
  }

  // Get character's base stats (not including equipment)
  const charResult = await db.execute({
    sql: 'SELECT * FROM characters WHERE id = ?',
    args: [characterId],
  });
  const character = charResult.rows[0] as any;
  if (!character) throw new Error('Character not found');

  // Check stat requirements (uses BASE stats, not including equipment)
  const requirements = [];
  if (invItem.required_strength > 0 && character.strength < invItem.required_strength) {
    requirements.push(`${invItem.required_strength} Strength`);
  }
  if (invItem.required_dexterity > 0 && character.dexterity < invItem.required_dexterity) {
    requirements.push(`${invItem.required_dexterity} Dexterity`);
  }
  if (invItem.required_constitution > 0 && character.constitution < invItem.required_constitution) {
    requirements.push(`${invItem.required_constitution} Constitution`);
  }
  if (invItem.required_intelligence > 0 && character.intelligence < invItem.required_intelligence) {
    requirements.push(`${invItem.required_intelligence} Intelligence`);
  }
  if (invItem.required_wisdom > 0 && character.wisdom < invItem.required_wisdom) {
    requirements.push(`${invItem.required_wisdom} Wisdom`);
  }
  if (invItem.required_charisma > 0 && character.charisma < invItem.required_charisma) {
    requirements.push(`${invItem.required_charisma} Charisma`);
  }
  if (invItem.required_level > 0 && character.level < invItem.required_level) {
    requirements.push(`Level ${invItem.required_level}`);
  }

  if (requirements.length > 0) {
    throw new Error(`Requirements not met: ${requirements.join(', ')}`);
  }

  // Unequip any item in the same slot
  if (invItem.slot) {
    await db.execute({
      sql: `UPDATE character_inventory 
        SET equipped = 0 
        WHERE character_id = ? 
        AND id IN (
          SELECT character_inventory.id 
          FROM character_inventory 
          JOIN items ON character_inventory.item_id = items.id 
          WHERE items.slot = ? AND character_inventory.equipped = 1
        )`,
      args: [characterId, invItem.slot],
    });
  }

  // Equip the item
  await db.execute({
    sql: 'UPDATE character_inventory SET equipped = 1 WHERE id = ?',
    args: [inventoryItemId],
  });
}

export async function unequipItem(inventoryItemId: number): Promise<void> {
  await db.execute({
    sql: 'UPDATE character_inventory SET equipped = 0 WHERE id = ?',
    args: [inventoryItemId],
  });
}

export async function useItem(characterId: number, inventoryItemId: number): Promise<{ character: Character; healthRestored: number; manaRestored: number }> {
  // Get the inventory item
  const invResult = await db.execute({
    sql: `SELECT character_inventory.*, items.* 
          FROM character_inventory 
          JOIN items ON character_inventory.item_id = items.id 
          WHERE character_inventory.id = ? AND character_inventory.character_id = ?`,
    args: [inventoryItemId, characterId],
  });

  const invItem = invResult.rows[0] as any;
  if (!invItem) throw new Error('Item not found in inventory');
  
  // Check if it's a consumable
  if (invItem.type !== 'consumable') throw new Error('This item cannot be used');
  
  // Check if we have any
  if (invItem.quantity <= 0) throw new Error('No items to use');
  
  // Get character
  const character = await getCharacter(characterId);
  if (!character) throw new Error('Character not found');
  
  // Get total stats including equipment bonuses
  const totalStats = await getTotalStats(characterId);
  
  // Calculate actual max health/mana using the new formula WITH equipment bonuses
  const actualMaxHealth = calculateMaxHealth(character.level, totalStats.constitution);
  const actualMaxMana = calculateMaxMana(totalStats.intelligence);
  
  // Calculate new health and mana values (capped at actual max)
  const newHealth = Math.min(actualMaxHealth, character.current_health + (invItem.health_restore || 0));
  const newMana = Math.min(actualMaxMana, character.current_mana + (invItem.mana_restore || 0));
  
  // Calculate actual restoration amounts
  const healthRestored = newHealth - character.current_health;
  const manaRestored = newMana - character.current_mana;
  
  // Update character health/mana
  await db.execute({
    sql: 'UPDATE characters SET current_health = ?, current_mana = ? WHERE id = ?',
    args: [newHealth, newMana, characterId],
  });
  
  // Decrease item quantity or remove if used last one
  if (invItem.quantity > 1) {
    await db.execute({
      sql: 'UPDATE character_inventory SET quantity = quantity - 1 WHERE id = ?',
      args: [inventoryItemId],
    });
  } else {
    await db.execute({
      sql: 'DELETE FROM character_inventory WHERE id = ?',
      args: [inventoryItemId],
    });
  }
  
  // Get updated character
  const updatedCharacter = await getCharacter(characterId);
  if (!updatedCharacter) throw new Error('Character not found');
  
  return { character: updatedCharacter, healthRestored, manaRestored };
}

export async function sellItem(characterId: number, inventoryItemId: number, quantity: number = 1): Promise<{ goldGained: number; character: Character }> {
  // Get the inventory item
  const invResult = await db.execute({
    sql: `SELECT character_inventory.*, items.value 
          FROM character_inventory 
          JOIN items ON character_inventory.item_id = items.id 
          WHERE character_inventory.id = ? AND character_inventory.character_id = ?`,
    args: [inventoryItemId, characterId],
  });

  const invItem = invResult.rows[0] as any;
  if (!invItem) throw new Error('Item not found in inventory');
  
  // Can't sell equipped items
  if (invItem.equipped) throw new Error('Cannot sell equipped items');
  
  // Can't sell more than you have
  if (quantity > invItem.quantity) throw new Error('Not enough items to sell');
  
  // Merchants buy items at 40% of their base value
  // (So if an item has value 100, you sell it for 40g, but would buy it for 250g)
  const sellPrice = Math.floor(invItem.value * 0.4);
  const goldGained = sellPrice * quantity;
  
  // Update character gold
  await db.execute({
    sql: 'UPDATE characters SET gold = gold + ? WHERE id = ?',
    args: [goldGained, characterId],
  });
  
  // Remove or decrease item quantity
  if (quantity >= invItem.quantity) {
    // Remove entire stack
    await db.execute({
      sql: 'DELETE FROM character_inventory WHERE id = ?',
      args: [inventoryItemId],
    });
  } else {
    // Decrease quantity
    await db.execute({
      sql: 'UPDATE character_inventory SET quantity = quantity - ? WHERE id = ?',
      args: [quantity, inventoryItemId],
    });
  }
  
  // Get updated character
  const character = await getCharacter(characterId);
  if (!character) throw new Error('Character not found');
  
  return { goldGained, character };
}

// Rest/Heal
export async function restCharacter(characterId: number): Promise<Character> {
  const character = await getCharacter(characterId);
  if (!character) throw new Error('Character not found');

  await db.execute({
    sql: 'UPDATE characters SET current_health = max_health, current_mana = max_mana WHERE id = ?',
    args: [characterId],
  });

  const result = await db.execute({
    sql: 'SELECT * FROM characters WHERE id = ?',
    args: [characterId],
  });

  return result.rows[0] as Character;
}

// Regions
export async function getAllRegions(characterLevel?: number, characterId?: number): Promise<Region[]> {
  const result = await db.execute({
    sql: 'SELECT * FROM regions ORDER BY min_level, id',
    args: [],
  });

  const regions = result.rows as Region[];

  // Auto-unlock regions based on character level or named mob defeats
  if (characterLevel !== undefined && characterId !== undefined) {
    for (const region of regions) {
      if (region.locked === 1 && region.unlock_requirement) {
        // Check if it's a level-based unlock
        const levelMatch = region.unlock_requirement.match(/level (\d+)/i);
        if (levelMatch) {
          const requiredLevel = parseInt(levelMatch[1]);
          if (characterLevel >= requiredLevel) {
            // Unlock the region
            await db.execute({
              sql: 'UPDATE regions SET locked = 0 WHERE id = ?',
              args: [region.id],
            });
            region.locked = 0; // Update in-memory as well
          }
        }
        
        // Check if it's a boss defeat requirement (e.g., "Defeat the Orc Chieftain")
        // Instead of hardcoding IDs, look up the boss by name match
        if (region.unlock_requirement && region.unlock_requirement.toLowerCase().includes('defeat')) {
          console.log(`[UNLOCK] Checking boss defeat requirement for region ${region.id}: ${region.unlock_requirement}`);
          
          // Get all named mobs and check if character has defeated any that match
          const namedMobsResult = await db.execute('SELECT * FROM named_mobs');
          const namedMobs = namedMobsResult.rows as any[];
          
          for (const namedMob of namedMobs) {
            // Check if the requirement mentions this boss
            const requirementLower = region.unlock_requirement.toLowerCase();
            
            // Match various patterns
            if (requirementLower.includes(namedMob.name.toLowerCase()) || 
                (requirementLower.includes('orc chieftain') && namedMob.name.toLowerCase().includes('gorak'))) {
              console.log(`[UNLOCK] Checking if defeated boss: ${namedMob.name} (ID: ${namedMob.id})`);
              const hasDefeated = await hasDefeatedNamedMob(characterId, namedMob.id);
              console.log(`[UNLOCK] Has defeated: ${hasDefeated}`);
              
              if (hasDefeated) {
                console.log(`[UNLOCK] Unlocking region ${region.id}: ${region.name}`);
                await db.execute({
                  sql: 'UPDATE regions SET locked = 0 WHERE id = ?',
                  args: [region.id],
                });
                region.locked = 0;
                break;
              }
            }
          }
        }
      }
    }
  }

  return regions;
}

export async function getRegion(regionId: number): Promise<Region | null> {
  const result = await db.execute({
    sql: 'SELECT * FROM regions WHERE id = ?',
    args: [regionId],
  });

  return result.rows[0] as Region | null;
}


// Abilities
export async function getCharacterAbilities(characterId: number): Promise<any[]> {
  const result = await db.execute({
    sql: `SELECT 
            abilities.*,
            character_abilities.last_used_at,
            abilities.id as ability_id
          FROM character_abilities
          JOIN abilities ON character_abilities.ability_id = abilities.id
          WHERE character_abilities.character_id = ?
          ORDER BY abilities.type, abilities.base_id, abilities.level`,
    args: [characterId],
  });

  return result.rows as any[];
}

// Merchants
export async function getMerchantsInRegion(regionId: number): Promise<any[]> {
  const result = await db.execute({
    sql: `SELECT * FROM merchants WHERE region_id = ?`,
    args: [regionId],
  });

  return result.rows as any[];
}

export async function getMerchantInventory(merchantId: number): Promise<any[]> {
  const result = await db.execute({
    sql: `SELECT 
            items.*,
            merchant_inventory.stock,
            merchant_inventory.price_multiplier,
            CAST(items.value * merchant_inventory.price_multiplier AS INTEGER) as merchant_price
          FROM merchant_inventory
          JOIN items ON merchant_inventory.item_id = items.id
          WHERE merchant_inventory.merchant_id = ?
          ORDER BY items.type, items.rarity, items.name`,
    args: [merchantId],
  });

  return result.rows as any[];
}

// Dungeons and Named Mobs
export async function getDungeonsInRegion(regionId: number): Promise<any[]> {
  const result = await db.execute({
    sql: `SELECT 
            dungeons.*,
            named_mobs.name as boss_name,
            named_mobs.title as boss_title,
            named_mobs.level as boss_level
          FROM dungeons
          JOIN named_mobs ON dungeons.boss_mob_id = named_mobs.id
          WHERE dungeons.region_id = ?`,
    args: [regionId],
  });

  return result.rows as any[];
}

export async function getNamedMob(namedMobId: number): Promise<NamedMob | null> {
  const result = await db.execute({
    sql: 'SELECT * FROM named_mobs WHERE id = ?',
    args: [namedMobId],
  });

  return result.rows[0] as NamedMob | null;
}

export async function hasDefeatedNamedMob(characterId: number, namedMobId: number): Promise<boolean> {
  const result = await db.execute({
    sql: 'SELECT id FROM character_named_mob_defeats WHERE character_id = ? AND named_mob_id = ?',
    args: [characterId, namedMobId],
  });

  return result.rows.length > 0;
}

export async function recordNamedMobDefeat(characterId: number, namedMobId: number): Promise<void> {
  await db.execute({
    sql: 'INSERT OR IGNORE INTO character_named_mob_defeats (character_id, named_mob_id) VALUES (?, ?)',
    args: [characterId, namedMobId],
  });
}

export async function startDungeon(characterId: number, dungeonId: number): Promise<any> {
  const character = await getCharacter(characterId);
  if (!character) throw new Error('Character not found');

  // Check if character is in active combat
  const activeCombat = await getActiveCombat(characterId);
  if (activeCombat) {
    throw new Error('Cannot start dungeon while in combat');
  }

  // Check if already in a dungeon
  const existingProgress = await db.execute({
    sql: 'SELECT * FROM character_dungeon_progress WHERE character_id = ? AND status = ?',
    args: [characterId, 'active'],
  });

  if (existingProgress.rows.length > 0) {
    throw new Error('Already in an active dungeon');
  }

  // Get dungeon info
  const dungeonResult = await db.execute({
    sql: 'SELECT * FROM dungeons WHERE id = ?',
    args: [dungeonId],
  });

  const dungeon = dungeonResult.rows[0] as any;
  if (!dungeon) throw new Error('Dungeon not found');

  // Check level requirement
  if (character.level < dungeon.required_level) {
    throw new Error(`Requires level ${dungeon.required_level}`);
  }

  // Create dungeon progress
  const progress = await db.execute({
    sql: `INSERT INTO character_dungeon_progress (character_id, dungeon_id, current_encounter, status)
          VALUES (?, ?, 1, 'active')
          RETURNING *`,
    args: [characterId, dungeonId],
  });

  // Get all encounters to calculate total
  const allEncountersResult = await db.execute({
    sql: 'SELECT COUNT(*) as total FROM dungeon_encounters WHERE dungeon_id = ?',
    args: [dungeonId],
  });
  const totalEncounters = (allEncountersResult.rows[0] as any).total;

  // Get the first encounter
  const encounterResult = await db.execute({
    sql: 'SELECT * FROM dungeon_encounters WHERE dungeon_id = ? AND encounter_order = 1',
    args: [dungeonId],
  });

  const encounter = encounterResult.rows[0] as any;

  // Start combat with the first mob
  if (encounter.is_boss) {
    // Boss encounter - use named mob
    const namedMob = await getNamedMob(dungeon.boss_mob_id);
    if (!namedMob) throw new Error('Boss not found');
    
    const combat = await startNamedMobCombat(characterId, dungeon.boss_mob_id, true);
    return {
      dungeonProgress: progress.rows[0],
      encounter,
      dungeon,
      combat,
      mob: namedMob, // Return named mob as the mob to fight
      namedMob,
      isBoss: true,
      encounterProgress: {
        current: 1,
        total: totalEncounters
      }
    };
  } else {
    // Regular mob encounter - fetch mob data
    const mobResult = await db.execute({
      sql: 'SELECT * FROM mobs WHERE id = ?',
      args: [encounter.mob_id],
    });
    
    const mob = mobResult.rows[0];
    const combat = await startCombat(characterId, encounter.mob_id, true);
    return {
      dungeonProgress: progress.rows[0],
      encounter,
      dungeon,
      combat,
      mob, // Return mob data
      isBoss: false,
      encounterProgress: {
        current: 1,
        total: totalEncounters
      }
    };
  }
}

export async function getActiveDungeon(characterId: number): Promise<any | null> {
  const result = await db.execute({
    sql: `SELECT character_dungeon_progress.*, dungeons.name as dungeon_name, dungeons.boss_mob_id
          FROM character_dungeon_progress
          JOIN dungeons ON character_dungeon_progress.dungeon_id = dungeons.id
          WHERE character_dungeon_progress.character_id = ? AND character_dungeon_progress.status = ?`,
    args: [characterId, 'active'],
  });

  return result.rows[0] as any | null;
}

export async function advanceDungeonEncounter(characterId: number): Promise<any> {
  // Get active dungeon progress
  const progress = await getActiveDungeon(characterId);
  if (!progress) {
    throw new Error('No active dungeon');
  }

  // Get all encounters for this dungeon
  const encountersResult = await db.execute({
    sql: 'SELECT * FROM dungeon_encounters WHERE dungeon_id = ? ORDER BY encounter_order',
    args: [progress.dungeon_id],
  });

  const encounters = encountersResult.rows as any[];
  const nextEncounterOrder = progress.current_encounter + 1;

  // Check if dungeon is complete
  if (nextEncounterOrder > encounters.length) {
    // Close the final combat session
    await db.execute({
      sql: 'UPDATE combat_sessions SET status = ? WHERE character_id = ? AND status = ?',
      args: ['victory', characterId, 'active'],
    });

    // Dungeon complete! Mark progress as completed
    await db.execute({
      sql: 'UPDATE character_dungeon_progress SET status = ?, updated_at = unixepoch() WHERE id = ?',
      args: ['completed', progress.id],
    });

    // Record boss defeat
    await recordNamedMobDefeat(characterId, progress.boss_mob_id);

    return { completed: true };
  }

  // Close any existing combat session (the previous encounter was completed)
  await db.execute({
    sql: 'UPDATE combat_sessions SET status = ? WHERE character_id = ? AND status = ?',
    args: ['victory', characterId, 'active'],
  });

  // Update progress to next encounter
  await db.execute({
    sql: 'UPDATE character_dungeon_progress SET current_encounter = ?, updated_at = unixepoch() WHERE id = ?',
    args: [nextEncounterOrder, progress.id],
  });

  // Get next encounter
  const nextEncounter = encounters.find((e: any) => e.encounter_order === nextEncounterOrder);

  if (nextEncounter.is_boss) {
    // Boss encounter - start combat with named mob
    const namedMob = await getNamedMob(progress.boss_mob_id);
    if (!namedMob) throw new Error('Boss not found');
    
    const combat = await startNamedMobCombat(characterId, progress.boss_mob_id, true);
    return {
      completed: false,
      encounter: nextEncounter,
      combat,
      mob: namedMob,
      namedMob,
      isBoss: true,
      progress: {
        current: nextEncounterOrder,
        total: encounters.length
      }
    };
  } else {
    // Regular mob encounter - start combat immediately and fetch mob data
    const mobResult = await db.execute({
      sql: 'SELECT * FROM mobs WHERE id = ?',
      args: [nextEncounter.mob_id],
    });
    
    const mob = mobResult.rows[0];
    const combat = await startCombat(characterId, nextEncounter.mob_id, true);
    return {
      completed: false,
      encounter: nextEncounter,
      combat,
      mob,
      isBoss: false,
      progress: {
        current: nextEncounterOrder,
        total: encounters.length
      }
    };
  }
}

export async function failDungeon(characterId: number): Promise<void> {
  await db.execute({
    sql: 'UPDATE character_dungeon_progress SET status = ?, updated_at = unixepoch() WHERE character_id = ? AND status = ?',
    args: ['failed', characterId, 'active'],
  });
}

// Hotbar functions
export async function getHotbar(characterId: number) {
  'use server';
  const result = await db.execute({
    sql: `
      SELECT 
        h.*,
        a.name as ability_name,
        a.description as ability_description,
        a.type as ability_type,
        a.mana_cost,
        a.cooldown,
        i.name as item_name,
        i.description as item_description,
        i.health_restore,
        i.mana_restore,
        inv.quantity as item_quantity
      FROM character_hotbar h
      LEFT JOIN abilities a ON h.ability_id = a.id
      LEFT JOIN items i ON h.item_id = i.id
      LEFT JOIN character_inventory inv ON inv.character_id = h.character_id AND inv.item_id = h.item_id
      WHERE h.character_id = ?
      ORDER BY h.slot ASC
    `,
    args: [characterId],
  });

  return result.rows as any[];
}

export async function setHotbarSlot(characterId: number, slot: number, type: 'ability' | 'consumable', abilityId?: number, itemId?: number) {
  'use server';
  
  console.log('[setHotbarSlot] Called with:', { characterId, slot, type, abilityId, itemId });
  
  // Delete existing slot
  await db.execute({
    sql: 'DELETE FROM character_hotbar WHERE character_id = ? AND slot = ?',
    args: [characterId, slot],
  });
  
  console.log('[setHotbarSlot] Deleted existing slot');

  // Insert new slot if provided
  if ((type === 'ability' && abilityId) || (type === 'consumable' && itemId)) {
    await db.execute({
      sql: `
        INSERT INTO character_hotbar (character_id, slot, type, ability_id, item_id)
        VALUES (?, ?, ?, ?, ?)
      `,
      args: [characterId, slot, type, abilityId || null, itemId || null],
    });
    console.log('[setHotbarSlot] Inserted new slot');
  } else {
    console.log('[setHotbarSlot] Skipped insert - condition not met:', { 
      typeCheck: type === 'ability' ? !!abilityId : !!itemId 
    });
  }
}

export async function clearHotbarSlot(characterId: number, slot: number) {
  'use server';
  await db.execute({
    sql: 'DELETE FROM character_hotbar WHERE character_id = ? AND slot = ?',
    args: [characterId, slot],
  });
}

// Ability Effects System
export async function getAbilityEffects(abilityId: number) {
  'use server';
  const result = await db.execute({
    sql: 'SELECT * FROM ability_effects WHERE ability_id = ? ORDER BY effect_order ASC',
    args: [abilityId],
  });
  return result.rows as any[];
}

export async function getAbilitiesWithEffects(characterId: number) {
  'use server';
  const abilities = await getCharacterAbilities(characterId);
  
  // Fetch effects for each ability
  const abilitiesWithEffects = await Promise.all(
    abilities.map(async (ability: any) => {
      const effects = await getAbilityEffects(ability.ability_id || ability.id);
      return {
        ...ability,
        effects,
      };
    })
  );
  
  return abilitiesWithEffects;
}

