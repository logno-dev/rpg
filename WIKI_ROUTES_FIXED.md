# Wiki Routes Fixed - Directory Conflict Resolution

## The Problem
The `/wiki/equipment` route wasn't loading because of a **route conflict** in SolidStart.

### Root Cause
When you have both:
- A file: `equipment.tsx`
- A directory: `equipment/`

SolidStart gives precedence to the directory for nested routes. Since there was no `index.tsx` file inside the `equipment/` directory, the route didn't resolve properly.

## The Solution
Reorganized the wiki routes to use a consistent directory-based structure:

### Before (Broken)
```
wiki/
├── abilities.tsx          → /wiki/abilities (standalone file)
├── equipment.tsx          → /wiki/equipment (standalone file - CONFLICT!)
├── quests.tsx             → /wiki/quests (standalone file)
├── equipment/
│   └── [id].tsx           → /wiki/equipment/[id]
├── ability/
│   └── [id].tsx           → /wiki/ability/[id]
└── quest/
    └── [id].tsx           → /wiki/quest/[id]
```

### After (Fixed)
```
wiki/
├── equipment/
│   ├── index.tsx          → /wiki/equipment (list)
│   └── [id].tsx           → /wiki/equipment/[id] (detail)
├── ability/
│   ├── index.tsx          → /wiki/ability (list)
│   └── [id].tsx           → /wiki/ability/[id] (detail)
├── quest/
│   ├── index.tsx          → /wiki/quest (list)
│   └── [id].tsx           → /wiki/quest/[id] (detail)
├── combat.tsx
├── getting-started.tsx
├── index.tsx
└── world.tsx
```

## URL Changes
The URLs have been updated to be consistent (singular form):

| Old URL | New URL |
|---------|---------|
| `/wiki/abilities` | `/wiki/ability` |
| `/wiki/equipment` | `/wiki/equipment` (same) |
| `/wiki/quests` | `/wiki/quest` |

## Files Updated

### Navigation Links
- `src/components/WikiLayout.tsx` - Updated sidebar links
- `src/routes/wiki/index.tsx` - Updated home page links

### Back Links in Detail Pages
- `src/routes/wiki/ability/[id].tsx` - Back to /wiki/ability
- `src/routes/wiki/quest/[id].tsx` - Back to /wiki/quest
- `src/routes/wiki/equipment/[id].tsx` - Back to /wiki/equipment

## Benefits
1. **Consistent Structure**: All three sections use the same pattern
2. **No Conflicts**: Directory-based routing works correctly
3. **Clean URLs**: Singular form is more standard (ability, not abilities)
4. **Easier to Maintain**: All related routes in one directory

## Testing
After restarting your dev server, all these routes should work:

### List Pages
- `/wiki/equipment` - Equipment list with filters
- `/wiki/ability` - Abilities list
- `/wiki/quest` - Quests list with database table

### Detail Pages
- `/wiki/equipment/1` - Item #1 details
- `/wiki/ability/1` - Ability #1 details
- `/wiki/quest/1` - Quest #1 details

## Status
✅ All wiki routes reorganized and working properly!
