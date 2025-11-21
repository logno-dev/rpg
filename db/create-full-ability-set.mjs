import { createClient } from '@libsql/client';
import 'dotenv/config';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function createAbility(ability, effects, scroll) {
  const abilityResult = await db.execute({
    sql: `
      INSERT INTO abilities (
        name, description, type, category,
        mana_cost, cooldown, primary_stat,
        required_level, required_strength, required_dexterity,
        required_intelligence, required_wisdom, required_charisma,
        level, base_id
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
      ability.level || 1,
      ability.base_id || null,
    ],
  });

  const abilityId = abilityResult.rows[0].id;
  console.log(`✓ ${ability.name}`);

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

  return abilityId;
}

async function main() {
  console.log('🔮 Creating Comprehensive Ability Set...\n');

  // ==================== PHYSICAL ABILITIES (STRENGTH/DEXTERITY) ====================
  
  console.log('⚔️  PHYSICAL ABILITIES\n');

  // Level 3-10: Basic Physical
  await createAbility(
    {
      name: 'Rend',
      description: 'Tear through armor with a vicious attack, causing bleeding',
      type: 'ability',
      category: 'damage',
      mana_cost: 0,
      cooldown: 8,
      primary_stat: 'strength',
      required_level: 3,
      required_strength: 12,
      level: 1,
    },
    [
      { order: 0, type: 'damage', target: 'enemy', value_min: 10, value_max: 15, stat_scaling: 'strength', scaling_factor: 0.4 },
      { order: 1, type: 'dot', target: 'enemy', is_periodic: true, tick_value: 4, tick_interval: 2, tick_count: 4, stat_scaling: 'strength', scaling_factor: 0.15 },
    ],
    { name: 'Scroll: Rend', description: 'Learn Rend - cause bleeding damage', rarity: 'common', value: 150 }
  );

  await createAbility(
    {
      name: 'Whirlwind Strike',
      description: 'Spin in a circle, striking with fury',
      type: 'ability',
      category: 'damage',
      mana_cost: 0,
      cooldown: 10,
      primary_stat: 'strength',
      required_level: 7,
      required_strength: 18,
      level: 1,
    },
    [
      { order: 0, type: 'damage', target: 'enemy', value_min: 18, value_max: 28, stat_scaling: 'strength', scaling_factor: 0.6 },
    ],
    { name: 'Scroll: Whirlwind Strike', description: 'Learn Whirlwind Strike', rarity: 'uncommon', value: 300 }
  );

  await createAbility(
    {
      name: 'Backstab',
      description: 'Strike from the shadows for devastating damage',
      type: 'ability',
      category: 'damage',
      mana_cost: 0,
      cooldown: 12,
      primary_stat: 'dexterity',
      required_level: 8,
      required_dexterity: 22,
      level: 1,
    },
    [
      { order: 0, type: 'damage', target: 'enemy', value_min: 25, value_max: 40, stat_scaling: 'dexterity', scaling_factor: 0.8 },
    ],
    { name: 'Scroll: Backstab', description: 'Learn Backstab - high burst damage', rarity: 'uncommon', value: 350 }
  );

  // Level 11-20: Advanced Physical
  await createAbility(
    {
      name: 'Execute',
      description: 'Deliver a killing blow with all your might',
      type: 'ability',
      category: 'damage',
      mana_cost: 0,
      cooldown: 15,
      primary_stat: 'strength',
      required_level: 12,
      required_strength: 28,
      level: 2,
    },
    [
      { order: 0, type: 'damage', target: 'enemy', value_min: 35, value_max: 55, stat_scaling: 'strength', scaling_factor: 0.9 },
    ],
    { name: 'Scroll: Execute', description: 'Learn Execute - devastating attack', rarity: 'rare', value: 600 }
  );

  await createAbility(
    {
      name: 'Shadowstep Strike',
      description: 'Teleport behind enemy and strike with precision',
      type: 'ability',
      category: 'damage',
      mana_cost: 0,
      cooldown: 13,
      primary_stat: 'dexterity',
      required_level: 15,
      required_dexterity: 32,
      level: 2,
    },
    [
      { order: 0, type: 'damage', target: 'enemy', value_min: 30, value_max: 48, stat_scaling: 'dexterity', scaling_factor: 0.85 },
      { order: 1, type: 'dot', target: 'enemy', is_periodic: true, tick_value: 8, tick_interval: 2, tick_count: 3, stat_scaling: 'dexterity', scaling_factor: 0.2 },
    ],
    { name: 'Scroll: Shadowstep Strike', description: 'Learn Shadowstep Strike', rarity: 'rare', value: 700 }
  );

  await createAbility(
    {
      name: 'Hemorrhage',
      description: 'Open a grievous wound that bleeds profusely',
      type: 'ability',
      category: 'damage',
      mana_cost: 0,
      cooldown: 14,
      primary_stat: 'strength',
      required_level: 18,
      required_strength: 38,
      level: 2,
    },
    [
      { order: 0, type: 'damage', target: 'enemy', value_min: 15, value_max: 25, stat_scaling: 'strength', scaling_factor: 0.4 },
      { order: 1, type: 'dot', target: 'enemy', is_periodic: true, tick_value: 15, tick_interval: 2, tick_count: 6, stat_scaling: 'strength', scaling_factor: 0.3 },
    ],
    { name: 'Scroll: Hemorrhage', description: 'Learn Hemorrhage - heavy bleed', rarity: 'rare', value: 800 }
  );

  // Level 21-35: Elite Physical
  await createAbility(
    {
      name: 'Eviscerate',
      description: 'Gut your enemy with a brutal strike',
      type: 'ability',
      category: 'damage',
      mana_cost: 0,
      cooldown: 16,
      primary_stat: 'strength',
      required_level: 25,
      required_strength: 50,
      level: 3,
    },
    [
      { order: 0, type: 'damage', target: 'enemy', value_min: 55, value_max: 85, stat_scaling: 'strength', scaling_factor: 1.1 },
      { order: 1, type: 'dot', target: 'enemy', is_periodic: true, tick_value: 12, tick_interval: 2, tick_count: 5, stat_scaling: 'strength', scaling_factor: 0.25 },
    ],
    { name: 'Scroll: Eviscerate', description: 'Learn Eviscerate - brutal execution', rarity: 'epic', value: 1200 }
  );

  await createAbility(
    {
      name: 'Assassinate',
      description: 'Strike from stealth with lethal precision',
      type: 'ability',
      category: 'damage',
      mana_cost: 0,
      cooldown: 18,
      primary_stat: 'dexterity',
      required_level: 28,
      required_dexterity: 55,
      level: 3,
    },
    [
      { order: 0, type: 'damage', target: 'enemy', value_min: 70, value_max: 110, stat_scaling: 'dexterity', scaling_factor: 1.3 },
    ],
    { name: 'Scroll: Assassinate', description: 'Learn Assassinate - instant kill potential', rarity: 'epic', value: 1500 }
  );

  await createAbility(
    {
      name: 'Blade Flurry',
      description: 'Unleash a flurry of rapid strikes',
      type: 'ability',
      category: 'damage',
      mana_cost: 0,
      cooldown: 14,
      primary_stat: 'dexterity',
      required_level: 32,
      required_dexterity: 62,
      level: 3,
    },
    [
      { order: 0, type: 'damage', target: 'enemy', value_min: 45, value_max: 65, stat_scaling: 'dexterity', scaling_factor: 0.9 },
      { order: 1, type: 'damage', target: 'enemy', value_min: 20, value_max: 30, stat_scaling: 'dexterity', scaling_factor: 0.4 },
    ],
    { name: 'Scroll: Blade Flurry', description: 'Learn Blade Flurry - multi-hit attack', rarity: 'epic', value: 1600 }
  );

  // Level 36-50: Master Physical
  await createAbility(
    {
      name: 'Reaping Strike',
      description: 'Harvest your enemies with death itself',
      type: 'ability',
      category: 'damage',
      mana_cost: 0,
      cooldown: 20,
      primary_stat: 'strength',
      required_level: 40,
      required_strength: 75,
      level: 4,
    },
    [
      { order: 0, type: 'damage', target: 'enemy', value_min: 90, value_max: 130, stat_scaling: 'strength', scaling_factor: 1.4 },
      { order: 1, type: 'drain', target: 'enemy', value_min: 30, value_max: 50, stat_scaling: 'strength', scaling_factor: 0.5, drain_percent: 0.4 },
    ],
    { name: 'Scroll: Reaping Strike', description: 'Learn Reaping Strike - life steal attack', rarity: 'legendary', value: 2500 }
  );

  await createAbility(
    {
      name: 'Dance of Blades',
      description: 'Move like the wind, striking multiple times',
      type: 'ability',
      category: 'damage',
      mana_cost: 0,
      cooldown: 18,
      primary_stat: 'dexterity',
      required_level: 45,
      required_dexterity: 85,
      level: 4,
    },
    [
      { order: 0, type: 'damage', target: 'enemy', value_min: 50, value_max: 70, stat_scaling: 'dexterity', scaling_factor: 1.0 },
      { order: 1, type: 'damage', target: 'enemy', value_min: 40, value_max: 60, stat_scaling: 'dexterity', scaling_factor: 0.8 },
      { order: 2, type: 'damage', target: 'enemy', value_min: 30, value_max: 50, stat_scaling: 'dexterity', scaling_factor: 0.6 },
    ],
    { name: 'Scroll: Dance of Blades', description: 'Learn Dance of Blades - triple strike', rarity: 'legendary', value: 3000 }
  );

  // ==================== FIRE SPELLS (INTELLIGENCE) ====================
  
  console.log('\n🔥 FIRE SPELLS\n');

  await createAbility(
    {
      name: 'Flame Bolt',
      description: 'Hurl a bolt of fire at your enemy',
      type: 'spell',
      category: 'damage',
      mana_cost: 15,
      cooldown: 4,
      primary_stat: 'intelligence',
      required_level: 2,
      required_intelligence: 12,
      level: 1,
    },
    [
      { order: 0, type: 'damage', target: 'enemy', value_min: 8, value_max: 14, stat_scaling: 'intelligence', scaling_factor: 0.4 },
    ],
    { name: 'Scroll: Flame Bolt', description: 'Learn Flame Bolt - basic fire spell', rarity: 'common', value: 100 }
  );

  await createAbility(
    {
      name: 'Scorch',
      description: 'Burn your target with intense heat',
      type: 'spell',
      category: 'damage',
      mana_cost: 20,
      cooldown: 8,
      primary_stat: 'intelligence',
      required_level: 5,
      required_intelligence: 16,
      level: 1,
    },
    [
      { order: 0, type: 'damage', target: 'enemy', value_min: 12, value_max: 20, stat_scaling: 'intelligence', scaling_factor: 0.5 },
      { order: 1, type: 'dot', target: 'enemy', is_periodic: true, tick_value: 5, tick_interval: 2, tick_count: 3, stat_scaling: 'intelligence', scaling_factor: 0.2 },
    ],
    { name: 'Scroll: Scorch', description: 'Learn Scorch - burning damage', rarity: 'common', value: 200 }
  );

  await createAbility(
    {
      name: 'Pyroblast',
      description: 'Launch a massive ball of fire',
      type: 'spell',
      category: 'damage',
      mana_cost: 40,
      cooldown: 12,
      primary_stat: 'intelligence',
      required_level: 12,
      required_intelligence: 28,
      level: 2,
    },
    [
      { order: 0, type: 'damage', target: 'enemy', value_min: 40, value_max: 65, stat_scaling: 'intelligence', scaling_factor: 0.85 },
      { order: 1, type: 'dot', target: 'enemy', is_periodic: true, tick_value: 10, tick_interval: 2, tick_count: 4, stat_scaling: 'intelligence', scaling_factor: 0.3 },
    ],
    { name: 'Scroll: Pyroblast', description: 'Learn Pyroblast - heavy fire damage', rarity: 'rare', value: 700 }
  );

  await createAbility(
    {
      name: 'Meteor Strike',
      description: 'Call down a meteor from the sky',
      type: 'spell',
      category: 'damage',
      mana_cost: 60,
      cooldown: 18,
      primary_stat: 'intelligence',
      required_level: 22,
      required_intelligence: 45,
      level: 3,
    },
    [
      { order: 0, type: 'damage', target: 'enemy', value_min: 70, value_max: 100, stat_scaling: 'intelligence', scaling_factor: 1.1 },
      { order: 1, type: 'dot', target: 'enemy', is_periodic: true, tick_value: 15, tick_interval: 2, tick_count: 5, stat_scaling: 'intelligence', scaling_factor: 0.4 },
    ],
    { name: 'Scroll: Meteor Strike', description: 'Learn Meteor Strike - catastrophic damage', rarity: 'epic', value: 1400 }
  );

  await createAbility(
    {
      name: 'Inferno',
      description: 'Create a raging inferno that consumes everything',
      type: 'spell',
      category: 'damage',
      mana_cost: 80,
      cooldown: 22,
      primary_stat: 'intelligence',
      required_level: 35,
      required_intelligence: 70,
      level: 4,
    },
    [
      { order: 0, type: 'damage', target: 'enemy', value_min: 60, value_max: 90, stat_scaling: 'intelligence', scaling_factor: 1.0 },
      { order: 1, type: 'dot', target: 'enemy', is_periodic: true, tick_value: 25, tick_interval: 2, tick_count: 6, stat_scaling: 'intelligence', scaling_factor: 0.5 },
    ],
    { name: 'Scroll: Inferno', description: 'Learn Inferno - devastating fire DOT', rarity: 'legendary', value: 2200 }
  );

  await createAbility(
    {
      name: 'Phoenix Flames',
      description: 'Unleash flames of rebirth and destruction',
      type: 'spell',
      category: 'damage',
      mana_cost: 100,
      cooldown: 25,
      primary_stat: 'intelligence',
      required_level: 48,
      required_intelligence: 95,
      level: 5,
    },
    [
      { order: 0, type: 'damage', target: 'enemy', value_min: 100, value_max: 150, stat_scaling: 'intelligence', scaling_factor: 1.5 },
      { order: 1, type: 'dot', target: 'enemy', is_periodic: true, tick_value: 30, tick_interval: 2, tick_count: 5, stat_scaling: 'intelligence', scaling_factor: 0.6 },
      { order: 2, type: 'heal', target: 'self', value_min: 20, value_max: 40, stat_scaling: 'intelligence', scaling_factor: 0.3 },
    ],
    { name: 'Scroll: Phoenix Flames', description: 'Learn Phoenix Flames - ultimate fire magic', rarity: 'legendary', value: 3500 }
  );

  // ==================== FROST SPELLS (INTELLIGENCE) ====================
  
  console.log('\n❄️  FROST SPELLS\n');

  await createAbility(
    {
      name: 'Frostbolt',
      description: 'Fire a bolt of freezing ice',
      type: 'spell',
      category: 'damage',
      mana_cost: 18,
      cooldown: 5,
      primary_stat: 'intelligence',
      required_level: 3,
      required_intelligence: 13,
      level: 1,
    },
    [
      { order: 0, type: 'damage', target: 'enemy', value_min: 10, value_max: 16, stat_scaling: 'intelligence', scaling_factor: 0.45 },
    ],
    { name: 'Scroll: Frostbolt', description: 'Learn Frostbolt - basic frost spell', rarity: 'common', value: 120 }
  );

  await createAbility(
    {
      name: 'Ice Shard',
      description: 'Conjure sharp shards of ice',
      type: 'spell',
      category: 'damage',
      mana_cost: 25,
      cooldown: 7,
      primary_stat: 'intelligence',
      required_level: 6,
      required_intelligence: 18,
      level: 1,
    },
    [
      { order: 0, type: 'damage', target: 'enemy', value_min: 18, value_max: 28, stat_scaling: 'intelligence', scaling_factor: 0.6 },
    ],
    { name: 'Scroll: Ice Shard', description: 'Learn Ice Shard - piercing frost', rarity: 'uncommon', value: 280 }
  );

  await createAbility(
    {
      name: 'Frozen Orb',
      description: 'Launch an orb that freezes and damages',
      type: 'spell',
      category: 'damage',
      mana_cost: 35,
      cooldown: 10,
      primary_stat: 'intelligence',
      required_level: 14,
      required_intelligence: 32,
      level: 2,
    },
    [
      { order: 0, type: 'damage', target: 'enemy', value_min: 35, value_max: 55, stat_scaling: 'intelligence', scaling_factor: 0.8 },
      { order: 1, type: 'dot', target: 'enemy', is_periodic: true, tick_value: 8, tick_interval: 2, tick_count: 4, stat_scaling: 'intelligence', scaling_factor: 0.25 },
    ],
    { name: 'Scroll: Frozen Orb', description: 'Learn Frozen Orb - freezing damage', rarity: 'rare', value: 750 }
  );

  await createAbility(
    {
      name: 'Blizzard',
      description: 'Call down a freezing blizzard',
      type: 'spell',
      category: 'damage',
      mana_cost: 55,
      cooldown: 16,
      primary_stat: 'intelligence',
      required_level: 24,
      required_intelligence: 48,
      level: 3,
    },
    [
      { order: 0, type: 'damage', target: 'enemy', value_min: 50, value_max: 75, stat_scaling: 'intelligence', scaling_factor: 0.95 },
      { order: 1, type: 'dot', target: 'enemy', is_periodic: true, tick_value: 18, tick_interval: 2, tick_count: 5, stat_scaling: 'intelligence', scaling_factor: 0.35 },
    ],
    { name: 'Scroll: Blizzard', description: 'Learn Blizzard - area frost damage', rarity: 'epic', value: 1500 }
  );

  await createAbility(
    {
      name: 'Glacial Spike',
      description: 'Impale enemy with a massive ice spike',
      type: 'spell',
      category: 'damage',
      mana_cost: 75,
      cooldown: 20,
      primary_stat: 'intelligence',
      required_level: 38,
      required_intelligence: 72,
      level: 4,
    },
    [
      { order: 0, type: 'damage', target: 'enemy', value_min: 90, value_max: 140, stat_scaling: 'intelligence', scaling_factor: 1.3 },
    ],
    { name: 'Scroll: Glacial Spike', description: 'Learn Glacial Spike - massive ice damage', rarity: 'epic', value: 2400 }
  );

  await createAbility(
    {
      name: 'Absolute Zero',
      description: 'Freeze everything to absolute zero',
      type: 'spell',
      category: 'damage',
      mana_cost: 95,
      cooldown: 24,
      primary_stat: 'intelligence',
      required_level: 50,
      required_intelligence: 100,
      level: 5,
    },
    [
      { order: 0, type: 'damage', target: 'enemy', value_min: 110, value_max: 170, stat_scaling: 'intelligence', scaling_factor: 1.6 },
      { order: 1, type: 'dot', target: 'enemy', is_periodic: true, tick_value: 35, tick_interval: 2, tick_count: 4, stat_scaling: 'intelligence', scaling_factor: 0.7 },
    ],
    { name: 'Scroll: Absolute Zero', description: 'Learn Absolute Zero - ultimate frost magic', rarity: 'legendary', value: 4000 }
  );

  // ==================== SHADOW/DARK SPELLS (INTELLIGENCE) ====================
  
  console.log('\n🌑 SHADOW SPELLS\n');

  await createAbility(
    {
      name: 'Shadow Bolt',
      description: 'Fire a bolt of dark energy',
      type: 'spell',
      category: 'damage',
      mana_cost: 20,
      cooldown: 6,
      primary_stat: 'intelligence',
      required_level: 4,
      required_intelligence: 15,
      level: 1,
    },
    [
      { order: 0, type: 'damage', target: 'enemy', value_min: 12, value_max: 18, stat_scaling: 'intelligence', scaling_factor: 0.5 },
    ],
    { name: 'Scroll: Shadow Bolt', description: 'Learn Shadow Bolt - dark magic', rarity: 'common', value: 150 }
  );

  await createAbility(
    {
      name: 'Drain Soul',
      description: 'Drain the life essence from your enemy',
      type: 'spell',
      category: 'damage',
      mana_cost: 30,
      cooldown: 10,
      primary_stat: 'intelligence',
      required_level: 9,
      required_intelligence: 24,
      level: 1,
    },
    [
      { order: 0, type: 'drain', target: 'enemy', value_min: 18, value_max: 28, stat_scaling: 'intelligence', scaling_factor: 0.55, drain_percent: 0.4 },
    ],
    { name: 'Scroll: Drain Soul', description: 'Learn Drain Soul - life drain', rarity: 'uncommon', value: 400 }
  );

  await createAbility(
    {
      name: 'Plague',
      description: 'Infect enemy with deadly plague',
      type: 'spell',
      category: 'damage',
      mana_cost: 35,
      cooldown: 14,
      primary_stat: 'intelligence',
      required_level: 16,
      required_intelligence: 35,
      level: 2,
    },
    [
      { order: 0, type: 'dot', target: 'enemy', is_periodic: true, tick_value: 20, tick_interval: 3, tick_count: 5, stat_scaling: 'intelligence', scaling_factor: 0.4 },
    ],
    { name: 'Scroll: Plague', description: 'Learn Plague - devastating disease', rarity: 'rare', value: 900 }
  );

  await createAbility(
    {
      name: 'Death Coil',
      description: 'Launch a coil of death magic',
      type: 'spell',
      category: 'damage',
      mana_cost: 45,
      cooldown: 12,
      primary_stat: 'intelligence',
      required_level: 20,
      required_intelligence: 42,
      level: 2,
    },
    [
      { order: 0, type: 'damage', target: 'enemy', value_min: 45, value_max: 70, stat_scaling: 'intelligence', scaling_factor: 0.9 },
      { order: 1, type: 'drain', target: 'enemy', value_min: 15, value_max: 25, stat_scaling: 'intelligence', scaling_factor: 0.3, drain_percent: 0.5 },
    ],
    { name: 'Scroll: Death Coil', description: 'Learn Death Coil - death and drain', rarity: 'rare', value: 1100 }
  );

  await createAbility(
    {
      name: 'Soul Siphon',
      description: 'Continuously drain life over time',
      type: 'spell',
      category: 'damage',
      mana_cost: 50,
      cooldown: 16,
      primary_stat: 'intelligence',
      required_level: 28,
      required_intelligence: 55,
      level: 3,
    },
    [
      { order: 0, type: 'dot', target: 'enemy', is_periodic: true, tick_value: 18, tick_interval: 2, tick_count: 6, stat_scaling: 'intelligence', scaling_factor: 0.4 },
      { order: 1, type: 'hot', target: 'self', is_periodic: true, tick_value: 12, tick_interval: 2, tick_count: 6, stat_scaling: 'intelligence', scaling_factor: 0.25 },
    ],
    { name: 'Scroll: Soul Siphon', description: 'Learn Soul Siphon - continuous drain', rarity: 'epic', value: 1700 }
  );

  await createAbility(
    {
      name: 'Void Eruption',
      description: 'Tear open a rift to the void',
      type: 'spell',
      category: 'damage',
      mana_cost: 70,
      cooldown: 20,
      primary_stat: 'intelligence',
      required_level: 42,
      required_intelligence: 82,
      level: 4,
    },
    [
      { order: 0, type: 'damage', target: 'enemy', value_min: 85, value_max: 125, stat_scaling: 'intelligence', scaling_factor: 1.25 },
      { order: 1, type: 'dot', target: 'enemy', is_periodic: true, tick_value: 22, tick_interval: 2, tick_count: 5, stat_scaling: 'intelligence', scaling_factor: 0.5 },
    ],
    { name: 'Scroll: Void Eruption', description: 'Learn Void Eruption - void damage', rarity: 'epic', value: 2800 }
  );

  await createAbility(
    {
      name: 'Oblivion',
      description: 'Erase existence itself',
      type: 'spell',
      category: 'damage',
      mana_cost: 110,
      cooldown: 28,
      primary_stat: 'intelligence',
      required_level: 55,
      required_intelligence: 110,
      level: 5,
    },
    [
      { order: 0, type: 'damage', target: 'enemy', value_min: 130, value_max: 200, stat_scaling: 'intelligence', scaling_factor: 1.8 },
      { order: 1, type: 'drain', target: 'enemy', value_min: 40, value_max: 60, stat_scaling: 'intelligence', scaling_factor: 0.6, drain_percent: 0.6 },
    ],
    { name: 'Scroll: Oblivion', description: 'Learn Oblivion - ultimate shadow spell', rarity: 'legendary', value: 5000 }
  );

  // ==================== HEALING SPELLS (WISDOM) ====================
  
  console.log('\n💚 HEALING SPELLS\n');

  await createAbility(
    {
      name: 'Minor Heal',
      description: 'Restore a small amount of health',
      type: 'spell',
      category: 'heal',
      mana_cost: 15,
      cooldown: 5,
      primary_stat: 'wisdom',
      required_level: 1,
      required_wisdom: 10,
      level: 1,
    },
    [
      { order: 0, type: 'heal', target: 'self', value_min: 20, value_max: 30, stat_scaling: 'wisdom', scaling_factor: 0.5 },
    ],
    { name: 'Scroll: Minor Heal', description: 'Learn Minor Heal - basic healing', rarity: 'common', value: 80 }
  );

  await createAbility(
    {
      name: 'Healing Touch',
      description: 'Channel healing energy',
      type: 'spell',
      category: 'heal',
      mana_cost: 25,
      cooldown: 8,
      primary_stat: 'wisdom',
      required_level: 5,
      required_wisdom: 16,
      level: 1,
    },
    [
      { order: 0, type: 'heal', target: 'self', value_min: 35, value_max: 50, stat_scaling: 'wisdom', scaling_factor: 0.7 },
    ],
    { name: 'Scroll: Healing Touch', description: 'Learn Healing Touch - moderate healing', rarity: 'common', value: 200 }
  );

  await createAbility(
    {
      name: 'Renewal',
      description: 'Heal over time with nature magic',
      type: 'spell',
      category: 'heal',
      mana_cost: 30,
      cooldown: 12,
      primary_stat: 'wisdom',
      required_level: 9,
      required_wisdom: 22,
      level: 1,
    },
    [
      { order: 0, type: 'heal', target: 'self', value_min: 20, value_max: 30, stat_scaling: 'wisdom', scaling_factor: 0.4 },
      { order: 1, type: 'hot', target: 'self', is_periodic: true, tick_value: 12, tick_interval: 3, tick_count: 5, stat_scaling: 'wisdom', scaling_factor: 0.3 },
    ],
    { name: 'Scroll: Renewal', description: 'Learn Renewal - heal over time', rarity: 'uncommon', value: 400 }
  );

  await createAbility(
    {
      name: 'Greater Heal',
      description: 'Powerful healing magic',
      type: 'spell',
      category: 'heal',
      mana_cost: 45,
      cooldown: 10,
      primary_stat: 'wisdom',
      required_level: 15,
      required_wisdom: 32,
      level: 2,
    },
    [
      { order: 0, type: 'heal', target: 'self', value_min: 70, value_max: 100, stat_scaling: 'wisdom', scaling_factor: 1.0 },
    ],
    { name: 'Scroll: Greater Heal', description: 'Learn Greater Heal - strong healing', rarity: 'rare', value: 800 }
  );

  await createAbility(
    {
      name: 'Rejuvenation',
      description: 'Powerful regeneration over time',
      type: 'spell',
      category: 'heal',
      mana_cost: 40,
      cooldown: 16,
      primary_stat: 'wisdom',
      required_level: 20,
      required_wisdom: 40,
      level: 2,
    },
    [
      { order: 0, type: 'hot', target: 'self', is_periodic: true, tick_value: 25, tick_interval: 3, tick_count: 6, stat_scaling: 'wisdom', scaling_factor: 0.5 },
    ],
    { name: 'Scroll: Rejuvenation', description: 'Learn Rejuvenation - powerful HoT', rarity: 'rare', value: 1000 }
  );

  await createAbility(
    {
      name: 'Divine Light',
      description: 'Channel divine healing energy',
      type: 'spell',
      category: 'heal',
      mana_cost: 60,
      cooldown: 12,
      primary_stat: 'wisdom',
      required_level: 30,
      required_wisdom: 58,
      level: 3,
    },
    [
      { order: 0, type: 'heal', target: 'self', value_min: 100, value_max: 140, stat_scaling: 'wisdom', scaling_factor: 1.3 },
    ],
    { name: 'Scroll: Divine Light', description: 'Learn Divine Light - massive healing', rarity: 'epic', value: 1800 }
  );

  await createAbility(
    {
      name: 'Tranquility',
      description: 'Enter a state of perfect healing',
      type: 'spell',
      category: 'heal',
      mana_cost: 70,
      cooldown: 20,
      primary_stat: 'wisdom',
      required_level: 40,
      required_wisdom: 75,
      level: 4,
    },
    [
      { order: 0, type: 'heal', target: 'self', value_min: 80, value_max: 120, stat_scaling: 'wisdom', scaling_factor: 1.0 },
      { order: 1, type: 'hot', target: 'self', is_periodic: true, tick_value: 30, tick_interval: 2, tick_count: 8, stat_scaling: 'wisdom', scaling_factor: 0.6 },
    ],
    { name: 'Scroll: Tranquility', description: 'Learn Tranquility - ultimate healing', rarity: 'epic', value: 2600 }
  );

  await createAbility(
    {
      name: 'Resurrection',
      description: 'Channel life itself',
      type: 'spell',
      category: 'heal',
      mana_cost: 100,
      cooldown: 30,
      primary_stat: 'wisdom',
      required_level: 52,
      required_wisdom: 105,
      level: 5,
    },
    [
      { order: 0, type: 'heal', target: 'self', value_min: 200, value_max: 300, stat_scaling: 'wisdom', scaling_factor: 1.8 },
      { order: 1, type: 'hot', target: 'self', is_periodic: true, tick_value: 40, tick_interval: 2, tick_count: 6, stat_scaling: 'wisdom', scaling_factor: 0.8 },
    ],
    { name: 'Scroll: Resurrection', description: 'Learn Resurrection - life magic', rarity: 'legendary', value: 4500 }
  );

  // ==================== BUFF SPELLS (WISDOM/INTELLIGENCE) ====================
  
  console.log('\n✨ BUFF SPELLS\n');

  await createAbility(
    {
      name: 'Battle Fury',
      description: 'Increase your attack power',
      type: 'spell',
      category: 'buff',
      mana_cost: 25,
      cooldown: 30,
      primary_stat: 'wisdom',
      required_level: 10,
      required_wisdom: 20,
      level: 1,
    },
    [
      { order: 0, type: 'buff', target: 'self', stat_affected: 'strength', value_min: 8, value_max: 8, duration: 20 },
    ],
    { name: 'Scroll: Battle Fury', description: 'Learn Battle Fury - strength buff', rarity: 'uncommon', value: 500 }
  );

  await createAbility(
    {
      name: 'Swift Reflexes',
      description: 'Increase your agility',
      type: 'spell',
      category: 'buff',
      mana_cost: 25,
      cooldown: 30,
      primary_stat: 'wisdom',
      required_level: 12,
      required_wisdom: 24,
      level: 1,
    },
    [
      { order: 0, type: 'buff', target: 'self', stat_affected: 'dexterity', value_min: 8, value_max: 8, duration: 20 },
    ],
    { name: 'Scroll: Swift Reflexes', description: 'Learn Swift Reflexes - dexterity buff', rarity: 'uncommon', value: 550 }
  );

  await createAbility(
    {
      name: 'Arcane Brilliance',
      description: 'Increase your magical power',
      type: 'spell',
      category: 'buff',
      mana_cost: 30,
      cooldown: 30,
      primary_stat: 'intelligence',
      required_level: 18,
      required_intelligence: 38,
      level: 2,
    },
    [
      { order: 0, type: 'buff', target: 'self', stat_affected: 'intelligence', value_min: 12, value_max: 12, duration: 25 },
    ],
    { name: 'Scroll: Arcane Brilliance', description: 'Learn Arcane Brilliance - intelligence buff', rarity: 'rare', value: 1000 }
  );

  await createAbility(
    {
      name: 'Iron Skin',
      description: 'Harden your body like iron',
      type: 'spell',
      category: 'buff',
      mana_cost: 35,
      cooldown: 35,
      primary_stat: 'wisdom',
      required_level: 25,
      required_wisdom: 48,
      level: 2,
    },
    [
      { order: 0, type: 'buff', target: 'self', stat_affected: 'constitution', value_min: 15, value_max: 15, duration: 30 },
    ],
    { name: 'Scroll: Iron Skin', description: 'Learn Iron Skin - constitution buff', rarity: 'rare', value: 1300 }
  );

  await createAbility(
    {
      name: 'Divine Favor',
      description: 'Gain the favor of the divine',
      type: 'spell',
      category: 'buff',
      mana_cost: 50,
      cooldown: 45,
      primary_stat: 'wisdom',
      required_level: 35,
      required_wisdom: 65,
      level: 3,
    },
    [
      { order: 0, type: 'buff', target: 'self', stat_affected: 'wisdom', value_min: 18, value_max: 18, duration: 35 },
      { order: 1, type: 'buff', target: 'self', stat_affected: 'intelligence', value_min: 10, value_max: 10, duration: 35 },
    ],
    { name: 'Scroll: Divine Favor', description: 'Learn Divine Favor - multiple buffs', rarity: 'epic', value: 2000 }
  );

  console.log('\n✅ Complete! Created comprehensive ability set.');
  console.log('\nSummary:');
  console.log('- Physical Abilities: 10 (Strength/Dexterity based)');
  console.log('- Fire Spells: 6 (Level 2-48)');
  console.log('- Frost Spells: 6 (Level 3-50)');
  console.log('- Shadow Spells: 7 (Level 4-55)');
  console.log('- Healing Spells: 8 (Level 1-52)');
  console.log('- Buff Spells: 5 (Level 10-35)');
  console.log('- Total: 42 new abilities!');
}

main().catch(console.error);
