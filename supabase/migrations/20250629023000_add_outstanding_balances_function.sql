-- Create function to get all outstanding balances
CREATE OR REPLACE FUNCTION get_all_outstanding_balances()
RETURNS TABLE (
  emp_id INTEGER,
  emp_name VARCHAR(255),
  total_work_pay DECIMAL(10,2),
  total_bills DECIMAL(10,2),
  total_owed DECIMAL(10,2),
  total_paid DECIMAL(10,2),
  outstanding DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id as emp_id,
    e.name as emp_name,
    COALESCE(SUM(we.hours * 10), 0) as total_work_pay,
    COALESCE(SUM(b.amount), 0) as total_bills,
    COALESCE(SUM(we.hours * 10), 0) + COALESCE(SUM(b.amount), 0) as total_owed,
    COALESCE(SUM(p.amount), 0) as total_paid,
    (COALESCE(SUM(we.hours * 10), 0) + COALESCE(SUM(b.amount), 0)) - COALESCE(SUM(p.amount), 0) as outstanding
  FROM employees e
  LEFT JOIN work_entries we ON e.id = we.employee_id
  LEFT JOIN bills b ON e.id = b.employee_id
  LEFT JOIN payments p ON e.id = p.employee_id
  WHERE e.role != 'admin'
  GROUP BY e.id, e.name
  ORDER BY outstanding DESC;
END;
$$ LANGUAGE plpgsql; 