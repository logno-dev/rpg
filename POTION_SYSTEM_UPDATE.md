# Potion System Expansion

## Summary of Changes

### 1. ✅ Added Consumable Effect Fields to GM UI
**File**: `/src/routes/gm.tsx`

Added two new fields to the Items editor in the GM UI:
- **Health Restore**: HP restored when consumed
- **Mana Restore**: MP restored when consumed

These fields appear in the "Consumable Settings" section, making it easy to configure potion effects directly in the UI.

---

### 2. ✅ Created Tiered Potion System
**File**: `/db/migrations/038_expand_potion_system.sql`

Replaced the basic "Health Potion" and "Mana Potion" with a 6-tier system:

| Tier | Health Potions | Mana Potions | Level Range | Rarity |
|------|---------------|--------------|-------------|--------|
| 1 | Minor Health Potion (50 HP) | Minor Mana Potion (40 MP) | 1-10 | Common |
| 2 | Lesser Health Potion (150 HP) | Lesser Mana Potion (120 MP) | 10-20 | Common |
| 3 | Health Potion (300 HP) | Mana Potion (250 MP) | 20-30 | Uncommon |
| 4 | Greater Health Potion (600 HP) | Greater Mana Potion (500 MP) | 30-40 | Uncommon |
| 5 | Superior Health Potion (1000 HP) | Superior Mana Potion (850 MP) | 40-50 | Rare |
| 6 | Supreme Health Potion (1500 HP) | Supreme Mana Potion (1300 MP) | 50-60 | Rare |

**Special Potions** - Rejuvenation Potions (restore both HP and MP):
- Minor Rejuvenation Potion (40 HP + 30 MP) - Uncommon
- Rejuvenation Potion (200 HP + 150 MP) - Rare
- Greater Rejuvenation Potion (500 HP + 400 MP) - Rare

---

### 3. ✅ Fixed Alchemy Recipe Names
**File**: `/db/update-alchemy-recipe-names.mjs`

**Problem**: Level 1 and Level 2 alchemy recipes both created "Health Potion (50 HP)" with identical names

**Solution**: Updated alchemy recipes to use the new tiered naming system:
- Level 1-3: Minor Potions
- Level 5-7: Lesser Potions
- Level 10-12: Normal Potions
- Level 15-17: Greater Potions
- Level 20-22: Superior Potions
- Level 25-27: Supreme Potions

Each tier now has unique names and appropriate material requirements.

---

### 4. ✅ Added Potions to Mob Loot Tables
**File**: `/db/add-potion-loot-tables.mjs`

Distributed potions across all mobs based on level ranges:

**Drop Rate Strategy**:
- Lower tier potions: 12-15% drop rate
- Mid tier potions: 8-10% drop rate
- High tier potions: 4-6% drop rate
- Rejuvenation potions: 3-5% drop rate (rarer)

**Level Distribution**:
- Mobs level 1-10: Drop Minor potions
- Mobs level 10-20: Drop Lesser potions
- Mobs level 20-30: Drop Normal potions
- Mobs level 30-40: Drop Greater potions
- Mobs level 40-50: Drop Superior potions
- Mobs level 50-60: Drop Supreme potions

---

## How to Apply

### Step 1: Run the migration
```bash
cd db
node migrate.mjs
```

### Step 2: Update alchemy recipes
```bash
node update-alchemy-recipe-names.mjs
```

### Step 3: Add potions to loot tables
```bash
node add-potion-loot-tables.mjs
```

---

## Using the GM UI

1. Navigate to `/gm` in your browser
2. Click the "Items" tab
3. Click "Create New" or edit an existing item
4. Set Type to "Consumable"
5. Configure the new fields:
   - **Health Restore**: Amount of HP to restore
   - **Mana Restore**: Amount of MP to restore
6. Save the item

The consumable will now work properly when used in-game!

---

## Benefits

✅ **Unique Names**: Each alchemy recipe now produces a uniquely named potion
✅ **Level Appropriate**: Potions scale with character level progression
✅ **Balanced Economy**: Rarer potions have lower drop rates and higher values
✅ **GM Control**: Easy to configure potion effects via the UI
✅ **Progression**: Players have clear upgrade paths for their consumables
✅ **Loot Variety**: Mobs now drop level-appropriate potions automatically

---

## Example Alchemy Crafting Flow

**Level 1 Alchemist**:
- Can craft: Minor Health Potion, Minor Mana Potion
- Materials: 2 Herbs each

**Level 5 Alchemist**:
- Can craft: Lesser Health Potion, Lesser Mana Potion
- Materials: 3 Herbs each

**Level 12 Alchemist**:
- Can craft: Health Potion, Mana Potion, Rejuvenation Potion
- Materials: 4-5 Herbs + 1-2 Minor Gemstones

**Level 25 Alchemist**:
- Can craft: Supreme Health Potion, Supreme Mana Potion
- Materials: 8 Rare Herbs + 2 Major Gemstones
