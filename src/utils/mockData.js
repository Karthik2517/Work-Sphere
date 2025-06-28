// Import the database data directly
import dbData from '../data/db.json';

// Mock API functions that return data immediately
export const mockApi = {
  // Work Entries
  getWorkEntries: async () => {
    return Promise.resolve(dbData.work_entries);
  },
  createWorkEntry: async (data) => {
    const newEntry = {
      ...data,
      id: dbData.work_entries.length > 0 ? Math.max(...dbData.work_entries.map(e => e.id)) + 1 : 1
    };
    dbData.work_entries.push(newEntry);
    return Promise.resolve(newEntry);
  },
  updateWorkEntry: async (id, data) => {
    const index = dbData.work_entries.findIndex(entry => entry.id === id);
    if (index !== -1) {
      dbData.work_entries[index] = { ...dbData.work_entries[index], ...data, id };
      return Promise.resolve(dbData.work_entries[index]);
    }
    throw new Error('Work entry not found');
  },
  deleteWorkEntry: async (id) => {
    const index = dbData.work_entries.findIndex(entry => entry.id === id);
    if (index !== -1) {
      dbData.work_entries.splice(index, 1);
      return Promise.resolve();
    }
    throw new Error('Work entry not found');
  },

  // Employees
  getEmployees: async () => {
    return Promise.resolve(dbData.employees);
  },
  createEmployee: async (data) => {
    const newEmployee = {
      ...data,
      id: dbData.employees.length > 0 ? Math.max(...dbData.employees.map(e => e.id)) + 1 : 1
    };
    dbData.employees.push(newEmployee);
    return Promise.resolve(newEmployee);
  },

  // Events
  getEvents: async () => {
    return Promise.resolve(dbData.events);
  },
  createEvent: async (data) => {
    const newEvent = {
      ...data,
      id: dbData.events.length > 0 ? Math.max(...dbData.events.map(e => e.id)) + 1 : 1
    };
    dbData.events.push(newEvent);
    return Promise.resolve(newEvent);
  }
};

export default mockApi; 