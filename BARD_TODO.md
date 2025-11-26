# Bard Class - Remaining Tasks

## ✅ Completed
- Equipment items (101 pieces)
- Abilities/Songs (40 abilities)
- Charisma scaling
- Low mana costs
- Documentation

## 🔧 In Progress

### 1. Loot Tables for Bard Equipment
**Status**: Creating now

All bard equipment needs to be added to mob loot tables:
- Instruments (offhand items)
- Performance armor (head, chest, hands, feet)
- Appropriate drop rates by rarity
- Distributed across level-appropriate mobs

### 2. Crafting Recipes for Bard Equipment
**Status**: Creating now

Need recipes for:
- **Instruments**: Woodworking + rare materials (strings, reeds, etc.)
- **Performance Armor**: Tailoring/Leatherworking + decorative materials
- Recipe materials by tier

## 📋 Still TODO

### 3. Ability Scrolls
**Priority**: Medium

Create scrolls that teach bard songs:
- Scroll: Sonic Blast
- Scroll: Discordant Note I-IV
- Scroll: Cacophony I-IV
- Scroll: Melody of Mending I-III
- etc.

Add to mob loot tables and merchant inventories.

### 4. Buff Song System
**Priority**: High (Core class feature)

Implement buff songs using ability_effects table:
- Song of Courage (STR buff)
- Song of Swiftness (DEX buff)
- Song of Fortitude (CON buff)
- Song of Clarity (INT buff)
- Song of Wisdom (WIS buff)
- Battle Hymn (damage buff)
- Defender's Chorus (armor buff)
- Anthem of Heroes (all stats buff)

**Requirements**:
- Need to integrate with ability_effects system
- Duration tracking
- Buff stacking rules
- Visual indicators in UI

### 5. Crowd Control Songs
**Priority**: Medium

Implement CC effects:
- Lullaby (sleep)
- Song of Fear (flee/fear)
- Song of Confusion (accuracy debuff)

**Requirements**:
- Combat system integration for status effects
- Break-on-damage mechanics for sleep
- Fear pathing/AI

### 6. Starting Gear Sets
**Priority**: High (Quality of Life)

Create starter equipment packages for new bard characters:
- Level 1 Wooden Lute (offhand)
- Level 1 Performer's outfit (head, chest, hands, feet)
- Starting songs (Sonic Blast, Melody of Mending I)

**Implementation**:
- Add to character creation flow
- Or give via quest/NPC

### 7. Merchant Inventory
**Priority**: Medium

Add bard equipment to merchants:
- Early merchants: Common/Uncommon instruments
- Mid-tier merchants: Rare performance armor
- High-tier merchants: Epic/Legendary instruments
- Spread across regions

### 8. Class-Specific Content
**Priority**: Low (Polish)

Optional bard-themed content:
- Bard trainer NPCs
- Performance quests
- Bard guild
- Special instrument quest chains
- Legendary instrument lore

### 9. Balance Testing
**Priority**: High

Test and balance:
- Charisma scaling multipliers
- Mana costs vs other classes
- Damage output compared to mages
- Healing output compared to clerics
- Equipment stat distributions

### 10. UI Updates
**Priority**: Medium

Update UI to support bard mechanics:
- Show charisma as primary stat in character sheet
- Buff duration indicators
- Song cooldown displays
- Instrument display in equipment screen

## 📊 Estimated Work

| Task | Priority | Complexity | Time Estimate |
|------|----------|------------|---------------|
| Loot Tables | High | Low | ✅ In Progress |
| Crafting Recipes | High | Low | ✅ In Progress |
| Ability Scrolls | Medium | Low | 1-2 hours |
| Buff System | High | High | 4-6 hours |
| CC Effects | Medium | Medium | 2-3 hours |
| Starting Gear | High | Low | 30 mins |
| Merchant Inventory | Medium | Low | 1 hour |
| Class Content | Low | Medium | 3-5 hours |
| Balance Testing | High | Medium | 2-4 hours |
| UI Updates | Medium | Medium | 2-3 hours |

**Total Remaining**: ~15-25 hours of development

## 🎯 Recommended Order

1. **Loot Tables** ✅ (In Progress)
2. **Crafting Recipes** ✅ (In Progress)
3. **Starting Gear** (Critical for playability)
4. **Buff System** (Core class feature)
5. **Balance Testing** (Ensure class is fun)
6. **Ability Scrolls** (Progression system)
7. **Merchant Inventory** (Accessibility)
8. **UI Updates** (User experience)
9. **CC Effects** (Additional depth)
10. **Class Content** (Polish/flavor)
