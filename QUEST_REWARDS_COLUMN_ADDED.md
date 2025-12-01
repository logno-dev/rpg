# Quest Rewards Column with Item Links

## Summary
Added a Rewards column to the quest table and made item rewards clickable links that navigate to the item detail pages.

## Changes Made

### 1. WikiData Component - Quest Endpoint Enhancement

**Location:** `src/components/WikiData.tsx`

#### Updated Quest Data Fetching
The quests endpoint now includes rewards data for each quest:

```typescript
// After fetching quests, fetch rewards for each one
for (const quest of quests) {
  const rewardsResult = await db.execute({
    sql: `SELECT qr.*, i.name as item_name, i.id as item_id, 
                 cm.name as material_name
          FROM quest_rewards qr
          LEFT JOIN items i ON qr.reward_item_id = i.id
          LEFT JOIN crafting_materials cm ON qr.reward_material_id = cm.id
          WHERE qr.quest_id = ?`,
    args: [quest.id]
  });
  quest.rewards = rewardsResult.rows;
}
```

**Benefits:**
- Single database query to get all rewards
- Includes item IDs for linking
- Includes item and material names

### 2. QuestTable Component - New Rewards Column

**Location:** `src/components/WikiData.tsx` - `QuestTable` component

#### Added Rewards Column
New column displays all quest rewards in a compact format:

**Columns (updated):**
1. Name (clickable → quest detail)
2. Level
3. Region
4. Type
5. **Rewards** (NEW)
6. Description

#### Reward Display Format
- **XP:** "250 XP"
- **Gold:** "50 Gold"
- **Items:** Clickable link to `/wiki/equipment/[id]`
- **Materials:** Material name with quantity

#### Item Links
Item rewards are now clickable:
```tsx
<A href={`/wiki/equipment/${reward.item_id}`} 
   style={{ color: "var(--accent)" }}>
  {reward.item_name}
</A>
```

**Features:**
- Comma-separated list of rewards
- Item names link to equipment detail pages
- Quantities shown for items/materials (x2, x3, etc.)
- Compact display (font-size: 0.85em)

### 3. Quest Detail Page - Clickable Item Rewards

**Location:** `src/routes/wiki/quest/[id].tsx`

#### Updated Rewards Section
Item rewards in the detail page are now clickable links:

```tsx
<A href={`/wiki/equipment/${reward.reward_item_id}`} 
   style={{ color: "var(--success)", "text-decoration": "underline" }}>
  {reward.item_name}
</A>
```

**Styling:**
- Green color (matches success theme)
- Underlined to indicate it's clickable
- Preserves quantity display

## User Experience

### Quest Table View
When browsing quests at `/wiki/quest`:
1. See all quest rewards at a glance
2. Click item names to view item details
3. Quickly compare quest rewards

### Quest Detail View
When viewing a specific quest at `/wiki/quest/[id]`:
1. See rewards in highlighted card
2. Click item rewards to learn more about the item
3. Seamless navigation to equipment pages

## Example Flow

1. **Browse quests:** `/wiki/quest`
2. **See quest "Bandit Menace"** with rewards: "250 XP, 50 Gold"
3. **Click quest name** → `/wiki/quest/4`
4. **See detailed rewards** including items
5. **Click item reward** → `/wiki/equipment/[item_id]`
6. **View full item stats** and details

## Database Queries

### Quest List with Rewards
```sql
-- Main quest query
SELECT q.id, q.name, q.description, q.min_level, q.repeatable, 
       r.name as region_name
FROM quests q
JOIN regions r ON q.region_id = r.id

-- For each quest, fetch rewards
SELECT qr.*, i.name as item_name, i.id as item_id, 
       cm.name as material_name
FROM quest_rewards qr
LEFT JOIN items i ON qr.reward_item_id = i.id
LEFT JOIN crafting_materials cm ON qr.reward_material_id = cm.id
WHERE qr.quest_id = ?
```

## Benefits

1. **Quick Reference:** See rewards without clicking into quest
2. **Better Planning:** Compare quest rewards at a glance
3. **Seamless Navigation:** Jump from quest to item details
4. **Complete Information:** All reward types shown (XP, gold, items, materials)
5. **Interactive:** Item rewards are clickable for more details

## Display Examples

### Quest Table Rewards Column
- "250 XP, 50 Gold"
- "100 XP, Iron Sword x1"
- "500 XP, 100 Gold, Health Potion x5"

### Quest Detail Rewards
- Large cards with:
  - Reward type label
  - Clickable item name (for item rewards)
  - Quantity display
  - Green success color

## Status
✅ Rewards column added to quest table
✅ Item rewards are clickable links
✅ Navigation flows from quest → item details
✅ Consistent styling across table and detail views
