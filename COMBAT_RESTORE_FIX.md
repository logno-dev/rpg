# Combat Restore Fix - Preventing Refresh Exploit

## Problem
Players could escape combat by simply refreshing the page. Two main issues:
1. Combat restore function only checked localStorage, not the server-side combat_sessions table
2. **Regular adventure combat didn't create server-side sessions at all** - only dungeon combat did

## Solution
Implemented server-side combat session verification on page load to ensure players cannot escape combat through page refreshes.

## Changes Made

### 1. New API Endpoint
**File**: `src/routes/api/game/active-combat.ts`

Created a new GET endpoint `/api/game/active-combat` that:
- Checks for an active combat session in the `combat_sessions` table
- **Validates dungeon combat** - cleans up stale sessions if dungeon is no longer active
- **Validates mob existence** - cleans up sessions where mob doesn't exist
- Returns the combat session details and mob information only if valid
- Used on page load to restore combat state from the server

### 2. Fix Regular Combat Session Creation
**File**: `src/routes/game/index.tsx` - `handleStartCombat` function

**Critical Fix**: Regular adventure combat now creates server-side sessions:
- Added API call to `/api/game/start-combat` when fighting regular mobs
- Previously only dungeon combat created sessions
- Now all combat creates server-side sessions that persist through refreshes

### 3. Game Route Combat Restore
**File**: `src/routes/game/index.tsx`

Updated the `onMount` function to:
1. **First** check the server for an active combat session
2. **Skip dungeon combat** - don't restore dungeon sessions on main game route
3. If regular combat found, restore from server session
4. Only fall back to localStorage if no server session exists
5. Update character health/mana to match the server session

Key benefits:
- Prevents refresh exploit (server is source of truth)
- Falls back gracefully to localStorage if API fails
- Restores combat with proper mob health tracking
- Properly separates regular and dungeon combat restoration

### 4. Dungeon Combat Restore
**File**: `src/routes/game/dungeon/[dungeonId].tsx`

Added similar logic for dungeon encounters:
- Checks server for active dungeon combat sessions
- Restores mob, named mob ID, and combat log
- Works in conjunction with existing dungeon progress system

### 5. Combat Session Cleanup
**Files**: `src/lib/game.ts`

Added automatic cleanup of stale combat sessions:
- Before creating new combat, clean up sessions older than 1 hour
- Marks old active sessions as 'stale' to prevent conflicts
- Ensures only one active combat session per character

## How It Works

### Server-Side Session Flow
1. When combat starts:
   - Old sessions (>1 hour) are cleaned up
   - A record is created in `combat_sessions` with status='active'
2. The session tracks:
   - Character health
   - Mob health  
   - Whether it's a dungeon combat
   - Named mob ID (if applicable)
   - Timestamp (for staleness detection)
3. When combat ends (victory/defeat), status is updated to 'victory' or 'defeat'
4. Stale sessions are marked as 'stale' during validation

### Page Load Flow
1. Page loads → Immediately call `/api/game/active-combat`
2. API validates the session:
   - For dungeon combat: Check if dungeon is still active
   - Check if mob still exists
   - Mark invalid sessions as 'stale'
3. If valid active session found:
   - **Main game route**: Only restore non-dungeon combat
   - **Dungeon route**: Only restore dungeon combat
   - Create `StoredCombatState` from server data
   - Restore combat with server health values
   - Set active mob and resume combat
4. If no server session:
   - Fall back to localStorage (for backward compatibility)
   - Or start fresh if neither exists

## Security Benefits
- **Server is source of truth**: Can't manipulate localStorage to escape combat
- **Persistent combat state**: Refreshing doesn't clear combat
- **Exploit prevention**: Players must actually defeat or flee from mobs
- **Data integrity**: Character health synced with server

## Future Enhancements (Optional)
The `combat_sessions` table could be extended to store:
- Combat ticks (character_ticks, mob_ticks, etc.)
- Active effects (DOTs, HOTs, buffs)
- Ability cooldowns
- Complete combat log

This would allow perfect combat restoration even mid-combat tick, but the current implementation already prevents the main exploit.

## Testing
To test:
1. Start combat with a mob
2. Refresh the page (F5 or Ctrl+R)
3. Combat should resume with the same mob and health values
4. Players cannot escape combat by refreshing
