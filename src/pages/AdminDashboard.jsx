import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Container, TextField, Button, Box, FormControl, InputLabel, Select, MenuItem, TableSortLabel, Grid, Dialog, DialogTitle, DialogContent, DialogActions, Pagination, Tabs, Tab } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker, DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { workEntriesApi, employeesApi, eventsApi, billsApi, paymentsApi, balancesApi } from '../services/supabaseApi';

function AdminDashboard() {
  const [workEntries, setWorkEntries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [newEntry, setNewEntry] = useState({ employee_id: '', date: '', day: '', hours: '', from_time: '', to_time: '', event: '', description: '' });
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [editedEntry, setEditedEntry] = useState(null);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('date');
  const [filterEmployeeId, setFilterEmployeeId] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [appliedFilterEmployeeId, setAppliedFilterEmployeeId] = useState('');
  const [appliedFilterMonth, setAppliedFilterMonth] = useState('');
  const [appliedFilterYear, setAppliedFilterYear] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [totalHours, setTotalHours] = useState(null);
  const [monthlyBreakdown, setMonthlyBreakdown] = useState(null);
  const [newEmployee, setNewEmployee] = useState({ name: '', password: '' });
  const [events, setEvents] = useState([]);
  const [newEventName, setNewEventName] = useState('');
  const [bills, setBills] = useState([]);
  const navigate = useNavigate();

  // New state for employees management
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [editedEmployee, setEditedEmployee] = useState({ name: '', password: '', role: 'employee' });
  const [editEmployeeDialogOpen, setEditEmployeeDialogOpen] = useState(false);

  // New state for events management
  const [editingEventId, setEditingEventId] = useState(null);
  const [editedEvent, setEditedEvent] = useState({ name: '' });
  const [editEventDialogOpen, setEditEventDialogOpen] = useState(false);

  // New state for payments
  const [paymentFilterMonth, setPaymentFilterMonth] = useState('');
  const [paymentFilterYear, setPaymentFilterYear] = useState('');
  const [paymentFilterEmployee, setPaymentFilterEmployee] = useState('');
  const [appliedPaymentFilterMonth, setAppliedPaymentFilterMonth] = useState('');
  const [appliedPaymentFilterYear, setAppliedPaymentFilterYear] = useState('');
  const [appliedPaymentFilterEmployee, setAppliedPaymentFilterEmployee] = useState('');

  // New state for outstanding balances
  const [outstandingBalances, setOutstandingBalances] = useState([]);
  const [payments, setPayments] = useState([]);
  const [settlementDialogOpen, setSettlementDialogOpen] = useState(false);
  const [selectedEmployeeForPayment, setSelectedEmployeeForPayment] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(dayjs());
  const [paymentDescription, setPaymentDescription] = useState('');
  const [loadingBalances, setLoadingBalances] = useState(false);

  // Add state for pagination
  const [employeesPage, setEmployeesPage] = useState(1);
  const [eventsPage, setEventsPage] = useState(1);
  const EMPLOYEES_PER_PAGE = 5;
  const EVENTS_PER_PAGE = 5;

  // Add state for work entries pagination
  const [workEntriesPage, setWorkEntriesPage] = useState(1);
  const WORK_ENTRIES_PER_PAGE = 5;

  // --- Bill upload state ---
  const [billDialogOpen, setBillDialogOpen] = useState(false);
  const [billWorkEntryId, setBillWorkEntryId] = useState(null);
  const [newBill, setNewBill] = useState({ date: dayjs(), category: '', description: '', amount: '' });
  const [billsForEntry, setBillsForEntry] = useState([]);

  // --- Payment edit state ---
  const [editPaymentDialogOpen, setEditPaymentDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);

  // --- Event grouping and export state ---
  const [showGroupedView, setShowGroupedView] = useState(false);
  const [groupedWorkEntries, setGroupedWorkEntries] = useState([]);
  const [groupFilterEvent, setGroupFilterEvent] = useState('');
  const [groupFilterDate, setGroupFilterDate] = useState('');

  // 1. Replace all show/hide section states with a single state:
  const [activeSection, setActiveSection] = useState('workEntries');

  // Check if user is authenticated
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
  }, [navigate]);

  useEffect(() => {
    fetchWorkEntries();
    fetchEmployees();
    fetchEvents();
    fetchBills();
    fetchPayments();
  }, []);

  useEffect(() => {
    if (activeSection === 'balances') {
      fetchOutstandingBalances();
    }
  }, [activeSection]);

  const fetchEvents = async () => {
    try {
      const data = await eventsApi.getAll();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchBills = async () => {
    setBills(await billsApi.getAll());
  };

  const fetchPayments = async () => {
    try {
      const data = await paymentsApi.getAll();
      setPayments(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  // Helper for sorting
  function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }

  function getComparator(order, orderBy) {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

  function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) {
        return order;
      }
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  }

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const fetchEmployees = async () => {
    try {
      const data = await employeesApi.getAll();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchWorkEntries = async () => {
    try {
      const data = await workEntriesApi.getAll();
      setWorkEntries(data);
    } catch (error) {
      console.error('Error fetching work entries:', error);
    }
  };

  const calculateHours = (from, to) => {
    if (!from || !to) return '';
    const [fromHour, fromMinute] = from.split(':').map(Number);
    const [toHour, toMinute] = to.split(':').map(Number);

    const fromDate = new Date(0, 0, 0, fromHour, fromMinute);
    const toDate = new Date(0, 0, 0, toHour, toMinute);

    let diff = toDate.getTime() - fromDate.getTime();
    if (diff < 0) { // Handle overnight shifts
      diff += 24 * 60 * 60 * 1000;
    }
    const hours = diff / (1000 * 60 * 60);
    return hours.toFixed(2); // Return hours with 2 decimal places
  };

  const handleTimeChange = (field, value, isEditing = false) => {
    let updatedEntry;
    if (isEditing) {
      updatedEntry = { ...editedEntry, [field]: value };
    } else {
      updatedEntry = { ...newEntry, [field]: value };
    }
    const calculatedHours = calculateHours(updatedEntry.from_time, updatedEntry.to_time);
    if (isEditing) {
      setEditedEntry({ ...updatedEntry, hours: calculatedHours });
    } else {
      setNewEntry({ ...updatedEntry, hours: calculatedHours });
    }
  };

  const handleDateChange = (newValue, isEditing = false) => {
    const date = newValue ? newValue.format('YYYY-MM-DD') : '';
    const day = newValue ? newValue.format('dddd') : '';
    if (isEditing) {
      setEditedEntry({ ...editedEntry, date, day });
    } else {
      setNewEntry({ ...newEntry, date, day });
    }
  };

  const handleAddEntry = async () => {
    try {
      // If no employees selected, use the single employee selection
      const employeesToAdd = selectedEmployees.length > 0 
        ? selectedEmployees 
        : [newEntry.employee_id];

      if (employeesToAdd.length === 0 || (employeesToAdd.length === 1 && !employeesToAdd[0])) {
        alert('Please select at least one employee');
        return;
      }

      const addedEntries = [];
      
      for (const employeeId of employeesToAdd) {
        if (employeeId) {
                const entryData = {
        employee_id: parseInt(employeeId),
        date: newEntry.date,
        day: newEntry.day,
        hours: parseFloat(newEntry.hours),
        from_time: newEntry.from_time,
        to_time: newEntry.to_time,
        event: newEntry.event,
        description: newEntry.description
      };
          
          const addedEntry = await workEntriesApi.create(entryData);
          addedEntries.push(addedEntry);
        }
      }

      setWorkEntries([...workEntries, ...addedEntries]);
      
      // Reset form
      setNewEntry({ employee_id: '', date: '', day: '', hours: '', from_time: '', to_time: '', event: '', description: '' });
      setSelectedEmployees([]);
      
      if (addedEntries.length > 1) {
        alert(`Successfully added ${addedEntries.length} work entries!`);
      }
    } catch (error) {
      console.error('Error adding work entries:', error);
      alert('Error adding work entries: ' + error.message);
    }
  };

  const handleResetNewEntry = () => {
    setNewEntry({ employee_id: '', date: '', day: '', hours: '', from_time: '', to_time: '', event: '', description: '' });
    setSelectedEmployees([]);
  };

  const handleEditClick = (entry) => {
    setEditingEntryId(entry.id);
    setEditedEntry({ ...entry });
  };

  const handleSaveEdit = async () => {
    try {
      console.log('Saving edited entry:', editedEntry);
      
      const updateData = { 
        ...editedEntry, 
        employee_id: parseInt(editedEntry.employee_id), 
        hours: parseFloat(editedEntry.hours) 
      };
      
      console.log('Update data being sent:', updateData);
      
      const updatedEntry = await workEntriesApi.update(editedEntry.id, updateData);
      console.log('Updated entry received:', updatedEntry);
      
      setWorkEntries(workEntries.map(entry => entry.id === updatedEntry.id ? updatedEntry : entry));
      setEditingEntryId(null);
      setEditedEntry(null);
      
      alert('Work entry updated successfully!');
    } catch (error) {
      console.error('Error saving work entry:', error);
      alert('Error saving work entry: ' + error.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingEntryId(null);
    setEditedEntry(null);
  };

  const handleDeleteClick = async (id) => {
    try {
      await workEntriesApi.delete(id);
      setWorkEntries(workEntries.filter(entry => entry.id !== id));
    } catch (error) {
      console.error('Error deleting work entry:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleAddEmployee = async () => {
    try {
      const addedEmployee = await employeesApi.create({ ...newEmployee, role: 'employee' });
      setEmployees([...employees, addedEmployee]);
      setNewEmployee({ name: '', password: '' });
    } catch (error) {
      console.error('Error adding employee:', error);
    }
  };

  const handleAddEvent = async () => {
    try {
      const addedEvent = await eventsApi.create({ name: newEventName });
      setEvents([...events, addedEvent]);
      setNewEventName('');
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  // New functions for employee management
  const handleEditEmployee = (employee) => {
    setEditingEmployeeId(employee.id);
    setEditedEmployee({ ...employee });
    setEditEmployeeDialogOpen(true);
  };

  const handleSaveEmployeeEdit = async () => {
    try {
      const updatedEmployee = await employeesApi.update(editingEmployeeId, editedEmployee);
      setEmployees(employees.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
      setEditEmployeeDialogOpen(false);
      setEditingEmployeeId(null);
      setEditedEmployee({ name: '', password: '', role: 'employee' });
    } catch (error) {
      console.error('Error updating employee:', error);
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee? This will also delete all their work entries.')) {
      try {
        await employeesApi.delete(id);
        setEmployees(employees.filter(emp => emp.id !== id));
        // Also remove work entries for this employee
        setWorkEntries(workEntries.filter(entry => entry.employee_id !== id));
      } catch (error) {
        console.error('Error deleting employee:', error);
      }
    }
  };

  const handleCancelEmployeeEdit = () => {
    setEditEmployeeDialogOpen(false);
    setEditingEmployeeId(null);
    setEditedEmployee({ name: '', password: '', role: 'employee' });
  };

  // New functions for event management
  const handleEditEvent = (event) => {
    setEditingEventId(event.id);
    setEditedEvent({ ...event });
    setEditEventDialogOpen(true);
  };

  const handleSaveEventEdit = async () => {
    try {
      const updatedEvent = await eventsApi.update(editingEventId, editedEvent);
      setEvents(events.map(evt => evt.id === updatedEvent.id ? updatedEvent : evt));
      setEditEventDialogOpen(false);
      setEditingEventId(null);
      setEditedEvent({ name: '' });
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (window.confirm('Are you sure you want to delete this event? This will remove it from all work entries.')) {
      try {
        await eventsApi.delete(id);
        setEvents(events.filter(evt => evt.id !== id));
        // Update work entries to remove references to deleted event
        setWorkEntries(workEntries.map(entry => 
          entry.event === events.find(evt => evt.id === id)?.name 
            ? { ...entry, event: '' } 
            : entry
        ));
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const handleCancelEventEdit = () => {
    setEditEventDialogOpen(false);
    setEditingEventId(null);
    setEditedEvent({ name: '' });
  };

  const filteredWorkEntries = workEntries.filter(entry => {
    const entryDate = dayjs(entry.date);
    const matchesEmployee = filterEmployeeId ? entry.employee_id === filterEmployeeId : true;
    const matchesMonth = filterMonth ? entryDate.format('MM') === filterMonth : true;
    const matchesYear = filterYear ? entryDate.format('YYYY') === filterYear : true;
    return matchesEmployee && matchesMonth && matchesYear;
  }).sort((a, b) => b.id - a.id);

  const handleApplyFilter = () => {
    setAppliedFilterEmployeeId(filterEmployeeId);
    setAppliedFilterMonth(filterMonth);
    setAppliedFilterYear(filterYear);
  };

  const handleResetFilters = () => {
    setFilterEmployeeId('');
    setFilterMonth('');
    setFilterYear('');
    setAppliedFilterEmployeeId('');
    setAppliedFilterMonth('');
    setAppliedFilterYear('');
  };

  const calculateMonthlyHours = () => {
    const monthlyHours = {};
    workEntries.forEach(entry => {
      const month = dayjs(entry.date).format('YYYY-MM');
      const employeeName = employees.find(emp => emp.id === entry.employee_id)?.name || 'Unknown';
      if (!monthlyHours[month]) {
        monthlyHours[month] = {};
      }
      if (!monthlyHours[month][employeeName]) {
        monthlyHours[month][employeeName] = 0;
      }
      monthlyHours[month][employeeName] += parseFloat(entry.hours);
    });
    return monthlyHours;
  };

  const monthlyHoursData = calculateMonthlyHours();

  const calculateTotalHours = () => {
    if (selectedEmployee && selectedMonth) {
      const filteredEntries = workEntries.filter(entry => {
        const entryMonth = dayjs(entry.date).format('YYYY-MM');
        return entry.employee_id === selectedEmployee && entryMonth === selectedMonth;
      });
      const total = filteredEntries.reduce((acc, entry) => acc + parseFloat(entry.hours), 0);
      setTotalHours(total);
      setMonthlyBreakdown(null);
    } else if (selectedEmployee) {
      const monthlyData = {};
      const filteredEntries = workEntries.filter(entry => entry.employee_id === selectedEmployee);
      filteredEntries.forEach(entry => {
        const month = dayjs(entry.date).format('YYYY-MM');
        if (!monthlyData[month]) {
          monthlyData[month] = 0;
        }
        monthlyData[month] += parseFloat(entry.hours);
      });
      setMonthlyBreakdown(monthlyData);
      setTotalHours(null);
    } else {
      setTotalHours(null);
      setMonthlyBreakdown(null);
    }
  };

  const formatTime = (time24) => {
    if (!time24) return '';
    const [hour, minute] = time24.split(':').map(Number);
    const date = new Date();
    date.setHours(hour, minute);
    return date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
  };

  // Payment calculation functions
  const calculateEmployeePayments = () => {
    const employeePayments = [];
    const hourlyRate = 10; // $10 per hour

    // Get all employees who have work entries in the selected period
    const employeesWithWork = new Set();
    workEntries.forEach(entry => {
      const entryDate = dayjs(entry.date);
      const matchesMonth = appliedPaymentFilterMonth ? entryDate.format('MM') === appliedPaymentFilterMonth : true;
      const matchesYear = appliedPaymentFilterYear ? entryDate.format('YYYY') === appliedPaymentFilterYear : true;
      if (matchesMonth && matchesYear) {
        employeesWithWork.add(entry.employee_id);
      }
    });

    // If employee filter is applied, only show that employee
    // Otherwise, show only employees who have work in the selected period
    const employeesToProcess = appliedPaymentFilterEmployee 
      ? employees.filter(emp => emp.id === parseInt(appliedPaymentFilterEmployee) && emp.role !== 'admin')
      : employees.filter(emp => emp.role !== 'admin' && employeesWithWork.has(emp.id));

    employeesToProcess.forEach(employee => {
      let totalHours = 0;
      let monthlyHours = {};

      // Filter work entries for this employee
      const employeeEntries = workEntries.filter(entry => {
        const entryDate = dayjs(entry.date);
        const matchesEmployee = entry.employee_id === employee.id;
        const matchesMonth = appliedPaymentFilterMonth ? entryDate.format('MM') === appliedPaymentFilterMonth : true;
        const matchesYear = appliedPaymentFilterYear ? entryDate.format('YYYY') === appliedPaymentFilterYear : true;
        return matchesEmployee && matchesMonth && matchesYear;
      });

      // Calculate total hours and monthly breakdown
      employeeEntries.forEach(entry => {
        const hours = parseFloat(calculateHours(entry.from_time, entry.to_time)) || 0;
        totalHours += hours;
        
        const month = dayjs(entry.date).format('YYYY-MM');
        if (!monthlyHours[month]) {
          monthlyHours[month] = 0;
        }
        monthlyHours[month] += hours;
      });

      const totalPayment = totalHours * hourlyRate;

      employeePayments.push({
        id: employee.id,
        name: employee.name,
        totalHours: totalHours.toFixed(2),
        totalPayment: totalPayment.toFixed(2),
        monthlyHours,
        entryCount: employeeEntries.length
      });
    });

    return employeePayments.sort((a, b) => parseFloat(b.totalPayment) - parseFloat(a.totalPayment));
  };

  const handleApplyPaymentFilter = () => {
    setAppliedPaymentFilterMonth(paymentFilterMonth);
    setAppliedPaymentFilterYear(paymentFilterYear);
    setAppliedPaymentFilterEmployee(paymentFilterEmployee);
  };

  const handleResetPaymentFilters = () => {
    setPaymentFilterMonth('');
    setPaymentFilterYear('');
    setPaymentFilterEmployee('');
    setAppliedPaymentFilterMonth('');
    setAppliedPaymentFilterYear('');
    setAppliedPaymentFilterEmployee('');
  };

  const getTotalCompanyPayment = () => {
    const payments = calculateEmployeePayments();
    return payments.reduce((total, payment) => total + (parseFloat(payment.totalPayment) + getTotalBillsForEmployee(payment.id)), 0).toFixed(2);
  };

  const getTotalBillsForEntry = (workEntryId) => {
    return bills.filter(bill => bill.work_entry_id === workEntryId).reduce((total, bill) => total + parseFloat(bill.amount), 0);
  };

  const getTotalBillsForEmployee = (employeeId) => {
    return bills.filter(bill => {
      const billDate = dayjs(bill.date);
      const matchesEmployee = bill.employee_id === employeeId;
      const matchesMonth = appliedPaymentFilterMonth ? billDate.format('MM') === appliedPaymentFilterMonth : true;
      const matchesYear = appliedPaymentFilterYear ? billDate.format('YYYY') === appliedPaymentFilterYear : true;
      return matchesEmployee && matchesMonth && matchesYear;
    }).reduce((total, bill) => total + parseFloat(bill.amount), 0);
  };

  const getTotalBillsForEmployeeInMonth = (employeeId, month) => {
    return bills.filter(bill => {
      const billDate = dayjs(bill.date);
      const matchesEmployee = bill.employee_id === employeeId;
      const matchesMonth = billDate.format('YYYY-MM') === month;
      return matchesEmployee && matchesMonth;
    }).reduce((total, bill) => total + parseFloat(bill.amount), 0);
  };

  // Outstanding Balance Functions
  const fetchOutstandingBalances = async () => {
    setLoadingBalances(true);
    try {
      const balances = await balancesApi.getAllOutstanding();
      setOutstandingBalances(balances);
    } catch (error) {
      console.error('Error fetching outstanding balances:', error);
    } finally {
      setLoadingBalances(false);
    }
  };

  const handleOpenPaymentDialog = (employee) => {
    setSelectedEmployeeForPayment(employee);
    setPaymentAmount(employee.outstanding.toString());
    setPaymentDate(dayjs());
    setPaymentDescription('');
    setSettlementDialogOpen(true);
  };

  const handlePaymentSettlement = async () => {
    try {
      const paymentData = {
        employee_id: selectedEmployeeForPayment.id,
        amount: parseFloat(paymentAmount),
        payment_date: paymentDate.format('YYYY-MM-DD'),
        description: paymentDescription || `Payment settlement for ${selectedEmployeeForPayment.name}`
      };
      
      await paymentsApi.create(paymentData);
      await fetchPayments(); // Refresh payments
      await fetchOutstandingBalances(); // Refresh balances
      
      setSettlementDialogOpen(false);
      setSelectedEmployeeForPayment(null);
      setPaymentAmount('');
      setPaymentDescription('');
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Error processing payment. Please try again.');
    }
  };

  const handleCancelPaymentDialog = () => {
    setSettlementDialogOpen(false);
    setSelectedEmployeeForPayment(null);
    setPaymentAmount('');
    setPaymentDescription('');
  };

  const calculateRemainingBalance = () => {
    if (!selectedEmployeeForPayment || !paymentAmount) return selectedEmployeeForPayment?.outstanding || 0;
    return Math.max(0, selectedEmployeeForPayment.outstanding - parseFloat(paymentAmount || 0));
  };

  const getTotalOutstandingAmount = () => {
    return outstandingBalances.reduce((total, balance) => total + balance.outstanding, 0).toFixed(2);
  };

  // Filter out admin users for employees table
  const filteredEmployees = employees.filter(emp => emp.role !== 'admin');
  const paginatedEmployees = filteredEmployees.slice((employeesPage - 1) * EMPLOYEES_PER_PAGE, employeesPage * EMPLOYEES_PER_PAGE);
  const paginatedEvents = events.slice((eventsPage - 1) * EVENTS_PER_PAGE, eventsPage * EVENTS_PER_PAGE);

  // Paginate filteredWorkEntries
  const paginatedWorkEntries = filteredWorkEntries.slice((workEntriesPage - 1) * WORK_ENTRIES_PER_PAGE, workEntriesPage * WORK_ENTRIES_PER_PAGE);

  // --- Bill dialog handlers ---
  const handleOpenBillDialog = async (workEntryId) => {
    setBillWorkEntryId(workEntryId);
    setBillDialogOpen(true);
    const bills = await billsApi.getByWorkEntry(workEntryId);
    setBillsForEntry(bills);
  };
  const handleAddBill = async () => {
    const entry = workEntries.find(e => e.id === billWorkEntryId);
    if (!entry || !entry.employee_id || !billWorkEntryId) {
      alert('Could not determine employee or shift for this bill.');
      return;
    }
    try {
      await billsApi.create({
        employee_id: entry.employee_id,
        date: newBill.date.format('YYYY-MM-DD'),
        category: newBill.category,
        description: newBill.description,
        amount: parseFloat(newBill.amount),
        work_entry_id: billWorkEntryId,
      });
      const bills = await billsApi.getByWorkEntry(billWorkEntryId);
      setBillsForEntry(bills);
      setNewBill({ date: dayjs(), category: '', description: '', amount: '' });
      setBillDialogOpen(false);
    } catch (error) {
      alert('Error adding bill: ' + (error.message || error));
    }
  };

  // --- Edit payment handlers ---
  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setEditPaymentDialogOpen(true);
  };
  const handleSavePaymentEdit = async () => {
    try {
      await paymentsApi.update(editingPayment.id, {
        amount: parseFloat(editingPayment.amount),
        payment_date: editingPayment.payment_date,
        description: editingPayment.description,
      });
      setEditPaymentDialogOpen(false);
      setEditingPayment(null);
      await fetchPayments();
      await fetchOutstandingBalances();
    } catch (error) {
      alert('Error updating payment: ' + (error.message || error));
    }
  };

  // Helper to get the most recent payment for an employee
  const getLastPaymentForEmployee = (employeeId) => {
    const employeePayments = payments
      .filter(p => p.employee_id === employeeId)
      .sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));
    return employeePayments[0] || null;
  };

  const handleRollbackPayment = async (paymentId) => {
    if (window.confirm('Are you sure you want to rollback this payment? This action cannot be undone.')) {
      try {
        await paymentsApi.delete(paymentId);
        setPayments(payments.filter(p => p.id !== paymentId));
        // Refresh outstanding balances
        await fetchOutstandingBalances();
        alert('Payment rolled back successfully!');
      } catch (error) {
        console.error('Error rolling back payment:', error);
        alert('Error rolling back payment: ' + error.message);
      }
    }
  };

  // Split outstandingBalances into outstanding and settled
  const outstanding = outstandingBalances.filter(e => e.outstanding !== 0);
  const settled = outstandingBalances.filter(e => e.outstanding === 0);

  // Event grouping and export functions
  const groupWorkEntriesByEventAndDate = () => {
    const grouped = {};
    
    filteredWorkEntries.forEach(entry => {
      const key = `${entry.event || 'No Event'}_${entry.date}`;
      if (!grouped[key]) {
        grouped[key] = {
          event: entry.event || 'No Event',
          date: entry.date,
          day: entry.day,
          entries: [],
          totalHours: 0,
          totalPay: 0,
          totalBills: 0,
          totalFinalPay: 0,
          employeeCount: 0
        };
      }
      
      const hours = parseFloat(entry.hours) || 0;
      const pay = hours * 10;
      const bills = getTotalBillsForEntry(entry.id);
      const finalPay = pay + bills;
      
      grouped[key].entries.push(entry);
      grouped[key].totalHours += hours;
      grouped[key].totalPay += pay;
      grouped[key].totalBills += bills;
      grouped[key].totalFinalPay += finalPay;
      grouped[key].employeeCount = grouped[key].entries.length;
    });
    
    return Object.values(grouped).sort((a, b) => {
      // Sort by date first, then by event name
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return a.event.localeCompare(b.event);
    });
  };

  const handleToggleGroupedView = () => {
    setShowGroupedView(!showGroupedView);
    if (!showGroupedView) {
      const grouped = groupWorkEntriesByEventAndDate();
      setGroupedWorkEntries(grouped);
    }
  };

  const handleExportToExcel = () => {
    if (!filterMonth || !filterYear) {
      alert('Please select both month and year before exporting to Excel.');
      return;
    }
    // Sheet 1: Filtered Work Entries (detailed)
    const detailedData = filteredWorkEntries.map(entry => ({
      'Employee': employees.find(emp => emp.id === entry.employee_id)?.name || entry.employee_id,
      'Date': entry.date,
      'Day': entry.day,
      'From Time': entry.from_time ? formatTime(entry.from_time) : '',
      'To Time': entry.to_time ? formatTime(entry.to_time) : '',
      'Hours': entry.hours,
      'Pay': `$${(parseFloat(entry.hours) * 10).toFixed(2)}`,
      'Bills': `$${getTotalBillsForEntry(entry.id).toFixed(2)}`,
      'Final Pay': `$${(parseFloat(entry.hours) * 10 + getTotalBillsForEntry(entry.id)).toFixed(2)}`,
      'Event': entry.event || 'No Event',
      'Description': entry.description || ''
    }));

    // Sheet 2: Grouped by Event and Date (summary)
    const grouped = groupWorkEntriesByEventAndDate();
    const groupedData = grouped.map(group => ({
      'Event': group.event,
      'Date': group.date,
      'Day': group.day,
      'Employee Count': group.employeeCount,
      'Total Hours': group.totalHours.toFixed(2),
      'Total Pay': `$${group.totalPay.toFixed(2)}`,
      'Total Bills': `$${group.totalBills.toFixed(2)}`,
      'Total Final Pay': `$${group.totalFinalPay.toFixed(2)}`,
      'Employees': [...new Set(group.entries.map(entry =>
        employees.find(emp => emp.id === entry.employee_id)?.name || entry.employee_id
      ))].join(', ')
    }));

    const ws1 = XLSX.utils.json_to_sheet(detailedData);
    const ws2 = XLSX.utils.json_to_sheet(groupedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, 'Work Entries');
    XLSX.utils.book_append_sheet(wb, ws2, 'Grouped Summary');

    const monthName = dayjs(`${filterYear}-${filterMonth}-01`).format('MMMM');
    let fileName = `work_entries_${monthName}_${filterYear}`;
    if (filterEmployeeId) {
      const emp = employees.find(e => e.id === filterEmployeeId);
      if (emp) fileName += `_${emp.name.replace(/\s+/g, '_')}`;
    }
    fileName += '.xlsx';
    XLSX.writeFile(wb, fileName);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Royal/Elegant Top Row Only */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          justifyContent: 'space-between', 
          alignItems: { xs: 'stretch', sm: 'center' }, 
          mb: 4, 
          gap: 2,
          p: 3,
          background: 'transparent',
          borderRadius: 3,
          color: '#333'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <svg width="34" height="34" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="16" fill="#556cd6"/>
              <circle cx="16" cy="16" r="11" fill="white" fillOpacity="0.1"/>
              <path d="M16 8.5V16L20 19.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="16" cy="16" r="0.85" fill="white"/>
            </svg>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                textAlign: { xs: 'center', sm: 'left' },
                fontWeight: 700,
                letterSpacing: '0.5px',
                color: '#333'
              }}
            >
              Admin Dashboard
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
            <Button 
              variant={activeSection === 'workEntries' ? "contained" : "outlined"}
              onClick={() => setActiveSection('workEntries')}
              sx={{
                background: activeSection === 'workEntries' ? '#556cd6' : 'transparent',
                border: '2px solid rgba(85, 108, 214, 0.3)',
                color: activeSection === 'workEntries' ? 'white' : '#333',
                '&:hover': {
                  background: activeSection === 'workEntries' ? '#4a5cb8' : 'rgba(85, 108, 214, 0.1)',
                  border: '2px solid rgba(85, 108, 214, 0.5)'
                }
              }}
            >
              Work Entries
            </Button>
            <Button 
              variant={activeSection === 'employeesEvents' ? "contained" : "outlined"}
              onClick={() => setActiveSection('employeesEvents')}
              sx={{
                background: activeSection === 'employeesEvents' ? '#556cd6' : 'transparent',
                border: '2px solid rgba(85, 108, 214, 0.3)',
                color: activeSection === 'employeesEvents' ? 'white' : '#333',
                '&:hover': {
                  background: activeSection === 'employeesEvents' ? '#4a5cb8' : 'rgba(85, 108, 214, 0.1)',
                  border: '2px solid rgba(85, 108, 214, 0.5)'
                }
              }}
            >
              Employees & Events
            </Button>
            <Button 
              variant={activeSection === 'payments' ? "contained" : "outlined"}
              onClick={() => setActiveSection('payments')}
              sx={{
                background: activeSection === 'payments' ? '#556cd6' : 'transparent',
                border: '2px solid rgba(85, 108, 214, 0.3)',
                color: activeSection === 'payments' ? 'white' : '#333',
                '&:hover': {
                  background: activeSection === 'payments' ? '#4a5cb8' : 'rgba(85, 108, 214, 0.1)',
                  border: '2px solid rgba(85, 108, 214, 0.5)'
                }
              }}
            >
              Payments
            </Button>
            <Button 
              variant={activeSection === 'balances' ? "contained" : "outlined"}
              onClick={() => setActiveSection('balances')}
              sx={{
                background: activeSection === 'balances' ? '#556cd6' : 'transparent',
                border: '2px solid rgba(85, 108, 214, 0.3)',
                color: activeSection === 'balances' ? 'white' : '#333',
                '&:hover': {
                  background: activeSection === 'balances' ? '#4a5cb8' : 'rgba(85, 108, 214, 0.1)',
                  border: '2px solid rgba(85, 108, 214, 0.5)'
                }
              }}
            >
              Balances
            </Button>
            <Button 
              variant="outlined" 
              onClick={handleLogout}
              sx={{
                background: 'transparent',
                border: '2px solid #ef5350',
                color: 'black',
                fontWeight: 600,
                '&:hover': {
                  background: '#ef5350',
                  color: 'white',
                  border: '2px solid #ef5350'
                }
              }}
            >
              Logout
            </Button>
          </Box>
        </Box>

        {/* All Employees Table Section */}
        {activeSection === 'employeesEvents' && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* Employees Section */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                {/* Add New Employee Section */}
                <Box sx={{ mb: 3, pb: 3, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>Add New Employee</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        label="Name"
                        value={newEmployee.name}
                        onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Password"
                        type="password"
                        value={newEmployee.password}
                        onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Button variant="contained" onClick={handleAddEmployee} fullWidth>Add Employee</Button>
                    </Grid>
                  </Grid>
                </Box>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>All Employees</Typography>
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table sx={{ minWidth: { xs: 300, sm: 400 } }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedEmployees.map((employee) => (
                        <TableRow key={employee.id}>
                          <TableCell>{employee.name}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 0.5 }}>
                              <Button 
                                size="small" 
                                variant="outlined" 
                                onClick={() => handleEditEmployee(employee)}
                              >
                                Edit
                              </Button>
                              <Button 
                                size="small" 
                                variant="outlined" 
                                color="error" 
                                onClick={() => handleDeleteEmployee(employee.id)}
                              >
                                Delete
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Pagination
                    count={Math.ceil(filteredEmployees.length / EMPLOYEES_PER_PAGE)}
                    page={employeesPage}
                    onChange={(_, value) => setEmployeesPage(value)}
                    color="primary"
                    size="small"
                  />
                </Box>
              </Paper>
            </Grid>
            {/* Events Section */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                {/* Add New Event Section */}
                <Box sx={{ mb: 3, pb: 3, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>Add New Event</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        label="Event Name"
                        value={newEventName}
                        onChange={(e) => setNewEventName(e.target.value)}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Button variant="contained" onClick={handleAddEvent} fullWidth>Add Event</Button>
                    </Grid>
                  </Grid>
                </Box>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>All Events</Typography>
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table sx={{ minWidth: { xs: 300, sm: 400 } }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedEvents.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell>{event.name}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 0.5 }}>
                              <Button 
                                size="small" 
                                variant="outlined" 
                                onClick={() => handleEditEvent(event)}
                              >
                                Edit
                              </Button>
                              <Button 
                                size="small" 
                                variant="outlined" 
                                color="error" 
                                onClick={() => handleDeleteEvent(event.id)}
                              >
                                Delete
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Pagination
                    count={Math.ceil(events.length / EVENTS_PER_PAGE)}
                    page={eventsPage}
                    onChange={(_, value) => setEventsPage(value)}
                    color="primary"
                    size="small"
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Payments Section */}
        {activeSection === 'payments' && (
          <Grid item xs={12} sx={{ mb: 3 }}>
            <Paper sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>Employee Payments</Typography>
              
              {/* Payment Filters */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Filter by Period</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={3}>
                    <FormControl fullWidth>
                      <InputLabel id="payment-employee-label">Employee</InputLabel>
                      <Select
                        labelId="payment-employee-label"
                        value={paymentFilterEmployee}
                        label="Employee"
                        onChange={(e) => setPaymentFilterEmployee(e.target.value)}
                      >
                        <MenuItem value="">All Employees</MenuItem>
                        {employees.filter(emp => emp.role !== 'admin').map(emp => (
                          <MenuItem key={emp.id} value={emp.id}>{emp.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <FormControl fullWidth>
                      <InputLabel id="payment-month-label">Month</InputLabel>
                      <Select
                        labelId="payment-month-label"
                        value={paymentFilterMonth}
                        label="Month"
                        onChange={(e) => setPaymentFilterMonth(e.target.value)}
                      >
                        <MenuItem value="">All Months</MenuItem>
                        {[...Array(12).keys()].map(month => (
                          <MenuItem key={month + 1} value={String(month + 1).padStart(2, '0')}>
                            {dayjs().month(month).format('MMMM')}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <FormControl fullWidth>
                      <InputLabel id="payment-year-label">Year</InputLabel>
                      <Select
                        labelId="payment-year-label"
                        value={paymentFilterYear}
                        label="Year"
                        onChange={(e) => setPaymentFilterYear(e.target.value)}
                      >
                        <MenuItem value="">All Years</MenuItem>
                        {[...Array(5).keys()].map(i => {
                          const year = 2025 + i;
                          return <MenuItem key={year} value={String(year)}>{year}</MenuItem>;
                        })}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={3} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 1 }}>
                    <Button variant="contained" onClick={handleApplyPaymentFilter} fullWidth>Apply</Button>
                    <Button variant="outlined" onClick={handleResetPaymentFilters} fullWidth>Reset</Button>
                  </Grid>
                </Grid>
              </Box>

              {/* Total Breakdown Heading */}
              {(appliedPaymentFilterEmployee || appliedPaymentFilterMonth || appliedPaymentFilterYear) && (
                <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
                  {appliedPaymentFilterEmployee 
                    ? `Payments for ${employees.find(emp => emp.id === parseInt(appliedPaymentFilterEmployee))?.name}`
                    : 'All Employees'
                  }
                  {(appliedPaymentFilterMonth || appliedPaymentFilterYear) &&
                    ` - ${appliedPaymentFilterMonth && appliedPaymentFilterYear
                      ? `${dayjs().month(parseInt(appliedPaymentFilterMonth) - 1).format('MMMM')} ${appliedPaymentFilterYear}`
                      : appliedPaymentFilterMonth
                        ? `${dayjs().month(parseInt(appliedPaymentFilterMonth) - 1).format('MMMM')}`
                        : appliedPaymentFilterYear
                          ? `${appliedPaymentFilterYear}`
                          : ''
                    }`
                  }
                </Typography>
              )}

              {/* Total Company Payment */}
              {(appliedPaymentFilterEmployee || appliedPaymentFilterMonth || appliedPaymentFilterYear) && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Typography variant="h6">
                    Total Company Payment: ${getTotalCompanyPayment()}
                  </Typography>
                </Box>
              )}

              {/* Payments Table */}
              {(appliedPaymentFilterEmployee || appliedPaymentFilterMonth || appliedPaymentFilterYear) && (
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table sx={{ minWidth: { xs: 600, sm: 700 } }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Employee Name</TableCell>
                        <TableCell>Total Hours</TableCell>
                        <TableCell>Hourly Rate</TableCell>
                        <TableCell>Total Payment</TableCell>
                        <TableCell>Total Bills</TableCell>
                        <TableCell>Final Pay</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {calculateEmployeePayments().map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {payment.name}
                            </Typography>
                          </TableCell>
                          <TableCell>{payment.totalHours} hrs</TableCell>
                          <TableCell>$10.00/hr</TableCell>
                          <TableCell>
                            <Typography variant="subtitle1" fontWeight="bold" style={{ color: 'black' }}>
                              ${payment.totalPayment}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            ${getTotalBillsForEmployee(payment.id).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle1" fontWeight="bold" color="primary">
                              ${(parseFloat(payment.totalPayment) + getTotalBillsForEmployee(payment.id)).toFixed(2)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Monthly Breakdown for Filtered Employee */}
              {appliedPaymentFilterEmployee && !appliedPaymentFilterMonth && calculateEmployeePayments().length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Monthly Breakdown for {employees.find(emp => emp.id === parseInt(appliedPaymentFilterEmployee))?.name}
                  </Typography>
                  <TableContainer sx={{ overflowX: 'auto' }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Month</TableCell>
                          <TableCell>Total Hours</TableCell>
                          <TableCell>Payment</TableCell>
                          <TableCell>Bills</TableCell>
                          <TableCell>Final Pay</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(calculateEmployeePayments()[0]?.monthlyHours || {}).map(([month, hours]) => (
                          <TableRow key={month}>
                            <TableCell>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {dayjs(month).format('MMMM YYYY')}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body1" fontWeight="bold">
                                {hours.toFixed(2)} hrs
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body1" fontWeight="bold" style={{ color: 'black' }}>
                                ${(hours * 10).toFixed(2)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              ${getTotalBillsForEmployeeInMonth(parseInt(appliedPaymentFilterEmployee), month).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body1" fontWeight="bold" style={{ color: 'black' }}>
                                ${(hours * 10 + getTotalBillsForEmployeeInMonth(parseInt(appliedPaymentFilterEmployee), month)).toFixed(2)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Paper>
          </Grid>
        )}

        {/* Outstanding Balances Section */}
        {activeSection === 'balances' && (
          <Grid item xs={12} sx={{ mb: 3 }}>
            <Paper sx={{ p: { xs: 2, sm: 3 } }}>
              {outstanding.length > 0 && (
                <>
                  <Typography variant="subtitle1" sx={{ color: 'error.main', mt: 2, mb: 1 }}>
                    Outstanding Balances
                  </Typography>
                  <TableContainer sx={{ overflowX: 'auto', mb: 3 }}>
                    <Table sx={{ minWidth: { xs: 600, sm: 800 } }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Employee Name</TableCell>
                          <TableCell>Total Owed</TableCell>
                          <TableCell>Total Paid</TableCell>
                          <TableCell align="center">Outstanding</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {outstanding.map((employee) => (
                          <TableRow key={employee.emp_id}>
                            <TableCell>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {employee.emp_name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="primary">
                                ${employee.total_owed.toFixed(2)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                (Work: ${employee.total_work_pay.toFixed(2)} + Bills: ${employee.total_bills.toFixed(2)})
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="success.main">
                                ${employee.total_paid.toFixed(2)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <span style={{ color: employee.outstanding > 0 ? '#d32f2f' : '#1976d2', fontWeight: 600 }}>
                                ${employee.outstanding.toFixed(2)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="contained" 
                                color="primary"
                                size="small"
                                onClick={() => handleOpenPaymentDialog(employee)}
                                sx={{ mb: 1 }}
                              >
                                Settle Payment
                              </Button>
                              {(() => {
                                const lastPayment = getLastPaymentForEmployee(employee.emp_id);
                                return lastPayment ? (
                                  <>
                                    <Button
                                      variant="outlined"
                                      color="secondary"
                                      size="small"
                                      sx={{ mt: 1, mr: 1 }}
                                      onClick={() => handleEditPayment(lastPayment)}
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      variant="outlined"
                                      color="error"
                                      size="small"
                                      sx={{ mt: 1 }}
                                      onClick={() => handleRollbackPayment(lastPayment.id)}
                                    >
                                      Rollback
                                    </Button>
                                  </>
                                ) : null;
                              })()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
              {settled.length > 0 && (
                <>
                  <Typography variant="subtitle1" sx={{ color: 'success.main', mt: 2, mb: 1 }}>
                    Settled Balances
                  </Typography>
                  <TableContainer sx={{ overflowX: 'auto', mb: 3 }}>
                    <Table sx={{ minWidth: { xs: 600, sm: 800 } }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Employee Name</TableCell>
                          <TableCell>Total Owed</TableCell>
                          <TableCell>Total Paid</TableCell>
                          <TableCell align="center">Outstanding</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {settled.map((employee) => (
                          <TableRow key={employee.emp_id}>
                            <TableCell>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {employee.emp_name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="primary">
                                ${employee.total_owed.toFixed(2)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                (Work: ${employee.total_work_pay.toFixed(2)} + Bills: ${employee.total_bills.toFixed(2)})
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="success.main">
                                ${employee.total_paid.toFixed(2)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="subtitle1" fontWeight="bold" color="success.main">
                                Settled
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="contained" 
                                color="primary"
                                size="small"
                                onClick={() => handleOpenPaymentDialog(employee)}
                                sx={{ mb: 1 }}
                              >
                                Settle Payment
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </Paper>
          </Grid>
        )}

        {/* 3. Wrap the Add New Work Entry and Work Entries Table sections in: */}
        {activeSection === 'workEntries' && (
          <>
            {/* Add New Work Entry Section */}
            <Grid item xs={12}>
              <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant="h6" gutterBottom>Add New Work Entry</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth>
                      <InputLabel id="employee-select-label">Select Employees</InputLabel>
                      <Select
                        labelId="employee-select-label"
                        id="employee-select"
                        multiple
                        value={selectedEmployees}
                        label="Select Employees"
                        onChange={(e) => setSelectedEmployees(e.target.value)}
                        renderValue={(selected) => {
                          if (selected.length === 0) return 'Select employees...';
                          if (selected.length === 1) {
                            const emp = employees.find(e => e.id === selected[0]);
                            return emp ? emp.name : '';
                          }
                          return `${selected.length} employees selected`;
                        }}
                      >
                        {employees.filter(emp => emp.role !== 'admin').map((emp) => (
                          <MenuItem key={emp.id} value={emp.id}>
                            {emp.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {selectedEmployees.length > 0 && (
                      <Box sx={{ mt: 1, p: 1, bgcolor: 'primary.light', borderRadius: 1 }}>
                        <Typography variant="caption" color="white" sx={{ fontWeight: 'bold' }}>
                          Selected: {selectedEmployees.map(id => {
                            const emp = employees.find(e => e.id === id);
                            return emp ? emp.name : '';
                          }).join(', ')}
                        </Typography>
                      </Box>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <DatePicker
                      label="Date"
                      value={newEntry.date ? dayjs(newEntry.date) : null}
                      onChange={(newValue) => handleDateChange(newValue)}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField label="Day" value={newEntry.day} InputProps={{ readOnly: true }} fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TimePicker
                      label="From Time"
                      value={newEntry.from_time ? dayjs(newEntry.from_time, 'HH:mm') : null}
                      onChange={(newValue) => handleTimeChange('from_time', newValue ? newValue.format('HH:mm') : '')}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TimePicker
                      label="To Time"
                      value={newEntry.to_time ? dayjs(newEntry.to_time, 'HH:mm') : null}
                      onChange={(newValue) => handleTimeChange('to_time', newValue ? newValue.format('HH:mm') : '')}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField label="Hours" type="number" value={newEntry.hours} InputProps={{ readOnly: true }} fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth>
                      <InputLabel id="event-select-label">Event</InputLabel>
                      <Select
                        labelId="event-select-label"
                        id="event-select"
                        value={newEntry.event}
                        label="Event"
                        onChange={(e) => setNewEntry({ ...newEntry, event: e.target.value })}
                      >
                        {events.map((event) => (
                          <MenuItem key={event.id} value={event.name}>
                            {event.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      label="Description"
                      value={newEntry.description}
                      onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="Enter work description..."
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 1 }}>
                    <Button variant="contained" onClick={handleAddEntry} sx={{ flex: 2 }}>
                      {selectedEmployees.length > 1 ? `Add ${selectedEmployees.length} Entries` : 'Add Entry'}
                    </Button>
                    <Button variant="outlined" onClick={handleResetNewEntry} sx={{ flex: 1 }}>Reset</Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Work Entries Table Section */}
            <Grid item xs={12}>
              <Paper sx={{ p: { xs: 1, sm: 2 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" gutterBottom>Work Entries</Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <InputLabel id="work-entries-employee-label">Employee</InputLabel>
                      <Select
                        labelId="work-entries-employee-label"
                        value={filterEmployeeId}
                        label="Employee"
                        onChange={e => setFilterEmployeeId(e.target.value)}
                      >
                        <MenuItem value="">All</MenuItem>
                        {employees.filter(emp => emp.role !== 'admin').map(emp => (
                          <MenuItem key={emp.id} value={emp.id}>{emp.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel id="work-entries-month-label">Month</InputLabel>
                      <Select
                        labelId="work-entries-month-label"
                        value={filterMonth}
                        label="Month"
                        onChange={e => setFilterMonth(e.target.value)}
                      >
                        <MenuItem value="">All</MenuItem>
                        {[...Array(12).keys()].map(month => (
                          <MenuItem key={month + 1} value={String(month + 1).padStart(2, '0')}>
                            {dayjs().month(month).format('MMMM')}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 100 }}>
                      <InputLabel id="work-entries-year-label">Year</InputLabel>
                      <Select
                        labelId="work-entries-year-label"
                        value={filterYear}
                        label="Year"
                        onChange={e => setFilterYear(e.target.value)}
                      >
                        <MenuItem value="">All</MenuItem>
                        {[...Array(5).keys()].map(i => {
                          const year = 2025 + i;
                          return <MenuItem key={year} value={String(year)}>{year}</MenuItem>;
                        })}
                      </Select>
                    </FormControl>
                    <Button 
                      variant="outlined" 
                      onClick={handleExportToExcel}
                      size="small"
                      sx={{
                        border: '2px solid #556cd6',
                        color: '#556cd6',
                        background: 'white',
                        '&:hover': {
                          background: '#556cd6',
                          color: 'white',
                          border: '2px solid #556cd6'
                        }
                      }}
                    >
                      Export to Excel
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="small"
                      onClick={() => {
                        setFilterEmployeeId('');
                        setFilterMonth('');
                        setFilterYear('');
                      }}
                    >
                      Reset
                    </Button>
                  </Box>
                </Box>
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table sx={{ minWidth: { xs: 600, sm: 700 } }}>
                    <TableHead>
                      <TableRow>
                        <TableCell key="employee_id" sortDirection={orderBy === 'employee_id' ? order : false}>
                          <TableSortLabel
                            active={orderBy === 'employee_id'}
                            direction={orderBy === 'employee_id' ? order : 'asc'}
                            onClick={(event) => handleRequestSort(event, 'employee_id')}
                          >
                            Employee Name
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Day</TableCell>
                        <TableCell>From Time</TableCell>
                        <TableCell>To Time</TableCell>
                        <TableCell>Hours</TableCell>
                        <TableCell>Pay</TableCell>
                        <TableCell>Bills</TableCell>
                        <TableCell>Final Pay</TableCell>
                        <TableCell>Event</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedWorkEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          {editingEntryId === entry.id ? (
                            <>
                              <TableCell>
                                <FormControl fullWidth>
                                  <InputLabel id="employee-edit-select-label">Employee</InputLabel>
                                  <Select
                                    labelId="employee-edit-select-label"
                                    id="employee-edit-select"
                                    value={editedEntry.employee_id}
                                    label="Employee"
                                    onChange={(e) => setEditedEntry({ ...editedEntry, employee_id: e.target.value })}
                                  >
                                    {employees.filter(emp => emp.role !== 'admin').map((emp) => (
                                      <MenuItem key={emp.id} value={emp.id}>
                                        {emp.name}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </TableCell>
                              <TableCell>
                                <DatePicker
                                  label="Date"
                                  value={editedEntry.date ? dayjs(editedEntry.date) : null}
                                  onChange={(newValue) => handleDateChange(newValue, true)}
                                  slotProps={{ textField: { fullWidth: true } }}
                                />
                              </TableCell>
                              <TableCell>
                                <TextField value={editedEntry.day} InputProps={{ readOnly: true }} fullWidth />
                              </TableCell>
                              <TableCell>
                                <TimePicker
                                  label="From Time"
                                  value={editedEntry.from_time ? dayjs(editedEntry.from_time, 'HH:mm') : null}
                                  onChange={(newValue) => handleTimeChange('from_time', newValue ? newValue.format('HH:mm') : '', true)}
                                  slotProps={{ textField: { fullWidth: true } }}
                                />
                              </TableCell>
                              <TableCell>
                                <TimePicker
                                  label="To Time"
                                  value={editedEntry.to_time ? dayjs(editedEntry.to_time, 'HH:mm') : null}
                                  onChange={(newValue) => handleTimeChange('to_time', newValue ? newValue.format('HH:mm') : '', true)}
                                  slotProps={{ textField: { fullWidth: true } }}
                                />
                              </TableCell>
                              <TableCell>
                                <TextField value={editedEntry.hours} InputProps={{ readOnly: true }} fullWidth />
                              </TableCell>
                              <TableCell>
                                ${(parseFloat(editedEntry.hours) * 10).toFixed(2)}
                              </TableCell>
                              <TableCell>
                                ${getTotalBillsForEntry(editedEntry.id)}
                              </TableCell>
                              <TableCell>
                                ${(parseFloat(editedEntry.hours) * 10 + getTotalBillsForEntry(editedEntry.id)).toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <FormControl fullWidth>
                                  <InputLabel id="event-edit-select-label">Event</InputLabel>
                                  <Select
                                    labelId="event-edit-select-label"
                                    id="event-edit-select"
                                    value={editedEntry.event || ''}
                                    label="Event"
                                    onChange={(e) => setEditedEntry({ ...editedEntry, event: e.target.value })}
                                  >
                                    <MenuItem value="">No Event</MenuItem>
                                    {events.map((event) => (
                                      <MenuItem key={event.id} value={event.name}>
                                        {event.name}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </TableCell>
                              <TableCell>
                                <TextField
                                  value={editedEntry.description || ''}
                                  onChange={(e) => setEditedEntry({ ...editedEntry, description: e.target.value })}
                                  fullWidth
                                  multiline
                                  rows={2}
                                  placeholder="Enter work description..."
                                />
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 0.5 }}>
                                  <Button size="small" variant="contained" onClick={handleSaveEdit}>Save</Button>
                                  <Button size="small" variant="outlined" onClick={handleCancelEdit}>Cancel</Button>
                                </Box>
                              </TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell>
                                {employees.find(emp => emp.id === entry.employee_id)?.name || entry.employee_id}
                              </TableCell>
                              <TableCell>{entry.date}</TableCell>
                              <TableCell>{entry.day}</TableCell>
                              <TableCell>{entry.from_time ? formatTime(entry.from_time) : ''}</TableCell>
                              <TableCell>{entry.to_time ? formatTime(entry.to_time) : ''}</TableCell>
                              <TableCell>{entry.hours}</TableCell>
                              <TableCell>
                                ${(parseFloat(entry.hours) * 10).toFixed(2)}
                              </TableCell>
                              <TableCell>
                                ${getTotalBillsForEntry(entry.id)}
                              </TableCell>
                              <TableCell>
                                ${(parseFloat(entry.hours) * 10 + getTotalBillsForEntry(entry.id)).toFixed(2)}
                              </TableCell>
                              <TableCell>{entry.event}</TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {entry.description || '-'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 0.5 }}>
                                  <Button size="small" variant="outlined" onClick={() => handleEditClick(entry)}>Edit</Button>
                                  <Button size="small" variant="outlined" color="error" onClick={() => handleDeleteClick(entry.id)}>Delete</Button>
                                </Box>
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Pagination
                    count={Math.ceil(filteredWorkEntries.length / WORK_ENTRIES_PER_PAGE)}
                    page={workEntriesPage}
                    onChange={(_, value) => setWorkEntriesPage(value)}
                    color="primary"
                    size="small"
                  />
                </Box>
              </Paper>
            </Grid>
          </>
        )}
      </Container>

      {/* Edit Employee Dialog */}
      <Dialog open={editEmployeeDialogOpen} onClose={handleCancelEmployeeEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Employee</DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              value={editedEmployee.name}
              onChange={(e) => setEditedEmployee({ ...editedEmployee, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={editedEmployee.password}
              onChange={(e) => setEditedEmployee({ ...editedEmployee, password: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
          <Button onClick={handleCancelEmployeeEdit}>Cancel</Button>
          <Button onClick={handleSaveEmployeeEdit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={editEventDialogOpen} onClose={handleCancelEventEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Event</DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Event Name"
              value={editedEvent.name}
              onChange={(e) => setEditedEvent({ ...editedEvent, name: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
          <Button onClick={handleCancelEventEdit}>Cancel</Button>
          <Button onClick={handleSaveEventEdit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Payment Settlement Dialog */}
      <Dialog open={settlementDialogOpen} onClose={handleCancelPaymentDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Settle Payment for {selectedEmployeeForPayment?.name}
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Employee Details Summary */}
            <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Outstanding Balance
              </Typography>
              <Typography variant="h6" color="error.main">
                ${selectedEmployeeForPayment?.outstanding.toFixed(2)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Owed: ${selectedEmployeeForPayment?.total_owed.toFixed(2)} | 
                Already Paid: ${selectedEmployeeForPayment?.total_paid.toFixed(2)}
              </Typography>
            </Box>

            {/* Payment Amount */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
              <TextField
                label="Payment Amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                fullWidth
                inputProps={{ step: "0.01", min: "0", max: selectedEmployeeForPayment?.outstanding }}
                helperText={`Maximum: $${selectedEmployeeForPayment?.outstanding.toFixed(2)}`}
              />
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => setPaymentAmount(selectedEmployeeForPayment?.outstanding.toString())}
              >
                Full Amount
              </Button>
            </Box>

            {/* Payment Date */}
            <DatePicker
              label="Payment Date"
              value={paymentDate}
              onChange={(date) => setPaymentDate(date)}
              slotProps={{ textField: { fullWidth: true } }}
            />

            {/* Payment Description */}
            <TextField
              label="Description (optional)"
              value={paymentDescription}
              onChange={(e) => setPaymentDescription(e.target.value)}
              fullWidth
              multiline
              rows={2}
              placeholder="Payment settlement note..."
            />

            {/* Remaining Balance Preview */}
            <Box sx={{ p: 2, borderRadius: 1 }}>
              <Typography variant="subtitle2">
                After Payment Remaining Balance:
              </Typography>
              <Typography variant="h6" color={calculateRemainingBalance() === 0 ? 'success.main' : 'warning.main'}>
                ${calculateRemainingBalance().toFixed(2)}
                {calculateRemainingBalance() === 0 && ' ✅ Fully Settled!'}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
          <Button onClick={handleCancelPaymentDialog}>Cancel</Button>
          <Button 
            onClick={handlePaymentSettlement} 
            variant="contained" 
            color="primary"
            disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
          >
            Process Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bill Upload Dialog */}
      <Dialog open={billDialogOpen} onClose={() => setBillDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Bill for Shift</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <DatePicker
                label="Date"
                value={newBill.date}
                onChange={(date) => setNewBill({ ...newBill, date })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newBill.category}
                  label="Category"
                  onChange={(e) => setNewBill({ ...newBill, category: e.target.value })}
                >
                  <MenuItem value="Cab">Cab</MenuItem>
                  <MenuItem value="Food">Food</MenuItem>
                  <MenuItem value="Transport">Transport</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={newBill.description}
                onChange={(e) => setNewBill({ ...newBill, description: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={newBill.amount}
                onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
                inputProps={{ step: "0.01", min: "0" }}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Bills for this shift:</Typography>
            {billsForEntry.map(bill => (
              <div key={bill.id}>{bill.category}: ${bill.amount}</div>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBillDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddBill} variant="contained">Add Bill</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Payment Dialog */}
      <Dialog open={editPaymentDialogOpen} onClose={() => setEditPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Settlement</DialogTitle>
        <DialogContent>
          <TextField
            label="Amount"
            type="number"
            value={editingPayment?.amount || ''}
            onChange={e => setEditingPayment({ ...editingPayment, amount: e.target.value })}
            fullWidth
            sx={{ mb: 2 }}
          />
          <DatePicker
            label="Payment Date"
            value={dayjs(editingPayment?.payment_date)}
            onChange={date => setEditingPayment({ ...editingPayment, payment_date: date.format('YYYY-MM-DD') })}
            slotProps={{ textField: { fullWidth: true } }}
          />
          <TextField
            label="Description"
            value={editingPayment?.description || ''}
            onChange={e => setEditingPayment({ ...editingPayment, description: e.target.value })}
            fullWidth
            multiline
            rows={2}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditPaymentDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSavePaymentEdit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}

export default AdminDashboard;
