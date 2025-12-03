# GM Bulk Edit Table - Implementation Guide

## Overview

I've created a reusable `BulkEditTable` component that provides:
- ✅ Sortable columns (click headers)
- ✅ Multi-select filters (by type, category, primary stat, etc.)
- ✅ Bulk editing (spreadsheet-style inline editing)
- ✅ Batch save (commit all changes at once)
- ✅ Search across all columns
- ✅ Change tracking (shows unsaved changes count)

## Component Location

`src/components/BulkEditTable.tsx`

## Usage Example - Abilities Tab

Here's how to replace the current abilities table with the new bulk edit table:

### 1. Import the Component

```typescript
import { BulkEditTable } from "~/components/BulkEditTable";
```

### 2. Define Column Configuration

```typescript
const abilityColumns = [
  { key: 'id', label: 'ID', width: '60px', type: 'readonly' as const, align: 'center' as const },
  { key: 'name', label: 'Name', width: '200px', type: 'text' as const },
  { key: 'type', label: 'Type', width: '120px', type: 'select' as const, align: 'center' as const, options: [
    { value: 'damage', label: 'Damage' },
    { value: 'heal', label: 'Heal' },
    { value: 'buff', label: 'Buff' },
    { value: 'debuff', label: 'Debuff' },
    { value: 'utility', label: 'Utility' }
  ]},
  { key: 'category', label: 'Category', width: '120px', type: 'select' as const, align: 'center' as const, options: [
    { value: 'combat', label: 'Combat' },
    { value: 'passive', label: 'Passive' },
    { value: 'crafting', label: 'Crafting' }
  ]},
  { key: 'required_level', label: 'Lvl Req', width: '80px', type: 'number' as const, align: 'center' as const },
  { key: 'mana_cost', label: 'Mana', width: '80px', type: 'number' as const, align: 'right' as const },
  { key: 'cooldown', label: 'Cooldown', width: '90px', type: 'number' as const, align: 'right' as const },
  { key: 'primary_stat', label: 'Primary Stat', width: '120px', type: 'select' as const, align: 'center' as const, options: [
    { value: '', label: 'None' },
    { value: 'strength', label: 'Strength' },
    { value: 'dexterity', label: 'Dexterity' },
    { value: 'intelligence', label: 'Intelligence' },
    { value: 'wisdom', label: 'Wisdom' },
    { value: 'charisma', label: 'Charisma' }
  ]},
  { key: 'stat_scaling', label: 'Scaling %', width: '90px', type: 'number' as const, align: 'right' as const }
];
```

### 3. Define Filter Configuration

```typescript
const abilityFilters = [
  {
    key: 'type',
    label: 'Type',
    type: 'multiselect' as const,
    options: [
      { value: 'damage', label: 'Damage' },
      { value: 'heal', label: 'Heal' },
      { value: 'buff', label: 'Buff' },
      { value: 'debuff', label: 'Debuff' },
      { value: 'utility', label: 'Utility' }
    ]
  },
  {
    key: 'category',
    label: 'Category',
    type: 'multiselect' as const,
    options: [
      { value: 'combat', label: 'Combat' },
      { value: 'passive', label: 'Passive' },
      { value: 'crafting', label: 'Crafting' }
    ]
  },
  {
    key: 'primary_stat',
    label: 'Primary Stat',
    type: 'multiselect' as const,
    options: [
      { value: 'strength', label: 'Strength' },
      { value: 'dexterity', label: 'Dexterity' },
      { value: 'intelligence', label: 'Intelligence' },
      { value: 'wisdom', label: 'Wisdom' },
      { value: 'charisma', label: 'Charisma' }
    ]
  }
];
```

### 4. Implement Save Handler

```typescript
const handleSaveAbilities = async (changes: Map<number | string, Partial<any>>) => {
  // changes is a Map of id -> { field: value }
  const promises = Array.from(changes.entries()).map(async ([id, fields]) => {
    const ability = abilities().find(a => a.id === id);
    if (!ability) return;
    
    // Merge changes with existing ability
    const updated = { ...ability, ...fields };
    await updateAbility(id as number, updated);
  });
  
  await Promise.all(promises);
  await loadAllData(); // Refresh data
};
```

### 5. Replace Table JSX

Replace the current abilities table with:

```typescript
<Show when={activeTab() === "abilities"}>
  <BulkEditTable
    data={abilities()}
    columns={abilityColumns}
    filters={abilityFilters}
    onSave={handleSaveAbilities}
    onDelete={handleDeleteAbility}
    onCreate={() => {
      setEditingAbility({
        name: '', description: '', type: 'damage', category: 'combat',
        required_level: 1, mana_cost: 0, cooldown: 0, primary_stat: null,
        stat_scaling: 0
      });
      setShowAbilityModal(true);
    }}
    getRowId={(row) => row.id}
    title="Abilities"
  />
</Show>
```

## Usage Example - Items Tab

### Column Configuration

```typescript
const itemColumns = [
  { key: 'id', label: 'ID', width: '60px', type: 'readonly' as const, align: 'center' as const },
  { key: 'name', label: 'Name', width: '200px', type: 'text' as const },
  { key: 'type', label: 'Type', width: '120px', type: 'select' as const, align: 'center' as const, options: [
    { value: 'weapon', label: 'Weapon' },
    { value: 'armor', label: 'Armor' },
    { value: 'consumable', label: 'Consumable' },
    { value: 'material', label: 'Material' },
    { value: 'quest', label: 'Quest Item' }
  ]},
  { key: 'slot', label: 'Slot', width: '120px', type: 'select' as const, align: 'center' as const, options: [
    { value: 'weapon', label: 'Weapon' },
    { value: 'offhand', label: 'Offhand' },
    { value: 'head', label: 'Head' },
    { value: 'chest', label: 'Chest' },
    { value: 'legs', label: 'Legs' },
    { value: 'feet', label: 'Feet' },
    { value: 'hands', label: 'Hands' },
    { value: 'accessory', label: 'Accessory' },
    { value: '', label: 'None' }
  ]},
  { key: 'level', label: 'Lvl', width: '60px', type: 'number' as const, align: 'center' as const },
  { key: 'value', label: 'Value', width: '80px', type: 'number' as const, align: 'right' as const },
  { key: 'damage_min', label: 'Dmg Min', width: '80px', type: 'number' as const, align: 'right' as const },
  { key: 'damage_max', label: 'Dmg Max', width: '80px', type: 'number' as const, align: 'right' as const },
  { key: 'armor', label: 'Armor', width: '70px', type: 'number' as const, align: 'right' as const },
  { key: 'strength_bonus', label: 'STR', width: '60px', type: 'number' as const, align: 'right' as const },
  { key: 'dexterity_bonus', label: 'DEX', width: '60px', type: 'number' as const, align: 'right' as const },
  { key: 'intelligence_bonus', label: 'INT', width: '60px', type: 'number' as const, align: 'right' as const }
];
```

### Filter Configuration

```typescript
const itemFilters = [
  {
    key: 'type',
    label: 'Type',
    type: 'multiselect' as const,
    options: [
      { value: 'weapon', label: 'Weapon' },
      { value: 'armor', label: 'Armor' },
      { value: 'consumable', label: 'Consumable' },
      { value: 'material', label: 'Material' },
      { value: 'quest', label: 'Quest Item' }
    ]
  },
  {
    key: 'slot',
    label: 'Slot',
    type: 'multiselect' as const,
    options: [
      { value: 'weapon', label: 'Weapon' },
      { value: 'offhand', label: 'Offhand' },
      { value: 'head', label: 'Head' },
      { value: 'chest', label: 'Chest' },
      { value: 'legs', label: 'Legs' },
      { value: 'feet', label: 'Feet' }
    ]
  }
];
```

## API Update Required

You'll need to add a bulk update endpoint for each table. Example:

```typescript
// src/routes/api/gm/abilities/bulk-update.ts
import { APIEvent } from "@solidjs/start/server";
import { db } from "~/lib/db";
import { getUser, isGM } from "~/lib/auth";

export async function POST(event: APIEvent) {
  const user = await getUser();
  if (!user || !await isGM(user.id)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { changes } = await event.request.json();
  // changes is { id: { field: value, ... }, ... }

  try {
    for (const [id, fields] of Object.entries(changes)) {
      const sets = Object.keys(fields as any).map(key => `${key} = ?`).join(', ');
      const values = Object.values(fields as any);
      
      await db.execute({
        sql: `UPDATE abilities SET ${sets} WHERE id = ?`,
        args: [...values, id]
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
```

## Features

### Sorting
- Click any column header to sort
- Click again to reverse sort direction
- Arrow indicator shows current sort

### Filtering
- Multi-select dropdowns for categorical fields
- Active filter count badge
- "Clear Filters" button to reset

### Bulk Editing
- Edit cells like a spreadsheet
- Yellow highlight on edited rows
- "Unsaved changes" counter
- "Discard" button to revert
- "Save All" button to commit all changes at once

### Performance
- Sticky headers
- Virtual scrolling ready (max-height: 600px with overflow)
- Memoized filtering/sorting

## Benefits

1. **Faster Editing**: Edit multiple rows without opening modals
2. **Better UX**: Spreadsheet-style editing is more intuitive for bulk operations
3. **Safer**: All changes reviewed before saving
4. **Efficient**: One save operation for all changes instead of one per edit
5. **Organized**: Filters and sorting help find what you need quickly

## Next Steps

1. Replace each table in `gm.tsx` with `BulkEditTable`
2. Create bulk update API endpoints
3. Test thoroughly with various data sets
4. Consider adding keyboard navigation (Tab, Enter, etc.)
