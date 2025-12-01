# Equipment Page Fix

## Issue
The `/wiki/equipment` page was not loading.

## Root Cause
The equipment.tsx file was using vanilla JavaScript `.map()` method instead of SolidJS's `<For>` component for rendering the list of equipment type buttons.

```tsx
// WRONG (vanilla JavaScript - causes hydration issues)
{equipmentTypes.map((type) => (
  <button>...</button>
))}

// CORRECT (SolidJS reactive rendering)
<For each={equipmentTypes}>
  {(type) => (
    <button>...</button>
  )}
</For>
```

## Fix Applied
1. Added `For` to the imports from "solid-js"
2. Changed `.map()` to `<For each={...}>` component

## Why This Matters
In SolidJS:
- `.map()` is static and can cause hydration mismatches
- `<For>` is reactive and properly handles server-side rendering
- `<For>` ensures the component tree is correctly managed

## File Changed
- `/src/routes/wiki/equipment.tsx`

## Testing
After this fix, the equipment page should load correctly:
1. Navigate to `/wiki/equipment`
2. Should see the equipment list with filter buttons
3. Should be able to filter by Weapons, Armor, Accessories
4. Should be able to click item names to view details

## Status
✅ Fixed - Equipment page should now load properly
