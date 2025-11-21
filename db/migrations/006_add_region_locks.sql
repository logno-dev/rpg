-- Add locked status to regions
ALTER TABLE regions ADD COLUMN locked INTEGER DEFAULT 0;

-- Add unlock_requirement column for future use (can store JSON or text description)
ALTER TABLE regions ADD COLUMN unlock_requirement TEXT;
