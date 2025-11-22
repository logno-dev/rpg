import { createClient } from '@libsql/client';
import 'dotenv/config';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function checkShadowBolt() {
  console.log('🔍 Checking Shadow Bolt configuration...\n');
  
  // Get Shadow Bolt ability
  const abilityResult = await db.execute({
    sql: 'SELECT * FROM abilities WHERE name = ?',
    args: ['Shadow Bolt'],
  });
  
  if (abilityResult.rows.length === 0) {
    console.log('❌ Shadow Bolt not found in database!');
    return;
  }
  
  const ability = abilityResult.rows[0];
  console.log('✅ Ability found:');
  console.log('  ID:', ability.id);
  console.log('  Name:', ability.name);
  console.log('  Mana Cost:', ability.mana_cost);
  console.log('  Cooldown:', ability.cooldown);
  console.log('  Primary Stat:', ability.primary_stat);
  console.log('  Required Level:', ability.required_level);
  console.log('  Required Intelligence:', ability.required_intelligence);
  console.log('');
  
  // Get Shadow Bolt effects
  const effectsResult = await db.execute({
    sql: 'SELECT * FROM ability_effects WHERE ability_id = ? ORDER BY effect_order',
    args: [ability.id],
  });
  
  console.log(`📊 Effects (${effectsResult.rows.length}):`);
  for (const effect of effectsResult.rows) {
    console.log('  Effect Type:', effect.effect_type);
    console.log('  Target:', effect.target);
    console.log('  Value Min:', effect.value_min);
    console.log('  Value Max:', effect.value_max);
    console.log('  Stat Scaling:', effect.stat_scaling);
    console.log('  Scaling Factor:', effect.scaling_factor);
    console.log('  Is Periodic:', effect.is_periodic);
    console.log('');
  }
  
  // Test damage calculation
  console.log('🧪 Test Damage Calculation:');
  console.log('  With 10 INT (base): 12-18 damage (no scaling bonus)');
  console.log('  With 20 INT: 12-18 + (20-10)*0.5 = 12-18 + 5 = 17-23 damage');
  console.log('  With 30 INT: 12-18 + (30-10)*0.5 = 12-18 + 10 = 22-28 damage');
}

checkShadowBolt().catch(console.error);
