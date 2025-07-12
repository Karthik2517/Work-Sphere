-- Add work_entry_id column to bills table
ALTER TABLE bills ADD COLUMN IF NOT EXISTS work_entry_id INTEGER REFERENCES work_entries(id) ON DELETE CASCADE;

-- Create index for work_entry_id
CREATE INDEX IF NOT EXISTS idx_bills_work_entry_id ON bills(work_entry_id); 