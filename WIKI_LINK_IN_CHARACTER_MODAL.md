# Wiki Link Added to Character Modal

## Summary
Added a clickable link to the Morthvale Wiki in the Character Modal that opens in a new tab with an external link icon.

## Changes Made

### Location
**File:** `src/components/CharacterModal.tsx`

### New Import
```typescript
import { TrendingUp, Grid3x3, Users, LogOut, SquareArrowOutUpRight } from "lucide-solid";
```

Added `SquareArrowOutUpRight` icon from lucide-solid to indicate external link.

### New Menu Item
Added wiki link positioned **above** the "Character Select" button:

```tsx
<a 
  href="/wiki" 
  target="_blank"
  rel="noopener noreferrer"
  style={{ 
    display: "flex",
    "align-items": "center",
    padding: "1rem",
    background: "var(--bg-light)",
    "border-radius": "6px",
    border: "1px solid var(--border)",
    "text-decoration": "none",
    color: "var(--text-primary)",
    transition: "all 0.2s"
  }}
  onMouseOver={(e) => {
    e.currentTarget.style.background = "var(--accent)";
    e.currentTarget.style.borderColor = "var(--accent)";
  }}
  onMouseOut={(e) => {
    e.currentTarget.style.background = "var(--bg-light)";
    e.currentTarget.style.borderColor = "var(--border)";
  }}
>
  <SquareArrowOutUpRight size={24} style={{ "margin-right": "1rem", "flex-shrink": "0" }} />
  <div>
    <div style={{ "font-weight": "600", "margin-bottom": "0.25rem" }}>Morthvale Wiki</div>
    <div style={{ "font-size": "0.875rem", color: "var(--text-secondary)" }}>
      Browse guides and game info
    </div>
  </div>
</a>
```

## Features

### External Link Behavior
- **`target="_blank"`** - Opens in new tab
- **`rel="noopener noreferrer"`** - Security best practice for external links
- Uses standard `<a>` tag instead of SolidJS `<A>` component (necessary for new tab)

### Visual Design
- **Icon:** SquareArrowOutUpRight (external link indicator)
- **Title:** "Morthvale Wiki"
- **Description:** "Browse guides and game info"
- **Hover Effect:** Blue accent color matching other menu items
- **Layout:** Consistent with other menu items

## Menu Order
The Character Modal now has the following menu items in order:

1. **Character Stats** (TrendingUp icon)
2. **Hotbar Management** (Grid3x3 icon)
3. **Morthvale Wiki** (SquareArrowOutUpRight icon) ← NEW
4. **Character Select** (Users icon)
5. **Sign Out** (LogOut icon)

## User Experience

### Access Flow
1. Click character name/level in game header
2. Character Modal opens
3. See "Morthvale Wiki" option
4. Click to open wiki in new tab
5. Original game tab remains open
6. Can switch between tabs freely

### Benefits
- **No navigation disruption** - Game stays open in original tab
- **Easy reference** - Check wiki while playing
- **Clear indication** - External link icon shows it opens new tab
- **Quick access** - Available from anywhere in game

## Use Cases

Players can now easily:
- Look up quest details while playing
- Check item stats before purchasing
- Learn about abilities while building character
- Reference combat mechanics during fights
- Plan character progression
- Compare equipment options

## Technical Details

### Why `<a>` instead of `<A>`?
- SolidJS `<A>` component is for internal routing only
- Standard HTML `<a>` tag needed for `target="_blank"` to work properly
- Still maintains consistent styling with other menu items

### Security
- `rel="noopener noreferrer"` prevents potential security issues:
  - `noopener` - Prevents new page from accessing `window.opener`
  - `noreferrer` - Doesn't send referrer information

## Testing
To test the wiki link:
1. Open game and log in
2. Click your character name/level in header
3. Click "Morthvale Wiki" in modal
4. Wiki should open in new tab
5. Game should remain open in original tab

## Status
✅ Wiki link added to Character Modal
✅ Opens in new tab
✅ External link icon included
✅ Positioned above Character Select
✅ Consistent styling with other menu items
