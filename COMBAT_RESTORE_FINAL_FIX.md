# Combat Restore - Final Fix Summary

## Root Cause
**Regular adventure combat was NOT creating server-side combat sessions!**

Only dungeon combat was creating sessions in the `combat_sessions` table. When players fought regular mobs in the adventure/exploration mode, combat was purely client-side with no server persistence.

## The Critical Fix
**File**: `src/routes/game/index.tsx` - `handleStartCombat` function

Changed from:
```typescript
const handleStartCombat = async (mob: Mob) => {
  // ... sync health ...
  setActiveMob(mob);  // Just set the mob, no API call!
};
```

To:
```typescript
const handleStartCombat = async (mob: Mob) => {
  // ... sync health ...
  
  // CREATE SERVER-SIDE COMBAT SESSION
  const response = await fetch('/api/game/start-combat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      characterId: characterId(), 
      mobId: mob.id 
    }),
  });
  
  setActiveMob(mob);
};
```

## Why This Matters
- **Before**: Regular combat had no server record → refresh = escape
- **After**: All combat creates server sessions → refresh = restored combat

## All Fixes Applied

### 1. Server-Side Session Creation ✅
- Regular combat now calls `/api/game/start-combat`
- Creates persistent `combat_sessions` record
- Tracked on server, can't be bypassed by client

### 2. Session Validation ✅
- Validates dungeon is still active (for dungeon combat)
- Validates mob still exists
- Marks stale/invalid sessions appropriately

### 3. Session Cleanup ✅
- Auto-cleans sessions older than 1 hour
- Prevents conflicts from forgotten sessions
- Marks completed combats as 'victory' or 'defeat'

### 4. Combat Restoration ✅
- Checks server on page load
- Restores active combat with correct health values
- Separates regular vs dungeon combat restoration
- Falls back to localStorage if needed

## Testing Steps
1. Start regular adventure combat with any mob
2. Refresh the page (F5)
3. Combat should resume with same mob and health
4. Complete combat normally
5. Verify session is marked as 'victory' or 'defeat'
6. Start new combat - should create fresh session

## Database Verification
Check active sessions:
```sql
SELECT * FROM combat_sessions WHERE status = 'active';
```

Should show active combat when player is in combat, empty when not.
