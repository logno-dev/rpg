# Wiki Dynamic Routes Implementation

## Overview
Implemented dynamic detail pages for items, abilities, and quests in the wiki with full database integration and clickable links from table listings.

## New Routes Created

### 1. Equipment Detail Page
**Route:** `/wiki/equipment/[id]`  
**File:** `/src/routes/wiki/equipment/[id].tsx`

#### Features:
- **Item Information Section**
  - Type and slot
  - Rarity (color-coded)
  - Weapon/armor type
  - Two-handed indicator
  - Value in gold
  - Stackable status
  - Description

- **Combat Stats Section** (conditional)
  - Damage range
  - Armor value
  - Attack speed multiplier

- **Stat Bonuses Section** (conditional)
  - All 6 primary stats (STR, DEX, CON, INT, WIS, CHA)
  - Displayed in grid layout

- **Consumable Effects Section** (conditional)
  - Health restoration
  - Mana restoration

- **Requirements Section** (conditional)
  - Level requirement
  - All stat requirements

#### Design:
- Color-coded rarity throughout
- Conditional sections (only show if relevant)
- Clean grid layouts for stats
- Back button to equipment list

### 2. Ability Detail Page
**Route:** `/wiki/ability/[id]`  
**File:** `/src/routes/wiki/ability/[id].tsx`

#### Features:
- **Ability Information Section**
  - Type and category (color-coded)
  - Tier level
  - Mana cost
  - Cooldown
  - Primary stat
  - Stat scaling percentage

- **Effects Section** (from ability_effects table)
  - Each effect in separate card
  - Border color matches effect type
  - Shows:
    - Direct damage/healing
    - Stat buffs with duration
    - Damage over time (DoT)
    - Healing over time (HoT)
    - Thorns (damage reflection)
    - Scaling information
  - Target indicator (self/enemy)

- **Equipment Requirements Section** (conditional)
  - Weapon type requirements
  - Offhand type requirements
  - Highlighted with warning colors

- **Stat Requirements Section** (conditional)
  - Level requirement
  - All stat requirements

#### Design:
- Category-based color coding
- Effect cards with colored borders
- Clear distinction between requirement types
- Back button to abilities list

### 3. Quest Detail Page
**Route:** `/wiki/quest/[id]`  
**File:** `/src/routes/wiki/quest/[id].tsx`

#### Features:
- **Quest Information Section**
  - Region name
  - Minimum level
  - Quest type (repeatable/one-time)
  - Cooldown hours (for repeatable)
  - Quest chain information
  - Description

- **Objectives Section**
  - Numbered objective cards
  - Each shows:
    - Description
    - Objective type (kill/collect)
    - Required count
    - Target mob name (for kill quests)
    - Item name (for collection quests)
    - Location/sub-area
    - Auto-complete indicator

- **Rewards Section** (green highlighted)
  - Experience points
  - Gold
  - Items with quantities
  - Crafting materials with quantities

- **Quest Tips Section**
  - Context-sensitive tips based on quest properties
  - Kill objective tips
  - Collection objective tips
  - Repeatable quest tips
  - Quest chain tips

#### Design:
- Objectives with left accent borders
- Rewards in success-colored card
- Tips in info-colored card
- Comprehensive data from joined tables
- Back button to quests list

## Table Updates (WikiData.tsx)

### Added Navigation Links
All three wiki tables now have clickable item names that link to detail pages:

#### AbilityTable
- Name column now links to `/wiki/ability/[id]`
- Links styled with accent color

#### ItemTable
- Name column now links to `/wiki/equipment/[id]`
- Links preserve rarity color

#### QuestTable
- Name column now links to `/wiki/quest/[id]`
- Links styled with accent color

### Import Added
```typescript
import { A } from "@solidjs/router";
```

## Database Queries

### Equipment Detail
```sql
SELECT * FROM items WHERE id = ?
```

### Ability Detail
```sql
-- Main ability data
SELECT * FROM abilities WHERE id = ?

-- Ability effects
SELECT * FROM ability_effects 
WHERE ability_id = ? 
ORDER BY effect_order ASC
```

### Quest Detail
```sql
-- Quest with region
SELECT q.*, r.name as region_name 
FROM quests q 
JOIN regions r ON q.region_id = r.id 
WHERE q.id = ?

-- Objectives with related data
SELECT qo.*, 
       m.name as mob_name, 
       cm.name as material_name,
       sa.name as sub_area_name
FROM quest_objectives qo
LEFT JOIN mobs m ON qo.target_mob_id = m.id
LEFT JOIN crafting_materials cm ON qo.target_item_id = cm.id
LEFT JOIN sub_areas sa ON qo.target_sub_area_id = sa.id
WHERE qo.quest_id = ?
ORDER BY qo.objective_order ASC

-- Rewards with item/material names
SELECT qr.*, 
       i.name as item_name,
       cm.name as material_name
FROM quest_rewards qr
LEFT JOIN items i ON qr.reward_item_id = i.id
LEFT JOIN crafting_materials cm ON qr.reward_material_id = cm.id
WHERE qr.quest_id = ?
```

## User Experience

### Navigation Flow
1. **Wiki Home** → Equipment/Abilities/Quests page
2. **List Page** → Browse table of all items/abilities/quests
3. **Click Item Name** → Navigate to detail page
4. **Detail Page** → View comprehensive information
5. **Back Button** → Return to list page

### Benefits
- **Deep Linking**: Direct URLs to specific items/abilities/quests
- **Comprehensive Data**: All database information displayed
- **Clean Organization**: Sectioned layouts with conditional rendering
- **Consistent Design**: Matches wiki aesthetic across all pages
- **Server-Side Rendering**: Fast initial page loads
- **Error Handling**: Graceful handling of invalid IDs or missing data

## Technical Implementation

### Server Functions
All data fetching uses `"use server"` directive for server-side execution:
- Efficient database queries
- No client-side data exposure
- Better performance

### Resource Management
Uses SolidJS `createResource` for:
- Automatic loading states
- Error handling
- Reactive updates when params change

### Conditional Rendering
Extensive use of `<Show>` components to:
- Only display relevant sections
- Handle loading and error states
- Provide clean UX

## File Structure
```
src/routes/wiki/
├── equipment/
│   └── [id].tsx          (NEW - Item detail page)
├── ability/
│   └── [id].tsx          (NEW - Ability detail page)
├── quest/
│   └── [id].tsx          (NEW - Quest detail page)
├── abilities.tsx
├── equipment.tsx
├── quests.tsx
└── ...

src/components/
└── WikiData.tsx          (UPDATED - Added links to tables)
```

## Example URLs
- `/wiki/equipment/42` - Iron Sword details
- `/wiki/ability/15` - Fireball details
- `/wiki/quest/3` - "Clear the Rats" details

## Future Enhancements
1. Add breadcrumb navigation
2. Show "Similar Items/Abilities/Quests"
3. Add user comments/ratings
4. Show drop locations for items
5. Link to mobs that drop items
6. Show which NPCs give quests
7. Add "Required For" sections (what uses this item/ability)
