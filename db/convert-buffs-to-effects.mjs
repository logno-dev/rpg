import Database from 'better-sqlite3';

const db = new Database('game.db');

console.log('Converting buff abilities to use ability_effects system...\n');

// Find all abilities with buff data in old columns
const buffAbilities = db.prepare(`
  SELECT id, name, buff_stat, buff_amount, buff_duration, stat_scaling, scaling_factor
  FROM abilities 
  WHERE category = 'buff' 
  AND buff_stat IS NOT NULL
`).all();

console.log(`Found ${buffAbilities.length} buff abilities to convert:\n`);

for (const ability of buffAbilities) {
  console.log(`\nConverting: ${ability.name}`);
  console.log(`  Current: +${ability.buff_amount} ${ability.buff_stat} for ${ability.buff_duration}s`);
  console.log(`  Scaling: ${ability.stat_scaling || 'none'} x${ability.scaling_factor || 0}`);
  
  // Check if effect already exists
  const existingEffect = db.prepare(`
    SELECT * FROM ability_effects 
    WHERE ability_id = ? AND effect_type = 'buff'
  `).get(ability.id);
  
  if (existingEffect) {
    console.log(`  ⚠️  Effect already exists - skipping`);
    continue;
  }
  
  // Create the effect
  db.prepare(`
    INSERT INTO ability_effects (
      ability_id,
      effect_type,
      target,
      stat_affected,
      value_min,
      value_max,
      stat_scaling,
      scaling_factor,
      duration,
      chance,
      effect_order,
      is_periodic
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    ability.id,
    'buff',
    'self',
    ability.buff_stat,
    ability.buff_amount, // Use as base value
    ability.buff_amount, // Same for max (no variance)
    ability.stat_scaling || ability.stat_scaling, // Use existing scaling if set
    ability.scaling_factor || 0, // Use existing scaling factor
    ability.buff_duration,
    1.0, // 100% chance
    1, // First effect
    0 // Not periodic
  );
  
  console.log(`  ✅ Created effect in ability_effects table`);
}

console.log('\n\nDone! Buffs now use the ability_effects system with stat scaling.');
console.log('\nNote: The old buff_stat, buff_amount, buff_duration columns are still in the abilities table.');
console.log('They will be ignored in favor of the ability_effects system.\n');
