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

async function seedDungeons() {
  console.log('Seeding dungeons system...');

  // REGION 1: Greenfield Plains (Level 1-2)
  // Named Mob: Gnarlroot the Ancient
  const gnarlroot = await db.execute({
    sql: `INSERT INTO named_mobs (name, title, region_id, level, max_health, damage_min, damage_max, defense, attack_speed, experience_reward, gold_min, gold_max, spawn_chance, description)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: ['Gnarlroot', 'The Ancient Treant', 1, 3, 200, 8, 15, 3, 2.5, 150, 25, 50, 0.01, 'A massive, twisted treant that has stood in Greenfield Plains for centuries. Its bark is thick as steel and its roots stretch deep into the earth.']
  });
  const gnarlrootId = gnarlroot.lastInsertRowid;

  // Create dungeon for Region 1
  const dungeon1 = await db.execute({
    sql: `INSERT INTO dungeons (name, region_id, boss_mob_id, required_level, description)
          VALUES (?, ?, ?, ?, ?)`,
    args: ['Ancient Grove Depths', 1, gnarlrootId, 1, 'A dark grove where twisted trees come alive. Gnarlroot the Ancient awaits at its heart.']
  });
  const dungeon1Id = dungeon1.lastInsertRowid;

  // Get mob IDs from region 1
  const region1Mobs = await db.execute(
    `SELECT mob_id FROM region_mobs WHERE region_id = 1 ORDER BY mob_id`
  );
  
  // Add progressive encounters (3 waves + boss) - repeat mobs if necessary
  const numEncounters1 = 3;
  for (let i = 0; i < numEncounters1; i++) {
    const mobId = region1Mobs.rows[i % region1Mobs.rows.length].mob_id;
    await db.execute({
      sql: `INSERT INTO dungeon_encounters (dungeon_id, encounter_order, mob_id, is_boss)
            VALUES (?, ?, ?, 0)`,
      args: [dungeon1Id, i + 1, mobId]
    });
  }
  // Boss encounter
  await db.execute({
    sql: `INSERT INTO dungeon_encounters (dungeon_id, encounter_order, mob_id, is_boss)
          VALUES (?, ?, NULL, 1)`,
    args: [dungeon1Id, numEncounters1 + 1]
  });

  console.log('✓ Created Region 1 dungeon: Ancient Grove Depths (Boss: Gnarlroot the Ancient)');

  // REGION 2: Darkwood Forest (Level 2-3)
  const shadowfang = await db.execute({
    sql: `INSERT INTO named_mobs (name, title, region_id, level, max_health, damage_min, damage_max, defense, attack_speed, experience_reward, gold_min, gold_max, spawn_chance, description)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: ['Shadowfang', 'Alpha of the Dark', 2, 4, 280, 12, 20, 4, 1.8, 200, 40, 75, 0.01, 'The largest and most cunning wolf to ever stalk Darkwood Forest. Its eyes glow with unnatural intelligence and its fangs drip with shadow essence.']
  });
  const shadowfangId = shadowfang.lastInsertRowid;

  const dungeon2 = await db.execute({
    sql: `INSERT INTO dungeons (name, region_id, boss_mob_id, required_level, description)
          VALUES (?, ?, ?, ?, ?)`,
    args: ['Shadowfang Den', 2, shadowfangId, 2, 'A lair deep in Darkwood where the wolf pack gathers. Shadowfang, the alpha, rules here.']
  });
  const dungeon2Id = dungeon2.lastInsertRowid;

  const region2Mobs = await db.execute(
    `SELECT mob_id FROM region_mobs WHERE region_id = 2 ORDER BY mob_id`
  );

  const numEncounters2 = 4;
  for (let i = 0; i < numEncounters2; i++) {
    const mobId = region2Mobs.rows[i % region2Mobs.rows.length].mob_id;
    await db.execute({
      sql: `INSERT INTO dungeon_encounters (dungeon_id, encounter_order, mob_id, is_boss)
            VALUES (?, ?, ?, 0)`,
      args: [dungeon2Id, i + 1, mobId]
    });
  }
  await db.execute({
    sql: `INSERT INTO dungeon_encounters (dungeon_id, encounter_order, mob_id, is_boss)
          VALUES (?, ?, NULL, 1)`,
    args: [dungeon2Id, numEncounters2 + 1]
  });

  console.log('✓ Created Region 2 dungeon: Shadowfang Den (Boss: Shadowfang, Alpha of the Dark)');

  // REGION 3: Ironpeak Mountains (Level 4-5)
  const gorak = await db.execute({
    sql: `INSERT INTO named_mobs (name, title, region_id, level, max_health, damage_min, damage_max, defense, attack_speed, experience_reward, gold_min, gold_max, spawn_chance, description)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: ['Gorak Stonefist', 'Chieftain of the Peak', 3, 6, 400, 18, 28, 8, 2.2, 300, 75, 125, 0.01, 'A massive orc chieftain who claims the highest peaks as his domain. His stone-crushing fists have ended countless challengers.']
  });
  const gorakId = gorak.lastInsertRowid;

  const dungeon3 = await db.execute({
    sql: `INSERT INTO dungeons (name, region_id, boss_mob_id, required_level, description)
          VALUES (?, ?, ?, ?, ?)`,
    args: ['Stonefist Stronghold', 3, gorakId, 4, 'An ancient fortress carved into the mountain where Gorak Stonefist commands his orc warband.']
  });
  const dungeon3Id = dungeon3.lastInsertRowid;

  const region3Mobs = await db.execute(
    `SELECT mob_id FROM region_mobs WHERE region_id = 3 ORDER BY mob_id`
  );

  const numEncounters3 = 5;
  for (let i = 0; i < numEncounters3; i++) {
    const mobId = region3Mobs.rows[i % region3Mobs.rows.length].mob_id;
    await db.execute({
      sql: `INSERT INTO dungeon_encounters (dungeon_id, encounter_order, mob_id, is_boss)
            VALUES (?, ?, ?, 0)`,
      args: [dungeon3Id, i + 1, mobId]
    });
  }
  await db.execute({
    sql: `INSERT INTO dungeon_encounters (dungeon_id, encounter_order, mob_id, is_boss)
          VALUES (?, ?, NULL, 1)`,
    args: [dungeon3Id, numEncounters3 + 1]
  });

  console.log('✓ Created Region 3 dungeon: Stonefist Stronghold (Boss: Gorak Stonefist, Chieftain of the Peak)');

  // REGION 4: Shadowdeep Dungeon (Level 5-6)
  const vexmora = await db.execute({
    sql: `INSERT INTO named_mobs (name, title, region_id, level, max_health, damage_min, damage_max, defense, attack_speed, experience_reward, gold_min, gold_max, spawn_chance, description)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: ['Vexmora', 'The Eternal Shadow', 4, 8, 550, 22, 35, 6, 1.9, 400, 100, 175, 0.01, 'A powerful necromancer who has transcended death itself. Her very presence drains the light from the world.']
  });
  const vexmoraId = vexmora.lastInsertRowid;

  const dungeon4 = await db.execute({
    sql: `INSERT INTO dungeons (name, region_id, boss_mob_id, required_level, description)
          VALUES (?, ?, ?, ?, ?)`,
    args: ['Shadowdeep Sanctum', 4, vexmoraId, 5, 'The deepest chamber of the dungeon where Vexmora the Eternal Shadow conducts her dark rituals.']
  });
  const dungeon4Id = dungeon4.lastInsertRowid;

  const region4Mobs = await db.execute(
    `SELECT mob_id FROM region_mobs WHERE region_id = 4 ORDER BY mob_id`
  );

  const numEncounters4 = 6;
  for (let i = 0; i < numEncounters4; i++) {
    const mobId = region4Mobs.rows[i % region4Mobs.rows.length].mob_id;
    await db.execute({
      sql: `INSERT INTO dungeon_encounters (dungeon_id, encounter_order, mob_id, is_boss)
            VALUES (?, ?, ?, 0)`,
      args: [dungeon4Id, i + 1, mobId]
    });
  }
  await db.execute({
    sql: `INSERT INTO dungeon_encounters (dungeon_id, encounter_order, mob_id, is_boss)
          VALUES (?, ?, NULL, 1)`,
    args: [dungeon4Id, numEncounters4 + 1]
  });

  console.log('✓ Created Region 4 dungeon: Shadowdeep Sanctum (Boss: Vexmora, The Eternal Shadow)');

  console.log('\n✅ All dungeons seeded successfully!');
}

seedDungeons().catch(console.error);
