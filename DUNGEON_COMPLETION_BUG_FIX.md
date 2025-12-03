# Dungeon Completion Bug Fix

## Problem
When completing a dungeon, the game crashed with:
```
LibsqlErrorSQL_INPUT_ERROR: SQLite input error: no such column: completed (at offset 7)
```

## Root Cause
The `checkRegionUnlockRequirements()` function in `/src/lib/game.ts:1348` was querying for a `completed` column that doesn't exist in the `character_dungeon_progress` table.

**Actual table schema:**
```sql
CREATE TABLE character_dungeon_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  character_id INTEGER NOT NULL,
  dungeon_id INTEGER NOT NULL,
  current_encounter INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed', 'failed'
  ...
)
```

The table uses a `status` column with string values ('active', 'completed', 'failed') instead of a numeric `completed` column.

## Fix Applied
**File:** `/src/lib/game.ts:1348-1352`

**Before:**
```typescript
const progressResult = await db.execute({
  sql: 'SELECT completed FROM character_dungeon_progress WHERE character_id = ? AND dungeon_id = ?',
  args: [characterId, dungeon.id],
});

if (progressResult.rows.length > 0 && (progressResult.rows[0] as any).completed === 1) {
  return true;
}
```

**After:**
```typescript
const progressResult = await db.execute({
  sql: 'SELECT status FROM character_dungeon_progress WHERE character_id = ? AND dungeon_id = ?',
  args: [characterId, dungeon.id],
});

if (progressResult.rows.length > 0 && (progressResult.rows[0] as any).status === 'completed') {
  return true;
}
```

## Impact
- Fixed crash when completing dungeons
- Region unlock system now correctly checks if required dungeons have been completed
- No database migration needed (table schema was already correct)

## Testing
To test: Complete a dungeon that unlocks a new region and verify no error occurs.
