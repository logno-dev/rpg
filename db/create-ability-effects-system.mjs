import { createClient } from '@libsql/client';
import 'dotenv/config';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function migrate() {
  console.log('🚀 Creating Advanced Ability Effects System...\n');

  // Step 1: Create ability_effects table
  console.log('📋 Creating ability_effects table...');
  await db.execute(`
    CREATE TABLE IF NOT EXISTS ability_effects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ability_id INTEGER NOT NULL,
      effect_order INTEGER DEFAULT 0,
      
      -- Effect classification
      effect_type TEXT NOT NULL CHECK (effect_type IN ('damage', 'heal', 'buff', 'debuff', 'dot', 'hot', 'drain', 'shield')),
      target TEXT NOT NULL CHECK (target IN ('self', 'enemy', 'ally')),
      
      -- Instant effect values
      value_min INTEGER DEFAULT 0,
      value_max INTEGER DEFAULT 0,
      
      -- Over-time effects (DOT/HOT)
      is_periodic INTEGER DEFAULT 0,
      tick_interval INTEGER DEFAULT 2,
      tick_count INTEGER DEFAULT 0,
      tick_value INTEGER DEFAULT 0,
      
      -- Stat modifications (buffs/debuffs)
      stat_affected TEXT,
      
      -- Scaling
      stat_scaling TEXT,
      scaling_factor REAL DEFAULT 0,
      
      -- Duration
      duration INTEGER DEFAULT 0,
      
      -- Conditions
      chance REAL DEFAULT 1.0 CHECK (chance >= 0 AND chance <= 1.0),
      requires_buff TEXT,
      
      -- Special properties
      drain_percent REAL DEFAULT 0,
      shield_amount INTEGER DEFAULT 0,
      stacks_max INTEGER DEFAULT 1,
      
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      
      FOREIGN KEY (ability_id) REFERENCES abilities(id) ON DELETE CASCADE
    )
  `);
  console.log('✓ ability_effects table created\n');

  // Step 2: Create index for fast lookups
  console.log('📊 Creating indexes...');
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_ability_effects_ability_id 
    ON ability_effects(ability_id)
  `);
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_ability_effects_type 
    ON ability_effects(effect_type)
  `);
  console.log('✓ Indexes created\n');

  // Step 3: Migrate existing abilities to new system
  console.log('🔄 Migrating existing abilities...');
  
  // Get all existing abilities
  const abilities = await db.execute('SELECT * FROM abilities');
  console.log(`Found ${abilities.rows.length} abilities to migrate`);
  
  let migrated = 0;
  for (const ability of abilities.rows) {
    const effects = [];
    
    // Convert damage abilities
    if (ability.damage_min > 0 || ability.damage_max > 0) {
      effects.push({
        ability_id: ability.id,
        effect_order: effects.length,
        effect_type: 'damage',
        target: 'enemy',
        value_min: ability.damage_min,
        value_max: ability.damage_max,
        stat_scaling: ability.primary_stat,
        scaling_factor: ability.stat_scaling || 0,
      });
    }
    
    // Convert healing abilities
    if (ability.healing > 0) {
      effects.push({
        ability_id: ability.id,
        effect_order: effects.length,
        effect_type: 'heal',
        target: 'self',
        value_min: ability.healing,
        value_max: ability.healing,
        stat_scaling: ability.primary_stat,
        scaling_factor: ability.stat_scaling || 0,
      });
    }
    
    // Convert buff abilities
    if (ability.buff_stat && ability.buff_amount > 0) {
      effects.push({
        ability_id: ability.id,
        effect_order: effects.length,
        effect_type: 'buff',
        target: 'self',
        stat_affected: ability.buff_stat,
        value_min: ability.buff_amount,
        value_max: ability.buff_amount,
        duration: ability.buff_duration || 0,
      });
    }
    
    // Insert effects
    for (const effect of effects) {
      await db.execute({
        sql: `
          INSERT INTO ability_effects (
            ability_id, effect_order, effect_type, target,
            value_min, value_max, stat_affected, stat_scaling,
            scaling_factor, duration
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          effect.ability_id,
          effect.effect_order,
          effect.effect_type,
          effect.target,
          effect.value_min || 0,
          effect.value_max || 0,
          effect.stat_affected || null,
          effect.stat_scaling || null,
          effect.scaling_factor || 0,
          effect.duration || 0,
        ],
      });
      migrated++;
    }
  }
  
  console.log(`✓ Migrated ${migrated} effects from ${abilities.rows.length} abilities\n`);

  // Step 4: Verify migration
  console.log('🔍 Verifying migration...');
  const effectCount = await db.execute('SELECT COUNT(*) as count FROM ability_effects');
  console.log(`Total effects in database: ${effectCount.rows[0].count}\n`);

  console.log('✅ Migration complete!\n');
  console.log('Next steps:');
  console.log('1. Update TypeScript types');
  console.log('2. Create EffectProcessor class');
  console.log('3. Update CombatEngine to use new effects');
  console.log('4. Add UI for DOTs/HOTs/Debuffs');
  console.log('5. Create new abilities with multiple effects!');
}

migrate().catch(console.error);
