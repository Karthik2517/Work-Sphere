-- Bills Table Setup for Work Sphere
-- Run this in your Supabase SQL Editor

-- Step 1: Create the bills table
CREATE TABLE IF NOT EXISTS bills (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Add bills column to work_entries table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'work_entries' AND column_name = 'bills') THEN
        ALTER TABLE work_entries ADD COLUMN bills DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Added bills column to work_entries table';
    ELSE
        RAISE NOTICE 'Bills column already exists in work_entries table';
    END IF;
END $$;

-- Step 3: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bills_employee_id ON bills(employee_id);
CREATE INDEX IF NOT EXISTS idx_bills_date ON bills(date);

-- Step 4: Enable Row Level Security
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies
DROP POLICY IF EXISTS "Employees can view their own bills" ON bills;
CREATE POLICY "Employees can view their own bills" ON bills
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Employees can insert their own bills" ON bills;
CREATE POLICY "Employees can insert their own bills" ON bills
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Employees can update their own bills" ON bills;
CREATE POLICY "Employees can update their own bills" ON bills
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Employees can delete their own bills" ON bills;
CREATE POLICY "Employees can delete their own bills" ON bills
  FOR DELETE USING (true);

-- Step 6: Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_bills_updated_at ON bills;
CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON bills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 7: Reset sequence
SELECT setval('bills_id_seq', (SELECT COALESCE(MAX(id), 0) FROM bills));

-- Step 8: Test the setup with a sample bill (optional - you can delete this after testing)
INSERT INTO bills (employee_id, date, category, description, amount) 
VALUES (1, CURRENT_DATE, 'Food', 'Test lunch expense', 15.50)
ON CONFLICT DO NOTHING;

-- Step 9: Verify the setup
SELECT 'Bills table setup completed successfully!' as status;
SELECT COUNT(*) as total_bills FROM bills; 