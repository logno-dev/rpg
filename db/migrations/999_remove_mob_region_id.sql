-- Remove redundant region_id from mobs table
-- Region information should be derived from region_mobs or sub_area_mobs relationships

-- Note: SQLite doesn't support DROP COLUMN directly, but since region_id was added later
-- and may not be properly used everywhere, we can leave it for backwards compatibility
-- but document that it should NOT be used - always derive region from spawn tables

-- For future reference: The proper way to get a mob's region(s) is:
-- SELECT DISTINCT r.* FROM regions r
-- LEFT JOIN region_mobs rm ON r.id = rm.region_id
-- LEFT JOIN sub_areas sa ON r.id = sa.region_id
-- LEFT JOIN sub_area_mobs sam ON sa.id = sam.sub_area_id
-- WHERE rm.mob_id = ? OR sam.mob_id = ?

-- If we want to fully remove it in the future, we'd need to:
-- 1. Create new table without region_id
-- 2. Copy data
-- 3. Drop old table
-- 4. Rename new table

-- For now, just document that mobs.region_id is deprecated and should not be used
