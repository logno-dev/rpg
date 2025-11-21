import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnv() {
  try {
    const envPath = join(__dirname, '..', '.env');
    const envFile = readFileSync(envPath, 'utf-8');
    envFile.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').trim();
        process.env[key.trim()] = value;
      }
    });
  } catch (error) {
    console.error('Could not load .env file:', error.message);
  }
}

loadEnv();

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function insertAbilitiesAndScrolls() {
  console.log('🔥 Force inserting abilities and scrolls...\n');
  
  // Delete old abilities and scrolls
  console.log('Cleaning old data...');
  await client.execute('DELETE FROM character_abilities');
  await client.execute('DELETE FROM abilities');
  await client.execute('DELETE FROM items WHERE teaches_ability_id IS NOT NULL');
  
  console.log('✅ Cleaned\n');
  
  // Insert Kick abilities
  console.log('Inserting Kick abilities...');
  await client.execute(`INSERT INTO abilities (id, name, description, type, category, level, base_id, primary_stat, stat_scaling, mana_cost, cooldown, damage_min, damage_max) VALUES 
    (1, 'Kick I', 'A quick kick attack', 'ability', 'damage', 1, 1, 'strength', 0.3, 0, 10, 5, 10),
    (2, 'Kick II', 'A stronger kick attack', 'ability', 'damage', 2, 1, 'strength', 0.5, 0, 12, 10, 18),
    (3, 'Kick III', 'A devastating kick attack', 'ability', 'damage', 3, 1, 'strength', 0.7, 0, 15, 18, 30)`);
  
  // Insert Dodge abilities
  console.log('Inserting Dodge abilities...');
  await client.execute(`INSERT INTO abilities (id, name, description, type, category, level, base_id, primary_stat, stat_scaling, mana_cost, cooldown, damage_min, damage_max) VALUES 
    (4, 'Dodge I', 'Quick evasive maneuver', 'ability', 'damage', 1, 4, 'dexterity', 0.4, 0, 8, 3, 8),
    (5, 'Dodge II', 'Improved evasion and counter', 'ability', 'damage', 2, 4, 'dexterity', 0.6, 0, 10, 8, 15),
    (6, 'Dodge III', 'Master evasion technique', 'ability', 'damage', 3, 4, 'dexterity', 0.8, 0, 12, 15, 25)`);
  
  // Insert Taunt abilities  
  console.log('Inserting Taunt abilities...');
  await client.execute(`INSERT INTO abilities (id, name, description, type, category, level, base_id, primary_stat, stat_scaling, mana_cost, cooldown, damage_min, damage_max) VALUES 
    (7, 'Taunt I', 'Draw enemy attention', 'ability', 'damage', 1, 7, 'charisma', 0.2, 0, 15, 2, 5),
    (8, 'Taunt II', 'Stronger provocation', 'ability', 'damage', 2, 7, 'charisma', 0.4, 0, 18, 5, 12),
    (9, 'Taunt III', 'Ultimate intimidation', 'ability', 'damage', 3, 7, 'charisma', 0.6, 0, 20, 10, 20)`);
  
  // Insert Fireball spells
  console.log('Inserting Fireball spells...');
  await client.execute(`INSERT INTO abilities (id, name, description, type, category, level, base_id, primary_stat, stat_scaling, mana_cost, cooldown, damage_min, damage_max) VALUES 
    (10, 'Fireball I', 'Hurl a ball of flame', 'spell', 'damage', 1, 10, 'intelligence', 0.8, 15, 0, 12, 20),
    (11, 'Fireball II', 'Greater ball of flame', 'spell', 'damage', 2, 10, 'intelligence', 1.0, 25, 0, 22, 35),
    (12, 'Fireball III', 'Devastating inferno', 'spell', 'damage', 3, 10, 'intelligence', 1.2, 40, 0, 35, 55)`);
  
  // Insert Heal spells
  console.log('Inserting Heal spells...');
  await client.execute(`INSERT INTO abilities (id, name, description, type, category, level, base_id, primary_stat, stat_scaling, mana_cost, cooldown, healing) VALUES 
    (13, 'Heal I', 'Restore health', 'spell', 'heal', 1, 13, 'wisdom', 0.5, 20, 0, 30),
    (14, 'Heal II', 'Greater restoration', 'spell', 'heal', 2, 13, 'wisdom', 0.8, 35, 0, 60),
    (15, 'Heal III', 'Divine healing', 'spell', 'heal', 3, 13, 'wisdom', 1.0, 50, 0, 100)`);
  
  // Insert Blessing spells
  console.log('Inserting Blessing spells...');
  await client.execute(`INSERT INTO abilities (id, name, description, type, category, level, base_id, primary_stat, stat_scaling, mana_cost, cooldown, buff_stat, buff_amount, buff_duration) VALUES 
    (16, 'Blessing I', 'Minor divine protection', 'spell', 'buff', 1, 16, 'wisdom', 0.3, 25, 0, 'constitution', 3, 10),
    (17, 'Blessing II', 'Greater blessing', 'spell', 'buff', 2, 16, 'wisdom', 0.6, 35, 0, 'constitution', 5, 15),
    (18, 'Blessing III', 'Divine protection', 'spell', 'buff', 3, 16, 'wisdom', 0.8, 45, 0, 'constitution', 8, 15)`);
  
  console.log('✅ Abilities inserted\n');
  
  // Insert scroll items
  console.log('Inserting scroll items...');
  const scrolls = [
    [1, 'Scroll: Kick I'],
    [2, 'Scroll: Kick II'],
    [3, 'Scroll: Kick III'],
    [4, 'Scroll: Dodge I'],
    [5, 'Scroll: Dodge II'],
    [6, 'Scroll: Dodge III'],
    [7, 'Scroll: Taunt I'],
    [8, 'Scroll: Taunt II'],
    [9, 'Scroll: Taunt III'],
    [10, 'Scroll: Fireball I'],
    [11, 'Scroll: Fireball II'],
    [12, 'Scroll: Fireball III'],
    [13, 'Scroll: Heal I'],
    [14, 'Scroll: Heal II'],
    [15, 'Scroll: Heal III'],
    [16, 'Scroll: Blessing I'],
    [17, 'Scroll: Blessing II'],
    [18, 'Scroll: Blessing III'],
  ];
  
  for (const [abilityId, name] of scrolls) {
    const desc = `Teaches you the ${name.replace('Scroll: ', '')} ability`;
    const rarity = name.includes('III') ? 'rare' : name.includes('II') ? 'uncommon' : 'common';
    const value = name.includes('III') ? 500 : name.includes('II') ? 200 : 75;
    
    await client.execute({
      sql: `INSERT INTO items (name, description, type, slot, rarity, stackable, value, teaches_ability_id) VALUES (?, ?, 'consumable', null, ?, 1, ?, ?)`,
      args: [name, desc, rarity, value, abilityId]
    });
  }
  
  console.log('✅ Scrolls inserted\n');
  
  // Update mob_loot with correct scroll IDs
  console.log('Updating mob_loot with scroll drops...');
  
  // Get the IDs of the scrolls we just inserted
  const result = await client.execute(`SELECT id, name FROM items WHERE teaches_ability_id IS NOT NULL ORDER BY teaches_ability_id`);
  
  const scrollMap = {};
  for (const row of result.rows) {
    scrollMap[row.name] = row.id;
  }
  
  console.log('Scroll IDs:', scrollMap);
  
  // Delete old scroll loot entries
  await client.execute('DELETE FROM mob_loot WHERE item_id >= 16 AND item_id <= 35');
  
  // Insert with correct IDs and high drop rates (85-90%)
  await client.execute({
    sql: `INSERT INTO mob_loot (mob_id, item_id, drop_chance, quantity_min, quantity_max) VALUES 
      (1, ?, 0.85, 1, 1),
      (2, ?, 0.85, 1, 1),
      (2, ?, 0.80, 1, 1),
      (3, ?, 0.85, 1, 1),
      (3, ?, 0.80, 1, 1),
      (4, ?, 0.85, 1, 1),
      (4, ?, 0.80, 1, 1),
      (4, ?, 0.80, 1, 1),
      (5, ?, 0.85, 1, 1),
      (5, ?, 0.80, 1, 1),
      (6, ?, 0.85, 1, 1),
      (7, ?, 0.85, 1, 1),
      (8, ?, 0.90, 1, 1),
      (8, ?, 0.85, 1, 1),
      (8, ?, 0.85, 1, 1)`,
    args: [
      scrollMap['Scroll: Kick I'],      // Rat
      scrollMap['Scroll: Kick I'],      // Goblin
      scrollMap['Scroll: Fireball I'],  // Goblin
      scrollMap['Scroll: Dodge I'],     // Wolf
      scrollMap['Scroll: Fireball I'],  // Wolf
      scrollMap['Scroll: Heal I'],      // Skeleton
      scrollMap['Scroll: Fireball I'],  // Skeleton
      scrollMap['Scroll: Blessing I'],  // Skeleton
      scrollMap['Scroll: Kick II'],     // Orc
      scrollMap['Scroll: Blessing I'],  // Orc
      scrollMap['Scroll: Kick I'],      // Boar
      scrollMap['Scroll: Taunt I'],     // Spider
      scrollMap['Scroll: Kick III'],    // Troll
      scrollMap['Scroll: Fireball III'],// Troll
      scrollMap['Scroll: Heal II'],     // Troll
    ]
  });
  
  console.log('✅ Loot table updated\n');
  console.log('🎉 Done! Scrolls should now drop at 80-90% rate!');
}

insertAbilitiesAndScrolls();
