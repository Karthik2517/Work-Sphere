import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Container, TextField, Button, Box, FormControl, InputLabel, Select, MenuItem, TableSortLabel, Grid } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker, DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { workEntriesApi, employeesApi, eventsApi } from '../services/supabaseApi';

function AdminDashboard() {
  const [workEntries, setWorkEntries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [newEntry, setNewEntry] = useState({ employee_id: '', date: '', day: '', hours: '', from_time: '', to_time: '', event: '' });
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
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkEntries();
    fetchEmployees();
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await eventsApi.getAll();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
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
      const addedEntry = await workEntriesApi.create({ 
        ...newEntry, 
        employee_id: parseInt(newEntry.employee_id), 
        hours: parseFloat(newEntry.hours) 
      });
      setWorkEntries([...workEntries, addedEntry]);
      setNewEntry({ employee_id: '', date: '', day: '', hours: '', from_time: '', to_time: '', event: '' });
    } catch (error) {
      console.error('Error adding work entry:', error);
    }
  };

  const handleResetNewEntry = () => {
    setNewEntry({ employee_id: '', date: '', day: '', hours: '', from_time: '', to_time: '', event: '' });
  };

  const handleEditClick = (entry) => {
    setEditingEntryId(entry.id);
    setEditedEntry({ ...entry });
  };

  const handleSaveEdit = async () => {
    try {
      const updatedEntry = await workEntriesApi.update(editedEntry.id, { 
        ...editedEntry, 
        employee_id: parseInt(editedEntry.employee_id), 
        hours: parseFloat(editedEntry.hours) 
      });
      setWorkEntries(workEntries.map(entry => entry.id === updatedEntry.id ? updatedEntry : entry));
      setEditingEntryId(null);
      setEditedEntry(null);
    } catch (error) {
      console.error('Error saving work entry:', error);
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

  const filteredWorkEntries = workEntries.filter(entry => {
    const entryDate = dayjs(entry.date);
    const matchesEmployee = appliedFilterEmployeeId ? entry.employee_id === appliedFilterEmployeeId : true;
    const matchesMonth = appliedFilterMonth ? entryDate.format('MM') === appliedFilterMonth : true;
    const matchesYear = appliedFilterYear ? entryDate.format('YYYY') === appliedFilterYear : true;
    return matchesEmployee && matchesMonth && matchesYear;
  });

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

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">Admin Dashboard</Typography>
          <Button variant="outlined" onClick={handleLogout}>Logout</Button>
        </Box>

        <Grid container spacing={3}>
          {/* Add New Employee Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Add New Employee</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label="Name"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label="Password"
                    type="password"
                    value={newEmployee.password}
                    onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', alignItems: 'flex-end' }}>
                  <Button variant="contained" onClick={handleAddEmployee} fullWidth>Add Employee</Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Add New Event Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Add New Event</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label="Event Name"
                    value={newEventName}
                    onChange={(e) => setNewEventName(e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', alignItems: 'flex-end' }}>
                  <Button variant="contained" onClick={handleAddEvent} fullWidth>Add Event</Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Add New Work Entry Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Add New Work Entry</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth>
                    <InputLabel id="employee-select-label">Employee</InputLabel>
                    <Select
                      labelId="employee-select-label"
                      id="employee-select"
                      value={newEntry.employee_id}
                      label="Employee"
                      onChange={(e) => setNewEntry({ ...newEntry, employee_id: e.target.value })}
                    >
                      {employees.filter(emp => emp.role !== 'admin').map((emp) => (
                        <MenuItem key={emp.id} value={emp.id}>
                          {emp.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <DatePicker
                    label="Date"
                    value={newEntry.date ? dayjs(newEntry.date) : null}
                    onChange={(newValue) => handleDateChange(newValue)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
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
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TimePicker
                    label="To Time"
                    value={newEntry.to_time ? dayjs(newEntry.to_time, 'HH:mm') : null}
                    onChange={(newValue) => handleTimeChange('to_time', newValue ? newValue.format('HH:mm') : '')}
                    renderInput={(params) => <TextField {...params} fullWidth />}
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
                <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                  <Button variant="contained" onClick={handleAddEntry} fullWidth>Add Entry</Button>
                  <Button variant="outlined" onClick={handleResetNewEntry} fullWidth>Reset</Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Filter Work Entries Section */}
          <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Filter Work Entries</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel id="filter-employee-label">Employee</InputLabel>
                  <Select
                    labelId="filter-employee-label"
                    id="filter-employee"
                    label="Employee"
                    value={filterEmployeeId}
                    onChange={(e) => setFilterEmployeeId(e.target.value)}
                  >
                    <MenuItem value="">All Employees</MenuItem>
                    {employees.filter(emp => emp.role !== 'admin').map(emp => (
                      <MenuItem key={emp.id} value={emp.id}>{emp.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel id="filter-month-label">Month</InputLabel>
                  <Select
                    labelId="filter-month-label"
                    id="filter-month"
                    label="Month"
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
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

              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel id="filter-year-label">Year</InputLabel>
                  <Select
                    labelId="filter-year-label"
                    id="filter-year"
                    label="Year"
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                  >
                    <MenuItem value="">All Years</MenuItem>
                    {[...Array(5).keys()].map(i => {
                      const year = dayjs().year() - 2 + i;
                      return <MenuItem key={year} value={String(year)}>{year}</MenuItem>;
                    })}
                  </Select>
                </FormControl>
              </Grid>
            <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                <Button variant="contained" onClick={handleApplyFilter} fullWidth>Filter</Button>
                <Button variant="outlined" onClick={handleResetFilters} fullWidth>Reset Filters</Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

          {/* Work Entries Table Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Work Entries</Typography>
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: 700 }}>
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
                      <TableCell key="date" sortDirection={orderBy === 'date' ? order : false}>
                        <TableSortLabel
                          active={orderBy === 'date'}
                          direction={orderBy === 'date' ? order : 'asc'}
                          onClick={(event) => handleRequestSort(event, 'date')}
                        >
                          Date
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>Day</TableCell>
                      <TableCell>From Time</TableCell>
                      <TableCell>To Time</TableCell>
                      <TableCell>Hours</TableCell>
                      <TableCell key="event" sortDirection={orderBy === 'event' ? order : false}>
                        <TableSortLabel
                          active={orderBy === 'event'}
                          direction={orderBy === 'event' ? order : 'asc'}
                          onClick={(event) => handleRequestSort(event, 'event')}
                        >
                          Event
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stableSort(filteredWorkEntries, getComparator(order, orderBy)).slice(0, 5).map((entry) => (
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
                                renderInput={(params) => <TextField {...params} fullWidth />}
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
                                renderInput={(params) => <TextField {...params} fullWidth />}
                              />
                            </TableCell>
                            <TableCell>
                              <TimePicker
                                label="To Time"
                                value={editedEntry.to_time ? dayjs(editedEntry.to_time, 'HH:mm') : null}
                                onChange={(newValue) => handleTimeChange('to_time', newValue ? newValue.format('HH:mm') : '', true)}
                                renderInput={(params) => <TextField {...params} fullWidth />}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField value={editedEntry.hours} InputProps={{ readOnly: true }} fullWidth />
                            </TableCell>
                            <TableCell>
                              <TextField value={editedEntry.event} onChange={(e) => setEditedEntry({ ...editedEntry, event: e.target.value })} fullWidth />
                            </TableCell>
                            <TableCell>
                              <Button onClick={handleSaveEdit}>Save</Button>
                              <Button onClick={handleCancelEdit}>Cancel</Button>
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
                            <TableCell>{entry.event}</TableCell>
                            <TableCell>
                              <Button onClick={() => handleEditClick(entry)}>Edit</Button>
                              <Button onClick={() => handleDeleteClick(entry.id)}>Delete</Button>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Monthly Hours Table */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Calculate Total Hours</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth>
                    <InputLabel id="select-employee-label">Select Employee</InputLabel>
                    <Select
                      labelId="select-employee-label"
                      value={selectedEmployee}
                      label="Select Employee"
                      onChange={(e) => setSelectedEmployee(e.target.value)}
                    >
                      <MenuItem value="">All Employees</MenuItem>
                      {employees.filter(emp => emp.role !== 'admin').map((emp) => (
                        <MenuItem key={emp.id} value={emp.id}>
                          {emp.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth>
                    <InputLabel id="select-month-label">Select Month</InputLabel>
                    <Select
                      labelId="select-month-label"
                      value={selectedMonth}
                      label="Select Month"
                      onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                      <MenuItem value="">All Months</MenuItem>
                      {[...Array(12).keys()].map(monthIndex => (
                        <MenuItem key={monthIndex + 1} value={dayjs().month(monthIndex).format('YYYY-MM')}>
                          {dayjs().month(monthIndex).format('MMMM YYYY')}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', alignItems: 'flex-end' }}>
                  <Button variant="contained" onClick={calculateTotalHours} fullWidth>Calculate</Button>
                </Grid>
              </Grid>
              {totalHours !== null && (
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Total Hours: {totalHours.toFixed(2)}
                </Typography>
              )}
              {monthlyBreakdown && (
                <TableContainer sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Month</TableCell>
                        <TableCell>Total Hours</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(monthlyBreakdown).map(([month, hours]) => (
                        <TableRow key={month}>
                          <TableCell>{month}</TableCell>
                          <TableCell>{hours.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      </LocalizationProvider>
  );
}

export default AdminDashboard;
