# Sub-Area Mobs Migration

## Overview
Migrated the GM "Mob Spawns" tab from using `region_mobs` table to the newer `sub_area_mobs` table, which provides more granular control over mob spawning within specific sub-areas of regions.

## Changes Made

### Backend (src/lib/gm.ts)

**New Functions Added:**
- `getAllSubAreaMobs()` - Fetches all sub-area mob spawns with joined data (sub_area_name, region_name, mob_name, mob_level)
- `createSubAreaMob(data)` - Creates new sub-area mob spawn entry
- `updateSubAreaMob(id, data)` - Updates existing sub-area mob spawn
- `deleteSubAreaMob(id)` - Deletes sub-area mob spawn
- `getAllSubAreas()` - Fetches all sub-areas with region info

**Old Functions Removed:**
- `getAllRegionMobs()`
- `createRegionMob()`
- `updateRegionMob()`
- `deleteRegionMob()`

### Frontend (src/routes/gm.tsx)

**Signals Updated:**
- `regionMobs` → `subAreaMobs`
- Added `subAreas` signal
- `selectedRegionForMobs` → `selectedSubAreaForMobs`
- `editingRegionMob` → `editingSubAreaMob`
- `showRegionMobModal` → `showSubAreaMobModal`

**Functions Updated:**
- `reloadRegionMobs()` → `reloadSubAreaMobs()`
- `handleDeleteRegionMob()` → `handleDeleteSubAreaMob()`
- `handleSaveRegionMob()` → `handleSaveSubAreaMob()`
- Added `handleEditSubAreaMob()`

**UI Changes:**

1. **Tab Title:** "Region Mob Spawns" → "Sub-Area Mob Spawns"

2. **Dropdown:** 
   - Changed from region selection to sub-area selection
   - Now shows: "Region Name - Sub-Area Name (Lvl X-Y) - N mobs"
   - Sorted by region_id then sub_area id

3. **Table Columns:**
   - Added "Level Variance" column (shows ±N)
   - Columns: Mob Name, Level, Spawn Weight, Level Variance, Actions

4. **Edit Modal:**
   - Changed from Region dropdown to Sub-Area dropdown  
   - Sub-areas grouped by region in dropdown
   - Added "Level Variance" input field (0-5)
   - Help text: "Mob level can vary by ± this amount from base level"

## Database Schema Differences

### Old: region_mobs
```sql
CREATE TABLE region_mobs (
  id INTEGER PRIMARY KEY,
  region_id INTEGER,
  mob_id INTEGER,
  spawn_weight INTEGER
)
```

### New: sub_area_mobs
```sql
CREATE TABLE sub_area_mobs (
  id INTEGER PRIMARY KEY,
  sub_area_id INTEGER,
  mob_id INTEGER,
  spawn_weight INTEGER,
  level_variance INTEGER  -- NEW: allows ±N level variation
)
```

## Benefits of Migration

1. **Granular Control:** Can assign different mobs to different sub-areas within the same region
2. **Level Variety:** `level_variance` allows mobs to spawn at slightly different levels
3. **Better Organization:** Sub-areas provide more logical groupings (e.g., "Forest Entrance" vs "Deep Forest")
4. **Matches Game Logic:** The game already uses sub_area_mobs for spawning, this just updates the GM tools

## Migration Path

The old `region_mobs` table is still in the database but is no longer used. It can be safely dropped:

```sql
DROP TABLE region_mobs;
```

All mob spawn data should be managed through `sub_area_mobs` going forward.

## Testing

To verify the migration:
1. Navigate to `/gm` → "Mob Spawns" tab
2. Select a sub-area from dropdown
3. Add/Edit/Delete mob spawns
4. Verify level variance field works (0-5)
5. Check that changes persist after refresh
