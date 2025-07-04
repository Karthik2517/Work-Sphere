import { supabase } from '../lib/supabase'

// Work Entries API
export const workEntriesApi = {
  // Get all work entries
  getAll: async () => {
    const { data, error } = await supabase
      .from('work_entries')
      .select('*')
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
  },
  getByWorkEntry: async (workEntryId) => {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('work_entry_id', workEntryId)
      .order('date', { ascending: false });
    if (error) throw error;
    return data;
  }
};

// Payments API
export const paymentsApi = {
  // Get all payments
  getAll: async () => {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('payment_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Get payments by employee
  getByEmployee: async (employeeId) => {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('employee_id', employeeId)
      .order('payment_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Create new payment
  create: async (payment) => {
    const { data, error } = await supabase
      .from('payments')
      .insert([payment])
      .select();
    if (error) throw error;
    return data[0];
  },

  // Update payment
  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  // Delete payment
  delete: async (id) => {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  // Calculate outstanding balance for an employee
  calculateOutstanding: async (employeeId, fromDate = null, toDate = null) => {
    try {
      // Get work entries for the employee
      let workQuery = supabase
        .from('work_entries')
        .select('hours, date')
        .eq('employee_id', employeeId);
      
      if (fromDate) workQuery = workQuery.gte('date', fromDate);
      if (toDate) workQuery = workQuery.lte('date', toDate);
      
      const { data: workEntries, error: workError } = await workQuery;
      if (workError) throw workError;

      // Get bills for the employee
      let billsQuery = supabase
        .from('bills')
        .select('amount, date')
        .eq('employee_id', employeeId);
      
      if (fromDate) billsQuery = billsQuery.gte('date', fromDate);
      if (toDate) billsQuery = billsQuery.lte('date', toDate);
      
      const { data: bills, error: billsError } = await billsQuery;
      if (billsError) throw billsError;

      // Get payments for the employee
      let paymentsQuery = supabase
        .from('payments')
        .select('amount, payment_date')
        .eq('employee_id', employeeId);
      
      if (fromDate) paymentsQuery = paymentsQuery.gte('payment_date', fromDate);
      if (toDate) paymentsQuery = paymentsQuery.lte('payment_date', toDate);
      
      const { data: payments, error: paymentsError } = await paymentsQuery;
      if (paymentsError) throw paymentsError;

      // Calculate totals
      const totalWorkPay = workEntries.reduce((sum, entry) => sum + (parseFloat(entry.hours) * 10), 0);
      const totalBills = bills.reduce((sum, bill) => sum + parseFloat(bill.amount), 0);
      const totalPaid = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
      const totalOwed = totalWorkPay + totalBills;
      const outstanding = totalOwed - totalPaid;

      return {
        totalWorkPay: parseFloat(totalWorkPay.toFixed(2)),
        totalBills: parseFloat(totalBills.toFixed(2)),
        totalOwed: parseFloat(totalOwed.toFixed(2)),
        totalPaid: parseFloat(totalPaid.toFixed(2)),
        outstanding: parseFloat(outstanding.toFixed(2))
      };
    } catch (error) {
      console.error('Error calculating outstanding balance:', error);
      throw error;
    }
  }
};

export default {
  workEntries: workEntriesApi,
  bills: billsApi,
  payments: paymentsApi,
  employees: employeesApi,
  events: eventsApi
} 