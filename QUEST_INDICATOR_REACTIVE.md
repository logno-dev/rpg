# Quest Indicator - Reactive Implementation ✅

## Overview
Refactored the quest completion indicator from polling-based to **reactive/signal-based**. The yellow dot now appears instantly when quest objectives complete, with no polling overhead.

## How It Works Now

### 1. Signal in CharacterContext
Added `hasCompletableQuests: boolean` to the character store:
- **Default:** `false`
- **Updated:** When quest objectives complete during combat
- **Cleared:** When player opens Quest Log

### 2. Quest Progress Tracking
When you kill a mob or collect an item:
1. **Backend** (`updateQuestProgress`) checks all objectives
2. If any quest is now completable, returns `true`
3. **API** (`finish-combat`) includes `hasCompletableQuests` in response
4. **Frontend** (`handleCombatEnd`) updates the signal
5. **UI** (`GameNavigation`) reactively shows/hides the yellow dot

### 3. User Interaction Flow

```
Player kills mob
    ↓
Quest objective completes (x = y)
    ↓
updateQuestProgress() returns true
    ↓
finish-combat API returns hasCompletableQuests: true
    ↓
Frontend sets signal to true
    ↓
Yellow dot appears instantly! 🟡
    ↓
Player clicks Quest Log
    ↓
Signal cleared to false
    ↓
Dot disappears
```

## Changes Made

### Backend

#### 1. `src/lib/game.ts` - `updateQuestProgress()`
**Before:** `Promise<void>`  
**After:** `Promise<boolean>`

```typescript
// Check if any quests are now completable
return await hasCompletableQuests(characterId);
```

#### 2. `src/routes/api/game/finish-combat.ts`
**Added:** Quest completion check and response field

```typescript
let hasCompletableQuests = false;
if (mobId) {
  hasCompletableQuests = await updateQuestProgress(...);
}

return json({
  ...
  hasCompletableQuests,  // NEW!
});
```

### Frontend

#### 1. `src/lib/CharacterContext.tsx`
**Added:**
- `hasCompletableQuests: boolean` to store
- `setHasCompletableQuests(hasCompletable: boolean)` action

#### 2. `src/components/GameNavigation.tsx`
**Removed:**
- ❌ `createResource` for polling
- ❌ `setInterval` polling every 10 seconds  
- ❌ API call overhead

**Added:**
- ✅ Direct signal access: `store.hasCompletableQuests`
- ✅ Clear on click: `actions.setHasCompletableQuests(false)`

**Before:**
```typescript
const [hasCompletableQuests] = createResource(
  () => store.character?.id,
  (id) => id ? checkCompletableQuests(id) : false
);

const interval = setInterval(() => { /* poll */ }, 10000);
```

**After:**
```typescript
const handleOpenQuestLog = () => {
  setShowQuestLogModal(true);
  actions.setHasCompletableQuests(false); // Clear indicator
};

<Show when={store.hasCompletableQuests}>
  {/* Yellow dot */}
</Show>
```

#### 3. `src/routes/game/index.tsx` - `handleCombatEnd()`
**Added:** Signal update on victory

```typescript
if (responseData.hasCompletableQuests) {
  actions.setHasCompletableQuests(true);
}
```

## Performance Comparison

### Before (Polling)
- ❌ API call every 10 seconds
- ❌ Constant database queries
- ❌ Wasted requests even when nothing changes
- ❌ Delay of up to 10 seconds before indicator shows

### After (Reactive)
- ✅ **Zero polling overhead**
- ✅ **Instant feedback** when objectives complete
- ✅ Only updates when quest progress actually changes
- ✅ Clean, reactive architecture

## Benefits

1. **Instant Feedback** - Dot appears immediately when quest completes
2. **Zero Overhead** - No background polling
3. **Scalable** - Works for any number of players
4. **Clean Code** - Signal-based reactive programming
5. **Battery Friendly** - No constant API calls on mobile

## Files Modified

1. **src/lib/game.ts** - Made `updateQuestProgress()` return boolean
2. **src/routes/api/game/finish-combat.ts** - Added `hasCompletableQuests` to response
3. **src/lib/CharacterContext.tsx** - Added signal to store
4. **src/components/GameNavigation.tsx** - Removed polling, added reactive indicator
5. **src/routes/game/index.tsx** - Update signal on combat victory

## Testing

Test flow:
1. Accept a quest (e.g., "Kill 5 Wild Foxes")
2. Kill foxes in combat
3. When 5th fox dies → Yellow dot appears instantly 🟡
4. Click Quest Log → Dot disappears
5. Turn in quest → Quest completes

## Summary

✅ **Reactive architecture** using signals  
✅ **Instant feedback** when quests complete  
✅ **Zero polling overhead**  
✅ **Clean on click** - indicator clears when opened  
✅ **Battery/performance friendly**

The quest indicator is now a proper reactive feature using Solid.js signals! 🎉
