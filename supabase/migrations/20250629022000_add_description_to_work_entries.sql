-- Add description column to work_entries table
ALTER TABLE work_entries ADD COLUMN description TEXT;

-- Update existing work entries to have empty descriptions
UPDATE work_entries SET description = '' WHERE description IS NULL; 