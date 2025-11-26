# Bard Class System - Complete Implementation

## Overview
The Bard class is a charisma-based support/hybrid class that uses songs to buff allies, heal, and deal damage. Bards excel at versatility, able to fill support, healing, or damage roles depending on their song choices.

---

## Core Stats
- **Primary Stat**: Charisma (CHA) - All abilities scale with CHA
- **Secondary Stats**: Strength (STR) & Dexterity (DEX) - For survivability and physical attacks
- **Low Stats**: Intelligence (INT) & Wisdom (WIS) - Bards rely on performance, not magic

**Why Low Mana Costs?**
Since bards have low INT/WIS, they have smaller mana pools. All bard songs have been balanced with very low mana costs (3-45 mana) to ensure they can cast frequently even with minimal intelligence/wisdom investment.

---

## Equipment System

### Total Items: 101 Charisma-Focused Pieces

#### **Musical Instruments (Offhand - 27 items)**
Unique offhand items that provide charisma bonuses with secondary STR/DEX.

**Level Progression:**
- **Level 1-10** (Common/Uncommon): Wooden Lute, Tin Whistle, Cedar Mandolin, Brass Horn
  - 1-3 armor, 2-6 CHA, 0-2 STR, 0-2 DEX
  
- **Level 11-20** (Uncommon): Maple Lute, Silver Flute, Enchanted Harp, War Drums, Masterwork Violin
  - 3-7 armor, 8-16 CHA, 2-4 STR, 2-4 DEX
  
- **Level 21-30** (Rare): Elven Lyre, Crystal Horn, Songweaver's Harp, Drums of Thunder
  - 8-11 armor, 20-32 CHA, 6-9 STR, 5-7 DEX
  
- **Level 31-40** (Epic): Archmage's Lute, Siren's Flute, Celestial Harp, Titan's Horn
  - 12-18 armor, 38-56 CHA, 11-16 STR, 9-12 DEX
  
- **Level 41-50** (Epic): Dreadlord's Lute, Phoenix Pipes, Starfall Harp, Warlord's War Horn
  - 20-26 armor, 64-88 CHA, 19-26 STR, 14-18 DEX
  
- **Level 51-60** (Legendary): Godvoice Lute, Worldsong Harp, Eternal Symphony Horn, Infinity's Echo
  - 28-40 armor, 100-150 CHA, 30-45 STR, 22-32 DEX

**Best-in-Slot Level 60:**
- **Infinity's Echo**: 40 armor, +150 CHA, +45 STR, +32 DEX

#### **Bard Armor (Head, Chest, Hands, Feet - 74 items)**
Performance-themed armor with charisma focus.

**Level Progression Examples:**

**Level 1-10 (Common)**
- Performer's Cap: 2 armor, +2 CHA, +1 STR, +1 DEX
- Jester's Tunic: 4 armor, +3 CHA, +1 STR, +1 DEX
- Full set bonus: ~17 armor, +17 CHA, +8 STR, +8 DEX

**Level 20 (Uncommon)**
- Charmer's Crown: 13 armor, +10 CHA, +5 STR, +6 DEX
- Mesmerizing Chainmail: 20 armor, +13 CHA, +6 STR, +7 DEX
- Full set: ~51 armor, +43 CHA, +21 STR, +25 DEX

**Level 40 (Epic)**
- Titan's Grasp: 25 armor, +34 CHA, +17 STR, +18 DEX
- Full set: ~173 armor, +144 CHA, +72 STR, +78 DEX

**Level 60 (Legendary)**
- **Eternal Bard's Crown**: 84 armor, +100 CHA, +48 STR, +50 DEX
- **Eternal Songmail**: 130 armor, +122 CHA, +58 STR, +60 DEX
- **Eternal Grips**: 65 armor, +100 CHA, +48 STR, +50 DEX
- **Eternal Treads**: 65 armor, +100 CHA, +48 STR, +50 DEX

**Full Level 60 Set (Armor + Offhand):**
- **Total**: 384 armor, +572 CHA, +247 STR, +242 DEX

This provides massive charisma for powerful songs while maintaining decent physical stats for survivability and basic attacks.

---

## Abilities System

### Total Songs: 40 Charisma-Scaling Abilities

All abilities use the `primary_stat = 'charisma'` and `stat_scaling` to multiply damage/healing by charisma. With proper CHA gear, bards can be formidable.

### **1. Damage Songs (17 abilities)**
DOT-style abilities that deal damage over time.

**Progression Lines:**
- **Discordant Note** (I-IV): Fast-casting damage spell
  - Tier I: 5 mana, 8-12 damage, 0.5x CHA scaling
  - Tier IV: 30 mana, 240-305 damage, 1.2x CHA scaling
  
- **Cacophony** (I-IV): Heavy-hitting DOT
  - Tier I: 8 mana, 15-22 damage, 0.6x CHA scaling
  - Tier IV: 35 mana, 330-415 damage, 1.5x CHA scaling
  
- **Dirge of Despair** (I-IV): Powerful sustained damage
  - Tier I: 10 mana, 25-35 damage, 0.7x CHA scaling
  - Tier IV: 40 mana, 450-560 damage, 1.6x CHA scaling

**Ultimate Damage Song:**
- **Requiem of Oblivion** (Level 60): 45 mana, 600-750 damage, 1.8x CHA scaling

### **2. Immediate Damage Songs (10 abilities)**
Fast, instant-cast damage for active combat.

**Key Abilities:**
- **Sonic Blast** (Level 1): 3 mana, 5-8 damage, 0.4x CHA scaling
- **Harmonic Burst** (Level 10): 7 mana, 22-32 damage, 0.6x CHA scaling
- **Power Chord** (Level 15): 9 mana, 45-62 damage, 0.7x CHA scaling
- **Crescendo** (Level 20): 12 mana, 85-115 damage, 0.9x CHA scaling
- **Thunderous Chord** (Level 30): 20 mana, 220-280 damage, 1.2x CHA scaling
- **Apocalyptic Aria** (Level 40): 26 mana, 350-440 damage, 1.4x CHA scaling
- **Reality Shattering Note** (Level 50): 32 mana, 520-650 damage, 1.6x CHA scaling
- **Worldending Symphony** (Level 60): 40 mana, 750-950 damage, 1.9x CHA scaling

### **3. Healing Songs (13 abilities)**
HOT (Heal Over Time) abilities that restore health.

**Progression Lines:**
- **Melody of Mending** (I-III): Quick healing
  - Tier I: 6 mana, 25 healing, 1.0x CHA scaling
  - Tier III: 22 mana, 220 healing, 1.5x CHA scaling
  
- **Ballad of Restoration** (I-III): Sustained healing
  - Tier I: 10 mana, 45 healing, 1.1x CHA scaling
  - Tier III: 26 mana, 310 healing, 1.7x CHA scaling
  
- **Hymn of Renewal** (I-III): Powerful restoration
  - Tier I: 14 mana, 70 healing, 1.2x CHA scaling
  - Tier III: 32 mana, 420 healing, 1.8x CHA scaling

**Ultimate Healing Songs:**
- **Aria of Resurrection** (Level 50): 38 mana, 550 healing, 2.0x CHA scaling
- **Eternal Lifesong** (Level 60): 45 mana, 750 healing, 2.2x CHA scaling

---

## Scaling Math Examples

With **Level 60 full bard gear (+572 CHA)**:

### Damage Output:
- **Sonic Blast**: 5-8 + (572 × 0.4) = **234-237 damage** (3 mana, 5s CD)
- **Worldending Symphony**: 750-950 + (572 × 1.9) = **1837-2037 damage** (40 mana, 28s CD)
- **Requiem of Oblivion**: 600-750 + (572 × 1.8) = **1630-1780 damage** (45 mana, 25s CD)

### Healing Output:
- **Melody of Mending III**: 220 + (572 × 1.5) = **1,078 healing** (22 mana, 40s CD)
- **Eternal Lifesong**: 750 + (572 × 2.2) = **2,008 healing** (45 mana, 120s CD)

### Comparison to Other Classes:
- **Mage Fireball V** (INT-based): ~1800-2200 damage (requires 100+ INT, 80+ mana)
- **Bard Worldending Symphony**: ~1840-2040 damage (requires 125+ CHA, **only 40 mana**)

**Key Advantage**: Bards can cast 4-5 spells with the same mana pool a mage uses for 1-2 spells.

---

## Build Archetypes

### **1. Support Bard (Future - Buff System)**
Focus: Buffing party members with stat-boosting songs
- Equipment: Full CHA gear for maximum buff potency
- Songs: Song of Courage, Battle Hymn, Defender's Chorus (to be implemented)
- Role: Pure support, enhances party damage and survivability

### **2. Damage Bard**
Focus: Maximum charisma for devastating song damage
- Equipment: Full CHA + some STR/DEX for survivability
- Songs: Cacophony line, Requiem of Oblivion, Worldending Symphony
- Rotation: Open with Requiem → Worldending Symphony → spam Sonic Blast
- Role: Mana-efficient burst damage dealer

### **3. Healer Bard**
Focus: Charisma-scaling HOTs to keep party alive
- Equipment: CHA-focused with CON for survivability
- Songs: Eternal Lifesong, Hymn of Renewal, Aria of Resurrection
- Role: Primary healer with lower mana costs than traditional healers

### **4. Hybrid Bard**
Focus: Balance of damage, healing, and support
- Equipment: CHA primary, balanced STR/DEX/CON
- Songs: Mix of damage (Apocalyptic Aria), healing (Ballad of Restoration), and buffs
- Role: Flexible all-rounder who adapts to party needs

---

## Unique Mechanics

### **Mana Efficiency**
Bards have the most mana-efficient abilities in the game:
- Early spells cost 3-10 mana (vs 20-40 for mage spells)
- Late spells cost 30-45 mana (vs 80-150 for mage spells)
- This compensates for low INT/WIS = small mana pools

### **Charisma Scaling**
- All bard abilities scale with CHA instead of INT or WIS
- Scaling factors range from 0.4x to 2.2x
- Higher-tier abilities have better scaling rewards
- With max CHA gear, even low-tier spells remain useful

### **Versatility**
Bards are the only class that can:
- Deal competitive damage (Worldending Symphony)
- Heal effectively (Eternal Lifesong)
- Buff allies (future implementation)
- Use all roles with the same primary stat (CHA)

---

## Loot & Crafting Integration

### Loot Tables
**Status**: ✅ **Complete - 2,318 loot entries**

All bard equipment added to mob loot tables:
- **Instruments** (offhand): Drop from mobs at appropriate levels
- **Performance Armor** (head, chest, hands, feet): Distributed across all level ranges
- **Drop rates by rarity**:
  - Common: 12% drop rate
  - Uncommon: 8% drop rate  
  - Rare: 5% drop rate
  - Epic: 3% drop rate
  - Legendary: 1.5% drop rate

Loot distribution ensures players can find bard gear throughout their leveling journey.

### Crafting Recipes
**Status**: ✅ **Complete - 34 recipes, 28 material requirements**

**Instruments (Woodworking/Blacksmithing/Alchemy)**:
- 24 instrument recipes spanning all levels
- Profession types:
  - **Woodworking**: Lutes, Harps, Flutes, Pipes (most instruments)
  - **Blacksmithing**: Horns (Brass Horn, Titan's Horn, etc.)
  - **Leatherworking**: Drums (War Drums, Drums of Thunder)
  - **Alchemy**: Crystal Horn (special magical instrument)

**Performance Armor (Tailoring/Blacksmithing)**:
- 10 armor recipes for key pieces
- **Tailoring**: Crowns, Caps, Diadems (head pieces)
- **Blacksmithing**: Chainmail pieces (chest armor)

**Material Requirements**:
- **Early (1-20)**: Wooden Planks, Linen, Copper Ore, Rough Leather
- **Mid (21-40)**: Ancient Wood, Silk Cloth, Steel Ingot, Minor Gemstones, Cured Leather
- **Late (41-60)**: Ancient Wood, Ethereal Silk, Adamantite Ore, Dragon Scales, Major Gemstones

---

## Files Created
1. `db/bard-equipment.sql` - 101 charisma-focused equipment pieces
2. `db/bard-songs-simple.sql` - 40 charisma-scaling abilities
3. `db/bard-loot-tables.sql` - 2,318 loot table entries
4. `db/bard-crafting-recipes.sql` - 34 recipes + 28 material requirements
5. `db/bard-ability-scrolls.sql` - ~30 scrolls that teach bard songs
6. `db/bard-merchant-inventory.sql` - Bard equipment distributed to merchants
7. `src/lib/game.ts` - Modified `giveStartingEquipment()` to auto-detect bards

---

## Database State
- **Bard Equipment**: 101 items (27 instruments, 74 armor pieces)
- **Bard Abilities**: 40 songs (17 DOTs, 10 immediate damage, 13 heals)
- **Loot Entries**: 2,318 mob drops for bard equipment
- **Crafting Recipes**: 34 recipes for instruments and armor
- **Recipe Materials**: 28 material requirements
- **Level Range**: 1-60 (full progression)
- **Slots Covered**: weapon (existing), offhand (instruments), head, chest, hands, feet ✓

---

## Integration Checklist

- ✅ Equipment items added to database
- ✅ Abilities added to database
- ✅ Charisma scaling implemented
- ✅ Low mana costs for low INT/WIS builds
- ✅ Full level 1-60 progression
- ✅ Loot tables (2,318 entries added)
- ✅ Crafting recipes (34 recipes added)
- ✅ Character creation redirect fixed (now uses `/game`)
- ✅ Scroll drops for bard abilities (~30 scrolls added to loot tables)
- ✅ Starting gear for new bard characters (auto-detects CHA >= 15)
- ✅ Merchant inventory updates (distributed across regions 1-5)
- ⚠️ Buff system implementation (requires ability_effects integration)

---

## Future Enhancements

### 1. Buff Songs Implementation
The original design includes powerful buff songs that need `ability_effects` table integration:
- Song of Courage (STR buff)
- Song of Swiftness (DEX buff)
- Song of Fortitude (CON buff)
- Battle Hymn (damage buff)
- Defender's Chorus (armor buff)
- Worldsong (all stats buff)

### 2. Crowd Control Songs
- Lullaby (sleep effect)
- Song of Fear (fear/flee effect)
- Song of Confusion (accuracy debuff)

### 3. Additional Mechanics
- Song duration extensions based on CHA
- Multi-target buffs for party support
- Combo system (certain songs enhance others)
- Performance skills (non-combat charisma checks)

---

## Testing Recommendations

1. **Create a level 1 bard character**
   - Give starting instrument and performance outfit
   - Test Sonic Blast and Melody of Mending I
   
2. **Create a level 60 bard with max CHA gear**
   - Equip full Eternal set + Infinity's Echo
   - Test damage scaling with Worldending Symphony
   - Verify healing with Eternal Lifesong
   
3. **Compare to other classes**
   - Verify bard damage is competitive with mages
   - Confirm mana efficiency advantage
   - Test healing vs wisdom-based healers

4. **Economy balance**
   - Verify bard equipment values are balanced
   - Test that low mana costs don't make potions obsolete

---

## Class Identity

**The Bard is**: A charismatic performer who uses the power of music to inspire allies, harm enemies, and heal the wounded.

**Best at**: Mana efficiency, versatility, sustained combat, party support

**Weaknesses**: Lower armor than plate users, requires CHA investment, buffs not yet fully implemented

**Playstyle**: Methodical and adaptive, switching between songs based on situation. Excels in longer fights where mana efficiency matters.

---

## Summary

The Bard class is now **fully playable** with 101 pieces of charisma-focused gear and 40 powerful songs spanning damage, healing, and future support roles. With extremely low mana costs and high charisma scaling, bards can maintain sustained performance in long encounters where other casters would run dry. The class fills a unique niche as a mana-efficient hybrid that can adapt to any role the party needs.

### What's Complete:
- ✅ Full equipment progression (1-60)
- ✅ 40 abilities with damage/healing
- ✅ Loot tables (mobs drop bard gear)
- ✅ Crafting recipes (34 recipes)
- ✅ Ability scrolls (learn songs from drops/merchants)
- ✅ Merchant inventory (buy gear in regions 1-5)
- ✅ Auto-starting gear (new characters with CHA >= 15 get bard starter pack)

### How to Play a Bard:
1. Create a new character with **Charisma >= 15** (recommended 18+ CHA)
2. You'll automatically receive:
   - Wooden Lute (offhand instrument)
   - Full performer's outfit (Cap, Tunic, Gloves, Shoes)
   - Sonic Blast (damage song)
   - Melody of Mending I (healing song)
3. Buy additional scrolls from merchants or loot them from mobs
4. Progress through regions to find better instruments and armor

**Next Steps**: Implement buff system via ability_effects table for support role songs.
