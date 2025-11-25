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

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function addPotions() {
  console.log('🧪 Adding tiered potions (checking for duplicates)...\n');

  const potions = [
    { name: 'Minor Health Potion', desc: 'Restores 50 health', hp: 50, mp: 0, rarity: 'common', value: 10 },
    { name: 'Minor Mana Potion', desc: 'Restores 40 mana', hp: 0, mp: 40, rarity: 'common', value: 10 },
    { name: 'Lesser Health Potion', desc: 'Restores 150 health', hp: 150, mp: 0, rarity: 'common', value: 25 },
    { name: 'Lesser Mana Potion', desc: 'Restores 120 mana', hp: 0, mp: 120, rarity: 'common', value: 25 },
    { name: 'Health Potion', desc: 'Restores 300 health', hp: 300, mp: 0, rarity: 'uncommon', value: 50 },
    { name: 'Mana Potion', desc: 'Restores 250 mana', hp: 0, mp: 250, rarity: 'uncommon', value: 50 },
    { name: 'Greater Health Potion', desc: 'Restores 600 health', hp: 600, mp: 0, rarity: 'uncommon', value: 100 },
    { name: 'Greater Mana Potion', desc: 'Restores 500 mana', hp: 0, mp: 500, rarity: 'uncommon', value: 100 },
    { name: 'Superior Health Potion', desc: 'Restores 1000 health', hp: 1000, mp: 0, rarity: 'rare', value: 200 },
    { name: 'Superior Mana Potion', desc: 'Restores 850 mana', hp: 0, mp: 850, rarity: 'rare', value: 200 },
    { name: 'Supreme Health Potion', desc: 'Restores 1500 health', hp: 1500, mp: 0, rarity: 'rare', value: 400 },
    { name: 'Supreme Mana Potion', desc: 'Restores 1300 mana', hp: 0, mp: 1300, rarity: 'rare', value: 400 },
    { name: 'Minor Rejuvenation Potion', desc: 'Restores 40 health and 30 mana', hp: 40, mp: 30, rarity: 'uncommon', value: 20 },
    { name: 'Rejuvenation Potion', desc: 'Restores 200 health and 150 mana', hp: 200, mp: 150, rarity: 'rare', value: 100 },
    { name: 'Greater Rejuvenation Potion', desc: 'Restores 500 health and 400 mana', hp: 500, mp: 400, rarity: 'rare', value: 300 },
  ];

  let added = 0;
  let skipped = 0;

  for (const potion of potions) {
    // Check if it already exists
    const exists = await db.execute({
      sql: 'SELECT id FROM items WHERE name = ?',
      args: [potion.name]
    });

    if (exists.rows.length > 0) {
      console.log(`⏭️  ${potion.name} already exists, skipping`);
      skipped++;
    } else {
      await db.execute({
        sql: `INSERT INTO items (name, description, type, rarity, value, stackable, health_restore, mana_restore)
              VALUES (?, ?, 'consumable', ?, ?, 1, ?, ?)`,
        args: [potion.name, potion.desc, potion.rarity, potion.value, potion.hp, potion.mp]
      });
      console.log(`✅ Added ${potion.name}`);
      added++;
    }
  }

  console.log(`\n🎉 Added ${added} new potions, skipped ${skipped} existing ones`);
}

addPotions();
