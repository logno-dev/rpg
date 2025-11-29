# Quest Completion Indicator Feature

## Overview
Added a visual indicator (yellow dot) to the Quest Log button that appears when a quest has all objectives completed and is ready to turn in.

## What Was Added

### Backend Changes

#### 1. New Function: `hasCompletableQuests()` (src/lib/game.ts)
```typescript
export async function hasCompletableQuests(characterId: number): Promise<boolean>
```
- Checks if any active quests have all objectives completed
- Returns `true` if player has quests ready to turn in
- Uses efficient SQL query to check objective completion status

#### 2. New API Endpoint: `/api/game/quests/completable`
- **File:** `src/routes/api/game/quests/completable.ts`
- **Method:** GET
- **Headers:** `x-character-id` (required)
- **Response:** `{ hasCompletable: boolean }`

### Frontend Changes

#### 1. GameNavigation Component Updates (src/components/GameNavigation.tsx)

**Added:**
- Import `createResource` and `onCleanup` from solid-js
- Import `useCharacter` from CharacterContext
- New helper function: `checkCompletableQuests()`
- Resource to track completable quest status
- Polling mechanism (checks every 10 seconds)

**Visual Indicator:**
- **Desktop:** Yellow dot (8px) in top-right corner of "Quest Log" button
- **Mobile:** Yellow dot (8px) in top-right corner of "Quests" button
- **Color:** Gold (#FFD700) with glow effect
- **Style:** Small circle with subtle box-shadow

## How It Works

### 1. Initial Check
When the GameNavigation component loads:
- Fetches character ID from CharacterContext
- Calls `/api/game/quests/completable` API
- Updates indicator visibility based on response

### 2. Polling
- Every 10 seconds, re-checks for completable quests
- Automatically updates indicator when quest objectives complete
- Cleans up interval on component unmount

### 3. SQL Logic
```sql
SELECT COUNT(*) as count
FROM character_quests cq
WHERE cq.character_id = ? 
  AND cq.status = 'active'
  AND NOT EXISTS (
    SELECT 1 
    FROM quest_objectives qo
    LEFT JOIN character_quest_objectives cqo 
      ON qo.id = cqo.quest_objective_id 
      AND cqo.character_quest_id = cq.id
    WHERE qo.quest_id = cq.quest_id 
      AND COALESCE(cqo.completed, 0) = 0
  )
```

**Translation:** Find quests where:
- Quest is active for this character
- No incomplete objectives exist
- Ready to turn in!

## User Experience

### Before
- Players had to manually open Quest Log to check if quests were done
- Easy to miss completed quests
- No visual feedback

### After  
- **Yellow dot appears** when quest is completable
- **Immediate feedback** - know at a glance
- **Polls automatically** - updates without page refresh
- **Works on both desktop and mobile**

## Visual Design

```
┌─────────────────┐
│  📜 Quest Log   │ ← Desktop button
│              🟡 │ ← Yellow indicator (top-right)
└─────────────────┘

Mobile:
┌─────┐
│ 📜  │
│Quests│
│   🟡│ ← Indicator
└─────┘
```

## Files Modified

1. **src/lib/game.ts** - Added `hasCompletableQuests()` function
2. **src/routes/api/game/quests/completable.ts** - New API endpoint
3. **src/components/GameNavigation.tsx** - Added indicator UI + polling

## Technical Details

### Polling Strategy
- **Interval:** 10 seconds
- **Why:** Balance between responsiveness and server load
- **Cleanup:** Properly removes interval on unmount

### Performance
- **Efficient SQL:** Single query with NOT EXISTS clause
- **Lightweight:** Only polls when character is loaded
- **No overhead:** Indicator only renders when true

## Future Improvements (Optional)

1. **WebSocket Integration** - Real-time updates instead of polling
2. **Quest Count Badge** - Show number of completable quests (e.g., "3")
3. **Pulsing Animation** - Make indicator more noticeable
4. **Sound Effect** - Play sound when quest becomes completable
5. **Different Colors** - Green for repeatable, Gold for one-time quests

## Summary

✅ **Yellow indicator** shows when quests are ready to turn in  
✅ **Automatic polling** every 10 seconds  
✅ **Works on desktop and mobile**  
✅ **No page refresh needed**  
✅ **Clean, subtle design**

Players will now immediately know when they have quests ready to complete! 🎉
