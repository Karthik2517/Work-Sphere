-- Create employees table
CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'employee',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create work_entries table
CREATE TABLE work_entries (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  day VARCHAR(50) NOT NULL,
  hours DECIMAL(5,2) NOT NULL,
  from_time TIME,
  to_time TIME,
  event VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_work_entries_employee_id ON work_entries(employee_id);
CREATE INDEX idx_work_entries_date ON work_entries(date);
CREATE INDEX idx_work_entries_event ON work_entries(event);

-- Enable Row Level Security
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for employees table
CREATE POLICY "Employees can view all employees" ON employees
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert employees" ON employees
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update employees" ON employees
  FOR UPDATE USING (true);

CREATE POLICY "Admins can delete employees" ON employees
  FOR DELETE USING (true);

-- Create policies for events table
CREATE POLICY "Everyone can view events" ON events
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert events" ON events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update events" ON events
  FOR UPDATE USING (true);

CREATE POLICY "Admins can delete events" ON events
  FOR DELETE USING (true);

-- Create policies for work_entries table
CREATE POLICY "Everyone can view work entries" ON work_entries
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert work entries" ON work_entries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update work entries" ON work_entries
  FOR UPDATE USING (true);

CREATE POLICY "Admins can delete work entries" ON work_entries
  FOR DELETE USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_entries_updated_at BEFORE UPDATE ON work_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert employees data
INSERT INTO employees (id, name, password, role) VALUES
(0, 'admin', 'admin', 'admin'),
(1, 'John Doe', 'password123', 'employee'),
(2, 'Jane Smith', 'password123', 'employee'),
(3, 'Karthik', 'password', 'employee'),
(4, 'Koti', 'password', 'employee');

-- Insert events data
INSERT INTO events (id, name) VALUES
(1, 'Wedding Decor'),
(2, 'Corporate Event Setup'),
(3, 'reception'),
(4, 'wedding'),
(5, 'house warming'),
(6, 'weddings'),
(7, 'haldi'),
(8, 'engagement'),
(9, 'Grad Party');

-- Insert work entries data
INSERT INTO work_entries (id, employee_id, date, day, hours, from_time, to_time, event) VALUES
(1, 1, '2025-06-26', 'Thursday', 6.00, '11:00:00', '17:00:00', 'Wedding Decor'),
(2, 2, '2025-06-26', 'Thursday', 14.00, '10:00:00', '00:00:00', 'Corporate Event Setup'),
(3, 2, '2025-06-11', 'Monday', 5.00, '13:00:00', '18:00:00', 'reception'),
(4, 1, '2025-06-04', 'Wednesday', 2.50, '13:30:00', '16:00:00', 'wedding'),
(5, NULL, '2025-06-17', 'Tuesday', 23.00, '01:00:00', '00:00:00', ''),
(6, 1, '2025-06-12', 'Thursday', 2.00, '14:00:00', '16:00:00', 'house warming'),
(7, 3, '2025-05-14', 'Wednesday', 16.00, '00:00:00', '16:00:00', 'wedding'),
(8, 3, '2025-05-19', 'Monday', 10.00, '03:00:00', '13:00:00', ''),
(9, 4, '2025-06-28', 'Saturday', 5.00, '09:00:00', '14:00:00', 'house warming'),
(10, 2, '2025-06-17', 'Tuesday', 8.00, '15:00:00', '23:00:00', 'Wedding Decor');

-- Reset sequences to continue from the highest ID
SELECT setval('employees_id_seq', (SELECT MAX(id) FROM employees));
SELECT setval('events_id_seq', (SELECT MAX(id) FROM events));
SELECT setval('work_entries_id_seq', (SELECT MAX(id) FROM work_entries)); 