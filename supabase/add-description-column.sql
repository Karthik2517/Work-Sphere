-- Add description column to work_entries table
-- Run this in your Supabase SQL Editor if the column doesn't exist

-- Check if column exists first
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'work_entries' 
        AND column_name = 'description'
    ) THEN
        ALTER TABLE work_entries ADD COLUMN description TEXT;
        RAISE NOTICE 'Description column added successfully';
    ELSE
        RAISE NOTICE 'Description column already exists';
    END IF;
END $$;

-- Update existing work entries to have empty descriptions if they are NULL
UPDATE work_entries SET description = '' WHERE description IS NULL; 