# Quest Database Table Added to Wiki

## Summary
Successfully added a comprehensive quest database table to the Quests wiki page, displaying all available quests with their details.

## Changes Made

### 1. WikiData Component (`/src/components/WikiData.tsx`)

#### Added Quest Endpoint
- **New endpoint**: `"quests"`
- **Query**: Joins quests with regions to show region names
- **Columns retrieved**:
  - Quest ID, name, description
  - Minimum level requirement
  - Repeatable status (0/1)
  - Region name and ID

#### Query Features
- Optional filters:
  - `regionId` - Filter quests by specific region
  - `minLevel` - Filter quests with minimum level >= value
  - `maxLevel` - Filter quests with minimum level <= value
- Sorted by: Minimum level (ASC), then name (ASC)

#### Added QuestTable Component
- **Columns displayed**:
  1. **Name** - Quest name (bold)
  2. **Level** - Minimum level requirement
  3. **Region** - Region name where quest is available
  4. **Type** - "Repeatable" or "One-time"
  5. **Description** - Quest description (smaller font)

- **Styling**:
  - Uses existing `wiki-table` class for consistency
  - Description column uses smaller font (0.9em) for readability
  - Proper table headers for all columns

### 2. Quests Wiki Page (`/src/routes/wiki/quests.tsx`)

#### Imports Added
```typescript
import { WikiData, QuestTable } from "~/components/WikiData";
```

#### New Section Added
- **Title**: "Quest Database"
- **Description**: Explains the table shows all available quests
- **Position**: Added before the closing quote section
- **Implementation**:
  ```tsx
  <WikiData endpoint="quests">
    {(quests) => <QuestTable data={quests} />}
  </WikiData>
  ```

## Features

### Live Data
- Table data is fetched directly from the game database
- Automatically updates when quests are added/modified
- Server-side rendering for fast initial page load

### Comprehensive Information
The table shows:
- All quests currently in the database
- Level requirements for each quest
- Which region each quest belongs to
- Whether quests are repeatable or one-time only
- Full quest descriptions

### User Experience
- Clean, readable table layout
- Consistent with other wiki data tables (regions, abilities, items, mobs)
- Sortable by default (level, then alphabetically)
- Mobile-responsive (inherits wiki-table styling)

## Database Query

```sql
SELECT q.id, q.name, q.description, q.min_level, q.repeatable, 
       r.name as region_name, r.id as region_id
FROM quests q
JOIN regions r ON q.region_id = r.id
WHERE 1=1
ORDER BY q.min_level ASC, q.name ASC
```

## Example Data Displayed
Based on current database:
- ~100+ quests spanning levels 1-50+
- Quests from all regions (Greenfield Plains, Ironpeak Mountains, etc.)
- Mix of one-time and repeatable quests
- Training quests, bounties, collection quests, and more

## Integration

### Fits Into Existing Wiki Structure
- Uses established WikiData/Table pattern
- Matches styling of Regions, Abilities, Items, and Mobs tables
- Server-side rendering like other wiki pages
- Loading states handled automatically

### Future Enhancement Options
1. Add filtering UI:
   - Filter by region dropdown
   - Filter by level range
   - Filter by quest type (repeatable vs one-time)
2. Add quest rewards column
3. Add quest objectives preview
4. Make table sortable by clicking column headers
5. Add search functionality

## File Changes Summary
```
Modified:
- src/components/WikiData.tsx (+50 lines)
  - Added quests endpoint
  - Added QuestTable component
  
- src/routes/wiki/quests.tsx (+13 lines)
  - Added imports
  - Added Quest Database section with table
```

## Result
The Quests wiki page now includes a complete, live database of all quests in the game, making it easy for players to:
- Browse all available quests
- Find quests appropriate for their level
- Identify which quests are repeatable
- See what quests are available in each region
- Plan their quest progression

The table complements the existing quest guide content and provides the concrete data players need to make informed decisions.
