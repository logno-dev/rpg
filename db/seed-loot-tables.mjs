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

async function getItemId(name) {
  const result = await db.execute({
    sql: 'SELECT id FROM items WHERE name = ?',
    args: [name]
  });
  if (!result.rows[0]?.id) {
    console.log(`  [DEBUG] Could not find item: "${name}"`);
  }
  return result.rows[0]?.id;
}

async function getNamedMobId(name) {
  const result = await db.execute({
    sql: 'SELECT id FROM named_mobs WHERE name = ?',
    args: [name]
  });
  if (!result.rows[0]?.id) {
    console.log(`  [DEBUG] Could not find named mob: "${name}"`);
    // Try to find close matches
    const allMobs = await db.execute('SELECT name FROM named_mobs');
    console.log(`  [DEBUG] Available named mobs:`, allMobs.rows.map(r => r.name));
  }
  return result.rows[0]?.id;
}

async function addBossLoot(bossName, itemName, dropChance = 1.0) {
  const bossId = await getNamedMobId(bossName);
  const itemId = await getItemId(itemName);
  
  if (!bossId || !itemId) {
    console.error(`  ❌ Could not find boss "${bossName}" or item "${itemName}"`);
    return;
  }
  
  await db.execute({
    sql: `INSERT INTO named_mob_loot (named_mob_id, item_id, drop_chance) VALUES (?, ?, ?)`,
    args: [bossId, itemId, dropChance]
  });
  console.log(`  ✓ ${bossName} → ${itemName} (${dropChance * 100}% chance)`);
}

async function addRegionRareLoot(regionId, itemName, dropChance, minLevel) {
  const itemId = await getItemId(itemName);
  
  if (!itemId) {
    console.error(`  ❌ Could not find item "${itemName}"`);
    return;
  }
  
  await db.execute({
    sql: `INSERT INTO region_rare_loot (region_id, item_id, drop_chance, min_level) VALUES (?, ?, ?, ?)`,
    args: [regionId, itemId, dropChance, minLevel]
  });
  console.log(`  ✓ Region ${regionId} → ${itemName} (${dropChance * 100}% chance, min level ${minLevel})`);
}

async function seedLootTables() {
  console.log('🎁 Seeding loot tables...\n');
  
  // Clear existing loot tables
  await db.execute('DELETE FROM named_mob_loot');
  await db.execute('DELETE FROM region_rare_loot');
  console.log('Cleared existing loot entries\n');
  
  // === GNARLROOT (Level 5 Boss) ===
  console.log('Gnarlroot loot:');
  await addBossLoot("Gnarlroot", "Gnarlroot's Barkshield", 1.0);
  await addBossLoot("Gnarlroot", "Living Rootstaff", 1.0);
  
  // === SHADOWFANG (Level 8 Boss) ===
  console.log('\nShadowfang loot:');
  await addBossLoot("Shadowfang", "Shadowfang Blade", 1.0);
  await addBossLoot("Shadowfang", "Darkpelt Armor", 1.0);
  
  // === GORAK STONEFIST (Level 12 Boss) ===
  console.log('\nGorak Stonefist loot:');
  await addBossLoot("Gorak Stonefist", "Stonebreaker Greataxe", 1.0);
  await addBossLoot("Gorak Stonefist", "Chieftain's Warplate", 1.0);
  
  // === VEXMORA (Level 16 Boss) ===
  console.log('\nVexmora loot:');
  await addBossLoot("Vexmora", "Voidheart Staff", 1.0);
  await addBossLoot("Vexmora", "Eternal Shadow Robes", 1.0);
  
  // === ULTRA-RARE WORLD DROPS ===
  console.log('\nUltra-rare world drops (0.5% chance):');
  // Dragonscale Hauberk - Region 3 (Highland Peaks), min level 10
  await addRegionRareLoot(3, "Dragonscale Hauberk", 0.005, 10);
  
  // Moonwhisper Bow - Region 2 (Shadow Woods), min level 5
  await addRegionRareLoot(2, "Moonwhisper Bow", 0.005, 5);
  
  // Crown of the Fallen King - Region 4 (Ancient Ruins), min level 12
  await addRegionRareLoot(4, "Crown of the Fallen King", 0.005, 12);
  
  console.log('\n✅ Loot tables seeded successfully!');
}

seedLootTables().catch(console.error);
