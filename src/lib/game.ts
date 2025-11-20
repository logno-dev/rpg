import { db, type Character, type Mob, type Item, type InventoryItem, type CombatSession } from './db';

const STARTING_STAT_POINTS = 15;
const POINTS_PER_LEVEL = 5;
const EXPERIENCE_PER_LEVEL = 100; // Base XP needed, increases per level

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

  // Calculate derived stats
  const maxHealth = 100 + (stats.constitution - 10) * 5;
  const maxMana = 50 + (stats.intelligence - 10) * 3;

  const result = await db.execute({
    sql: `INSERT INTO characters 
      (user_id, name, strength, dexterity, constitution, intelligence, wisdom, charisma, max_health, current_health, max_mana, current_mana)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
  if (stats.constitution) {
    const newMaxHealth = character.max_health + stats.constitution * 5;
    updates.push('max_health = ?', 'current_health = current_health + ?');
    args.push(newMaxHealth, stats.constitution * 5);
  }

  if (stats.intelligence) {
    const newMaxMana = character.max_mana + stats.intelligence * 3;
    updates.push('max_mana = ?', 'current_mana = current_mana + ?');
    args.push(newMaxMana, stats.intelligence * 3);
  }

  args.push(characterId);

  const result = await db.execute({
    sql: `UPDATE characters SET ${updates.join(', ')} WHERE id = ? RETURNING *`,
    args,
  });

  return result.rows[0] as Character;
}

// Roaming and Encounters
export async function roamField(characterId: number, area: string): Promise<{ mob: Mob; initiated: boolean }> {
  const character = await getCharacter(characterId);
  if (!character) throw new Error('Character not found');

  // Get mobs from the area
  const result = await db.execute({
    sql: 'SELECT * FROM mobs WHERE area = ? AND level <= ?',
    args: [area, character.level + 3], // Can encounter mobs up to 3 levels higher
  });

  const mobs = result.rows as Mob[];
  if (mobs.length === 0) {
    throw new Error('No mobs found in this area');
  }

  // Random encounter - 60% chance of aggressive mob initiating combat
  const aggressiveMobs = mobs.filter(m => m.aggressive === 1);
  const shouldEncounter = Math.random() < 0.6 && aggressiveMobs.length > 0;

  if (shouldEncounter) {
    const randomMob = aggressiveMobs[Math.floor(Math.random() * aggressiveMobs.length)];
    return { mob: randomMob, initiated: true };
  }

  // Return a random mob for player to choose
  const randomMob = mobs[Math.floor(Math.random() * mobs.length)];
  return { mob: randomMob, initiated: false };
}

export async function getMobsInArea(area: string, characterLevel: number): Promise<Mob[]> {
  const result = await db.execute({
    sql: 'SELECT * FROM mobs WHERE area = ? AND level <= ? ORDER BY level',
    args: [area, characterLevel + 3],
  });

  return result.rows as Mob[];
}

// Combat System
export async function startCombat(characterId: number, mobId: number): Promise<CombatSession> {
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
      (character_id, mob_id, character_health, mob_health) 
      VALUES (?, ?, ?, ?) 
      RETURNING *`,
    args: [characterId, mobId, character.current_health, mob.max_health],
  });

  return result.rows[0] as CombatSession;
}

export async function processCombatRound(
  combatId: number,
  abilityId?: number
): Promise<{
  combat: CombatSession;
  character: Character;
  mob: Mob;
  log: string[];
  result?: 'victory' | 'defeat';
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

  const mobResult = await db.execute({
    sql: 'SELECT * FROM mobs WHERE id = ?',
    args: [combat.mob_id],
  });

  const mob = mobResult.rows[0] as Mob;
  if (!mob) throw new Error('Mob not found');

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
    log.push(`You defeated the ${mob.name}!`);

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
      await db.execute({
        sql: 'UPDATE characters SET level = level + 1, available_points = available_points + ?, experience = 0 WHERE id = ?',
        args: [POINTS_PER_LEVEL, character.id],
      });
      log.push(`LEVEL UP! You are now level ${character.level + 1}! You have ${POINTS_PER_LEVEL} stat points to assign.`);
    }

    // Roll for loot
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

    await db.execute({
      sql: 'UPDATE combat_sessions SET status = ?, character_health = ?, mob_health = ?, updated_at = unixepoch() WHERE id = ?',
      args: ['victory', combat.character_health, combat.mob_health, combatId],
    });

    return { combat, character, mob, log, result: 'victory' };
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

    await db.execute({
      sql: 'UPDATE characters SET current_health = ? WHERE id = ?',
      args: [Math.floor(character.max_health * 0.5), character.id],
    });

    await db.execute({
      sql: 'UPDATE combat_sessions SET status = ?, character_health = ?, mob_health = ?, updated_at = unixepoch() WHERE id = ?',
      args: ['defeat', combat.character_health, combat.mob_health, combatId],
    });

    return { combat, character, mob, log, result: 'defeat' };
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

  return { combat, character, mob, log };
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
    sql: `SELECT character_inventory.*, items.slot 
      FROM character_inventory 
      JOIN items ON character_inventory.item_id = items.id 
      WHERE character_inventory.id = ?`,
    args: [inventoryItemId],
  });

  const invItem = invResult.rows[0] as any;
  if (!invItem || invItem.character_id !== characterId) {
    throw new Error('Item not found in inventory');
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
