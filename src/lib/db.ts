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
  max_health: number;
  current_health: number;
  max_mana: number;
  current_mana: number;
  gold: number;
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
  value: number;
  stackable: number;
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
  type: string;
  min_level: number;
  strength_required: number;
  dexterity_required: number;
  intelligence_required: number;
  wisdom_required: number;
  mana_cost: number;
  cooldown: number;
  damage_min: number;
  damage_max: number;
  healing: number;
  created_at: number;
};

export type CombatSession = {
  id: number;
  character_id: number;
  mob_id: number;
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
