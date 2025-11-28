-- Quest System Migration

-- First, alter crafting_materials to support quest items
ALTER TABLE crafting_materials ADD COLUMN is_quest_item INTEGER DEFAULT 0;
ALTER TABLE crafting_materials ADD COLUMN quest_id INTEGER;

-- Main quests table
CREATE TABLE IF NOT EXISTS quests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  region_id INTEGER NOT NULL,
  min_level INTEGER NOT NULL,
  repeatable INTEGER DEFAULT 0,
  cooldown_hours INTEGER DEFAULT 0, -- For repeatable quests
  chain_id INTEGER, -- For quest chains
  chain_order INTEGER, -- Order in the chain
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (region_id) REFERENCES regions(id)
);

-- Quest objectives (tasks that must be completed)
CREATE TABLE IF NOT EXISTS quest_objectives (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quest_id INTEGER NOT NULL,
  objective_order INTEGER NOT NULL, -- Order objectives must be completed
  type TEXT NOT NULL, -- 'kill', 'collect', 'talk'
  description TEXT NOT NULL,
  target_mob_id INTEGER, -- For kill objectives
  target_item_id INTEGER, -- For collect objectives (crafting_materials)
  target_region_id INTEGER, -- Where the objective must be completed
  target_sub_area_id INTEGER, -- Optional: specific sub-area
  required_count INTEGER DEFAULT 1,
  auto_complete INTEGER DEFAULT 0, -- Auto-complete when count reached (for kills)
  FOREIGN KEY (quest_id) REFERENCES quests(id),
  FOREIGN KEY (target_mob_id) REFERENCES mobs(id),
  FOREIGN KEY (target_item_id) REFERENCES crafting_materials(id),
  FOREIGN KEY (target_region_id) REFERENCES regions(id),
  FOREIGN KEY (target_sub_area_id) REFERENCES sub_areas(id)
);

-- Quest rewards
CREATE TABLE IF NOT EXISTS quest_rewards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quest_id INTEGER NOT NULL,
  reward_type TEXT NOT NULL, -- 'xp', 'gold', 'item', 'crafting_material'
  reward_item_id INTEGER, -- For item rewards
  reward_material_id INTEGER, -- For crafting material rewards
  reward_amount INTEGER NOT NULL,
  FOREIGN KEY (quest_id) REFERENCES quests(id),
  FOREIGN KEY (reward_item_id) REFERENCES items(id),
  FOREIGN KEY (reward_material_id) REFERENCES crafting_materials(id)
);

-- Character quest progress tracking
CREATE TABLE IF NOT EXISTS character_quests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  character_id INTEGER NOT NULL,
  quest_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'available', -- 'available', 'active', 'completed', 'failed'
  current_objective INTEGER DEFAULT 1, -- Current objective order
  started_at TEXT,
  completed_at TEXT,
  last_completion_at TEXT, -- For repeatable quests
  FOREIGN KEY (character_id) REFERENCES characters(id),
  FOREIGN KEY (quest_id) REFERENCES quests(id),
  UNIQUE(character_id, quest_id)
);

-- Track progress on individual objectives
CREATE TABLE IF NOT EXISTS character_quest_objectives (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  character_quest_id INTEGER NOT NULL,
  quest_objective_id INTEGER NOT NULL,
  current_count INTEGER DEFAULT 0,
  completed INTEGER DEFAULT 0,
  FOREIGN KEY (character_quest_id) REFERENCES character_quests(id),
  FOREIGN KEY (quest_objective_id) REFERENCES quest_objectives(id),
  UNIQUE(character_quest_id, quest_objective_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quests_region ON quests(region_id);
CREATE INDEX IF NOT EXISTS idx_quest_objectives_quest ON quest_objectives(quest_id);
CREATE INDEX IF NOT EXISTS idx_quest_objectives_mob ON quest_objectives(target_mob_id);
CREATE INDEX IF NOT EXISTS idx_quest_rewards_quest ON quest_rewards(quest_id);
CREATE INDEX IF NOT EXISTS idx_character_quests_character ON character_quests(character_id);
CREATE INDEX IF NOT EXISTS idx_character_quests_status ON character_quests(character_id, status);
CREATE INDEX IF NOT EXISTS idx_character_quest_objectives_quest ON character_quest_objectives(character_quest_id);
