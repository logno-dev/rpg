# Quest Reward Item Selector Enhancement

## Overview
Added a visual item selection modal for quest rewards (item type), replacing the manual item ID input with the same intuitive item browser used for adding items to player inventories.

## Changes Made

### GM Page (src/routes/gm.tsx)

**New Signals:**
- `showQuestRewardItemModal` - Controls item selection modal visibility
- `editingRewardIndex` - Tracks which reward is being edited
- `selectedRewardItemId` - Currently selected item in the modal
- `rewardItemQuantity` - Quantity for the reward item

**Updated Reward UI:**
- Replaced item ID number input with:
  - Display of selected item name (or "No item selected")
  - "Select Item" / "Change Item" button
  - Opens dedicated item selection modal
- Grid layout spans 2 columns for item selection field

**New Item Selection Modal:**
- Searchable item table with:
  - Radio button selection
  - Item ID, Name, Type, Rarity columns
  - Color-coded rarity badges
  - Click anywhere on row to select
- Quantity input field
- Confirm/Cancel buttons
- Updates reward with selected item ID and quantity

## Features

### Item Selection Flow
1. User adds a reward or edits existing reward
2. Selects "item" as reward type
3. Clicks "Select Item" button
4. Modal opens with searchable item list
5. User can search by name or type
6. Click on item to select (radio button)
7. Set quantity (default: 1)
8. Click "Confirm" to apply
9. Reward updates with selected item and displays item name

### Benefits
- **Visual Selection**: See all item properties before selecting
- **Search Functionality**: Quickly find items by name or type
- **Consistency**: Same UX as player inventory management
- **Error Prevention**: Can't enter invalid item IDs
- **User Friendly**: No need to remember or look up item IDs

## Usage

1. Open GM page `/gm` → Quests tab
2. Create/edit a quest
3. In Quest Rewards section, add a reward
4. Select "Item" as reward type
5. Click "Select Item" button
6. Search and click on desired item
7. Set quantity
8. Click "Confirm"
9. Item name appears in reward (e.g., "Iron Sword")
10. Save quest

## Technical Details

- Modal z-index: 1001 (above quest modal at 1000)
- Uses existing `items()` signal and `searchItems()` filter
- Maintains reward array immutability when updating
- Clears selection state on modal close
- Grid layout: 3 columns (Type, Item selection spans 2, Amount)

## Future Enhancements (Optional)
- Could add similar selector for crafting materials
- Could show item icon/thumbnail in selection
- Could group items by type in dropdown sections
