import { createClient } from '@libsql/client';
import 'dotenv/config';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function createAbility(ability, effects, scroll) {
  // Create ability
  const abilityResult = await db.execute({
    sql: `
      INSERT INTO abilities (
        name, description, type, category,
        mana_cost, cooldown, primary_stat,
        required_level, required_strength, required_dexterity,
        required_intelligence, required_wisdom, level
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING id
    `,
    args: [
      ability.name,
      ability.description,
      ability.type,
      ability.category,
      ability.mana_cost,
      ability.cooldown,
      ability.primary_stat,
      ability.required_level,
      ability.required_strength || 0,
      ability.required_dexterity || 0,
      ability.required_intelligence || 0,
      ability.required_wisdom || 0,
      ability.level || 1,
    ],
  });

  const abilityId = abilityResult.rows[0].id;
  console.log(`✓ Created ability: ${ability.name} (ID: ${abilityId})`);

  // Create effects
  for (const effect of effects) {
    await db.execute({
      sql: `
        INSERT INTO ability_effects (
          ability_id, effect_order, effect_type, target,
          value_min, value_max, is_periodic, tick_value,
          tick_interval, tick_count, stat_affected,
          stat_scaling, scaling_factor, duration,
          chance, drain_percent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        abilityId,
        effect.order,
        effect.type,
        effect.target,
        effect.value_min || 0,
        effect.value_max || 0,
        effect.is_periodic ? 1 : 0,
        effect.tick_value || 0,
        effect.tick_interval || 2,
        effect.tick_count || 0,
        effect.stat_affected || null,
        effect.stat_scaling || null,
        effect.scaling_factor || 0,
        effect.duration || 0,
        effect.chance || 1.0,
        effect.drain_percent || 0,
      ],
    });
  }
  console.log(`  Added ${effects.length} effect(s)`);

  // Create scroll
  if (scroll) {
    await db.execute({
      sql: `
        INSERT INTO items (
          name, description, type, rarity, value,
          stackable, teaches_ability_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        scroll.name,
        scroll.description,
        'scroll',
        scroll.rarity,
        scroll.value,
        1,
        abilityId,
      ],
    });
    console.log(`  Created scroll: ${scroll.name}\n`);
  }

  return abilityId;
}

async function main() {
  console.log('🔮 Creating Advanced Abilities...\n');

  // 1. Poison Strike (Instant + DOT)
  await createAbility(
    {
      name: 'Poison Strike',
      description: 'Strike with a poisoned blade, dealing immediate damage and poisoning the target',
      type: 'ability',
      category: 'damage',
      mana_cost: 0,
      cooldown: 12,
      primary_stat: 'dexterity',
      required_level: 5,
      required_dexterity: 15,
      level: 1,
    },
    [
      {
        order: 0,
        type: 'damage',
        target: 'enemy',
        value_min: 8,
        value_max: 12,
        stat_scaling: 'dexterity',
        scaling_factor: 0.3,
      },
      {
        order: 1,
        type: 'dot',
        target: 'enemy',
        is_periodic: true,
        tick_value: 5,
        tick_interval: 2,
        tick_count: 5,
        stat_scaling: 'dexterity',
        scaling_factor: 0.2,
        chance: 0.8,
      },
    ],
    {
      name: 'Scroll: Poison Strike',
      description: 'Learn the Poison Strike ability - deal damage and poison your target',
      rarity: 'uncommon',
      value: 250,
    }
  );

  // 2. Scorching Fireball (Instant + Burn DOT)
  await createAbility(
    {
      name: 'Scorching Fireball',
      description: 'Hurl a massive fireball that burns the target over time',
      type: 'spell',
      category: 'damage',
      mana_cost: 35,
      cooldown: 10,
      primary_stat: 'intelligence',
      required_level: 8,
      required_intelligence: 25,
      level: 2,
    },
    [
      {
        order: 0,
        type: 'damage',
        target: 'enemy',
        value_min: 25,
        value_max: 40,
        stat_scaling: 'intelligence',
        scaling_factor: 0.7,
      },
      {
        order: 1,
        type: 'dot',
        target: 'enemy',
        is_periodic: true,
        tick_value: 8,
        tick_interval: 2,
        tick_count: 4,
        stat_scaling: 'intelligence',
        scaling_factor: 0.3,
      },
    ],
    {
      name: 'Scroll: Scorching Fireball',
      description: 'Learn Scorching Fireball - a devastating spell that leaves enemies burning',
      rarity: 'rare',
      value: 500,
    }
  );

  // 3. Regeneration (Instant + HOT)
  await createAbility(
    {
      name: 'Regeneration',
      description: 'Heal yourself immediately and continue healing over time',
      type: 'spell',
      category: 'heal',
      mana_cost: 30,
      cooldown: 15,
      primary_stat: 'wisdom',
      required_level: 6,
      required_wisdom: 20,
      level: 1,
    },
    [
      {
        order: 0,
        type: 'heal',
        target: 'self',
        value_min: 15,
        value_max: 20,
        stat_scaling: 'wisdom',
        scaling_factor: 0.4,
      },
      {
        order: 1,
        type: 'hot',
        target: 'self',
        is_periodic: true,
        tick_value: 8,
        tick_interval: 3,
        tick_count: 5,
        stat_scaling: 'wisdom',
        scaling_factor: 0.2,
      },
    ],
    {
      name: 'Scroll: Regeneration',
      description: 'Learn Regeneration - heal yourself over time',
      rarity: 'uncommon',
      value: 300,
    }
  );

  // 4. Life Drain
  await createAbility(
    {
      name: 'Life Drain',
      description: 'Drain life force from your enemy, healing yourself',
      type: 'spell',
      category: 'damage',
      mana_cost: 40,
      cooldown: 12,
      primary_stat: 'intelligence',
      required_level: 10,
      required_intelligence: 30,
      level: 2,
    },
    [
      {
        order: 0,
        type: 'drain',
        target: 'enemy',
        value_min: 20,
        value_max: 35,
        stat_scaling: 'intelligence',
        scaling_factor: 0.6,
        drain_percent: 0.5,
      },
    ],
    {
      name: 'Scroll: Life Drain',
      description: 'Learn Life Drain - steal life from your enemies',
      rarity: 'rare',
      value: 600,
    }
  );

  // 5. Shadow Corruption (DOT only, no instant damage)
  await createAbility(
    {
      name: 'Shadow Corruption',
      description: 'Curse your enemy with creeping corruption',
      type: 'spell',
      category: 'damage',
      mana_cost: 25,
      cooldown: 15,
      primary_stat: 'intelligence',
      required_level: 7,
      required_intelligence: 22,
      level: 1,
    },
    [
      {
        order: 0,
        type: 'dot',
        target: 'enemy',
        is_periodic: true,
        tick_value: 12,
        tick_interval: 3,
        tick_count: 4,
        stat_scaling: 'intelligence',
        scaling_factor: 0.4,
      },
    ],
    {
      name: 'Scroll: Shadow Corruption',
      description: 'Learn Shadow Corruption - inflict slow, creeping damage',
      rarity: 'uncommon',
      value: 350,
    }
  );

  console.log('✅ All advanced abilities created!');
  console.log('\nAbilities created:');
  console.log('1. Poison Strike - Instant damage + Poison DOT');
  console.log('2. Scorching Fireball - Instant damage + Burn DOT');
  console.log('3. Regeneration - Instant heal + HoT');
  console.log('4. Life Drain - Damage enemy + Heal self');
  console.log('5. Shadow Corruption - Pure DOT');
}

main().catch(console.error);
