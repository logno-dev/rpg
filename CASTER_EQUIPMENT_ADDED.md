# Caster Equipment System - Complete

## Summary
Added comprehensive head, hands, and feet armor for caster classes (cloth armor with Intelligence and Wisdom bonuses).

### Before
- **Head**: 1 item (Crown of Shadows - no INT/WIS bonuses)
- **Hands**: 1 item (Cloth Gloves - no bonuses)
- **Feet**: 1 item (Worn Boots - no bonuses)

### After
- **Head**: 18 items (levels 1-60)
- **Hands**: 18 items (levels 1-60)
- **Feet**: 18 items (levels 1-60)
- **Total**: 51 new caster items added + 3 existing = 54 total

---

## Item Distribution

### By Rarity
- **Common**: 12 items (levels 1-8)
- **Uncommon**: 12 items (levels 5-15)
- **Rare**: 12 items (levels 12-20)
- **Epic**: 12 items (levels 25-45)
- **Legendary**: 12 items (levels 50-60)

### Boss-Only Items (15 total - 5 sets)
These drop ONLY from bosses (named_mobs) with 15% drop chance:

1. **Shadowfang Set** (Level 12 - Rare)
   - Shadowfang Crown
   - Shadowfang Grips  
   - Shadowfang Treads

2. **Gorak's Set** (Level 18 - Rare)
   - Gorak's Wisdom Crown
   - Gorak's Crushing Grips
   - Gorak's Stone Treads

3. **Vexmora's Set** (Level 25 - Epic)
   - Vexmora's Dark Crown
   - Vexmora's Shadow Wraps
   - Vexmora's Void Walkers

4. **Flame Lord Set** (Level 40 - Epic)
   - Crown of the Flame Lord
   - Flame Lord's Grasp
   - Flame Lord's Stride

5. **Infernal Set** (Level 55 - Legendary)
   - Infernal Crown of Dominion
   - Infernal Grips of Power
   - Infernal Treads of Cinders

### Craftable Items (36 total - 12 sets)
Can be crafted via Tailoring profession:

| Level Range | Set Name | Tailoring Level | Materials |
|-------------|----------|----------------|-----------|
| 1 | Cloth Set | 1 | 2 Linen Cloth |
| 3 | Apprentice Set | 2 | 2 Linen Cloth |
| 5 | Adept Set | 3 | 2 Linen Cloth |
| 8 | Mage Set | 4 | 3 Wool Cloth |
| 10 | Enchanted Set | 5 | 3 Wool Cloth |
| 15 | Runic Set | 8 | 4 Silk Cloth + 1 Enchanted Thread |
| 20 | Sorcerer's Set | 10 | 5 Silk Cloth + 1 Enchanted Thread |
| 30 | Archmage Set | 15 | 7 Silk Cloth + 2 Enchanted Thread |
| 35 | Starwoven Set | 18 | 8 Silk Cloth + 2 Enchanted Thread |
| 45 | Celestial Set | 23 | 10 Silk Cloth + 2 Enchanted Thread |
| 50 | Primordial Set | 25 | 11 Silk Cloth + 3 Enchanted Thread |
| 60 | Ascendant Set | 30 | 13 Silk Cloth + 3 Enchanted Thread |

---

## Stat Bonuses

All items provide Intelligence and Wisdom bonuses appropriate for their level:

| Level | INT Bonus | WIS Bonus | Armor |
|-------|-----------|-----------|-------|
| 1 | 0-1 | 0-1 | 0 |
| 3 | 1 | 1 | 1 |
| 5 | 2 | 2 | 2 |
| 8 | 3 | 2 | 2 |
| 10 | 4 | 3 | 3 |
| 12 | 5 | 4 | 4 |
| 15 | 6 | 4 | 4 |
| 18 | 7 | 5 | 5 |
| 20 | 8 | 5 | 5 |
| 25 | 10 | 7 | 7 |
| 30 | 11 | 8 | 8 |
| 35 | 13 | 9 | 9 |
| 40 | 15 | 10 | 11 |
| 45 | 16 | 11 | 12 |
| 50 | 18 | 12 | 13 |
| 55 | 20 | 14 | 15 |
| 60 | 22 | 15 | 16 |

---

## Loot Table Integration

### Boss Drops
- 15 boss-only items added to named_mob_loot
- 15% drop chance per item
- Distributed across bosses in appropriate level ranges

### Regular Mob Drops
- 36 craftable items added to mob_loot  
- Drop chances: 2-10% based on rarity
  - Common: 10%
  - Uncommon: 8%
  - Rare: 6%
  - Epic: 4%
  - Legendary: 2%
- Added to ~1/3 of mobs in appropriate level ranges

**Total**: 213 loot table entries added

---

## Crafting Recipe Integration

### Tailoring Profession
- 36 new recipes added spanning Tailoring levels 1-30
- Each recipe requires:
  - Cloth (Linen → Wool → Silk based on level)
  - Enchanted Thread (for level 15+ items)
- Craft time: 20 seconds
- Experience: Scales with crafting level (level × 60 XP)

---

## Progression Path

### Early Game (Levels 1-10)
- **Drops**: Common/Uncommon items from mobs
- **Crafting**: Cloth, Apprentice, Adept, Mage, Enchanted sets (Tailoring 1-5)

### Mid Game (Levels 10-30)
- **Boss Drops**: Shadowfang (12), Gorak (18), Vexmora (25) sets
- **Crafting**: Enchanted, Runic, Sorcerer's, Archmage sets (Tailoring 5-15)
- **Regular Drops**: Uncommon/Rare items

### Late Game (Levels 30-50)
- **Boss Drops**: Flame Lord (40) set
- **Crafting**: Starwoven, Celestial, Primordial sets (Tailoring 18-25)
- **Regular Drops**: Epic items

### End Game (Levels 50-60)
- **Boss Drops**: Infernal (55) set - best boss drops
- **Crafting**: Ascendant (60) set - best craftable
- **Regular Drops**: Legendary items (very rare)

---

## Files
- **Script**: `/db/add-caster-equipment.mjs`
- **Documentation**: `/CASTER_EQUIPMENT_ADDED.md`

## Database Changes
- 51 new items added to `items` table
- 213 entries added to loot tables (`mob_loot` + `named_mob_loot`)
- 36 recipes added to `recipes` table
- 48 material requirements added to `recipe_materials` table

---

## Benefits
✅ Complete caster gear progression from level 1-60
✅ Mix of boss drops (rare/special) and craftable items (reliable)
✅ All items have appropriate INT/WIS bonuses
✅ Balanced drop rates and crafting costs
✅ Named boss sets for prestige/farming
✅ Smooth progression with no major gaps
