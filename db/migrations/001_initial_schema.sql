-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at INTEGER DEFAULT (unixepoch())
);

-- Characters table
CREATE TABLE IF NOT EXISTS characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    available_points INTEGER DEFAULT 0,
    
    -- Base stats
    strength INTEGER DEFAULT 10,
    dexterity INTEGER DEFAULT 10,
    constitution INTEGER DEFAULT 10,
    intelligence INTEGER DEFAULT 10,
    wisdom INTEGER DEFAULT 10,
    charisma INTEGER DEFAULT 10,
    
    -- Derived stats
    max_health INTEGER DEFAULT 100,
    current_health INTEGER DEFAULT 100,
    max_mana INTEGER DEFAULT 50,
    current_mana INTEGER DEFAULT 50,
    
    -- Currency
    gold INTEGER DEFAULT 0,
    
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch()),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Items table (master list of all possible items)
CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL, -- 'weapon', 'armor', 'consumable', 'misc'
    slot TEXT, -- 'head', 'chest', 'legs', 'feet', 'hands', 'weapon', 'offhand', null for consumables
    rarity TEXT DEFAULT 'common', -- 'common', 'uncommon', 'rare', 'epic', 'legendary'
    
    -- Stat modifiers
    strength_bonus INTEGER DEFAULT 0,
    dexterity_bonus INTEGER DEFAULT 0,
    constitution_bonus INTEGER DEFAULT 0,
    intelligence_bonus INTEGER DEFAULT 0,
    wisdom_bonus INTEGER DEFAULT 0,
    charisma_bonus INTEGER DEFAULT 0,
    
    -- Combat stats
    damage_min INTEGER DEFAULT 0,
    damage_max INTEGER DEFAULT 0,
    armor INTEGER DEFAULT 0,
    attack_speed REAL DEFAULT 1.0, -- attacks per second (base 1.0)
    
    -- Other properties
    value INTEGER DEFAULT 0,
    stackable INTEGER DEFAULT 0, -- boolean: 0 or 1
    
    created_at INTEGER DEFAULT (unixepoch())
);

-- Character inventory
CREATE TABLE IF NOT EXISTS character_inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    equipped INTEGER DEFAULT 0, -- boolean: 0 or 1
    
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id)
);

-- Mobs table (monster definitions)
CREATE TABLE IF NOT EXISTS mobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    level INTEGER NOT NULL,
    area TEXT NOT NULL, -- 'forest', 'plains', 'mountains', 'dungeon', etc.
    
    -- Stats
    max_health INTEGER NOT NULL,
    damage_min INTEGER NOT NULL,
    damage_max INTEGER NOT NULL,
    defense INTEGER DEFAULT 0,
    attack_speed REAL DEFAULT 1.0, -- attacks per second
    
    -- Rewards
    experience_reward INTEGER NOT NULL,
    gold_min INTEGER DEFAULT 0,
    gold_max INTEGER DEFAULT 0,
    
    -- Behavior
    aggressive INTEGER DEFAULT 1, -- boolean: 0 or 1
    
    created_at INTEGER DEFAULT (unixepoch())
);

-- Mob loot table (defines what items mobs can drop)
CREATE TABLE IF NOT EXISTS mob_loot (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mob_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    drop_chance REAL NOT NULL, -- 0.0 to 1.0 (0% to 100%)
    quantity_min INTEGER DEFAULT 1,
    quantity_max INTEGER DEFAULT 1,
    
    FOREIGN KEY (mob_id) REFERENCES mobs(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id)
);

-- Abilities table
CREATE TABLE IF NOT EXISTS abilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL, -- 'physical', 'magical', 'buff', 'heal'
    
    -- Requirements
    min_level INTEGER DEFAULT 1,
    strength_required INTEGER DEFAULT 0,
    dexterity_required INTEGER DEFAULT 0,
    intelligence_required INTEGER DEFAULT 0,
    wisdom_required INTEGER DEFAULT 0,
    
    -- Costs
    mana_cost INTEGER DEFAULT 0,
    cooldown INTEGER DEFAULT 0, -- in seconds
    
    -- Effects
    damage_min INTEGER DEFAULT 0,
    damage_max INTEGER DEFAULT 0,
    healing INTEGER DEFAULT 0,
    
    created_at INTEGER DEFAULT (unixepoch())
);

-- Character abilities (unlocked abilities)
CREATE TABLE IF NOT EXISTS character_abilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id INTEGER NOT NULL,
    ability_id INTEGER NOT NULL,
    unlocked_at INTEGER DEFAULT (unixepoch()),
    
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
    FOREIGN KEY (ability_id) REFERENCES abilities(id),
    UNIQUE(character_id, ability_id)
);

-- Combat logs (for tracking active combats)
CREATE TABLE IF NOT EXISTS combat_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id INTEGER NOT NULL,
    mob_id INTEGER NOT NULL,
    
    -- Combat state
    character_health INTEGER NOT NULL,
    mob_health INTEGER NOT NULL,
    status TEXT DEFAULT 'active', -- 'active', 'victory', 'defeat'
    
    -- Timestamps
    started_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch()),
    
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
    FOREIGN KEY (mob_id) REFERENCES mobs(id)
);

-- Sessions for auth
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER DEFAULT (unixepoch()),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_characters_user_id ON characters(user_id);
CREATE INDEX IF NOT EXISTS idx_character_inventory_character_id ON character_inventory(character_id);
CREATE INDEX IF NOT EXISTS idx_character_inventory_equipped ON character_inventory(character_id, equipped);
CREATE INDEX IF NOT EXISTS idx_mob_loot_mob_id ON mob_loot(mob_id);
CREATE INDEX IF NOT EXISTS idx_character_abilities_character_id ON character_abilities(character_id);
CREATE INDEX IF NOT EXISTS idx_combat_sessions_character_id ON combat_sessions(character_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
