// API utility functions
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = {
  // Work Entries
  getWorkEntries: () => fetch(`${API_BASE_URL}/api/work-entries`),
  createWorkEntry: (data) => fetch(`${API_BASE_URL}/api/work-entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  updateWorkEntry: (id, data) => fetch(`${API_BASE_URL}/api/work-entries/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  deleteWorkEntry: (id) => fetch(`${API_BASE_URL}/api/work-entries/${id}`, {
    method: 'DELETE'
  }),

  // Employees
  getEmployees: () => fetch(`${API_BASE_URL}/api/employees`),
  createEmployee: (data) => fetch(`${API_BASE_URL}/api/employees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),

  // Events
  getEvents: () => fetch(`${API_BASE_URL}/api/events`),
  createEvent: (data) => fetch(`${API_BASE_URL}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
};

export default api; 