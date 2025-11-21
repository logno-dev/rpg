# Simplified Enhanced Ability System

## Philosophy: Extend, Don't Replace

Keep the existing table structure but add new columns for advanced features.

## Enhanced Abilities Table

```sql
ALTER TABLE abilities ADD COLUMN effect_type TEXT DEFAULT 'instant'; 
-- 'instant', 'dot', 'hot', 'buff', 'debuff', 'drain'

ALTER TABLE abilities ADD COLUMN tick_damage INTEGER DEFAULT 0;
-- Damage per tick for DOTs

ALTER TABLE abilities ADD COLUMN tick_healing INTEGER DEFAULT 0;
-- Healing per tick for HOTs

ALTER TABLE abilities ADD COLUMN tick_interval INTEGER DEFAULT 2;
-- Seconds between ticks

ALTER TABLE abilities ADD COLUMN tick_duration INTEGER DEFAULT 0;
-- Total duration of DOT/HOT effect

ALTER TABLE abilities ADD COLUMN drain_percent REAL DEFAULT 0;
-- For drain spells: % of damage dealt returned as healing

ALTER TABLE abilities ADD COLUMN debuff_stat TEXT;
-- Stat to reduce on enemy: 'attack', 'defense', 'speed'

ALTER TABLE abilities ADD COLUMN debuff_amount INTEGER DEFAULT 0;
-- Amount to reduce stat by

ALTER TABLE abilities ADD COLUMN debuff_duration INTEGER DEFAULT 0;
-- Duration of debuff in seconds

ALTER TABLE abilities ADD COLUMN stacks_max INTEGER DEFAULT 1;
-- Max stacks for stackable effects

ALTER TABLE abilities ADD COLUMN aoe_radius INTEGER DEFAULT 0;
-- 0 = single target, >0 = area effect (future)
```

## Simple Effect Types

### 1. Instant (Current System)
```
effect_type: 'instant'
damage_min/max: immediate damage
healing: immediate heal
buff_stat/amount/duration: stat buff
```

### 2. Damage Over Time (DOT)
```
effect_type: 'dot'
damage_min/max: initial hit damage (optional)
tick_damage: damage per tick
tick_interval: seconds between ticks (default 2)
tick_duration: how long it lasts
Example: Poison (3 dmg every 2s for 10s)
```

### 3. Heal Over Time (HOT)
```
effect_type: 'hot'
healing: initial heal (optional)
tick_healing: healing per tick
tick_interval: seconds between ticks
tick_duration: how long it lasts
Example: Rejuvenation (5 hp every 2s for 12s)
```

### 4. Drain
```
effect_type: 'drain'
damage_min/max: damage dealt
drain_percent: % returned as healing (0.0-1.0)
Example: Life Drain (20 dmg, 50% returned = 10 hp)
```

### 5. Debuff
```
effect_type: 'debuff'
debuff_stat: 'attack'|'defense'|'speed'
debuff_amount: reduction amount
debuff_duration: how long it lasts
Example: Weaken (-5 attack for 10s)
```

### 6. Combo (Multiple Effects)
```
effect_type: 'combo'
Can have instant damage + DOT
Can have heal + buff
Parse as combination of above
```

## Example Abilities

### Poison Strike
```sql
INSERT INTO abilities (name, description, type, category, effect_type,
  mana_cost, cooldown, damage_min, damage_max,
  tick_damage, tick_interval, tick_duration,
  primary_stat, stat_scaling, required_level, required_dexterity)
VALUES (
  'Poison Strike', 
  'Strike with a poisoned blade, dealing damage over time',
  'ability', 'damage', 'dot',
  0, 12, 8, 12,
  5, 2, 10,
  'dexterity', 0.4, 5, 15
);
```

### Fireball with Burn
```sql
INSERT INTO abilities (name, description, type, category, effect_type,
  mana_cost, cooldown, damage_min, damage_max,
  tick_damage, tick_interval, tick_duration,
  primary_stat, stat_scaling, required_level, required_intelligence)
VALUES (
  'Scorching Fireball', 
  'Hurl a fireball that burns the target',
  'spell', 'damage', 'dot',
  35, 10, 25, 40,
  8, 2, 8,
  'intelligence', 0.7, 8, 25
);
```

### Regeneration
```sql
INSERT INTO abilities (name, description, type, category, effect_type,
  mana_cost, cooldown, healing,
  tick_healing, tick_interval, tick_duration,
  primary_stat, stat_scaling, required_level, required_wisdom)
VALUES (
  'Regeneration', 
  'Heal yourself over time',
  'spell', 'heal', 'hot',
  30, 15, 15,
  8, 3, 15,
  'wisdom', 0.3, 6, 20
);
```

### Life Drain
```sql
INSERT INTO abilities (name, description, type, category, effect_type,
  mana_cost, cooldown, damage_min, damage_max, drain_percent,
  primary_stat, stat_scaling, required_level, required_intelligence)
VALUES (
  'Life Drain', 
  'Drain life from enemy, healing yourself',
  'spell', 'damage', 'drain',
  40, 12, 20, 35, 0.5,
  'intelligence', 0.6, 10, 30
);
```

### Curse of Weakness
```sql
INSERT INTO abilities (name, description, type, category, effect_type,
  mana_cost, cooldown, debuff_stat, debuff_amount, debuff_duration,
  required_level, required_intelligence)
VALUES (
  'Curse of Weakness', 
  'Weaken enemy attacks',
  'spell', 'debuff', 'debuff',
  25, 18, 'attack', 5, 12,
  7, 22
);
```

## Combat Engine Changes

### 1. Track Active DOTs/HOTs
```typescript
type ActiveTick = {
  id: string;
  abilityId: number;
  abilityName: string;
  type: 'dot' | 'hot';
  tickValue: number;
  tickInterval: number;
  ticksRemaining: number;
  nextTickAt: number;
  statScaling?: string;
  scalingFactor?: number;
};

const [activeDots, setActiveDots] = createSignal<ActiveTick[]>([]);
const [activeHots, setActiveHots] = createSignal<ActiveTick[]>([]);
```

### 2. Process Ticks
```typescript
// In combat tick loop
const processTicks = () => {
  const now = Date.now();
  
  // Process DOTs
  activeDots().forEach(dot => {
    if (now >= dot.nextTickAt) {
      // Apply tick damage
      const damage = calculateTickDamage(dot);
      applyDotDamage(damage);
      
      // Update next tick
      dot.ticksRemaining--;
      if (dot.ticksRemaining > 0) {
        dot.nextTickAt = now + (dot.tickInterval * 1000);
      }
    }
  });
  
  // Process HOTs
  activeHots().forEach(hot => {
    if (now >= hot.nextTickAt) {
      // Apply tick healing
      const healing = calculateTickHealing(hot);
      applyHotHealing(healing);
      
      // Update next tick
      hot.ticksRemaining--;
      if (hot.ticksRemaining > 0) {
        hot.nextTickAt = now + (hot.tickInterval * 1000);
      }
    }
  });
  
  // Clean up expired effects
  setActiveDots(activeDots().filter(d => d.ticksRemaining > 0));
  setActiveHots(activeHots().filter(h => h.ticksRemaining > 0));
};
```

### 3. Enhanced useAbility Function
```typescript
const useAbility = (ability: Ability) => {
  // Existing instant damage/heal logic
  
  // NEW: Handle effect types
  if (ability.effect_type === 'dot' && ability.tick_damage > 0) {
    const tickCount = Math.floor(ability.tick_duration / ability.tick_interval);
    activeDots().push({
      id: `dot-${Date.now()}`,
      abilityId: ability.id,
      abilityName: ability.name,
      type: 'dot',
      tickValue: ability.tick_damage,
      tickInterval: ability.tick_interval,
      ticksRemaining: tickCount,
      nextTickAt: Date.now() + (ability.tick_interval * 1000),
      statScaling: ability.primary_stat,
      scalingFactor: ability.stat_scaling
    });
    log(`Applied ${ability.name} DOT!`);
  }
  
  if (ability.effect_type === 'hot' && ability.tick_healing > 0) {
    const tickCount = Math.floor(ability.tick_duration / ability.tick_interval);
    activeHots().push({
      id: `hot-${Date.now()}`,
      abilityId: ability.id,
      abilityName: ability.name,
      type: 'hot',
      tickValue: ability.tick_healing,
      tickInterval: ability.tick_interval,
      ticksRemaining: tickCount,
      nextTickAt: Date.now() + (ability.tick_interval * 1000),
      statScaling: ability.primary_stat,
      scalingFactor: ability.stat_scaling
    });
    log(`Applied ${ability.name} HoT!`);
  }
  
  if (ability.effect_type === 'drain') {
    const damage = calculateDamage(ability);
    const healing = Math.floor(damage * ability.drain_percent);
    applyDamage(damage);
    applyHealing(healing);
    log(`Drained ${damage} HP, restored ${healing} HP!`);
  }
  
  if (ability.effect_type === 'debuff') {
    applyDebuff(ability.debuff_stat, ability.debuff_amount, ability.debuff_duration);
    log(`Applied ${ability.name} debuff!`);
  }
};
```

## UI Updates

### Show Active DOTs on Enemy
```jsx
<Show when={activeDots().length > 0}>
  <div style={{ "font-size": "0.75rem", "margin-top": "0.25rem" }}>
    <For each={activeDots()}>
      {(dot) => (
        <span style={{ 
          "margin-right": "0.5rem", 
          color: "var(--danger)" 
        }}>
          🔥 {dot.abilityName} ({dot.ticksRemaining} ticks)
        </span>
      )}
    </For>
  </div>
</Show>
```

## Migration Script

```javascript
// Add new columns
await db.execute(`
  ALTER TABLE abilities ADD COLUMN effect_type TEXT DEFAULT 'instant';
  ALTER TABLE abilities ADD COLUMN tick_damage INTEGER DEFAULT 0;
  ALTER TABLE abilities ADD COLUMN tick_healing INTEGER DEFAULT 0;
  ALTER TABLE abilities ADD COLUMN tick_interval INTEGER DEFAULT 2;
  ALTER TABLE abilities ADD COLUMN tick_duration INTEGER DEFAULT 0;
  ALTER TABLE abilities ADD COLUMN drain_percent REAL DEFAULT 0;
  ALTER TABLE abilities ADD COLUMN debuff_stat TEXT;
  ALTER TABLE abilities ADD COLUMN debuff_amount INTEGER DEFAULT 0;
  ALTER TABLE abilities ADD COLUMN debuff_duration INTEGER DEFAULT 0;
`);
```

## Pros of This Approach

✅ **Simple**: Builds on existing structure
✅ **Backward Compatible**: Old abilities still work
✅ **Incremental**: Add features one at a time
✅ **Testable**: Easy to test each effect type
✅ **Performant**: No complex joins or JSON parsing

## Next Steps

1. ✅ Review this design
2. Run migration to add columns
3. Update TypeScript types
4. Add DOT/HOT tracking to CombatEngine
5. Update useAbility function
6. Add UI indicators
7. Create 10-15 new abilities
8. Test and balance

Would you like me to proceed with the migration script?
