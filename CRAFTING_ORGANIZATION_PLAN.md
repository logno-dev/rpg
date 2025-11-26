# Crafting Organization Plan

## Current State
- Recipes are displayed as a flat grid
- All available recipes show at once
- Can become overwhelming with many recipes
- No way to find specific recipes quickly

## Proposed Organization Features

### Phase 1: Basic Organization (Quick Wins)

#### 1. Level Bracket Filtering
Group recipes into collapsible sections by level:

```
▼ Beginner (Level 1-10)
  - Iron Sword
  - Iron Dagger
  - Leather Cap
  
▼ Intermediate (Level 11-20)
  - Steel Sword
  - Chain Mail Helm
  
▶ Advanced (Level 21-30)  ← Collapsed
▶ Expert (Level 31-40)    ← Collapsed
```

**Benefits**:
- Reduces visual clutter
- Helps players find appropriate-level recipes
- Can auto-expand player's current level bracket

#### 2. Item Type Tabs
Filter recipes by what they produce:

```
[Weapons] [Armor] [Consumables] [Materials] [All]
```

**Benefits**:
- Quick access to specific item types
- Reduces scrolling
- Clear categorization

#### 3. Search/Filter Bar
Add a search input above recipes:

```
┌─────────────────────────────────┐
│ 🔍 Search recipes...            │
└─────────────────────────────────┘

Filters:
☑ Show Craftable Only
☐ Show Locked (grayed out)
```

**Benefits**:
- Find recipes by name instantly
- Toggle visibility of uncraftable items
- Reduce visual noise

#### 4. Sort Options
Dropdown to sort recipes:

```
Sort by: [Level ▼]
- Level (Low to High)
- Level (High to Low)
- Name (A-Z)
- Craftable (Available First)
```

**Benefits**:
- Player preference for organization
- Easy to find newest unlocked recipes

### Phase 2: Enhanced Features

#### 5. Favorites/Pinning System
Let players mark frequently-used recipes:

```
⭐ FAVORITES (Always shown first)
  - Health Potion (★ Pinned)
  - Iron Sword (★ Pinned)
  
──────────────────────────────

□ ALL RECIPES
  - ...
```

**UI Changes**:
- Add star icon to recipe cards
- Click to toggle favorite
- Favorites section always visible
- Limited to 5 favorites per profession

#### 6. Recipe Unlocking Indicators
Show how to unlock grayed-out recipes:

```
┌─────────────────────────────────┐
│  Superior Health Potion   🔒    │
│  ────────────────────────────  │
│  Requires: Alchemy Level 15    │
│  Current: Level 10             │
│  (5 more levels needed)        │
└─────────────────────────────────┘
```

**Benefits**:
- Clear progression path
- Motivates leveling
- No confusion about locked recipes

#### 7. Recently Crafted Section
Track last 3-5 crafted items:

```
🕐 RECENTLY CRAFTED
  - Iron Sword (2 min ago)
  - Health Potion (5 min ago)
  
──────────────────────────────
```

**Benefits**:
- Quick access to repeated crafts
- Shows crafting history
- Convenient for bulk crafting

### Phase 3: Advanced (Optional)

#### 8. Recipe Collections/Sets
Group related recipes:

```
▼ Iron Equipment Set (3/8 crafted)
  ✓ Iron Sword
  ✓ Iron Helmet
  ✓ Iron Chestplate
  ○ Iron Boots
  ○ Iron Gauntlets
  ...
```

**Benefits**:
- Shows progression toward complete sets
- Encourages crafting variety
- Achievement-like feeling

#### 9. Material Requirement Highlighting
Show if you have all materials before expanding recipe:

```
┌─────────────────────────────────┐
│  Iron Sword           ✓ Ready   │  ← Green badge
│  Steel Sword          🔸 Partial │  ← Orange badge
│  Mythril Sword        ✗ Missing  │  ← Red badge
└─────────────────────────────────┘
```

**Benefits**:
- At-a-glance craftability
- No need to expand every recipe
- Faster decision making

#### 10. Compact View Toggle
Switch between detailed and compact recipe cards:

```
Detailed View:
┌─────────────────────────────────┐
│  Iron Sword                     │
│  Level Required: 5              │
│  Craft Time: 45s                │
│  Experience: 100 XP             │
│  Materials:                     │
│    - Iron Ore: 5/3 ✓           │
│    - Wood: 2/2 ✓               │
│  [Craft]                        │
└─────────────────────────────────┘

Compact View:
┌─────────────────────────────────┐
│  Iron Sword (Lvl 5) ✓          │
│  [Craft]                        │
└─────────────────────────────────┘
```

**Benefits**:
- See more recipes at once
- Reduce scrolling
- Player preference

## Implementation Priority

### Must Have (Phase 1)
1. ✅ Level bracket filtering
2. ✅ Search bar
3. ✅ "Show Craftable Only" toggle
4. ✅ Sort dropdown

### Should Have (Phase 2)
5. Favorites/pinning (3-5 per profession)
6. Recipe unlocking indicators
7. Recently crafted section

### Nice to Have (Phase 3)
8. Recipe collections/sets
9. Material requirement badges
10. Compact view toggle

## UI Mockup (Phase 1 Implementation)

```
┌─────────────────────────────────────────────────┐
│  Blacksmithing - Level 12                       │
├─────────────────────────────────────────────────┤
│  🔍 Search recipes...          Sort: Level ▼   │
│  ☑ Show Craftable Only                         │
├─────────────────────────────────────────────────┤
│                                                 │
│  ▼ Beginner (1-10) ────── 8 recipes            │
│     [Iron Sword] [Iron Dagger] [Buckler] ...   │
│                                                 │
│  ▼ Intermediate (11-20) ── 6 recipes           │
│     [Steel Sword] [Steel Helm] ...             │
│                                                 │
│  ▶ Advanced (21-30) ────── 5 recipes 🔒        │
│                                                 │
│  ▶ Expert (31-40) ─────── 4 recipes 🔒         │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Database Changes Needed

### For Favorites
```sql
CREATE TABLE IF NOT EXISTS character_recipe_favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  character_id INTEGER NOT NULL,
  recipe_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (character_id) REFERENCES characters(id),
  FOREIGN KEY (recipe_id) REFERENCES recipes(id),
  UNIQUE(character_id, recipe_id)
);
```

### For Recently Crafted
```sql
CREATE TABLE IF NOT EXISTS character_crafting_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  character_id INTEGER NOT NULL,
  recipe_id INTEGER NOT NULL,
  crafted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  success INTEGER NOT NULL,
  quality TEXT, -- 'common', 'fine', 'superior', 'masterwork'
  FOREIGN KEY (character_id) REFERENCES characters(id),
  FOREIGN KEY (recipe_id) REFERENCES recipes(id)
);

-- Index for fast recent queries
CREATE INDEX idx_crafting_history_recent 
  ON character_crafting_history(character_id, crafted_at DESC);
```

## Component Structure

```
CraftingPage
├── ProfessionSelector (existing)
├── SelectedProfessionView
│   ├── ProfessionHeader (existing)
│   ├── RecipeFilters (NEW)
│   │   ├── SearchBar
│   │   ├── CraftableToggle
│   │   └── SortDropdown
│   ├── RecipeList (ENHANCED)
│   │   ├── FavoritesSection (if any)
│   │   ├── RecentSection (if any)
│   │   └── LevelBrackets
│   │       ├── BracketHeader (collapsible)
│   │       └── RecipeGrid
│   └── MaterialsInventory (existing)
└── CraftingMinigame (when active)
```

## Next Steps

1. Implement Phase 1 features:
   - Add search/filter state management
   - Create collapsible level bracket sections
   - Add sort dropdown
   - Implement "craftable only" filter

2. Test with various recipe counts:
   - 5 recipes (minimal)
   - 20 recipes (moderate)
   - 50+ recipes (many)

3. Gather feedback on organization effectiveness

4. Plan Phase 2 implementation based on user needs

Would you like me to start implementing Phase 1 organization features?
