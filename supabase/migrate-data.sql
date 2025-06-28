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