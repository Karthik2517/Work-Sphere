-- Create payments table for tracking employee payment settlements
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_employee_id ON payments(employee_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);

-- Enable Row Level Security for payments table
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies for payments table
DROP POLICY IF EXISTS "Admins can view all payments" ON payments;
CREATE POLICY "Admins can view all payments" ON payments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert payments" ON payments;
CREATE POLICY "Admins can insert payments" ON payments
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update payments" ON payments;
CREATE POLICY "Admins can update payments" ON payments
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Admins can delete payments" ON payments;
CREATE POLICY "Admins can delete payments" ON payments
  FOR DELETE USING (true);

-- Create trigger for payments table
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Reset payments sequence
SELECT setval('payments_id_seq', (SELECT COALESCE(MAX(id), 0) FROM payments)); 