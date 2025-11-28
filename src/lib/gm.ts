'use server';

import { db } from './db';
import { getUser } from './auth';

export async function isGM() {
  const user = await getUser();
  if (!user) return false;
  
  const result = await db.execute({
    sql: 'SELECT is_gm FROM users WHERE id = ?',
    args: [user.id],
  });
  
  return result.rows[0]?.is_gm === 1;
}

export async function requireGM() {
  const gm = await isGM();
  if (!gm) {
    throw new Error('Unauthorized: GM access required');
  }
}

// Players Management
export async function getAllPlayers() {
  await requireGM();
  
  const result = await db.execute({
    sql: `SELECT 
            u.id as user_id,
            u.username,
            u.is_gm,
            c.id as character_id,
            c.name as character_name,
            c.level,
            c.experience,
            c.gold,
            c.current_health,
            c.max_health,
            c.current_mana,
            c.max_mana,
            r.name as current_region
          FROM users u
          LEFT JOIN characters c ON u.id = c.user_id
          LEFT JOIN regions r ON c.current_region = r.id
          ORDER BY u.id, c.id`,
    args: [],
  });
  
  return result.rows;
}

// Mobs Management
export async function getAllMobs() {
  await requireGM();
  
  const result = await db.execute({
    sql: `SELECT 
            id, name, level, area, max_health, 
            damage_min as attack, defense, 
            experience_reward as experience, 
            gold_min, gold_max, attack_speed, region_id
          FROM mobs 
          ORDER BY level, name`,
    args: [],
  });
  
  return result.rows;
}

export async function createMob(mobData: any) {
  await requireGM();
  
  const result = await db.execute({
    sql: `INSERT INTO mobs (name, level, area, max_health, damage_min, defense, experience_reward, gold_min, gold_max, attack_speed, region_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      mobData.name || '',
      mobData.level ?? 1,
      mobData.area || '',
      mobData.max_health ?? 100,
      mobData.attack ?? mobData.damage_min ?? 10,
      mobData.defense ?? 5,
      mobData.experience ?? mobData.experience_reward ?? 10,
      mobData.gold_min ?? 1,
      mobData.gold_max ?? 5,
      mobData.attack_speed ?? 1.0,
      mobData.region_id ?? null,
    ],
  });
  
  return result.lastInsertRowid;
}

export async function updateMob(id: number, mobData: any) {
  await requireGM();
  
  await db.execute({
    sql: `UPDATE mobs SET
            name = ?, level = ?, area = ?, max_health = ?, damage_min = ?, defense = ?,
            experience_reward = ?, gold_min = ?, gold_max = ?, attack_speed = ?, region_id = ?
          WHERE id = ?`,
    args: [
      mobData.name || '',
      mobData.level ?? 1,
      mobData.area || '',
      mobData.max_health ?? 100,
      mobData.attack ?? mobData.damage_min ?? 10,
      mobData.defense ?? 5,
      mobData.experience ?? mobData.experience_reward ?? 10,
      mobData.gold_min ?? 1,
      mobData.gold_max ?? 5,
      mobData.attack_speed ?? 1.0,
      mobData.region_id ?? null,
      id,
    ],
  });
}

export async function deleteMob(id: number) {
  await requireGM();
  
  await db.execute({
    sql: 'DELETE FROM mobs WHERE id = ?',
    args: [id],
  });
}

// Items Management
export async function getAllItems() {
  await requireGM();
  
  const result = await db.execute({
    sql: `SELECT 
            id, name, description, type, slot, rarity,
            strength_bonus, dexterity_bonus, constitution_bonus,
            intelligence_bonus, wisdom_bonus, charisma_bonus,
            damage_min as damage, armor, value, stackable,
            attack_speed, health_restore, mana_restore,
            required_level as level,
            required_strength, required_dexterity, required_constitution,
            required_intelligence, required_wisdom, required_charisma,
            teaches_ability_id
          FROM items 
          ORDER BY type, required_level, name`,
    args: [],
  });
  
  return result.rows;
}

export async function createItem(itemData: any) {
  await requireGM();
  
  const result = await db.execute({
    sql: `INSERT INTO items (name, description, type, slot, rarity, value, damage_min, armor, 
            strength_bonus, dexterity_bonus, constitution_bonus, intelligence_bonus, 
            wisdom_bonus, charisma_bonus, health_restore, mana_restore, attack_speed, 
            required_level, required_strength, required_dexterity, required_constitution,
            required_intelligence, required_wisdom, required_charisma, stackable, teaches_ability_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      itemData.name || '',
      itemData.description || '',
      itemData.type || 'misc',
      itemData.slot || null,
      itemData.rarity || 'common',
      itemData.value ?? 0,
      itemData.damage ?? itemData.damage_min ?? 0,
      itemData.armor ?? 0,
      itemData.strength_bonus ?? 0,
      itemData.dexterity_bonus ?? 0,
      itemData.constitution_bonus ?? 0,
      itemData.intelligence_bonus ?? 0,
      itemData.wisdom_bonus ?? 0,
      itemData.charisma_bonus ?? 0,
      itemData.health_restore ?? 0,
      itemData.mana_restore ?? 0,
      itemData.attack_speed ?? 1.0,
      itemData.required_level ?? itemData.level ?? 1,
      itemData.required_strength ?? 0,
      itemData.required_dexterity ?? 0,
      itemData.required_constitution ?? 0,
      itemData.required_intelligence ?? 0,
      itemData.required_wisdom ?? 0,
      itemData.required_charisma ?? 0,
      itemData.stackable ?? 0,
      itemData.teaches_ability_id || null,
    ],
  });
  
  return result.lastInsertRowid;
}

export async function updateItem(id: number, itemData: any) {
  await requireGM();
  
  await db.execute({
    sql: `UPDATE items SET
            name = ?, description = ?, type = ?, slot = ?, rarity = ?, value = ?,
            damage_min = ?, armor = ?, strength_bonus = ?, dexterity_bonus = ?,
            constitution_bonus = ?, intelligence_bonus = ?, wisdom_bonus = ?,
            charisma_bonus = ?, health_restore = ?, mana_restore = ?,
            attack_speed = ?, required_level = ?, required_strength = ?,
            required_dexterity = ?, required_constitution = ?, required_intelligence = ?,
            required_wisdom = ?, required_charisma = ?, stackable = ?, teaches_ability_id = ?
          WHERE id = ?`,
    args: [
      itemData.name || '', 
      itemData.description || '', 
      itemData.type || 'misc', 
      itemData.slot || null, 
      itemData.rarity || 'common', 
      itemData.value ?? 0, 
      itemData.damage ?? itemData.damage_min ?? 0, 
      itemData.armor ?? 0, 
      itemData.strength_bonus ?? 0,
      itemData.dexterity_bonus ?? 0, 
      itemData.constitution_bonus ?? 0, 
      itemData.intelligence_bonus ?? 0,
      itemData.wisdom_bonus ?? 0, 
      itemData.charisma_bonus ?? 0, 
      itemData.health_restore ?? 0,
      itemData.mana_restore ?? 0, 
      itemData.attack_speed ?? 1.0, 
      itemData.required_level ?? itemData.level ?? 1,
      itemData.required_strength ?? 0, 
      itemData.required_dexterity ?? 0, 
      itemData.required_constitution ?? 0,
      itemData.required_intelligence ?? 0, 
      itemData.required_wisdom ?? 0, 
      itemData.required_charisma ?? 0,
      itemData.stackable ?? 0,
      itemData.teaches_ability_id || null,
      id,
    ],
  });
}

export async function deleteItem(id: number) {
  await requireGM();
  
  await db.execute({
    sql: 'DELETE FROM items WHERE id = ?',
    args: [id],
  });
}

// Regions Management
export async function getAllRegions() {
  await requireGM();
  
  const result = await db.execute({
    sql: 'SELECT * FROM regions ORDER BY min_level',
    args: [],
  });
  
  return result.rows;
}

export async function createRegion(regionData: any) {
  await requireGM();
  
  const result = await db.execute({
    sql: `INSERT INTO regions (name, description, min_level, max_level, locked, unlock_requirement)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [
      regionData.name || '',
      regionData.description || '',
      regionData.min_level ?? 1,
      regionData.max_level ?? 5,
      regionData.locked ?? 0,
      regionData.unlock_requirement || null,
    ],
  });
  
  return result.lastInsertRowid;
}

export async function updateRegion(id: number, regionData: any) {
  await requireGM();
  
  await db.execute({
    sql: `UPDATE regions SET
            name = ?, description = ?, min_level = ?, max_level = ?,
            locked = ?, unlock_requirement = ?
          WHERE id = ?`,
    args: [
      regionData.name || '',
      regionData.description || '',
      regionData.min_level ?? 1,
      regionData.max_level ?? 5,
      regionData.locked ?? 0,
      regionData.unlock_requirement || null,
      id,
    ],
  });
}

export async function deleteRegion(id: number) {
  await requireGM();
  
  await db.execute({
    sql: 'DELETE FROM regions WHERE id = ?',
    args: [id],
  });
}

// Abilities Management
export async function getAllAbilities() {
  await requireGM();
  
  const result = await db.execute({
    sql: 'SELECT * FROM abilities ORDER BY required_level, name',
    args: [],
  });
  
  return result.rows;
}

export async function createAbility(abilityData: any) {
  await requireGM();
  
  const result = await db.execute({
    sql: `INSERT INTO abilities (name, description, type, category, required_level, mana_cost, cooldown,
            required_strength, required_dexterity, required_constitution,
            required_intelligence, required_wisdom, required_charisma)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      abilityData.name || '',
      abilityData.description || '',
      abilityData.type || 'ability',
      abilityData.category || 'damage',
      abilityData.required_level ?? 1,
      abilityData.mana_cost ?? 0,
      abilityData.cooldown ?? 0,
      abilityData.required_strength ?? 0,
      abilityData.required_dexterity ?? 0,
      abilityData.required_constitution ?? 0,
      abilityData.required_intelligence ?? 0,
      abilityData.required_wisdom ?? 0,
      abilityData.required_charisma ?? 0,
    ],
  });
  
  return result.lastInsertRowid;
}

export async function updateAbility(id: number, abilityData: any) {
  await requireGM();
  
  await db.execute({
    sql: `UPDATE abilities SET
            name = ?, description = ?, type = ?, category = ?, required_level = ?,
            mana_cost = ?, cooldown = ?,
            required_strength = ?, required_dexterity = ?, required_constitution = ?,
            required_intelligence = ?, required_wisdom = ?, required_charisma = ?
          WHERE id = ?`,
    args: [
      abilityData.name || '',
      abilityData.description || '',
      abilityData.type || 'ability',
      abilityData.category || 'damage',
      abilityData.required_level ?? 1,
      abilityData.mana_cost ?? 0,
      abilityData.cooldown ?? 0,
      abilityData.required_strength ?? 0,
      abilityData.required_dexterity ?? 0,
      abilityData.required_constitution ?? 0,
      abilityData.required_intelligence ?? 0,
      abilityData.required_wisdom ?? 0,
      abilityData.required_charisma ?? 0,
      id,
    ],
  });
}

export async function deleteAbility(id: number) {
  await requireGM();
  
  await db.execute({
    sql: 'DELETE FROM abilities WHERE id = ?',
    args: [id],
  });
}

// Ability Effects Management
export async function getAbilityEffects(abilityId: number) {
  await requireGM();
  
  const result = await db.execute({
    sql: 'SELECT * FROM ability_effects WHERE ability_id = ? ORDER BY effect_order',
    args: [abilityId],
  });
  
  return result.rows;
}

export async function createAbilityEffect(effectData: any) {
  await requireGM();
  
  const result = await db.execute({
    sql: `INSERT INTO ability_effects (
            ability_id, effect_order, effect_type, target,
            value_min, value_max, is_periodic, tick_interval, tick_count, tick_value,
            stat_affected, stat_scaling, scaling_factor, chance, duration,
            shield_amount, drain_percent, stacks_max
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      effectData.ability_id,
      effectData.effect_order ?? 1,
      effectData.effect_type,
      effectData.target ?? 'enemy',
      effectData.value_min ?? 0,
      effectData.value_max ?? 0,
      effectData.is_periodic ?? 0,
      effectData.tick_interval ?? 0,
      effectData.tick_count ?? 0,
      effectData.tick_value ?? 0,
      effectData.stat_affected || null,
      effectData.stat_scaling || null,
      effectData.scaling_factor ?? 0,
      effectData.chance ?? 1.0,
      effectData.duration ?? 0,
      effectData.shield_amount ?? 0,
      effectData.drain_percent ?? 0,
      effectData.stacks_max ?? 1,
    ],
  });
  
  return result.lastInsertRowid;
}

export async function updateAbilityEffect(id: number, effectData: any) {
  await requireGM();
  
  await db.execute({
    sql: `UPDATE ability_effects SET
            effect_order = ?, effect_type = ?, target = ?,
            value_min = ?, value_max = ?, is_periodic = ?, tick_interval = ?, tick_count = ?, tick_value = ?,
            stat_affected = ?, stat_scaling = ?, scaling_factor = ?, chance = ?, duration = ?,
            shield_amount = ?, drain_percent = ?, stacks_max = ?
          WHERE id = ?`,
    args: [
      effectData.effect_order ?? 1,
      effectData.effect_type,
      effectData.target ?? 'enemy',
      effectData.value_min ?? 0,
      effectData.value_max ?? 0,
      effectData.is_periodic ?? 0,
      effectData.tick_interval ?? 0,
      effectData.tick_count ?? 0,
      effectData.tick_value ?? 0,
      effectData.stat_affected || null,
      effectData.stat_scaling || null,
      effectData.scaling_factor ?? 0,
      effectData.chance ?? 1.0,
      effectData.duration ?? 0,
      effectData.shield_amount ?? 0,
      effectData.drain_percent ?? 0,
      effectData.stacks_max ?? 1,
      id,
    ],
  });
}

export async function deleteAbilityEffect(id: number) {
  await requireGM();
  
  await db.execute({
    sql: 'DELETE FROM ability_effects WHERE id = ?',
    args: [id],
  });
}

// Merchants Management
export async function getAllMerchants() {
  await requireGM();
  
  const result = await db.execute({
    sql: `SELECT m.*, r.name as region_name 
          FROM merchants m
          LEFT JOIN regions r ON m.region_id = r.id
          ORDER BY m.region_id, m.name`,
    args: [],
  });
  
  return result.rows;
}

export async function createMerchant(merchantData: any) {
  await requireGM();
  
  const result = await db.execute({
    sql: `INSERT INTO merchants (name, description, region_id)
          VALUES (?, ?, ?)`,
    args: [
      merchantData.name || '',
      merchantData.description || '',
      merchantData.region_id ?? 1,
    ],
  });
  
  return result.lastInsertRowid;
}

export async function updateMerchant(id: number, merchantData: any) {
  await requireGM();
  
  await db.execute({
    sql: `UPDATE merchants SET
            name = ?, description = ?, region_id = ?
          WHERE id = ?`,
    args: [
      merchantData.name || '',
      merchantData.description || '',
      merchantData.region_id ?? 1,
      id,
    ],
  });
}

export async function deleteMerchant(id: number) {
  await requireGM();
  
  await db.execute({
    sql: 'DELETE FROM merchants WHERE id = ?',
    args: [id],
  });
}

// Loot Management
export async function getAllMobLoot() {
  await requireGM();
  
  const result = await db.execute({
    sql: `SELECT 
            ml.*,
            m.name as mob_name,
            m.level as mob_level,
            i.name as item_name,
            i.type as item_type,
            i.rarity as item_rarity
          FROM mob_loot ml
          JOIN mobs m ON ml.mob_id = m.id
          JOIN items i ON ml.item_id = i.id
          ORDER BY m.level, m.name, i.name`,
    args: [],
  });
  
  return result.rows;
}

export async function getMobLootByMob(mobId: number) {
  await requireGM();
  
  const result = await db.execute({
    sql: `SELECT 
            ml.*,
            i.name as item_name,
            i.type as item_type,
            i.rarity as item_rarity
          FROM mob_loot ml
          JOIN items i ON ml.item_id = i.id
          WHERE ml.mob_id = ?
          ORDER BY i.name`,
    args: [mobId],
  });
  
  return result.rows;
}

export async function createMobLoot(lootData: any) {
  await requireGM();
  
  const result = await db.execute({
    sql: `INSERT INTO mob_loot (mob_id, item_id, drop_chance, min_quantity, max_quantity)
          VALUES (?, ?, ?, ?, ?)`,
    args: [
      lootData.mob_id ?? 0,
      lootData.item_id ?? 0,
      lootData.drop_chance ?? 0.1,
      lootData.min_quantity ?? 1,
      lootData.max_quantity ?? 1,
    ],
  });
  
  return result.lastInsertRowid;
}

export async function updateMobLoot(id: number, lootData: any) {
  await requireGM();
  
  await db.execute({
    sql: `UPDATE mob_loot SET
            mob_id = ?, item_id = ?, drop_chance = ?, 
            min_quantity = ?, max_quantity = ?
          WHERE id = ?`,
    args: [
      lootData.mob_id ?? 0,
      lootData.item_id ?? 0,
      lootData.drop_chance ?? 0.1,
      lootData.min_quantity ?? 1,
      lootData.max_quantity ?? 1,
      id,
    ],
  });
}

export async function deleteMobLoot(id: number) {
  await requireGM();
  
  await db.execute({
    sql: 'DELETE FROM mob_loot WHERE id = ?',
    args: [id],
  });
}

export async function getAllRegionRareLoot() {
  await requireGM();
  
  const result = await db.execute({
    sql: `SELECT 
            rrl.*,
            r.name as region_name,
            i.name as item_name,
            i.type as item_type,
            i.rarity as item_rarity
          FROM region_rare_loot rrl
          JOIN regions r ON rrl.region_id = r.id
          JOIN items i ON rrl.item_id = i.id
          ORDER BY r.name, i.name`,
    args: [],
  });
  
  return result.rows;
}

export async function createRegionRareLoot(lootData: any) {
  await requireGM();
  
  const result = await db.execute({
    sql: `INSERT INTO region_rare_loot (region_id, item_id, drop_chance, min_level)
          VALUES (?, ?, ?, ?)`,
    args: [
      lootData.region_id ?? 0,
      lootData.item_id ?? 0,
      lootData.drop_chance ?? 0.001,
      lootData.min_level ?? 1,
    ],
  });
  
  return result.lastInsertRowid;
}

export async function updateRegionRareLoot(id: number, lootData: any) {
  await requireGM();
  
  await db.execute({
    sql: `UPDATE region_rare_loot SET
            region_id = ?, item_id = ?, drop_chance = ?, min_level = ?
          WHERE id = ?`,
    args: [
      lootData.region_id ?? 0,
      lootData.item_id ?? 0,
      lootData.drop_chance ?? 0.001,
      lootData.min_level ?? 1,
      id,
    ],
  });
}

export async function deleteRegionRareLoot(id: number) {
  await requireGM();
  
  await db.execute({
    sql: 'DELETE FROM region_rare_loot WHERE id = ?',
    args: [id],
  });
}

// Region Mobs (Spawn Control)
export async function getAllRegionMobs() {
  await requireGM();
  
  const result = await db.execute({
    sql: `SELECT 
            rm.*,
            r.name as region_name,
            m.name as mob_name,
            m.level as mob_level
          FROM region_mobs rm
          JOIN regions r ON rm.region_id = r.id
          JOIN mobs m ON rm.mob_id = m.id
          ORDER BY r.min_level, r.name, rm.spawn_weight DESC`,
    args: [],
  });
  
  return result.rows;
}

export async function createRegionMob(data: any) {
  await requireGM();
  
  const result = await db.execute({
    sql: `INSERT INTO region_mobs (region_id, mob_id, spawn_weight)
          VALUES (?, ?, ?)`,
    args: [
      data.region_id ?? 0,
      data.mob_id ?? 0,
      data.spawn_weight ?? 1,
    ],
  });
  
  return result.lastInsertRowid;
}

export async function updateRegionMob(id: number, data: any) {
  await requireGM();
  
  await db.execute({
    sql: `UPDATE region_mobs SET
            region_id = ?, mob_id = ?, spawn_weight = ?
          WHERE id = ?`,
    args: [
      data.region_id ?? 0,
      data.mob_id ?? 0,
      data.spawn_weight ?? 1,
      id,
    ],
  });
}

export async function deleteRegionMob(id: number) {
  await requireGM();
  
  await db.execute({
    sql: 'DELETE FROM region_mobs WHERE id = ?',
    args: [id],
  });
}

// Merchant Inventory
export async function getAllMerchantInventory() {
  await requireGM();
  
  const result = await db.execute({
    sql: `SELECT 
            mi.*,
            m.name as merchant_name,
            i.name as item_name,
            i.type as item_type,
            i.value as base_value
          FROM merchant_inventory mi
          JOIN merchants m ON mi.merchant_id = m.id
          JOIN items i ON mi.item_id = i.id
          ORDER BY m.name, i.name`,
    args: [],
  });
  
  return result.rows;
}

export async function createMerchantInventory(data: any) {
  await requireGM();
  
  const result = await db.execute({
    sql: `INSERT INTO merchant_inventory (merchant_id, item_id, stock, price_multiplier)
          VALUES (?, ?, ?, ?)`,
    args: [
      data.merchant_id ?? 0,
      data.item_id ?? 0,
      data.stock ?? -1,
      data.price_multiplier ?? 1.0,
    ],
  });
  
  return result.lastInsertRowid;
}

export async function updateMerchantInventory(id: number, data: any) {
  await requireGM();
  
  await db.execute({
    sql: `UPDATE merchant_inventory SET
            merchant_id = ?, item_id = ?, stock = ?, price_multiplier = ?
          WHERE id = ?`,
    args: [
      data.merchant_id ?? 0,
      data.item_id ?? 0,
      data.stock ?? -1,
      data.price_multiplier ?? 1.0,
      id,
    ],
  });
}

export async function deleteMerchantInventory(id: number) {
  await requireGM();
  
  await db.execute({
    sql: 'DELETE FROM merchant_inventory WHERE id = ?',
    args: [id],
  });
}
