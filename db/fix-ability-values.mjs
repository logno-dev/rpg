#!/usr/bin/env node
import { createClient } from '@libsql/client';
import 'dotenv/config';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function fixAbilityValues() {
  console.log('🔧 Fixing ability values from ability_effects...\n');

  // Get all abilities
  const abilitiesResult = await db.execute('SELECT id, name FROM abilities ORDER BY name');
  const abilities = abilitiesResult.rows;

  console.log(`Found ${abilities.length} abilities\n`);

  let fixedCount = 0;

  for (const ability of abilities) {
    // Get all effects for this ability
    const effectsResult = await db.execute({
      sql: 'SELECT effect_type, value_min, value_max FROM ability_effects WHERE ability_id = ? ORDER BY effect_order',
      args: [ability.id],
    });

    const effects = effectsResult.rows;

    if (effects.length === 0) {
      console.log(`⚠️  ${ability.name}: No effects found`);
      continue;
    }

    // Calculate values from effects
    let damageMin = 0;
    let damageMax = 0;
    let healing = 0;

    for (const effect of effects) {
      if (effect.effect_type === 'damage' || effect.effect_type === 'dot' || effect.effect_type === 'drain') {
        damageMin += Number(effect.value_min || 0);
        damageMax += Number(effect.value_max || 0);
      } else if (effect.effect_type === 'heal' || effect.effect_type === 'hot') {
        healing += Number(effect.value_max || 0); // Use max for healing
      }
    }

    // Update abilities table
    await db.execute({
      sql: 'UPDATE abilities SET damage_min = ?, damage_max = ?, healing = ? WHERE id = ?',
      args: [damageMin, damageMax, healing, ability.id],
    });

    if (damageMin > 0 || damageMax > 0 || healing > 0) {
      console.log(`✅ ${ability.name}: dmg=${damageMin}-${damageMax}, heal=${healing}`);
      fixedCount++;
    }
  }

  console.log(`\n✅ Fixed ${fixedCount} abilities`);
}

fixAbilityValues().catch(console.error);
