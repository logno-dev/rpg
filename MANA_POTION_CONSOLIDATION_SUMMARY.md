# Mana Potion Consolidation Summary

## Overview
Replaced all instances of "Mana Potion" with "Minor Mana Potion" across the database, similar to the health potion consolidation.

## Changes Made

### 1. Database Updates
- **mob_loot**: Updated 126 entries (now 129 total Minor Mana Potion drops)
- **merchant_inventory**: Updated 14 entries
- **character_inventory**: Updated 7 entries
- **named_mob_loot**: Checked and updated any references
- **quest_rewards**: Checked and updated any references

### 2. Items Removed
Deleted 4 duplicate "Mana Potion" items:
- ID 14 (30 mana restore)
- ID 1792 (0 mana restore - likely duplicate)
- ID 1802 (0 mana restore - likely duplicate)
- ID 1812 (0 mana restore - likely duplicate)

### 3. Remaining Mana Potion Progression
After consolidation, the clean progression is:
1. **Minor Mana Potion** (ID 1349) - 40 mana restore
2. **Greater Mana Potion** (ID 477) - 60 mana restore
3. **Lesser Mana Potion** (ID 1351) - 120 mana restore
4. **Superior Mana Potion** (ID 1353) - 850 mana restore
5. **Supreme Mana Potion** (ID 1355) - 1300 mana restore

## Migration Script
Created: `db/replace-mana-potion-with-minor.sql`

## Verification Results
- ✅ 129 mob_loot entries reference Minor Mana Potion
- ✅ 14 merchant_inventory entries reference Minor Mana Potion
- ✅ 7 character_inventory entries reference Minor Mana Potion
- ✅ 0 old "Mana Potion" items remain in database
- ✅ 5 clean mana potion types remain

## Benefits
- Consistent naming with health potions (Minor, Lesser, Greater, Superior, Supreme)
- No duplicate or confusing "Mana Potion" base item
- Cleaner item progression
- All loot tables, merchants, and player inventories updated
