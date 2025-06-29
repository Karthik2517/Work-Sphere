import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Container, Button, Box, FormControl, InputLabel, Select, MenuItem, Grid, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton } from '@mui/material';
import dayjs from 'dayjs';
import { workEntriesApi, employeesApi, billsApi } from '../services/supabaseApi';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

function EmployeeDashboard() {
  const { id } = useParams();
  const [employeeWorkEntries, setEmployeeWorkEntries] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [monthlyBreakdown, setMonthlyBreakdown] = useState({});
  const [selectedMonth, setSelectedMonth] = useState('');
  const [employeeBills, setEmployeeBills] = useState([]);
  const [openBillDialog, setOpenBillDialog] = useState(false);
  const [newBill, setNewBill] = useState({ date: dayjs(), category: '', description: '', amount: '' });
  const [activeTab, setActiveTab] = useState(0);
  const [billsRefreshTrigger, setBillsRefreshTrigger] = useState(0);
  const [selectedBillMonth, setSelectedBillMonth] = useState('');
  const [selectedBreakdownMonth, setSelectedBreakdownMonth] = useState('');
  const [breakdownFromDate, setBreakdownFromDate] = useState(null);
  const [breakdownToDate, setBreakdownToDate] = useState(null);
  const [selectedWorkMonth, setSelectedWorkMonth] = useState('');
  const [editingBillId, setEditingBillId] = useState(null);
  const [editingBill, setEditingBill] = useState({ date: dayjs(), category: '', description: '', amount: '' });
  const [editBillDialogOpen, setEditBillDialogOpen] = useState(false);
  const navigate = useNavigate();

  // Check if user is authenticated and has access to this employee dashboard
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    // If user is an employee, they can only access their own dashboard
    if (user.role === 'employee' && user.id !== parseInt(id)) {
      navigate('/');
      return;
    }
  }, [navigate, id]);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        // Fetch work entries for this specific employee
        const workEntries = await workEntriesApi.getByEmployee(parseInt(id));
        console.log('Employee Work Entries:', workEntries);
        setEmployeeWorkEntries(workEntries);

        // Fetch employee details
        const employeeData = await employeesApi.getById(parseInt(id));
        console.log('Current Employee:', employeeData);
        setEmployee(employeeData);

      } catch (error) {
        console.error('Error fetching employee data:', error);
      }
    };
    fetchEmployeeData();
  }, [id]);

  useEffect(() => {
    const calculateMonthlyHours = () => {
      const monthlyData = {};
      employeeWorkEntries.forEach(entry => {
        const month = dayjs(entry.date).format('YYYY-MM');
        if (!monthlyData[month]) {
          monthlyData[month] = { hours: 0, pay: 0, bills: 0, finalPay: 0 };
        }
        const hours = parseFloat(calculateHours(entry.from_time, entry.to_time)) || 0;
        const pay = hours * 10; // $10 per hour
        const bills = getTotalBillsForDate(entry.date);
        monthlyData[month].hours += hours;
        monthlyData[month].pay += pay;
        monthlyData[month].bills += bills;
        monthlyData[month].finalPay += (pay + bills);
      });
      setMonthlyBreakdown(monthlyData);
    };
    calculateMonthlyHours();
  }, [employeeWorkEntries, employeeBills]);

  useEffect(() => {
    const fetchBills = async () => {
      const bills = await billsApi.getByEmployee(parseInt(id));
      setEmployeeBills(bills);
    };
    fetchBills();
  }, [id, billsRefreshTrigger]);

  const handleLogout = () => {
    navigate('/');
  };

  const handleResetMonthFilter = () => {
    setSelectedMonth('');
  };

  const formatTime = (time24) => {
    if (!time24) return '';
    const [hour, minute] = time24.split(':').map(Number);
    const date = new Date();
    date.setHours(hour, minute);
    return date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
  };

  const handleAddBill = async () => {
    try {
      const billData = {
        employee_id: parseInt(id),
        date: newBill.date.format('YYYY-MM-DD'),
        category: newBill.category,
        description: newBill.description,
        amount: parseFloat(newBill.amount)
      };
      await billsApi.create(billData);
      setOpenBillDialog(false);
      setNewBill({ date: dayjs(), category: '', description: '', amount: '' });
      setBillsRefreshTrigger(prevTrigger => prevTrigger + 1);
    } catch (error) {
      alert('Error adding bill');
    }
  };

  const handleDeleteBill = async (billId) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      await billsApi.delete(billId);
      setBillsRefreshTrigger(prevTrigger => prevTrigger + 1);
    }
  };

  const handleEditBill = (bill) => {
    setEditingBillId(bill.id);
    setEditingBill({
      date: dayjs(bill.date),
      category: bill.category,
      description: bill.description,
      amount: bill.amount
    });
    setEditBillDialogOpen(true);
  };

  const handleSaveBillEdit = async () => {
    try {
      const billData = {
        date: editingBill.date.format('YYYY-MM-DD'),
        category: editingBill.category,
        description: editingBill.description,
        amount: parseFloat(editingBill.amount)
      };
      await billsApi.update(editingBillId, billData);
      setEditBillDialogOpen(false);
      setEditingBillId(null);
      setEditingBill({ date: dayjs(), category: '', description: '', amount: '' });
      setBillsRefreshTrigger(prevTrigger => prevTrigger + 1);
    } catch (error) {
      alert('Error updating bill');
    }
  };

  const handleCancelBillEdit = () => {
    setEditBillDialogOpen(false);
    setEditingBillId(null);
    setEditingBill({ date: dayjs(), category: '', description: '', amount: '' });
  };

  const getTotalBillsForDate = (date) => {
    return employeeBills.filter(bill => bill.date === date).reduce((total, bill) => total + parseFloat(bill.amount), 0);
  };

  const getFilteredBills = () => {
    if (!selectedBillMonth) return employeeBills;
    return employeeBills.filter(bill => {
      const billMonth = dayjs(bill.date).format('YYYY-MM');
      return billMonth === selectedBillMonth;
    });
  };

  const getBillsByMonth = () => {
    const billsByMonth = {};
    employeeBills.forEach(bill => {
      const month = dayjs(bill.date).format('YYYY-MM');
      if (!billsByMonth[month]) {
        billsByMonth[month] = [];
      }
      billsByMonth[month].push(bill);
    });
    return billsByMonth;
  };

  const calculatePeriodHours = () => {
    if (!breakdownFromDate || !breakdownToDate) return 0;
    return employeeWorkEntries.reduce((total, entry) => {
      const entryDate = dayjs(entry.date);
      if (entryDate.isBetween(breakdownFromDate, breakdownToDate, 'day', '[]')) {
        const hours = parseFloat(calculateHours(entry.from_time, entry.to_time)) || 0;
        return total + hours;
      }
      return total;
    }, 0);
  };

  const calculatePeriodPay = () => {
    return calculatePeriodHours() * 10; // $10 per hour
  };

  const calculatePeriodBills = () => {
    if (!breakdownFromDate || !breakdownToDate) return 0;
    return employeeBills.reduce((total, bill) => {
      const billDate = dayjs(bill.date);
      if (billDate.isBetween(breakdownFromDate, breakdownToDate, 'day', '[]')) {
        return total + parseFloat(bill.amount);
      }
      return total;
    }, 0);
  };

  const calculateHours = (fromTime, toTime) => {
    if (!fromTime || !toTime) return '';
    const [fromHour, fromMinute] = fromTime.split(':').map(Number);
    const [toHour, toMinute] = toTime.split(':').map(Number);
    const from = fromHour + fromMinute / 60;
    const to = toHour + toMinute / 60;
    const hours = to - from;
    return hours.toFixed(2);
  };

  const getWorkEntriesByMonth = () => {
    const workByMonth = {};
    employeeWorkEntries.forEach(entry => {
      const month = dayjs(entry.date).format('YYYY-MM');
      if (!workByMonth[month]) {
        workByMonth[month] = [];
      }
      workByMonth[month].push(entry);
    });
    return workByMonth;
  };

  const getFilteredWorkEntries = () => {
    if (!selectedWorkMonth) return employeeWorkEntries;
    return employeeWorkEntries.filter(entry => {
      const entryMonth = dayjs(entry.date).format('YYYY-MM');
      return entryMonth === selectedWorkMonth;
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="lg">
        {/* Royal/Elegant Top Row Only */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          justifyContent: 'space-between', 
          alignItems: { xs: 'stretch', sm: 'center' }, 
          mb: 4, 
          gap: 2,
          p: 3,
          background: 'linear-gradient(135deg, #556cd6 0%, #7c8de8 100%)',
          borderRadius: 3,
          color: 'white'
        }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              textAlign: { xs: 'center', sm: 'left' },
              fontWeight: 700,
              letterSpacing: '0.5px',
              color: 'white'
            }}
          >
            {employee ? `${employee.name}'s Dashboard` : 'Employee Dashboard'}
          </Typography>
          <Button 
            variant="outlined" 
            onClick={handleLogout}
            sx={{
              border: '2px solid rgba(255,255,255,0.3)',
              color: 'white',
              '&:hover': {
                background: 'rgba(255,255,255,0.1)',
                border: '2px solid rgba(255,255,255,0.5)'
              }
            }}
          >
            Logout
          </Button>
        </Box>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
            <Tab label="Work Entries" />
            <Tab label="Bills" />
            <Tab label="Pay Breakdown" />
          </Tabs>
        </Box>
        {/* Work Entries Tab */}
        {activeTab === 0 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">My Work Entries</Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel id="work-month-select-label">Filter by Month</InputLabel>
                  <Select
                    labelId="work-month-select-label"
                    value={selectedWorkMonth}
                    label="Filter by Month"
                    onChange={(e) => setSelectedWorkMonth(e.target.value)}
                  >
                    <MenuItem value="">All Months</MenuItem>
                    {Object.keys(getWorkEntriesByMonth()).map(month => (
                      <MenuItem key={month} value={month}>
                        {dayjs(month).format('MMMM YYYY')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button variant="outlined" onClick={() => setSelectedWorkMonth('')}>
                  Reset
                </Button>
              </Box>
            </Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Day</TableCell>
                    <TableCell>Event</TableCell>
                    <TableCell>From Time</TableCell>
                    <TableCell>To Time</TableCell>
                    <TableCell>Hours</TableCell>
                    <TableCell>Pay</TableCell>
                    <TableCell>Bills</TableCell>
                    <TableCell>Final Pay</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getFilteredWorkEntries().map((entry) => {
                    const hours = parseFloat(calculateHours(entry.from_time, entry.to_time)) || 0;
                    const pay = hours * 10;
                    const bills = getTotalBillsForDate(entry.date);
                    const finalPay = pay + bills;
                    
                    return (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.date}</TableCell>
                        <TableCell>{entry.day}</TableCell>
                        <TableCell>{entry.event}</TableCell>
                        <TableCell>{formatTime(entry.from_time)}</TableCell>
                        <TableCell>{formatTime(entry.to_time)}</TableCell>
                        <TableCell>{calculateHours(entry.from_time, entry.to_time)} hrs</TableCell>
                        <TableCell>${pay.toFixed(2)}</TableCell>
                        <TableCell>${bills.toFixed(2)}</TableCell>
                        <TableCell>${finalPay.toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
        {/* Bills Tab */}
        {activeTab === 1 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">My Bills</Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel id="bill-month-select-label">Filter by Month</InputLabel>
                  <Select
                    labelId="bill-month-select-label"
                    value={selectedBillMonth}
                    label="Filter by Month"
                    onChange={(e) => setSelectedBillMonth(e.target.value)}
                  >
                    <MenuItem value="">All Months</MenuItem>
                    {Object.keys(getBillsByMonth()).map(month => (
                      <MenuItem key={month} value={month}>
                        {dayjs(month).format('MMMM YYYY')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button variant="outlined" onClick={() => setSelectedBillMonth('')}>
                  Reset
                </Button>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenBillDialog(true)}>
                  Add Bill
                </Button>
              </Box>
            </Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getFilteredBills().map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell>{bill.date}</TableCell>
                      <TableCell>{bill.category}</TableCell>
                      <TableCell>{bill.description}</TableCell>
                      <TableCell>${parseFloat(bill.amount).toFixed(2)}</TableCell>
                      <TableCell>
                        <IconButton color="error" onClick={() => handleDeleteBill(bill.id)}>
                          <DeleteIcon />
                        </IconButton>
                        <IconButton color="primary" onClick={() => handleEditBill(bill)}>
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {selectedBillMonth && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="h6">
                  Total Bills for {dayjs(selectedBillMonth).format('MMMM YYYY')}: ${getFilteredBills().reduce((total, bill) => total + parseFloat(bill.amount), 0).toFixed(2)}
                </Typography>
              </Box>
            )}
            <Dialog open={openBillDialog} onClose={() => setOpenBillDialog(false)} maxWidth="sm" fullWidth>
              <DialogTitle>Add New Bill</DialogTitle>
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
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenBillDialog(false)}>Cancel</Button>
                <Button onClick={handleAddBill} variant="contained">Add Bill</Button>
              </DialogActions>
            </Dialog>
            
            {/* Edit Bill Dialog */}
            <Dialog open={editBillDialogOpen} onClose={handleCancelBillEdit} maxWidth="sm" fullWidth>
              <DialogTitle>Edit Bill</DialogTitle>
              <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <DatePicker
                      label="Date"
                      value={editingBill.date}
                      onChange={(date) => setEditingBill({ ...editingBill, date })}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={editingBill.category}
                        label="Category"
                        onChange={(e) => setEditingBill({ ...editingBill, category: e.target.value })}
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
                      value={editingBill.description}
                      onChange={(e) => setEditingBill({ ...editingBill, description: e.target.value })}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Amount"
                      type="number"
                      value={editingBill.amount}
                      onChange={(e) => setEditingBill({ ...editingBill, amount: e.target.value })}
                      inputProps={{ step: "0.01", min: "0" }}
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCancelBillEdit}>Cancel</Button>
                <Button onClick={handleSaveBillEdit} variant="contained">Save Changes</Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}
        {/* Monthly Summary Tab */}
        {activeTab === 2 && (
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <DatePicker
                  label="From Date"
                  value={breakdownFromDate}
                  onChange={(newValue) => setBreakdownFromDate(newValue)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <DatePicker
                  label="To Date"
                  value={breakdownToDate}
                  onChange={(newValue) => setBreakdownToDate(newValue)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel id="breakdown-month-select-label">Filter by Month</InputLabel>
                  <Select
                    labelId="breakdown-month-select-label"
                    value={selectedBreakdownMonth}
                    label="Filter by Month"
                    onChange={(e) => setSelectedBreakdownMonth(e.target.value)}
                  >
                    <MenuItem value="">All Months</MenuItem>
                    {Object.keys(monthlyBreakdown).map(month => (
                      <MenuItem key={month} value={month}>{dayjs(month).format('MMMM YYYY')}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Button variant="outlined" onClick={() => {
                    setBreakdownFromDate(null);
                    setBreakdownToDate(null);
                    setSelectedBreakdownMonth('');
                  }}>Reset</Button>
                </Box>
              </Grid>
            </Grid>
            
            {/* Monthly Breakdown Table */}
            {(breakdownFromDate && breakdownToDate) || selectedBreakdownMonth ? (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {selectedBreakdownMonth 
                    ? `Monthly Breakdown for ${dayjs(selectedBreakdownMonth).format('MMMM YYYY')}`
                    : `Breakdown from ${breakdownFromDate.format('MMM DD, YYYY')} to ${breakdownToDate.format('MMM DD, YYYY')}`
                  }
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Category</TableCell>
                        <TableCell>Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Total Hours</TableCell>
                        <TableCell>{selectedBreakdownMonth ? monthlyBreakdown[selectedBreakdownMonth].hours.toFixed(2) : calculatePeriodHours().toFixed(2)} hrs</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Total Pay</TableCell>
                        <TableCell>${selectedBreakdownMonth ? monthlyBreakdown[selectedBreakdownMonth].pay.toFixed(2) : calculatePeriodPay().toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Total Bills</TableCell>
                        <TableCell>${selectedBreakdownMonth ? monthlyBreakdown[selectedBreakdownMonth].bills.toFixed(2) : calculatePeriodBills().toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow sx={{ backgroundColor: 'primary.main', color: 'white' }}>
                        <TableCell>
                          <Typography variant="subtitle1" fontWeight="bold">
                            Final Pay
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle1" fontWeight="bold">
                            ${selectedBreakdownMonth 
                              ? monthlyBreakdown[selectedBreakdownMonth].finalPay.toFixed(2)
                              : (calculatePeriodPay() + calculatePeriodBills()).toFixed(2)
                            }
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ) : null}
          </Paper>
        )}
      </Container>
    </LocalizationProvider>
  );
}

export default EmployeeDashboard;