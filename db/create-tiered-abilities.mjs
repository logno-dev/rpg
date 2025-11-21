import { createClient } from '@libsql/client';
import 'dotenv/config';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function createAbility(ability, effects, scroll) {
  let abilityId;
  
  try {
    const abilityResult = await db.execute({
      sql: `
        INSERT INTO abilities (
          name, description, type, category,
          mana_cost, cooldown, primary_stat,
          required_level, required_strength, required_dexterity,
          required_intelligence, required_wisdom, required_charisma,
          base_id, level
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        ability.required_charisma || 0,
        ability.base_id || null,
        ability.tier || 1,
      ],
    });

    abilityId = abilityResult.rows[0].id;

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
    }
  } catch (error) {
    console.error('Error creating ability:', ability.name);
    console.error('Ability data:', JSON.stringify(ability, null, 2));
    console.error('Effects data:', JSON.stringify(effects, null, 2));
    throw error;
  }

  return abilityId;
}

// Helper to create tiered abilities
async function createTieredAbility(baseName, baseDesc, config, tiers) {
  console.log(`\n${baseName}:`);
  let baseId = null;
  
  for (const tier of tiers) {
    const tierName = `${baseName} ${['I', 'II', 'III', 'IV', 'V', 'VI'][tier.tier - 1]}`;
    
    const abilityId = await createAbility(
      {
        name: tierName,
        description: baseDesc,
        type: config.type,
        category: config.category,
        mana_cost: tier.mana_cost || config.base_mana_cost || 0,
        cooldown: config.cooldown || 0,
        primary_stat: config.primary_stat,
        required_level: tier.level,
        required_strength: tier.required_strength || 0,
        required_dexterity: tier.required_dexterity || 0,
        required_intelligence: tier.required_intelligence || 0,
        required_wisdom: tier.required_wisdom || 0,
        tier: tier.tier,
        base_id: baseId || null,
      },
      tier.effects,
      {
        name: `Scroll: ${tierName}`,
        description: `Learn ${tierName} - ${baseDesc}`,
        rarity: tier.rarity,
        value: tier.scroll_value,
      }
    );
    
    if (!baseId) baseId = abilityId;
    console.log(`  ✓ ${tierName} (Lv${tier.level})`);
  }
}

async function main() {
  console.log('🔮 Creating Tiered Ability System...\n');

  // ==================== PHYSICAL ABILITIES ====================
  console.log('⚔️  PHYSICAL ABILITIES');

  // REND - Bleed damage
  await createTieredAbility(
    'Rend',
    'Tear through armor with a vicious attack, causing bleeding',
    {
      type: 'ability',
      category: 'damage',
      cooldown: 8,
      primary_stat: 'strength',
    },
    [
      {
        tier: 1, level: 3, required_strength: 12,
        effects: [
          { order: 0, type: 'damage', target: 'enemy', value_min: 8, value_max: 12, stat_scaling: 'strength', scaling_factor: 0.3 },
          { order: 1, type: 'dot', target: 'enemy', is_periodic: true, tick_value: 3, tick_interval: 2, tick_count: 4, stat_scaling: 'strength', scaling_factor: 0.1 },
        ],
        rarity: 'common', scroll_value: 150,
      },
      {
        tier: 2, level: 10, required_strength: 22,
        effects: [
          { order: 0, type: 'damage', target: 'enemy', value_min: 15, value_max: 22, stat_scaling: 'strength', scaling_factor: 0.4 },
          { order: 1, type: 'dot', target: 'enemy', is_periodic: true, tick_value: 6, tick_interval: 2, tick_count: 4, stat_scaling: 'strength', scaling_factor: 0.15 },
        ],
        rarity: 'uncommon', scroll_value: 400,
      },
      {
        tier: 3, level: 18, required_strength: 38,
        effects: [
          { order: 0, type: 'damage', target: 'enemy', value_min: 28, value_max: 38, stat_scaling: 'strength', scaling_factor: 0.5 },
          { order: 1, type: 'dot', target: 'enemy', is_periodic: true, tick_value: 10, tick_interval: 2, tick_count: 5, stat_scaling: 'strength', scaling_factor: 0.2 },
        ],
        rarity: 'rare', scroll_value: 800,
      },
      {
        tier: 4, level: 30, required_strength: 58,
        effects: [
          { order: 0, type: 'damage', target: 'enemy', value_min: 45, value_max: 60, stat_scaling: 'strength', scaling_factor: 0.7 },
          { order: 1, type: 'dot', target: 'enemy', is_periodic: true, tick_value: 15, tick_interval: 2, tick_count: 6, stat_scaling: 'strength', scaling_factor: 0.3 },
        ],
        rarity: 'epic', scroll_value: 1500,
      },
      {
        tier: 5, level: 45, required_strength: 85,
        effects: [
          { order: 0, type: 'damage', target: 'enemy', value_min: 70, value_max: 95, stat_scaling: 'strength', scaling_factor: 1.0 },
          { order: 1, type: 'dot', target: 'enemy', is_periodic: true, tick_value: 25, tick_interval: 2, tick_count: 7, stat_scaling: 'strength', scaling_factor: 0.4 },
        ],
        rarity: 'legendary', scroll_value: 3000,
      },
    ]
  );

  // BACKSTAB - High burst dexterity
  await createTieredAbility(
    'Backstab',
    'Strike from the shadows for devastating damage',
    {
      type: 'ability',
      category: 'damage',
      cooldown: 12,
      primary_stat: 'dexterity',
    },
    [
      {
        tier: 1, level: 5, required_dexterity: 16,
        effects: [
          { order: 0, type: 'damage', target: 'enemy', value_min: 18, value_max: 28, stat_scaling: 'dexterity', scaling_factor: 0.6 },
        ],
        rarity: 'common', scroll_value: 200,
      },
      {
        tier: 2, level: 12, required_dexterity: 28,
        effects: [
          { order: 0, type: 'damage', target: 'enemy', value_min: 32, value_max: 48, stat_scaling: 'dexterity', scaling_factor: 0.8 },
        ],
        rarity: 'uncommon', scroll_value: 500,
      },
      {
        tier: 3, level: 22, required_dexterity: 45,
        effects: [
          { order: 0, type: 'damage', target: 'enemy', value_min: 55, value_max: 80, stat_scaling: 'dexterity', scaling_factor: 1.0 },
        ],
        rarity: 'rare', scroll_value: 1100,
      },
      {
        tier: 4, level: 35, required_dexterity: 68,
        effects: [
          { order: 0, type: 'damage', target: 'enemy', value_min: 85, value_max: 120, stat_scaling: 'dexterity', scaling_factor: 1.3 },
        ],
        rarity: 'epic', scroll_value: 2000,
      },
      {
        tier: 5, level: 50, required_dexterity: 100,
        effects: [
          { order: 0, type: 'damage', target: 'enemy', value_min: 130, value_max: 180, stat_scaling: 'dexterity', scaling_factor: 1.6 },
        ],
        rarity: 'legendary', scroll_value: 4000,
      },
    ]
  );

  // EXECUTE - Finishing move
  await createTieredAbility(
    'Execute',
    'Deliver a killing blow with all your might',
    {
      type: 'ability',
      category: 'damage',
      cooldown: 15,
      primary_stat: 'strength',
    },
    [
      {
        tier: 1, level: 8, required_strength: 20,
        effects: [
          { order: 0, type: 'damage', target: 'enemy', value_min: 25, value_max: 40, stat_scaling: 'strength', scaling_factor: 0.7 },
        ],
        rarity: 'uncommon', scroll_value: 350,
      },
      {
        tier: 2, level: 16, required_strength: 35,
        effects: [
          { order: 0, type: 'damage', target: 'enemy', value_min: 45, value_max: 65, stat_scaling: 'strength', scaling_factor: 0.9 },
        ],
        rarity: 'rare', scroll_value: 750,
      },
      {
        tier: 3, level: 26, required_strength: 52,
        effects: [
          { order: 0, type: 'damage', target: 'enemy', value_min: 70, value_max: 100, stat_scaling: 'strength', scaling_factor: 1.1 },
        ],
        rarity: 'rare', scroll_value: 1300,
      },
      {
        tier: 4, level: 38, required_strength: 72,
        effects: [
          { order: 0, type: 'damage', target: 'enemy', value_min: 105, value_max: 145, stat_scaling: 'strength', scaling_factor: 1.4 },
        ],
        rarity: 'epic', scroll_value: 2300,
      },
      {
        tier: 5, level: 52, required_strength: 105,
        effects: [
          { order: 0, type: 'damage', target: 'enemy', value_min: 160, value_max: 220, stat_scaling: 'strength', scaling_factor: 1.8 },
        ],
        rarity: 'legendary', scroll_value: 4200,
      },
    ]
  );

  // ==================== FIRE SPELLS ====================
  console.log('🔥 FIRE SPELLS');

  // FIREBALL
  await createTieredAbility(
    'Fireball',
    'Hurl a fireball that burns your target',
    {
      type: 'spell',
      category: 'damage',
      cooldown: 8,
      primary_stat: 'intelligence',
      base_mana_cost: 20,
    },
    [
      {
        tier: 1, level: 2, required_intelligence: 12, mana_cost: 15,
        effects: [
          { order: 0, type: 'damage', target: 'enemy', value_min: 10, value_max: 16, stat_scaling: 'intelligence', scaling_factor: 0.4 },
          { order: 1, type: 'dot', target: 'enemy', is_periodic: true, tick_value: 4, tick_interval: 2, tick_count: 3, stat_scaling: 'intelligence', scaling_factor: 0.15 },
        ],
        rarity: 'common', scroll_value: 100,
      },
      {
        tier: 2, level: 10, required_intelligence: 24, mana_cost: 25,
        effects: [
          { order: 0, type: 'damage', target: 'enemy', value_min: 22, value_max: 32, stat_scaling: 'intelligence', scaling_factor: 0.5 },
          { order: 1, type: 'dot', target: 'enemy', is_periodic: true, tick_value: 7, tick_interval: 2, tick_count: 4, stat_scaling: 'intelligence', scaling_factor: 0.2 },
        ],
        rarity: 'uncommon', scroll_value: 450,
      },
      {
        tier: 3, level: 20, required_intelligence: 42, mana_cost: 40,
        effects: [
          { order: 0, type: 'damage', target: 'enemy', value_min: 40, value_max: 58, stat_scaling: 'intelligence', scaling_factor: 0.7 },
          { order: 1, type: 'dot', target: 'enemy', is_periodic: true, tick_value: 12, tick_interval: 2, tick_count: 4, stat_scaling: 'intelligence', scaling_factor: 0.3 },
        ],
        rarity: 'rare', scroll_value: 1000,
      },
      {
        tier: 4, level: 32, required_intelligence: 62, mana_cost: 60,
        effects: [
          { order: 0, type: 'damage', target: 'enemy', value_min: 65, value_max: 90, stat_scaling: 'intelligence', scaling_factor: 1.0 },
          { order: 1, type: 'dot', target: 'enemy', is_periodic: true, tick_value: 18, tick_interval: 2, tick_count: 5, stat_scaling: 'intelligence', scaling_factor: 0.4 },
        ],
        rarity: 'epic', scroll_value: 1900,
      },
      {
        tier: 5, level: 46, required_intelligence: 90, mana_cost: 85,
        effects: [
          { order: 0, type: 'damage', target: 'enemy', value_min: 100, value_max: 140, stat_scaling: 'intelligence', scaling_factor: 1.4 },
          { order: 1, type: 'dot', target: 'enemy', is_periodic: true, tick_value: 28, tick_interval: 2, tick_count: 6, stat_scaling: 'intelligence', scaling_factor: 0.6 },
        ],
        rarity: 'legendary', scroll_value: 3500,
      },
      {
        tier: 6, level: 58, required_intelligence: 115, mana_cost: 110,
        effects: [
          { order: 0, type: 'damage', target: 'enemy', value_min: 150, value_max: 210, stat_scaling: 'intelligence', scaling_factor: 1.8 },
          { order: 1, type: 'dot', target: 'enemy', is_periodic: true, tick_value: 40, tick_interval: 2, tick_count: 7, stat_scaling: 'intelligence', scaling_factor: 0.8 },
        ],
        rarity: 'legendary', scroll_value: 5500,
      },
    ]
  );

  // ==================== FROST SPELLS ====================
  console.log('❄️  FROST SPELLS');

  // FROSTBOLT
  await createTieredAbility(
    'Frostbolt',
    'Fire a bolt of freezing ice at your enemy',
    {
      type: 'spell',
      category: 'damage',
      cooldown: 5,
      primary_stat: 'intelligence',
    },
    [
      {
        tier: 1, level: 3, required_intelligence: 13, mana_cost: 18,
        effects: [
          { order: 0, type: 'damage', target: 'enemy', value_min: 10, value_max: 16, stat_scaling: 'intelligence', scaling_factor: 0.45 },
        ],
        rarity: 'common', scroll_value: 120,
      },
      {
        tier: 2, level: 11, required_intelligence: 26, mana_cost: 28,
        effects: [
          { order: 0, type: 'damage', target: 'enemy', value_min: 24, value_max: 34, stat_scaling: 'intelligence', scaling_factor: 0.6 },
        ],
        rarity: 'uncommon', scroll_value: 480,
      },
      {
        tier: 3, level: 21, required_intelligence: 43, mana_cost: 42,
        effects: [
          { order: 0, type: 'damage', target: 'enemy', value_min: 42, value_max: 58, stat_scaling: 'intelligence', scaling_factor: 0.8 },
        ],
        rarity: 'rare', scroll_value: 1050,
      },
      {
        tier: 4, level: 33, required_intelligence: 64, mana_cost: 60,
        effects: [
          { order: 0, type: 'damage', target: 'enemy', value_min: 68, value_max: 92, stat_scaling: 'intelligence', scaling_factor: 1.1 },
        ],
        rarity: 'epic', scroll_value: 1950,
      },
      {
        tier: 5, level: 47, required_intelligence: 92, mana_cost: 82,
        effects: [
          { order: 0, type: 'damage', target: 'enemy', value_min: 105, value_max: 145, stat_scaling: 'intelligence', scaling_factor: 1.5 },
        ],
        rarity: 'legendary', scroll_value: 3600,
      },
    ]
  );

  // BLIZZARD
  await createTieredAbility(
    'Blizzard',
    'Call down a freezing blizzard upon your enemy',
    {
      type: 'spell',
      category: 'damage',
      cooldown: 16,
      primary_stat: 'intelligence',
    },
    [
      {
        tier: 1, level: 15, required_intelligence: 32, mana_cost: 40,
        effects: [
          { order: 0, type: 'damage', target: 'enemy', value_min: 35, value_max: 50, stat_scaling: 'intelligence', scaling_factor: 0.7 },
          { order: 1, type: 'dot', target: 'enemy', is_periodic: true, tick_value: 10, tick_interval: 2, tick_count: 4, stat_scaling: 'intelligence', scaling_factor: 0.25 },
        ],
        rarity: 'rare', scroll_value: 700,
      },
      {
        tier: 2, level: 27, required_intelligence: 54, mana_cost: 60,
        effects: [
          { order: 0, type: 'damage', target: 'enemy', value_min: 60, value_max: 85, stat_scaling: 'intelligence', scaling_factor: 0.95 },
          { order: 1, type: 'dot', target: 'enemy', is_periodic: true, tick_value: 18, tick_interval: 2, tick_count: 5, stat_scaling: 'intelligence', scaling_factor: 0.35 },
        ],
        rarity: 'epic', scroll_value: 1400,
      },
      {
        tier: 3, level: 41, required_intelligence: 78, mana_cost: 85,
        effects: [
          { order: 0, type: 'damage', target: 'enemy', value_min: 95, value_max: 130, stat_scaling: 'intelligence', scaling_factor: 1.3 },
          { order: 1, type: 'dot', target: 'enemy', is_periodic: true, tick_value: 28, tick_interval: 2, tick_count: 6, stat_scaling: 'intelligence', scaling_factor: 0.5 },
        ],
        rarity: 'epic', scroll_value: 2600,
      },
      {
        tier: 4, level: 55, required_intelligence: 110, mana_cost: 115,
        effects: [
          { order: 0, type: 'damage', target: 'enemy', value_min: 145, value_max: 200, stat_scaling: 'intelligence', scaling_factor: 1.7 },
          { order: 1, type: 'dot', target: 'enemy', is_periodic: true, tick_value: 42, tick_interval: 2, tick_count: 7, stat_scaling: 'intelligence', scaling_factor: 0.7 },
        ],
        rarity: 'legendary', scroll_value: 5000,
      },
    ]
  );

  // ==================== SHADOW SPELLS ====================
  console.log('🌑 SHADOW SPELLS');

  // SHADOW BOLT
  await createTieredAbility(
    'Shadow Bolt',
    'Fire a bolt of dark energy at your enemy',
    {
      type: 'spell',
      category: 'damage',
      cooldown: 6,
      primary_stat: 'intelligence',
    },
    [
      {
        tier: 1, level: 4, required_intelligence: 15, mana_cost: 20,
        effects: [
          { order: 0, type: 'damage', target: 'enemy', value_min: 12, value_max: 18, stat_scaling: 'intelligence', scaling_factor: 0.5 },
        ],
        rarity: 'common', scroll_value: 150,
      },
      {
        tier: 2, level: 13, required_intelligence: 30, mana_cost: 32,
        effects: [
          { order: 0, type: 'damage', target: 'enemy', value_min: 28, value_max: 40, stat_scaling: 'intelligence', scaling_factor: 0.65 },
        ],
        rarity: 'uncommon', scroll_value: 550,
      },
      {
        tier: 3, level: 24, required_intelligence: 48, mana_cost: 48,
        effects: [
          { order: 0, type: 'damage', target: 'enemy', value_min: 50, value_max: 70, stat_scaling: 'intelligence', scaling_factor: 0.85 },
        ],
        rarity: 'rare', scroll_value: 1200,
      },
      {
        tier: 4, level: 37, required_intelligence: 70, mana_cost: 68,
        effects: [
          { order: 0, type: 'damage', target: 'enemy', value_min: 80, value_max: 110, stat_scaling: 'intelligence', scaling_factor: 1.15 },
        ],
        rarity: 'epic', scroll_value: 2200,
      },
      {
        tier: 5, level: 51, required_intelligence: 102, mana_cost: 92,
        effects: [
          { order: 0, type: 'damage', target: 'enemy', value_min: 125, value_max: 170, stat_scaling: 'intelligence', scaling_factor: 1.6 },
        ],
        rarity: 'legendary', scroll_value: 4000,
      },
    ]
  );

  // LIFE DRAIN
  await createTieredAbility(
    'Life Drain',
    'Drain life force from your enemy, healing yourself',
    {
      type: 'spell',
      category: 'damage',
      cooldown: 12,
      primary_stat: 'intelligence',
    },
    [
      {
        tier: 1, level: 7, required_intelligence: 20, mana_cost: 30,
        effects: [
          { order: 0, type: 'drain', target: 'enemy', value_min: 15, value_max: 22, stat_scaling: 'intelligence', scaling_factor: 0.5, drain_percent: 0.35 },
        ],
        rarity: 'uncommon', scroll_value: 350,
      },
      {
        tier: 2, level: 17, required_intelligence: 36, mana_cost: 45,
        effects: [
          { order: 0, type: 'drain', target: 'enemy', value_min: 30, value_max: 42, stat_scaling: 'intelligence', scaling_factor: 0.65, drain_percent: 0.4 },
        ],
        rarity: 'rare', scroll_value: 800,
      },
      {
        tier: 3, level: 29, required_intelligence: 56, mana_cost: 65,
        effects: [
          { order: 0, type: 'drain', target: 'enemy', value_min: 52, value_max: 72, stat_scaling: 'intelligence', scaling_factor: 0.85, drain_percent: 0.45 },
        ],
        rarity: 'rare', scroll_value: 1500,
      },
      {
        tier: 4, level: 43, required_intelligence: 82, mana_cost: 90,
        effects: [
          { order: 0, type: 'drain', target: 'enemy', value_min: 85, value_max: 115, stat_scaling: 'intelligence', scaling_factor: 1.15, drain_percent: 0.5 },
        ],
        rarity: 'epic', scroll_value: 2800,
      },
      {
        tier: 5, level: 57, required_intelligence: 114, mana_cost: 120,
        effects: [
          { order: 0, type: 'drain', target: 'enemy', value_min: 135, value_max: 180, stat_scaling: 'intelligence', scaling_factor: 1.5, drain_percent: 0.6 },
        ],
        rarity: 'legendary', scroll_value: 5000,
      },
    ]
  );

  // ==================== HEALING SPELLS ====================
  console.log('💚 HEALING SPELLS');

  // HEAL
  await createTieredAbility(
    'Heal',
    'Restore health with healing magic',
    {
      type: 'spell',
      category: 'heal',
      cooldown: 6,
      primary_stat: 'wisdom',
    },
    [
      {
        tier: 1, level: 1, required_wisdom: 10, mana_cost: 15,
        effects: [
          { order: 0, type: 'heal', target: 'self', value_min: 20, value_max: 30, stat_scaling: 'wisdom', scaling_factor: 0.5 },
        ],
        rarity: 'common', scroll_value: 80,
      },
      {
        tier: 2, level: 8, required_wisdom: 20, mana_cost: 25,
        effects: [
          { order: 0, type: 'heal', target: 'self', value_min: 40, value_max: 55, stat_scaling: 'wisdom', scaling_factor: 0.7 },
        ],
        rarity: 'common', scroll_value: 320,
      },
      {
        tier: 3, level: 16, required_wisdom: 34, mana_cost: 40,
        effects: [
          { order: 0, type: 'heal', target: 'self', value_min: 70, value_max: 95, stat_scaling: 'wisdom', scaling_factor: 0.95 },
        ],
        rarity: 'uncommon', scroll_value: 750,
      },
      {
        tier: 4, level: 28, required_wisdom: 55, mana_cost: 60,
        effects: [
          { order: 0, type: 'heal', target: 'self', value_min: 110, value_max: 145, stat_scaling: 'wisdom', scaling_factor: 1.3 },
        ],
        rarity: 'rare', scroll_value: 1500,
      },
      {
        tier: 5, level: 42, required_wisdom: 80, mana_cost: 85,
        effects: [
          { order: 0, type: 'heal', target: 'self', value_min: 170, value_max: 220, stat_scaling: 'wisdom', scaling_factor: 1.7 },
        ],
        rarity: 'epic', scroll_value: 2800,
      },
      {
        tier: 6, level: 56, required_wisdom: 112, mana_cost: 115,
        effects: [
          { order: 0, type: 'heal', target: 'self', value_min: 260, value_max: 330, stat_scaling: 'wisdom', scaling_factor: 2.2 },
        ],
        rarity: 'legendary', scroll_value: 4800,
      },
    ]
  );

  // REGENERATION
  await createTieredAbility(
    'Regeneration',
    'Heal yourself over time with nature magic',
    {
      type: 'spell',
      category: 'heal',
      cooldown: 15,
      primary_stat: 'wisdom',
    },
    [
      {
        tier: 1, level: 6, required_wisdom: 18, mana_cost: 30,
        effects: [
          { order: 0, type: 'heal', target: 'self', value_min: 15, value_max: 20, stat_scaling: 'wisdom', scaling_factor: 0.4 },
          { order: 1, type: 'hot', target: 'self', is_periodic: true, tick_value: 8, tick_interval: 3, tick_count: 5, stat_scaling: 'wisdom', scaling_factor: 0.3 },
        ],
        rarity: 'uncommon', scroll_value: 300,
      },
      {
        tier: 2, level: 14, required_wisdom: 31, mana_cost: 45,
        effects: [
          { order: 0, type: 'heal', target: 'self', value_min: 30, value_max: 42, stat_scaling: 'wisdom', scaling_factor: 0.5 },
          { order: 1, type: 'hot', target: 'self', is_periodic: true, tick_value: 15, tick_interval: 3, tick_count: 6, stat_scaling: 'wisdom', scaling_factor: 0.4 },
        ],
        rarity: 'uncommon', scroll_value: 650,
      },
      {
        tier: 3, level: 25, required_wisdom: 50, mana_cost: 65,
        effects: [
          { order: 0, type: 'heal', target: 'self', value_min: 55, value_max: 75, stat_scaling: 'wisdom', scaling_factor: 0.7 },
          { order: 1, type: 'hot', target: 'self', is_periodic: true, tick_value: 25, tick_interval: 3, tick_count: 7, stat_scaling: 'wisdom', scaling_factor: 0.5 },
        ],
        rarity: 'rare', scroll_value: 1300,
      },
      {
        tier: 4, level: 39, required_wisdom: 74, mana_cost: 90,
        effects: [
          { order: 0, type: 'heal', target: 'self', value_min: 90, value_max: 120, stat_scaling: 'wisdom', scaling_factor: 1.0 },
          { order: 1, type: 'hot', target: 'self', is_periodic: true, tick_value: 38, tick_interval: 3, tick_count: 8, stat_scaling: 'wisdom', scaling_factor: 0.7 },
        ],
        rarity: 'epic', scroll_value: 2500,
      },
      {
        tier: 5, level: 53, required_wisdom: 106, mana_cost: 120,
        effects: [
          { order: 0, type: 'heal', target: 'self', value_min: 145, value_max: 190, stat_scaling: 'wisdom', scaling_factor: 1.4 },
          { order: 1, type: 'hot', target: 'self', is_periodic: true, tick_value: 55, tick_interval: 3, tick_count: 9, stat_scaling: 'wisdom', scaling_factor: 1.0 },
        ],
        rarity: 'legendary', scroll_value: 4500,
      },
    ]
  );

  // ==================== BUFF SPELLS ====================
  console.log('✨ BUFF SPELLS');

  // STRENGTH BUFF
  await createTieredAbility(
    'Battle Fury',
    'Increase your physical power',
    {
      type: 'spell',
      category: 'buff',
      cooldown: 30,
      primary_stat: 'wisdom',
    },
    [
      {
        tier: 1, level: 10, required_wisdom: 20, mana_cost: 25,
        effects: [
          { order: 0, type: 'buff', target: 'self', stat_affected: 'strength', value_min: 6, value_max: 6, duration: 20 },
        ],
        rarity: 'uncommon', scroll_value: 450,
      },
      {
        tier: 2, level: 22, required_wisdom: 44, mana_cost: 40,
        effects: [
          { order: 0, type: 'buff', target: 'self', stat_affected: 'strength', value_min: 12, value_max: 12, duration: 25 },
        ],
        rarity: 'rare', scroll_value: 1100,
      },
      {
        tier: 3, level: 36, required_wisdom: 68, mana_cost: 60,
        effects: [
          { order: 0, type: 'buff', target: 'self', stat_affected: 'strength', value_min: 20, value_max: 20, duration: 30 },
        ],
        rarity: 'epic', scroll_value: 2100,
      },
      {
        tier: 4, level: 50, required_wisdom: 100, mana_cost: 85,
        effects: [
          { order: 0, type: 'buff', target: 'self', stat_affected: 'strength', value_min: 32, value_max: 32, duration: 40 },
        ],
        rarity: 'legendary', scroll_value: 3800,
      },
    ]
  );

  // INTELLIGENCE BUFF
  await createTieredAbility(
    'Arcane Brilliance',
    'Increase your magical power',
    {
      type: 'spell',
      category: 'buff',
      cooldown: 30,
      primary_stat: 'intelligence',
    },
    [
      {
        tier: 1, level: 12, required_intelligence: 26, mana_cost: 30,
        effects: [
          { order: 0, type: 'buff', target: 'self', stat_affected: 'intelligence', value_min: 8, value_max: 8, duration: 22 },
        ],
        rarity: 'uncommon', scroll_value: 500,
      },
      {
        tier: 2, level: 24, required_intelligence: 48, mana_cost: 45,
        effects: [
          { order: 0, type: 'buff', target: 'self', stat_affected: 'intelligence', value_min: 14, value_max: 14, duration: 28 },
        ],
        rarity: 'rare', scroll_value: 1200,
      },
      {
        tier: 3, level: 38, required_intelligence: 72, mana_cost: 65,
        effects: [
          { order: 0, type: 'buff', target: 'self', stat_affected: 'intelligence', value_min: 22, value_max: 22, duration: 35 },
        ],
        rarity: 'epic', scroll_value: 2300,
      },
      {
        tier: 4, level: 52, required_intelligence: 104, mana_cost: 90,
        effects: [
          { order: 0, type: 'buff', target: 'self', stat_affected: 'intelligence', value_min: 35, value_max: 35, duration: 45 },
        ],
        rarity: 'legendary', scroll_value: 4000,
      },
    ]
  );

  console.log('\n✅ Tiered ability system complete!');
  console.log('\nTotal abilities created:');
  console.log('- Rend: 5 tiers');
  console.log('- Backstab: 5 tiers');
  console.log('- Execute: 5 tiers');
  console.log('- Fireball: 6 tiers');
  console.log('- Frostbolt: 5 tiers');
  console.log('- Blizzard: 4 tiers');
  console.log('- Shadow Bolt: 5 tiers');
  console.log('- Life Drain: 5 tiers');
  console.log('- Heal: 6 tiers');
  console.log('- Regeneration: 5 tiers');
  console.log('- Battle Fury: 4 tiers');
  console.log('- Arcane Brilliance: 4 tiers');
  console.log('\nTotal: 59 new tiered abilities covering levels 1-58!');
}

main().catch(console.error);
