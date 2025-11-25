# Equipment Expansion Plan

## Current State

### Slots Available
- Head
- Chest  
- Hands
- Feet
- Weapon
- **(Missing: Offhand, Legs, Shoulders, Waist, Neck, Rings)**

### Class Types & Armor
1. **Caster** (INT/WIS) - Cloth armor
2. **Tank** (CON/STR) - Plate armor
3. **Dexterity** (DEX) - Leather armor
4. **Hybrid** - Chain armor (STR/DEX mix)

---

## Phase 1: Complete Caster Equipment ✅ DONE

### Cloth Armor (INT/WIS)
- ✅ Head: 18 items (levels 1-60)
- ✅ Hands: 18 items (levels 1-60)
- ✅ Feet: 18 items (levels 1-60)
- ✅ Chest: 24 items (levels 1-60)
- ✅ Weapons: 28 staves/wands (levels 1-60)
- **Missing**: Offhand (orbs, tomes, focus items)

### What's Left for Casters
- [ ] **Offhand slot** (need to add slot to schema)
  - Orbs (magic focus)
  - Tomes (spellbooks)
  - 15-18 items spanning levels 1-60
  - Mix of boss drops and craftable

---

## Phase 2: Tank Equipment (Plate Armor - CON/STR)

### Current State
- Need to audit existing plate armor
- Likely missing: head, hands, feet coverage

### Plan
- [ ] **Head** (helmets): 15-18 items
- [ ] **Chest** (breastplates): Check existing, fill gaps
- [ ] **Hands** (gauntlets): 15-18 items
- [ ] **Feet** (boots): 15-18 items
- [ ] **Weapons** (swords, maces, axes): Check existing, fill gaps
- [ ] **Offhand** (shields): Add slot, create 15-18 shields

**Stat Focus**: Constitution (primary), Strength (secondary), Armor (high)

---

## Phase 3: Dexterity Equipment (Leather Armor - DEX)

### Current State  
- Need to audit existing leather armor
- Likely missing: head, hands, feet coverage

### Plan
- [ ] **Head** (hoods, masks): 15-18 items
- [ ] **Chest** (jerkins, tunics): Check existing, fill gaps
- [ ] **Hands** (gloves): 15-18 items
- [ ] **Feet** (boots): 15-18 items
- [ ] **Weapons** (daggers, bows): Check existing, fill gaps
- [ ] **Offhand** (daggers for dual-wield): Add mechanics if needed

**Stat Focus**: Dexterity (primary), Strength (secondary), medium armor

---

## Phase 4: Hybrid Equipment (Chain Armor - STR/DEX)

### Plan
- [ ] **Head** (coifs): 15-18 items
- [ ] **Chest** (hauberks): Check existing, fill gaps
- [ ] **Hands** (mail gloves): 15-18 items
- [ ] **Feet** (mail boots): 15-18 items
- [ ] **Weapons** (versatile weapons): Check existing

**Stat Focus**: Strength + Dexterity balance, medium-high armor

---

## Schema Changes Needed

### Add Offhand Slot
```sql
-- Items table already has 'slot' column
-- Just need to add 'offhand' as valid value
-- Offhand items: shields, orbs, tomes, daggers
```

### Optional: Additional Slots (Future)
- Legs (separate from chest)
- Shoulders
- Waist (belts)
- Neck (amulets)
- Ring slots (2x)
- Back (cloaks)

---

## Item Distribution Strategy

### Per Slot, Per Armor Type
- **15-18 items** spanning levels 1-60
- **5-6 boss-only items** (levels 12, 18, 25, 40, 55)
- **10-12 craftable items** (fill level gaps)

### Rarity Distribution
- Common: Levels 1-8 (3-4 items)
- Uncommon: Levels 5-15 (3-4 items)
- Rare: Levels 12-25 (3-4 items)
- Epic: Levels 25-45 (3-4 items)
- Legendary: Levels 50-60 (2-3 items)

---

## Execution Order

### Session 1: Complete Casters ✅
1. ✅ Cloth head, hands, feet
2. [ ] Orbs/Tomes (offhand) - **NEXT**

### Session 2: Tank Class
1. Plate head, hands, feet
2. Shields (offhand)
3. Fill weapon gaps (1H swords, maces, axes)

### Session 3: Dexterity Class
1. Leather head, hands, feet
2. Fill weapon gaps (daggers, bows, crossbows)

### Session 4: Hybrid Class
1. Chain head, hands, feet
2. Fill weapon gaps (versatile/polearms)

---

## Crafting Profession Mapping

- **Cloth** → Tailoring
- **Leather** → Leatherworking
- **Chain** → Blacksmithing
- **Plate** → Blacksmithing
- **Shields** → Blacksmithing
- **Orbs/Tomes** → Alchemy or new "Enchanting" profession?
- **Weapons** → Blacksmithing (metal), Fletching (ranged), Tailoring (staves?)

---

## Next Immediate Steps

1. **Add offhand slot to database** (schema update)
2. **Create caster offhand items** (orbs, tomes)
3. **Audit tank equipment** (plate armor + weapons)
4. **Begin tank expansion**
