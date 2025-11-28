# Weapon/Offhand Requirements for Abilities - Implementation Exploration

## Overview
This document explores what it would take to implement a system where:
1. Certain abilities require specific weapon types or offhand items to be equipped
2. Two-handed weapons occupy both weapon and offhand slots

## Current System State

### Database Schema

**Abilities Table:**
- Has stat requirements: `required_strength`, `required_dexterity`, etc.
- Has level requirement: `required_level`
- Has cost/cooldown: `mana_cost`, `cooldown`
- Has type categorization: `type` (physical, magical, buff, heal)
- **Missing**: No weapon/offhand requirement fields

**Items Table:**
- Has `type` field: 'weapon', 'armor', 'consumable', 'misc'
- Has `slot` field: 'weapon', 'offhand', 'head', 'chest', etc.
- Has `armor_type` field: 'cloth', 'leather', 'chain', 'plate' (for armor only)
- **Missing**: No weapon subtype (staff, sword, bow, dagger, etc.)

### Current Combat Flow
1. User selects ability from hotbar
2. API endpoint `/api/game/attack` receives `abilityId`
3. `processCombatRound()` function validates mana cost only (line 537)
4. Ability is executed if player has enough mana
5. No equipment validation occurs

## Implementation Plan

### Phase 1: Database Schema Changes

#### Option A: Add Weapon Subtype Field (Recommended)
**Items table changes:**
```sql
ALTER TABLE items ADD COLUMN weapon_type TEXT;
-- Values: 'sword', 'staff', 'bow', 'dagger', 'axe', 'mace', 'wand', 'greatsword', 'greataxe', etc.

ALTER TABLE items ADD COLUMN offhand_type TEXT;
-- Values: 'shield', 'orb', 'tome', 'focus', 'quiver', etc.

ALTER TABLE items ADD COLUMN is_two_handed BOOLEAN DEFAULT 0;
-- 1 = occupies both weapon and offhand slots
-- 0 = normal one-handed weapon
```

**Abilities table changes:**
```sql
ALTER TABLE abilities ADD COLUMN required_weapon_type TEXT;
-- Can be NULL (no requirement) or specific type like 'staff', 'sword'

ALTER TABLE abilities ADD COLUMN required_offhand_type TEXT;
-- Can be NULL or specific type like 'orb', 'tome'

ALTER TABLE abilities ADD COLUMN requires_any_weapon BOOLEAN DEFAULT 0;
-- For generic melee abilities that work with any weapon

ALTER TABLE abilities ADD COLUMN requires_any_offhand BOOLEAN DEFAULT 0;
-- For abilities that need any offhand equipped
```

#### Option B: Use JSON for Complex Requirements (More Flexible)
```sql
ALTER TABLE abilities ADD COLUMN equipment_requirements TEXT;
-- JSON format: {
--   "weapon_types": ["staff", "wand"],
--   "offhand_types": ["orb", "tome"],
--   "requires_weapon": true,
--   "requires_offhand": false
-- }
```

**Recommendation:** Option A for simplicity. Most abilities will only require one weapon type.

### Phase 1B: Two-Handed Weapon System

**Concept:**
- Two-handed weapons (greatswords, greataxes, longbows, staves) occupy both weapon AND offhand slots
- When equipped, they prevent equipping an offhand item
- When an offhand is equipped, they prevent equipping a 2-handed weapon
- Higher damage/stats to compensate for losing offhand slot

**Database Approach:**
The `is_two_handed` boolean flag on items tells us if equipping this weapon blocks the offhand slot.

**Equipment Rules:**
1. If equipping a 2-handed weapon → auto-unequip any offhand
2. If equipping an offhand → prevent if 2-handed weapon equipped (show error)
3. Abilities can require "2-handed weapon" specifically

**Examples:**
- Greatsword (is_two_handed=1, weapon_type='greatsword')
- Battle Staff (is_two_handed=1, weapon_type='staff')
- Regular Sword (is_two_handed=0, weapon_type='sword')
- Bow (is_two_handed=0, weapon_type='bow') - requires quiver offhand
- Quiver (slot='offhand', offhand_type='quiver') - holds arrows

### Phase 2: Data Migration

**Update existing items with weapon types:**
```sql
-- Classify existing weapons (one-handed)
UPDATE items SET weapon_type = 'sword', is_two_handed = 0
WHERE name LIKE '%Sword%' OR name LIKE '%Blade%';

UPDATE items SET weapon_type = 'dagger', is_two_handed = 0
WHERE name LIKE '%Dagger%';

UPDATE items SET weapon_type = 'axe', is_two_handed = 0
WHERE name LIKE '%Axe%' AND name NOT LIKE '%Great%';

UPDATE items SET weapon_type = 'mace', is_two_handed = 0
WHERE name LIKE '%Mace%' OR name LIKE '%Club%';

UPDATE items SET weapon_type = 'wand', is_two_handed = 0
WHERE name LIKE '%Wand%';

-- Classify two-handed weapons
UPDATE items SET weapon_type = 'greatsword', is_two_handed = 1
WHERE name LIKE '%Greatsword%' OR name LIKE '%Great Sword%' OR name LIKE '%Claymore%';

UPDATE items SET weapon_type = 'greataxe', is_two_handed = 1
WHERE name LIKE '%Greataxe%' OR name LIKE '%Great Axe%';

UPDATE items SET weapon_type = 'staff', is_two_handed = 1
WHERE name LIKE '%Staff%';

UPDATE items SET weapon_type = 'bow', is_two_handed = 0
WHERE name LIKE '%Bow%';

UPDATE items SET weapon_type = 'polearm', is_two_handed = 1
WHERE name LIKE '%Spear%' OR name LIKE '%Pike%' OR name LIKE '%Halberd%';

-- Classify existing offhands
UPDATE items SET offhand_type = 'orb' 
WHERE name LIKE '%Orb%' AND slot = 'offhand';

UPDATE items SET offhand_type = 'tome' 
WHERE name LIKE '%Tome%' OR name LIKE '%Grimoire%' AND slot = 'offhand';

UPDATE items SET offhand_type = 'shield' 
WHERE name LIKE '%Shield%' AND slot = 'offhand';

UPDATE items SET offhand_type = 'focus'
WHERE name LIKE '%Focus%' OR name LIKE '%Crystal%' AND slot = 'offhand';

UPDATE items SET offhand_type = 'quiver'
WHERE name LIKE '%Quiver%' AND slot = 'offhand';
```

**Update existing abilities with requirements:**
```sql
-- Magic spells require staff/wand + orb/tome
UPDATE abilities SET 
  required_weapon_type = 'staff',
  required_offhand_type = 'orb'
WHERE name LIKE '%bolt%' OR name LIKE '%Fire%' OR name LIKE '%Frost%';

-- Melee abilities require melee weapons
UPDATE abilities SET 
  required_weapon_type = 'sword',
  requires_any_weapon = 1
WHERE name LIKE '%Strike%' OR name LIKE '%Slash%';

-- Archery abilities require bow + quiver
UPDATE abilities SET 
  required_weapon_type = 'bow',
  required_offhand_type = 'quiver'
WHERE name LIKE '%Shot%' OR name LIKE '%Arrow%';

-- Dagger abilities require dagger
UPDATE abilities SET 
  required_weapon_type = 'dagger'
WHERE name LIKE '%Backstab%' OR name LIKE '%Poison Strike%';
```

### Phase 3: Backend Validation

**Update `processCombatRound()` in `src/lib/game.ts`:**

```typescript
// Around line 530, before executing ability
if (abilityId) {
  const abilityResult = await db.execute({
    sql: 'SELECT * FROM abilities WHERE id = ?',
    args: [abilityId],
  });

  const ability = abilityResult.rows[0] as any;
  
  // NEW: Validate weapon requirements
  if (ability.required_weapon_type || ability.required_offhand_type) {
    // Get equipped weapon
    const equippedWeapon = await db.execute({
      sql: `SELECT items.* FROM items 
        JOIN character_inventory ON items.id = character_inventory.item_id
        WHERE character_inventory.character_id = ? 
        AND character_inventory.equipped = 1 
        AND items.slot = 'weapon'`,
      args: [character.id],
    });
    
    // Get equipped offhand
    const equippedOffhand = await db.execute({
      sql: `SELECT items.* FROM items 
        JOIN character_inventory ON items.id = character_inventory.item_id
        WHERE character_inventory.character_id = ? 
        AND character_inventory.equipped = 1 
        AND items.slot = 'offhand'`,
      args: [character.id],
    });
    
    const weapon = equippedWeapon.rows[0] as Item | undefined;
    const offhand = equippedOffhand.rows[0] as Item | undefined;
    
    // Check weapon requirement
    if (ability.required_weapon_type) {
      if (!weapon || weapon.weapon_type !== ability.required_weapon_type) {
        throw new Error(
          `This ability requires a ${ability.required_weapon_type} to be equipped.`
        );
      }
    }
    
    // Check offhand requirement
    if (ability.required_offhand_type) {
      if (!offhand || offhand.offhand_type !== ability.required_offhand_type) {
        throw new Error(
          `This ability requires a ${ability.required_offhand_type} to be equipped.`
        );
      }
    }
  }
  
  // Rest of existing ability execution code...
}
```

### Phase 3B: Two-Handed Weapon Equip Logic

**Update equipment API endpoint (`/api/game/equip` or similar):**

```typescript
// When equipping an item
async function equipItem(characterId: number, itemId: number) {
  // Get the item being equipped
  const itemResult = await db.execute({
    sql: 'SELECT * FROM items WHERE id = ?',
    args: [itemId]
  });
  const item = itemResult.rows[0] as Item;
  
  if (item.slot === 'weapon' && item.is_two_handed) {
    // TWO-HANDED WEAPON: Auto-unequip any offhand
    await db.execute({
      sql: `UPDATE character_inventory 
            SET equipped = 0 
            WHERE character_id = ? 
            AND equipped = 1 
            AND item_id IN (SELECT id FROM items WHERE slot = 'offhand')`,
      args: [characterId]
    });
  }
  
  if (item.slot === 'offhand') {
    // OFFHAND: Check if 2-handed weapon equipped
    const twoHandedCheck = await db.execute({
      sql: `SELECT items.* FROM items
            JOIN character_inventory ON items.id = character_inventory.item_id
            WHERE character_inventory.character_id = ?
            AND character_inventory.equipped = 1
            AND items.slot = 'weapon'
            AND items.is_two_handed = 1`,
      args: [characterId]
    });
    
    if (twoHandedCheck.rows.length > 0) {
      const twoHandedWeapon = twoHandedCheck.rows[0] as Item;
      throw new Error(
        `Cannot equip offhand while ${twoHandedWeapon.name} (2-handed) is equipped. Unequip your weapon first.`
      );
    }
  }
  
  // Unequip any item in the same slot
  await db.execute({
    sql: `UPDATE character_inventory 
          SET equipped = 0 
          WHERE character_id = ? 
          AND equipped = 1 
          AND item_id IN (SELECT id FROM items WHERE slot = ?)`,
    args: [characterId, item.slot]
  });
  
  // Equip the new item
  await db.execute({
    sql: `UPDATE character_inventory 
          SET equipped = 1 
          WHERE character_id = ? AND item_id = ?`,
    args: [characterId, itemId]
  });
}
```

### Phase 4: Frontend Updates

#### 4.1: Hotbar Display
**Update `src/components/AbilityHotbar.tsx` or equivalent:**

```typescript
// Add visual indicator if ability is unusable due to equipment
const canUseAbility = (ability: Ability) => {
  // Check mana
  if (currentMana() < ability.mana_cost) return false;
  
  // NEW: Check weapon requirements
  if (ability.required_weapon_type) {
    const equippedWeapon = inventory().find(
      item => item.equipped && item.slot === 'weapon'
    );
    if (!equippedWeapon || equippedWeapon.weapon_type !== ability.required_weapon_type) {
      return false;
    }
  }
  
  // NEW: Check offhand requirements
  if (ability.required_offhand_type) {
    const equippedOffhand = inventory().find(
      item => item.equipped && item.slot === 'offhand'
    );
    if (!equippedOffhand || equippedOffhand.offhand_type !== ability.required_offhand_type) {
      return false;
    }
  }
  
  return true;
};

// Visual styling
<button 
  class={`ability-button ${!canUseAbility(ability) ? 'disabled' : ''}`}
  disabled={!canUseAbility(ability)}
  title={getDisabledReason(ability)}
>
```

#### 4.2: Ability Tooltips
**Add equipment requirements to tooltips:**

```typescript
const getAbilityTooltip = (ability: Ability) => {
  let tooltip = ability.description;
  
  if (ability.required_weapon_type) {
    tooltip += `\n\nRequires: ${ability.required_weapon_type}`;
  }
  
  if (ability.required_offhand_type) {
    tooltip += `\nRequires: ${ability.required_offhand_type} (offhand)`;
  }
  
  return tooltip;
};
```

#### 4.3: Error Handling
**Display friendly error messages:**

```typescript
try {
  await fetch('/api/game/attack', {
    method: 'POST',
    body: JSON.stringify({ combatId, abilityId })
  });
} catch (error) {
  if (error.message.includes('requires a')) {
    // Show equipment requirement error prominently
    showNotification(error.message, 'warning');
  }
}
```

#### 4.4: Two-Handed Weapon UI Indicators

**Equipment/Inventory Page:**

```tsx
<div class="item-card">
  <h3>{item.name}</h3>
  
  {/* Show 2-handed indicator */}
  <Show when={item.is_two_handed}>
    <span class="two-handed-badge">
      ⚔️ Two-Handed
    </span>
    <p class="warning-text">
      Equipping this will remove your offhand item
    </p>
  </Show>
  
  {/* Show what weapon type it is */}
  <Show when={item.weapon_type}>
    <span class="weapon-type-badge">
      {item.weapon_type}
    </span>
  </Show>
</div>
```

**Character Stats/Equipment Display:**

```tsx
// Show "blocked" state for offhand when 2-handed equipped
<div class="equipment-slot offhand">
  <Show when={equippedWeapon?.is_two_handed} fallback={
    // Normal offhand slot
    <Show when={equippedOffhand}>
      <ItemCard item={equippedOffhand} />
    </Show>
  }>
    {/* Blocked by 2-handed weapon */}
    <div class="slot-blocked">
      <div class="blocked-icon">🚫</div>
      <div class="blocked-text">
        Blocked by {equippedWeapon.name}
      </div>
    </div>
  </Show>
</div>
```

**Equip Button Behavior:**

```tsx
// Disable offhand equip button when 2-handed weapon equipped
<button
  disabled={
    item.slot === 'offhand' && 
    equippedWeapon?.is_two_handed
  }
  title={
    item.slot === 'offhand' && equippedWeapon?.is_two_handed
      ? `Cannot equip: ${equippedWeapon.name} is two-handed`
      : 'Equip item'
  }
>
  Equip
</button>
```

### Phase 5: UI/UX Enhancements

#### 5.1: Character Stats Page
**Show weapon/offhand requirements on ability cards:**

```tsx
<div class="ability-card">
  <h3>{ability.name}</h3>
  <p>{ability.description}</p>
  
  {/* Requirements section */}
  <div class="requirements">
    <Show when={ability.required_level > 1}>
      <span>Level {ability.required_level}</span>
    </Show>
    
    {/* NEW: Weapon requirement */}
    <Show when={ability.required_weapon_type}>
      <span class="equipment-req">
        ⚔️ {ability.required_weapon_type}
      </span>
    </Show>
    
    {/* NEW: Offhand requirement */}
    <Show when={ability.required_offhand_type}>
      <span class="equipment-req">
        🛡️ {ability.required_offhand_type}
      </span>
    </Show>
  </div>
</div>
```

#### 5.2: Equipment Page
**Show which abilities are enabled by equipping an item:**

```tsx
<div class="item-details">
  <h3>{weapon.name}</h3>
  <p>Type: {weapon.weapon_type}</p>
  
  {/* NEW: Show compatible abilities */}
  <div class="enables-abilities">
    <h4>Enables Abilities:</h4>
    <For each={abilitiesRequiringWeapon(weapon.weapon_type)}>
      {ability => <span class="ability-tag">{ability.name}</span>}
    </For>
  </div>
</div>
```

## Example Use Cases

### Use Case 1: Mage Spells (One-Handed Staff)
```
Item: "Apprentice Staff"
- weapon_type: 'wand'
- is_two_handed: 0

Item: "Crystal Orb"
- offhand_type: 'orb'

Ability: "Fireball"
- required_weapon_type: 'wand'
- required_offhand_type: 'orb'

Result: Player uses wand + orb combo for Fireball
```

### Use Case 2: Mage Spells (Two-Handed Staff)
```
Item: "Battle Staff"
- weapon_type: 'staff'
- is_two_handed: 1

Ability: "Meteor Strike"
- required_weapon_type: 'staff'
- required_offhand_type: NULL

Result: Player uses powerful 2-handed staff, no offhand needed/possible
Balance: Higher spell power but can't use offhand bonuses
```

### Use Case 3: Archery Abilities
```
Item: "Longbow"
- weapon_type: 'bow'
- is_two_handed: 0

Item: "Leather Quiver"
- offhand_type: 'quiver'
- slot: 'offhand'

Ability: "Piercing Shot"
- required_weapon_type: 'bow'
- required_offhand_type: 'quiver'

Result: Bow + quiver combo required for archery abilities
Balance: Quiver can provide bonuses (arrow damage, crit chance, capacity)
```

### Use Case 4: Dual-Wield Dagger Build
```
Item: "Assassin's Dagger" (weapon)
- weapon_type: 'dagger'
- is_two_handed: 0

Item: "Poisoned Dagger" (offhand)
- offhand_type: 'dagger'

Ability: "Dual Strike"
- required_weapon_type: 'dagger'
- required_offhand_type: 'dagger'

Result: Requires dagger in both hands
```

### Use Case 5: Sword & Shield Tank
```
Item: "Longsword"
- weapon_type: 'sword'
- is_two_handed: 0

Item: "Tower Shield"
- offhand_type: 'shield'

Ability: "Shield Bash"
- required_offhand_type: 'shield'

Result: Can use any weapon + shield for Shield Bash
```

### Use Case 6: Greatsword Warrior
```
Item: "Greatsword of Doom"
- weapon_type: 'greatsword'
- is_two_handed: 1
- damage_min: 45, damage_max: 65

Ability: "Cleaving Strike"
- required_weapon_type: 'greatsword'

Result: High damage 2-handed weapon, blocks shield
Balance: Higher damage than sword+shield but no defensive offhand
```

### Use Case 7: Generic Melee
```
Ability: "Whirlwind Strike"
- requires_any_weapon: 1

Result: Works with ANY weapon type (sword, axe, greatsword, etc.)
```

## Migration Strategy

### Step 1: Add Columns (Non-Breaking)
Add new columns with NULL defaults. Existing functionality continues to work.

### Step 2: Classify Existing Data
Run migration scripts to populate weapon_type and offhand_type for existing items.

### Step 3: Add Backend Validation
Update combat code to check requirements, but make it lenient initially (log warnings instead of errors).

### Step 4: Update Frontend
Add UI indicators for equipment requirements.

### Step 5: Enable Strict Mode
Once tested, make equipment requirements strictly enforced.

## Considerations

### Performance
- Equipment checks happen once per ability use
- Requires 1-2 additional DB queries per ability (can be cached)
- Minimal performance impact

### Balance
- Opens up interesting build diversity:
  - **Mage**: wand+orb (versatile) vs 2H staff (power)
  - **Warrior**: sword+shield (defense) vs greatsword (offense)
  - **Archer**: bow+quiver (required combo for ranged abilities)
- Prevents class-mixing cheese (warrior using fireball)
- Makes equipment choices meaningful and strategic
- **2-handed weapons** create trade-off: higher base damage vs losing offhand utility

### Complexity
- **Low**: Simple string matching for weapon types
- **Medium**: Need to classify all existing items + add 2-handed flags
- **Medium**: UI updates to show requirements and blocked slots
- **Medium**: Equipment logic to handle 2-handed auto-unequip

### Two-Handed Weapon Balance Examples
```
One-Handed Sword:
- Damage: 15-22
- Can use Shield (+armor/block chance)
- Can use Orb (+spell power)
- More versatile

Greatsword (2-handed):
- Damage: 28-40 (much higher!)
- Blocks offhand slot
- Higher risk, higher reward
- Specific abilities only
```

### Future Extensions
- Combo requirements: "staff OR wand"
- Quality requirements: "masterwork weapon or better"
- Set bonuses: "requires 3-piece mage set"
- Temporary weapon enchants that enable abilities
- Dual-wield system (two weapons, no offhand)
- Stance system (defensive stance with shield, offensive with 2H)

## Estimated Effort

### Database
- Schema changes (weapon_type, offhand_type, is_two_handed): **30 minutes**
- Data migration scripts: **3 hours** (classify all items + 2-handed flags)

### Backend
- Ability validation logic: **2 hours**
- Equipment equip/unequip logic (2-handed handling): **2 hours**
- Testing: **2 hours**

### Frontend
- Hotbar updates (disable based on equipment): **2 hours**
- Tooltip/UI updates (show requirements): **2 hours**
- 2-handed weapon UI (blocked slot, badges, warnings): **3 hours**
- Equipment page updates: **2 hours**
- Testing: **2 hours**

### Total: ~18-22 hours

## Recommendation

**Implement in phases:**

1. **Phase 1A (Required)**: Database schema (weapon_type, offhand_type, is_two_handed)
2. **Phase 1B (Required)**: Data migration (classify all items, mark 2-handed)
3. **Phase 2 (Required)**: Backend validation (ability requirements + equipment)
4. **Phase 3A (Required)**: Equipment logic (2-handed auto-unequip/block)
5. **Phase 3B (Required)**: Basic UI indicators (disable buttons, show requirements)
6. **Phase 4 (Recommended)**: Enhanced UI (2-handed badges, blocked slot visual, tooltips)
7. **Phase 5 (Optional)**: Equipment page enhancements (show enabled abilities)
8. **Phase 6 (Future)**: Advanced features (combo requirements, dual-wield, etc.)

**Key Design Decisions:**

1. **Simple weapon_type strings** (not enums) for flexibility
2. **Boolean is_two_handed flag** - simple and clear
3. **Auto-unequip offhand** when equipping 2H weapon (better UX than error)
4. **Block offhand equip** when 2H equipped (show clear error message)
5. **Higher damage for 2H weapons** to compensate for losing offhand slot

**Test thoroughly:**
- Equipping 2H weapon with offhand equipped → offhand auto-removed
- Equipping offhand with 2H weapon equipped → error shown
- Switching between 1H and 2H weapons → smooth transition
- Abilities disabled when wrong equipment → clear visual feedback
- Mid-combat equipment swaps → handled gracefully
- Edge case: What if someone removes weapon during combat? (Block or allow?)

**Balance Recommendations:**
```
2-Handed Damage Multiplier: 1.7x - 2.0x of 1-handed
- Compensates for lost offhand stats
- Makes choice meaningful but not mandatory
- Example: 1H sword (20 dmg) vs 2H greatsword (38 dmg)

Offhand Stat Budget: 60-80% of main piece
- Shields: High armor, low stats
- Orbs/Tomes: Good spell stats
- Daggers (offhand): Moderate damage
```


---

## Special Note: Quivers for Archery

**Design Decision:** Bows are 1-handed weapons that REQUIRE a quiver in the offhand slot.

**Rationale:**
- Realistic: Archers need arrows, stored in quivers
- Prevents bow + shield (which doesn't make sense)
- Allows quiver progression and variety
- Creates archer-specific offhand itemization

**Quiver Item Examples:**

```sql
-- Basic quiver
INSERT INTO items (name, description, type, slot, offhand_type, value) 
VALUES ('Leather Quiver', 'Holds 20 arrows', 'armor', 'offhand', 'quiver', 50);

-- Advanced quivers with bonuses
INSERT INTO items (name, description, type, slot, offhand_type, dexterity_bonus, value)
VALUES ('Ranger Quiver', 'Enchanted quiver with +3 DEX', 'armor', 'offhand', 'quiver', 3, 500);

-- Special quivers
INSERT INTO items (name, description, type, slot, offhand_type, damage_min, damage_max, value)
VALUES ('Quiver of Piercing', 'Arrows deal +5 damage', 'armor', 'offhand', 'quiver', 5, 5, 1000);
```

**Quiver Stat Possibilities:**
- **Arrow Capacity**: Could track ammo in future (not required initially)
- **Damage Bonus**: +damage to ranged attacks
- **Dexterity**: Improves aim and attack speed
- **Crit Chance**: Special arrows that crit more often
- **Special Effects**: Poison arrows, fire arrows, etc.

**Ability Requirements:**
```sql
-- All archery abilities require bow + quiver
UPDATE abilities SET 
  required_weapon_type = 'bow',
  required_offhand_type = 'quiver'
WHERE type = 'physical' AND (name LIKE '%Shot%' OR name LIKE '%Arrow%');
```

**Why Not 2-Handed Bows?**
- Loses opportunity for interesting quiver progression
- No variety in offhand slot for archers
- Historically, bows were used with quivers, not alone
- Creates room for different quiver types (light, heavy, magical, etc.)

**Future Expansion Ideas:**
- Arrow crafting system (arrows stored in quiver)
- Quiver capacity limiting number of shots
- Different arrow types (broadhead, bodkin, flame)
- Legendary quivers with unique effects
- Cross-class hybrid: bow + dagger offhand for melee backup (but can't use archery abilities)
