# Testing Equipment Detail Route

## Route Structure
- List page: `/wiki/equipment` → `src/routes/wiki/equipment.tsx`
- Detail page: `/wiki/equipment/[id]` → `src/routes/wiki/equipment/[id].tsx`

## How to Test

1. **Navigate to equipment list:**
   - Go to `/wiki/equipment`
   - You should see the equipment table

2. **Click on an item name:**
   - Click any item name in the table
   - Should navigate to `/wiki/equipment/[item_id]`

3. **Direct URL test:**
   - Try navigating directly to `/wiki/equipment/1`
   - Should show item details for item ID 1

## Common Issues & Solutions

### Issue: Page shows nothing/blank
**Possible causes:**
1. Server not restarted after adding new route
2. Build cache issue
3. Route conflict

**Solutions:**
```bash
# Stop the dev server
# Clear build cache
rm -rf .vinxi

# Restart dev server
npm run dev
```

### Issue: 404 Not Found
**Possible causes:**
1. Route file not recognized
2. File naming issue with brackets

**Check:**
- File should be named exactly: `[id].tsx` (with square brackets)
- Directory should be named: `equipment` (no brackets)

### Issue: TypeScript/Build errors
**Check console for:**
- Import errors
- Type errors
- Missing dependencies

## Verify Route Registration

After restarting, check if route is registered:
1. Open browser console
2. Look for any route-related errors
3. Try navigating to `/wiki/equipment/1` directly

## Database Query Test

Test if the query works:
```bash
turso db shell rpg "SELECT * FROM items WHERE id = 1;"
```

Should return item data.
