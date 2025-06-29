import { supabase } from '../lib/supabase'

// Work Entries API
export const workEntriesApi = {
  // Get all work entries
  getAll: async () => {
    const { data, error } = await supabase
      .from('work_entries')
      .select(`
        *,
        employees (
          id,
          name,
          role
        )
      `)
      .order('date', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get work entries by employee
  getByEmployee: async (employeeId) => {
    const { data, error } = await supabase
      .from('work_entries')
      .select('*')
      .eq('employee_id', employeeId)
      .order('date', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Create new work entry
  create: async (workEntry) => {
    const { data, error } = await supabase
      .from('work_entries')
      .insert([workEntry])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Update work entry
  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('work_entries')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Delete work entry
  delete: async (id) => {
    const { error } = await supabase
      .from('work_entries')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  }
}

// Employees API
export const employeesApi = {
  // Get all employees
  getAll: async () => {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data
  },

  // Get employee by ID
  getById: async (id) => {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Create new employee
  create: async (employee) => {
    const { data, error } = await supabase
      .from('employees')
      .insert([employee])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Update employee
  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Delete employee
  delete: async (id) => {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  },

  // Authenticate employee
  authenticate: async (name, password) => {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('name', name)
      .eq('password', password)
      .single()
    
    if (error) throw error
    return data
  }
}

// Events API
export const eventsApi = {
  // Get all events
  getAll: async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data
  },

  // Create new event
  create: async (event) => {
    const { data, error } = await supabase
      .from('events')
      .insert([event])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Update event
  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Delete event
  delete: async (id) => {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  }
}

export const billsApi = {
  getAll: async () => {
    const { data, error } = await supabase.from('bills').select('*').order('date', { ascending: false });
    if (error) throw error;
    return data;
  },
  getByEmployee: async (employeeId) => {
    const { data, error } = await supabase.from('bills').select('*').eq('employee_id', employeeId).order('date', { ascending: false });
    if (error) throw error;
    return data;
  },
  create: async (bill) => {
    const { data, error } = await supabase.from('bills').insert([bill]).select();
    if (error) throw error;
    return data[0];
  },
  update: async (id, updates) => {
    const { data, error } = await supabase.from('bills').update(updates).eq('id', id).select();
    if (error) throw error;
    return data[0];
  },
  delete: async (id) => {
    const { error } = await supabase.from('bills').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};

export default {
  workEntries: workEntriesApi,
  bills: billsApi,
  employees: employeesApi,
  events: eventsApi
} 