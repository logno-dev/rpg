# Chain Armor Recipe Output Fix

## Problem
9 chain armor recipe groups have NO outputs configured, making them completely unusable:
- Simple Chain Head, Hands, Feet (level 1)
- Moderate Chain Head, Hands, Feet (level 10)  
- Advanced Chain Head, Hands, Feet (level 25)

Additionally, Moderate Chain Chest had outputs but all required level 15+, making it unusable for levels 10-14.

## Root Cause
When chain armor was added to the crafting system, only the chest pieces got recipe outputs populated. The head/hands/feet pieces were created in the items table but never linked to recipe outputs.

## Solution
Need to add recipe outputs for all 9 empty recipe groups, matching the pattern used for plate/leather armor.

## Items Available by Slot and Level

### Feet (18 items, levels 1-60)
### Hands (18 items, levels 1-60)
### Head (18 items, levels 1-60)

## Recipe Groups Needing Outputs

| Recipe Group ID | Name | Min Level | Items Needed |
|----------------|------|-----------|--------------|
| 34 | Simple Chain Head | 1 | Levels 1-9 |
| 35 | Simple Chain Hands | 1 | Levels 1-9 |
| 36 | Simple Chain Feet | 1 | Levels 1-9 |
| 40 | Moderate Chain Head | 10 | Levels 10-24 |
| 41 | Moderate Chain Hands | 10 | Levels 10-24 |
| 42 | Moderate Chain Feet | 10 | Levels 10-24 |
| 46 | Advanced Chain Head | 25 | Levels 25-50 |
| 47 | Advanced Chain Hands | 25 | Levels 25-50 |
| 48 | Advanced Chain Feet | 25 | Levels 25-50 |

## Fix Applied
Added outputs following the same weight distribution pattern used for plate armor chest pieces.
