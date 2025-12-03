# Wiki Loot Sources Enhancement

## Overview
Enhanced wiki pages to show loot sources, quest rewards, and created dynamic routes for crafting materials with full source information.

## Changes Made

### 1. ✅ Item/Equipment Wiki Pages - Added Loot & Quest Sources

**File:** `/src/routes/wiki/equipment/[id].tsx`

#### New Sections Added:

**Loot Sources Section:**
- Shows all mobs that drop this item (regular and named/bosses)
- Displays mob name, level, and **spawn area**
- Shows drop rate percentage
- Indicates quantity range if item drops in stacks
- Named mobs/bosses highlighted with golden border and warning color
- Shows region name for named mobs

**Quest Rewards Section:**
- Lists all quests that reward this item
- Clickable links to quest detail pages
- Shows quest level and region
- Displays quantity if quest gives multiple items

#### Data Fetched:
```typescript
{
  item: Item,
  mobLoot: [{
    mob_name, mob_level, mob_area, 
    drop_chance, quantity_min, quantity_max
  }],
  namedMobLoot: [{
    mob_name, mob_title, mob_level, region_name,
    drop_chance, quantity_min, quantity_max
  }],
  questRewards: [{
    quest_id, quest_name, quest_level, region_name, quantity
  }]
}
```

---

### 2. ✅ Created Crafting Material Dynamic Routes

**New File:** `/src/routes/wiki/material/[id].tsx`

Complete detail pages for every crafting material showing:

#### Material Information:
- Name (color-coded by rarity)
- Rarity level
- Description
- Special material indicator (quest/dungeon only)

#### Used In Recipes:
- Lists all recipes that use this material
- Shows profession type, level requirement, and tier
- Helps players understand material value

#### Loot Sources:
- **Regular Mobs** - Shows count of sources (e.g., "Regular Mobs (81 sources)")
  - Mob name, level, and spawn area
  - Drop rate percentage
  - Quantity range
- **Named Mobs & Bosses** - Golden border highlight
  - Boss name with title
  - Level and region
  - Drop rate (typically higher than regular mobs)

#### Quest Rewards:
- Clickable links to quest pages
- Quest level and region
- Quantity obtained

#### No Sources Warning:
- Special warning card for materials with no known sources
- Explains possible reasons (special events, future content, legacy)

---

### 3. ✅ Linked Materials Throughout Wiki

**File:** `/src/routes/wiki/crafting.tsx`

#### Crafting Materials Table:
- Material names now link to `/wiki/material/[id]`
- Preserves rarity color coding

#### Recipe Outcomes Table:
- "Special Material" column entries now link to material pages
- Shows which special material unlocks each outcome
- "Always available" remains unlinked (no special material required)

#### SQL Query Enhanced:
```sql
SELECT 
  ...
  cm.id as required_material_id,  -- Added for linking
  cm.name as required_material,
  cm.rarity as material_rarity
FROM recipe_outputs ro
LEFT JOIN crafting_materials cm ON ro.requires_rare_material_id = cm.id
```

---

## User Experience Improvements

### For Item Seekers:
- **"Where do I get this item?"** - Instantly see all sources
- **Mob farming** - Know exact mob names, levels, and areas
- **Quest planning** - See which quests reward desired items
- **Drop rate transparency** - Make informed farming decisions

### For Crafters:
- **Material sourcing** - Click any material to see where it drops
- **Efficient farming** - See all 81 sources for Rare Herbs at a glance
- **Recipe planning** - Understand which special materials unlock better outcomes
- **Quest prioritization** - See which quests reward needed materials

### For New Players:
- **Discovery** - Explore material sources naturally through links
- **Learning** - Understand the connection between crafting and world content
- **Planning** - Know what level mobs/quests to target for materials

---

## Examples

### Example 1: Health Potion
Visit `/wiki/equipment/13` to see:
- Drops from: Multiple merchants (stock available)
- Quest rewards: Various quests
- Can be crafted via Alchemy

### Example 2: Reinforced Leather (New Material)
Visit `/wiki/material/48` to see:
- Drops from: 20 tough beast-type mobs (Dragons, Wyverns, Behemoths, etc.)
- All level 25+ monsters
- 15% drop rate, 1-2 quantity
- Used in: 4 Advanced leatherworking recipes
- Shows spawn areas for each mob

### Example 3: Rare Herbs
Visit `/wiki/material/17` to see:
- Drops from: 81 nature/forest creatures
- Level 6+ Treants, Sprites, Dryads, etc.
- 25% drop rate, 1-2 quantity
- Used in: Various Alchemy recipes

---

## Technical Details

### Query Optimization:
- All loot sources fetched in single server function
- JOINs with mobs/regions for complete info
- Ordered by level and name for easy scanning

### UI Features:
- Color-coded rarity throughout
- Hover effects on clickable elements
- Responsive grid layouts
- Mobile-friendly card designs
- Visual separation between regular mobs and bosses

### Navigation:
- Back links to parent wiki pages
- Breadcrumb-style navigation
- Deep linking support for sharing specific items/materials

---

## Files Modified
- `/src/routes/wiki/equipment/[id].tsx` - Enhanced with loot/quest sources
- `/src/routes/wiki/crafting.tsx` - Added material links and material_id to queries
- **NEW:** `/src/routes/wiki/material/[id].tsx` - Complete material detail pages

## Database Tables Used
- `mob_loot` / `mob_crafting_loot` - Regular mob drops
- `named_mob_loot` / `named_mob_crafting_loot` - Boss drops
- `quest_rewards` / `quest_material_rewards` - Quest sources
- `mobs` / `named_mobs` - Mob details and areas
- `regions` - Location names
- `recipe_outputs` - Material usage in recipes
- `crafting_materials` - Material metadata

---

## Future Enhancements (Optional)
- Add merchant sources (items sold by NPCs)
- Show recipe craft chance details on item pages
- Filter loot sources by level range
- Show "best farming location" recommendations
- Add drop rate statistics (actual drop counts vs expected)
