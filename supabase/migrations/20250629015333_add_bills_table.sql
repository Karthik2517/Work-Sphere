-- Create bills table
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

-- Add bills column to work_entries table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'work_entries' AND column_name = 'bills') THEN
        ALTER TABLE work_entries ADD COLUMN bills DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Added bills column to work_entries table';
    ELSE
        RAISE NOTICE 'Bills column already exists in work_entries table';
    END IF;
END $$;

-- Create indexes for bills table
CREATE INDEX IF NOT EXISTS idx_bills_employee_id ON bills(employee_id);
CREATE INDEX IF NOT EXISTS idx_bills_date ON bills(date);

-- Enable Row Level Security for bills table
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

-- Create policies for bills table
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

-- Create trigger for bills table
DROP TRIGGER IF EXISTS update_bills_updated_at ON bills;
CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON bills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Reset bills sequence
SELECT setval('bills_id_seq', (SELECT COALESCE(MAX(id), 0) FROM bills));
