import { createClient } from '@libsql/client';

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export type User = {
  id: number;
  email: string;
  password_hash: string;
  created_at: number;
};

export type Character = {
  id: number;
  user_id: number;
  name: string;
  level: number;
  experience: number;
  available_points: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  evasiveness: number;
  max_health: number;
  current_health: number;
  max_mana: number;
  current_mana: number;
  gold: number;
  current_region: number;
  created_at: number;
  updated_at: number;
};

export type Item = {
  id: number;
  name: string;
  description: string | null;
  type: string;
  slot: string | null;
  rarity: string;
  strength_bonus: number;
  dexterity_bonus: number;
  constitution_bonus: number;
  intelligence_bonus: number;
  wisdom_bonus: number;
  charisma_bonus: number;
  damage_min: number;
  damage_max: number;
  armor: number;
  attack_speed: number;
  value: number;
  stackable: number;
  health_restore: number;
  mana_restore: number;
  teaches_ability_id: number | null;
  required_strength: number;
  required_dexterity: number;
  required_constitution: number;
  required_intelligence: number;
  required_wisdom: number;
  required_charisma: number;
  required_level: number;
  created_at: number;
};

export type InventoryItem = {
  id: number;
  character_id: number;
  item_id: number;
  quantity: number;
  equipped: number;
};

export type Mob = {
  id: number;
  name: string;
  level: number;
  area: string;
  max_health: number;
  damage_min: number;
  damage_max: number;
  defense: number;
  attack_speed: number;
  evasiveness: number;
  experience_reward: number;
  gold_min: number;
  gold_max: number;
  aggressive: number;
  created_at: number;
};

export type Ability = {
  id: number;
  name: string;
  description: string | null;
  type: string; // 'ability' or 'spell'
  category: string; // 'damage', 'heal', 'buff'
  level: number; // Tier (1, 2, 3)
  base_id: number | null;
  mana_cost: number;
  cooldown: number;
  required_strength: number;
  required_dexterity: number;
  required_constitution: number;
  required_intelligence: number;
  required_wisdom: number;
  required_charisma: number;
  required_level: number;
  created_at: number;
  // Legacy fields for backward compatibility (not in DB anymore)
  primary_stat?: string | null;
  stat_scaling?: number;
  damage_min?: number;
  damage_max?: number;
  healing?: number;
  buff_stat?: string | null;
  buff_amount?: number;
  buff_duration?: number;
};

export type CharacterAbility = {
  id: number;
  character_id: number;
  ability_id: number;
  last_used_at: number;
};

export type CombatSession = {
  id: number;
  character_id: number;
  mob_id: number;
  named_mob_id: number | null;
  is_dungeon: number;
  character_health: number;
  mob_health: number;
  status: string;
  started_at: number;
  updated_at: number;
};

export type Session = {
  id: string;
  user_id: number;
  expires_at: number;
  created_at: number;
};

export type Region = {
  id: number;
  name: string;
  description: string | null;
  min_level: number;
  max_level: number;
  locked: number;
  unlock_requirement: string | null;
  created_at: number;
};

export type Merchant = {
  id: number;
  name: string;
  region_id: number;
  description: string | null;
  created_at: number;
};

export type MerchantInventory = {
  id: number;
  merchant_id: number;
  item_id: number;
  stock: number;
  price_multiplier: number;
};

export type NamedMob = {
  id: number;
  name: string;
  title: string | null;
  region_id: number;
  level: number;
  max_health: number;
  damage_min: number;
  damage_max: number;
  defense: number;
  attack_speed: number;
  evasiveness: number;
  experience_reward: number;
  gold_min: number;
  gold_max: number;
  spawn_chance: number;
  aggressive: number;
  description: string | null;
  created_at: number;
};

export type Dungeon = {
  id: number;
  name: string;
  region_id: number;
  description: string | null;
  boss_mob_id: number;
  required_level: number;
  created_at: number;
};

export type DungeonEncounter = {
  id: number;
  dungeon_id: number;
  encounter_order: number;
  mob_id: number | null;
  is_boss: number;
  created_at: number;
};

export type CharacterDungeonProgress = {
  id: number;
  character_id: number;
  dungeon_id: number;
  current_encounter: number;
  status: string;
  started_at: number;
  updated_at: number;
};

export type CharacterNamedMobDefeat = {
  id: number;
  character_id: number;
  named_mob_id: number;
  defeated_at: number;
};

export type HotbarSlot = {
  id: number;
  character_id: number;
  slot: number; // 1-8
  type: 'ability' | 'consumable';
  ability_id: number | null;
  item_id: number | null;
  created_at: number;
  updated_at: number;
};

export type AbilityEffect = {
  id: number;
  ability_id: number;
  effect_order: number;
  effect_type: 'damage' | 'heal' | 'buff' | 'debuff' | 'dot' | 'hot' | 'drain' | 'shield';
  target: 'self' | 'enemy' | 'ally';
  
  // Instant values
  value_min: number;
  value_max: number;
  
  // Periodic effects
  is_periodic: number;
  tick_interval: number;
  tick_count: number;
  tick_value: number;
  
  // Stat modifications
  stat_affected: string | null;
  stat_scaling: string | null;
  scaling_factor: number;
  
  // Duration
  duration: number;
  
  // Conditions
  chance: number;
  requires_buff: string | null;
  
  // Special
  drain_percent: number;
  shield_amount: number;
  stacks_max: number;
  
  created_at: number;
};

export type ActiveEffect = {
  id: string;
  name: string;
  source: 'ability' | 'item';
  effect_type: 'dot' | 'hot' | 'buff' | 'debuff' | 'shield';
  target: 'self' | 'enemy';
  
  // For DOT/HOT
  tick_value?: number;
  tick_interval?: number;
  ticks_remaining?: number;
  next_tick_at?: number;
  
  // For buffs/debuffs
  stat?: string;
  amount?: number;
  
  // For shields
  shield_remaining?: number;
  
  // Common
  duration: number;
  expires_at: number;
  stacks: number;
  stat_scaling?: string;
  scaling_factor?: number;
};
