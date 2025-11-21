# Enhanced Ability & Spell System Design

## Current System Limitations

The current system supports:
- ✅ Instant damage
- ✅ Instant healing
- ✅ Stat buffs (temporary)
- ✅ Stat scaling
- ❌ Damage/Heal over time (DoTs/HoTs)
- ❌ Debuffs on enemies
- ❌ Multiple effects per ability
- ❌ Area effects
- ❌ Conditional effects

## Proposed Enhanced System

### New Database Structure

Instead of flat columns for effects, use a flexible effect system with JSON:

```sql
CREATE TABLE ability_effects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ability_id INTEGER NOT NULL,
    effect_type TEXT NOT NULL, -- 'damage', 'heal', 'buff', 'debuff', 'dot', 'hot'
    target TEXT NOT NULL, -- 'self', 'enemy', 'ally'
    
    -- Instant effects
    value_min INTEGER DEFAULT 0,
    value_max INTEGER DEFAULT 0,
    
    -- Over-time effects
    is_periodic BOOLEAN DEFAULT 0,
    tick_interval INTEGER DEFAULT 0, -- seconds between ticks
    tick_count INTEGER DEFAULT 0, -- how many ticks
    tick_value INTEGER DEFAULT 0, -- damage/heal per tick
    
    -- Stat modifications
    stat_affected TEXT, -- 'strength', 'max_health', 'armor', etc.
    stat_scaling TEXT, -- which stat to scale from
    scaling_factor REAL DEFAULT 0,
    
    -- Duration (for buffs/debuffs/dots)
    duration INTEGER DEFAULT 0,
    
    -- Conditions
    requires_buff TEXT, -- only works if target has this buff
    chance REAL DEFAULT 1.0, -- 0.0-1.0, chance to apply
    
    created_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (ability_id) REFERENCES abilities(id)
);
```

### Effect Types

1. **Instant Damage** - Immediate damage to enemy
2. **Instant Heal** - Immediate heal to self
3. **Buff** - Temporary stat increase to self/ally
4. **Debuff** - Temporary stat decrease to enemy
5. **DOT (Damage Over Time)** - Periodic damage to enemy (e.g., Poison, Burn)
6. **HOT (Heal Over Time)** - Periodic healing to self (e.g., Regeneration)
7. **Drain** - Damage enemy and heal self
8. **Shield** - Absorb damage for duration

### Example Abilities

#### 1. Fireball (Instant Damage + DOT)
```json
{
  "name": "Fireball",
  "mana_cost": 30,
  "cooldown": 8,
  "effects": [
    {
      "type": "damage",
      "target": "enemy",
      "value_min": 20,
      "value_max": 35,
      "stat_scaling": "intelligence",
      "scaling_factor": 0.6
    },
    {
      "type": "dot",
      "target": "enemy",
      "tick_value": 5,
      "tick_interval": 2,
      "tick_count": 3,
      "duration": 6,
      "stat_scaling": "intelligence",
      "scaling_factor": 0.2,
      "chance": 0.8
    }
  ]
}
```

#### 2. Poison Strike (DOT)
```json
{
  "name": "Poison Strike",
  "cooldown": 12,
  "effects": [
    {
      "type": "damage",
      "target": "enemy",
      "value_min": 5,
      "value_max": 10
    },
    {
      "type": "dot",
      "target": "enemy",
      "tick_value": 8,
      "tick_interval": 3,
      "tick_count": 4,
      "duration": 12,
      "stat_scaling": "dexterity",
      "scaling_factor": 0.3
    }
  ]
}
```

#### 3. Rejuvenation (HOT)
```json
{
  "name": "Rejuvenation",
  "mana_cost": 25,
  "cooldown": 15,
  "effects": [
    {
      "type": "heal",
      "target": "self",
      "value_min": 10,
      "value_max": 15,
      "stat_scaling": "wisdom",
      "scaling_factor": 0.4
    },
    {
      "type": "hot",
      "target": "self",
      "tick_value": 5,
      "tick_interval": 2,
      "tick_count": 5,
      "duration": 10,
      "stat_scaling": "wisdom",
      "scaling_factor": 0.2
    }
  ]
}
```

#### 4. Curse of Weakness (Debuff)
```json
{
  "name": "Curse of Weakness",
  "mana_cost": 20,
  "cooldown": 20,
  "effects": [
    {
      "type": "debuff",
      "target": "enemy",
      "stat_affected": "attack_damage",
      "value_min": -5,
      "value_max": -5,
      "duration": 10
    },
    {
      "type": "debuff",
      "target": "enemy",
      "stat_affected": "defense",
      "value_min": -3,
      "value_max": -3,
      "duration": 10
    }
  ]
}
```

#### 5. Berserker Rage (Buff with Trade-off)
```json
{
  "name": "Berserker Rage",
  "cooldown": 30,
  "effects": [
    {
      "type": "buff",
      "target": "self",
      "stat_affected": "strength",
      "value_min": 10,
      "value_max": 10,
      "duration": 15
    },
    {
      "type": "buff",
      "target": "self",
      "stat_affected": "attack_speed",
      "value_min": 5,
      "value_max": 5,
      "duration": 15
    },
    {
      "type": "debuff",
      "target": "self",
      "stat_affected": "defense",
      "value_min": -5,
      "value_max": -5,
      "duration": 15
    }
  ]
}
```

#### 6. Life Drain (Damage + Heal)
```json
{
  "name": "Life Drain",
  "mana_cost": 35,
  "cooldown": 10,
  "effects": [
    {
      "type": "damage",
      "target": "enemy",
      "value_min": 15,
      "value_max": 25,
      "stat_scaling": "intelligence",
      "scaling_factor": 0.5
    },
    {
      "type": "heal",
      "target": "self",
      "value_min": 10,
      "value_max": 15,
      "stat_scaling": "intelligence",
      "scaling_factor": 0.3
    }
  ]
}
```

## Implementation Plan

### Phase 1: Database Migration
1. Create `ability_effects` table
2. Migrate existing abilities to new system
3. Keep old columns for backward compatibility

### Phase 2: Combat Engine Updates
1. Create `EffectProcessor` class to handle all effect types
2. Add DOT/HOT tracking system (active_dots, active_hots)
3. Update combat tick system to process periodic effects
4. Add debuff tracking for enemies

### Phase 3: UI Updates
1. Show active DOTs/HOTs on enemies
2. Display debuff icons
3. Add effect tooltips with detailed info

### Phase 4: New Abilities
1. Create scrolls for new ability types
2. Add to loot tables
3. Balance testing

## Data Structure for Active Effects

```typescript
type ActiveEffect = {
  id: string; // unique ID
  name: string;
  source: 'ability' | 'item' | 'buff';
  type: 'dot' | 'hot' | 'buff' | 'debuff';
  target: 'self' | 'enemy';
  
  // For DOT/HOT
  tickValue?: number;
  tickInterval?: number;
  ticksRemaining?: number;
  nextTickAt?: number;
  
  // For buffs/debuffs
  stat?: string;
  amount?: number;
  
  // Common
  duration: number;
  expiresAt: number;
  stacks?: number; // for stackable effects
};
```

## Benefits of New System

1. **Flexibility**: Any combination of effects possible
2. **Scalability**: Easy to add new effect types
3. **Balance**: Fine-tune individual effects without changing ability structure
4. **Complexity**: Support for sophisticated spell mechanics
5. **Clarity**: Clear separation of concerns
6. **Performance**: Efficient querying and processing

## Migration Strategy

### Option A: Big Bang (Recommended)
- Migrate all abilities at once
- Simpler codebase
- One-time disruption

### Option B: Gradual
- Keep both systems running
- Migrate abilities incrementally
- More complex code
- Longer transition period

## Next Steps

1. Review and approve design
2. Create migration script
3. Update TypeScript types
4. Implement EffectProcessor
5. Update CombatEngine
6. Add UI components
7. Create new abilities
8. Balance testing
9. Documentation
