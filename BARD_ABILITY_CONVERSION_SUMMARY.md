# Bard Ability DOT/HOT Conversion Summary

## Overview
All bard abilities have been converted from instant effects to **HOT (Heal Over Time)**, **DOT (Damage Over Time)**, or kept as **instant damage** for fast-casting abilities.

---

## Conversion Strategy

### Effect Types:
1. **HOT (12 abilities)** - Healing songs that restore health over time
2. **DOT (12 abilities)** - Damage songs that deal damage over time
3. **Instant Damage (16 abilities)** - Fast-casting burst damage abilities

### Tick Design:
- **Fast songs** (short cooldown): 5 ticks over 10 seconds (2s interval)
- **Medium songs**: 8 ticks over 16 seconds (2s interval)
- **Slow songs** (long cooldown): 10 ticks over 20 seconds (2s interval)

---

## HOT Abilities (Heal Over Time)

| Ability | Mana | Cooldown | Ticks | Per Tick | Total Base | Scaling |
|---------|------|----------|-------|----------|------------|---------|
| **Melody of Mending I** | 6 | 30s | 10 | 1 | 10 | 0.6x CHA |
| **Melody of Mending II** | 16 | 35s | 10 | 1 | 10 | 0.6x CHA |
| **Melody of Mending III** | 22 | 40s | 10 | 1 | 10 | 0.6x CHA |
| **Ballad of Restoration I** | 10 | 40s | 8 | 6 | 48 | 1.1x CHA |
| **Ballad of Restoration II** | 20 | 45s | 8 | 17 | 136 | 1.4x CHA |
| **Ballad of Restoration III** | 26 | 50s | 8 | 39 | 312 | 1.7x CHA |
| **Hymn of Renewal I** | 14 | 50s | 10 | 7 | 70 | 1.2x CHA |
| **Hymn of Renewal II** | 24 | 55s | 10 | 18 | 180 | 1.5x CHA |
| **Hymn of Renewal III** | 32 | 60s | 10 | 42 | 420 | 1.8x CHA |
| **Song of Rejuvenation** | 28 | 70s | 8 | 31 | 248 | 1.6x CHA |
| **Aria of Resurrection** | 38 | 90s | 10 | 55 | 550 | 2.0x CHA |
| **Eternal Lifesong** | 45 | 120s | 10 | 75 | 750 | 2.2x CHA |

### HOT Scaling Example (500 CHA):
- **Melody of Mending I**: 1 + (500 × 0.6) = **301 healing per tick** × 10 = **3,010 total**
- **Eternal Lifesong**: 75 + (500 × 2.2) = **1,175 healing per tick** × 10 = **11,750 total**

---

## DOT Abilities (Damage Over Time)

| Ability | Mana | Cooldown | Ticks | Per Tick | Total Base | Scaling |
|---------|------|----------|-------|----------|------------|---------|
| **Discordant Note I** | 5 | 8s | 5 | 2 | 10 | 0.5x CHA |
| **Discordant Note II** | 12 | 10s | 5 | 8 | 40 | 0.7x CHA |
| **Discordant Note III** | 20 | 12s | 5 | 25 | 125 | 1.0x CHA |
| **Discordant Note IV** | 30 | 14s | 5 | 54 | 270 | 1.2x CHA |
| **Cacophony I** | 8 | 10s | 8 | 2 | 16 | 0.6x CHA |
| **Cacophony II** | 15 | 12s | 8 | 7 | 56 | 0.8x CHA |
| **Cacophony III** | 25 | 14s | 8 | 21 | 168 | 1.2x CHA |
| **Cacophony IV** | 35 | 16s | 8 | 47 | 376 | 1.5x CHA |
| **Dirge of Despair I** | 10 | 12s | 10 | 3 | 30 | 0.7x CHA |
| **Dirge of Despair II** | 18 | 14s | 10 | 9 | 90 | 0.9x CHA |
| **Dirge of Despair III** | 28 | 16s | 10 | 24 | 240 | 1.3x CHA |
| **Dirge of Despair IV** | 40 | 18s | 10 | 51 | 510 | 1.6x CHA |

### DOT Scaling Example (500 CHA):
- **Discordant Note IV**: 54 + (500 × 1.2) = **654 damage per tick** × 5 = **3,270 total over 10s**
- **Dirge of Despair IV**: 51 + (500 × 1.6) = **851 damage per tick** × 10 = **8,510 total over 20s**

---

## Instant Damage Abilities

| Ability | Mana | Cooldown | Damage Range | Scaling |
|---------|------|----------|--------------|---------|
| **Sonic Blast** | 3 | 5s | 5-8 | 0.4x CHA |
| **Resonant Strike** | 5 | 6s | 12-18 | 0.5x CHA |
| **Harmonic Burst** | 7 | 7s | 22-32 | 0.6x CHA |
| **Power Chord** | 9 | 8s | 45-62 | 0.7x CHA |
| **Crescendo** | 12 | 10s | 85-115 | 0.9x CHA |
| **Scream of Anguish** | 22 | 18s | 100-135 | 1.0x CHA |
| **Fortissimo** | 16 | 12s | 145-190 | 1.1x CHA |
| **Thunderous Chord** | 20 | 14s | 220-280 | 1.2x CHA |
| **Deathsong** | 32 | 22s | 280-350 | 1.3x CHA |
| **Apocalyptic Aria** | 26 | 18s | 350-440 | 1.4x CHA |
| **Reality Shattering Note** | 32 | 22s | 520-650 | 1.6x CHA |
| **Requiem of Oblivion** | 45 | 25s | 600-750 | 1.8x CHA |
| **Worldending Symphony** | 40 | 28s | 750-950 | 1.9x CHA |

### Instant Damage Scaling Example (500 CHA):
- **Sonic Blast**: 5-8 + (500 × 0.4) = **205-208 instant damage**
- **Worldending Symphony**: 750-950 + (500 × 1.9) = **1,700-1,900 instant damage**

---

## Key Changes

### Before Conversion:
- All abilities had instant damage/healing in the `abilities` table
- No periodic effects (DOTs/HOTs)
- Only Melody of Mending I-III were HOTs

### After Conversion:
- ✅ **12 HOT abilities** - Healing over time with tick mechanics
- ✅ **12 DOT abilities** - Damage over time with tick mechanics
- ✅ **16 Instant abilities** - Burst damage for active combat
- ✅ All effects moved to `ability_effects` table
- ✅ `abilities.damage_min`, `abilities.damage_max`, `abilities.healing` cleared for bard songs

---

## Gameplay Impact

### DOT Benefits:
- **Mana efficient**: Cast once, damage continues while you use other abilities
- **Stacking**: Can apply multiple DOTs to the same target
- **Sustained pressure**: Keeps damage ticking even when you're healing or moving

### HOT Benefits:
- **Set and forget**: Cast healing, continue fighting
- **Mana efficient**: Heal over 20 seconds instead of instant burst
- **Stacking**: Multiple HOTs can run simultaneously

### Instant Damage Benefits:
- **Burst windows**: High damage when you need it
- **Filler abilities**: Use between DOT applications
- **Flexibility**: Quick response to changing combat situations

---

## Optimal Rotations

### DOT Damage Build:
1. Apply **Dirge of Despair IV** (510 base over 20s)
2. Apply **Cacophony IV** (376 base over 16s)
3. Apply **Discordant Note IV** (270 base over 10s)
4. Spam **Sonic Blast** (instant filler)
5. Refresh DOTs as they expire

**Total DOT damage**: ~1,156 base damage + scaling ticking simultaneously!

### HOT Healing Build:
1. Cast **Eternal Lifesong** (750 base over 20s)
2. Cast **Hymn of Renewal III** (420 base over 20s)
3. Cast **Ballad of Restoration III** (312 base over 16s)
4. Use instant heals as needed

**Total HOT healing**: ~1,482 base healing + scaling ticking simultaneously!

---

## Database Changes

### File Created:
- `db/convert-bard-abilities-to-dots-hots.sql`

### Tables Modified:
1. **`ability_effects`** - Added 40 new effect entries for bard abilities
2. **`abilities`** - Cleared `damage_min`, `damage_max`, `healing` for CHA abilities

### Schema Used:
```sql
ability_effects (
  effect_type: 'dot' | 'hot' | 'damage',
  is_periodic: 1 for DOT/HOT, 0 for instant,
  tick_interval: 2 seconds,
  tick_count: 5/8/10 depending on ability,
  tick_value: damage/healing per tick,
  stat_scaling: 'charisma',
  scaling_factor: 0.4x to 2.2x
)
```

---

## Testing Recommendations

1. **Test DOT stacking**: Apply multiple DOTs and verify they tick independently
2. **Test HOT stacking**: Cast multiple healing songs and verify healing occurs
3. **Test instant damage**: Verify burst abilities work alongside DOTs
4. **Test scaling**: Equip high CHA gear and verify tick values increase correctly
5. **Test duration**: Verify DOTs/HOTs tick for the correct duration (10s/16s/20s)

---

## Summary

All 40 bard abilities now follow the proper structure:
- **HOT**: 12 healing songs (periodic healing)
- **DOT**: 12 damage songs (periodic damage)
- **Instant**: 16 burst damage songs (immediate effect)

Bards can now play as true damage-over-time specialists or heal-over-time supports, with instant abilities providing flexibility and burst windows. This aligns perfectly with the mana-efficient, sustained combat playstyle of the bard class! 🎵
