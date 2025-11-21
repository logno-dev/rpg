-- Drop old simple region_merchants table if it exists (it was never used)
DROP TABLE IF EXISTS region_merchants;

-- Create new merchants table with full structure
CREATE TABLE IF NOT EXISTS merchants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    region_id INTEGER NOT NULL,
    description TEXT,
    created_at INTEGER DEFAULT (unixepoch()),
    
    FOREIGN KEY (region_id) REFERENCES regions(id)
);

-- Create merchant inventory table (what items each merchant sells)
CREATE TABLE IF NOT EXISTS merchant_inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    merchant_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    stock INTEGER DEFAULT -1, -- -1 = infinite stock
    price_multiplier REAL DEFAULT 1.0, -- Allows for markup/discount
    
    FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id)
);

-- Seed merchants for each region
INSERT INTO merchants (id, name, region_id, description) VALUES
(1, 'Bran the Merchant', 1, 'A friendly trader who welcomes newcomers to Greenfield Plains'),
(2, 'Elara Moonwhisper', 2, 'An elven merchant who specializes in forest survival gear'),
(3, 'Thorgrim Ironforge', 3, 'A dwarven blacksmith offering sturdy mountain equipment'),
(4, 'Cassandra the Shadowed', 4, 'A mysterious vendor who deals in dungeon expedition supplies');
