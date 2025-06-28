import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Container, Button, Box, FormControl, InputLabel, Select, MenuItem, Grid } from '@mui/material';
import dayjs from 'dayjs';
import { workEntriesApi, employeesApi } from '../services/supabaseApi';

function EmployeeDashboard() {
  const { id } = useParams();
  const [employeeWorkEntries, setEmployeeWorkEntries] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [monthlyBreakdown, setMonthlyBreakdown] = useState({});
  const [selectedMonth, setSelectedMonth] = useState('');
  const navigate = useNavigate();

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
          monthlyData[month] = 0;
        }
        monthlyData[month] += parseFloat(entry.hours);
      });
      setMonthlyBreakdown(monthlyData);
    };
    calculateMonthlyHours();
  }, [employeeWorkEntries]);

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

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, mb: 2 }}>
        <Typography variant="h4">{employee ? `${employee.name}'s Dashboard` : 'Employee Dashboard'}</Typography>
        <Button variant="outlined" onClick={handleLogout}>Logout</Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Day</TableCell>
              <TableCell>Hours</TableCell>
              <TableCell>From Time</TableCell>
              <TableCell>To Time</TableCell>
              <TableCell>Event</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employeeWorkEntries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{entry.date}</TableCell>
                <TableCell>{entry.day}</TableCell>
                <TableCell>{entry.hours}</TableCell>
                <TableCell>{entry.from_time ? formatTime(entry.from_time) : ''}</TableCell>
                <TableCell>{entry.to_time ? formatTime(entry.to_time) : ''}</TableCell>
                <TableCell>{entry.event}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>Monthly Hours</Typography>
      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="month-select-label">Select Month</InputLabel>
              <Select
                labelId="month-select-label"
                value={selectedMonth}
                label="Select Month"
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {Object.keys(monthlyBreakdown).map(month => (
                  <MenuItem key={month} value={month}>{dayjs(month).format('MMMM YYYY')}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {selectedMonth && (
                <Typography variant="h6">
                  Total Hours: {monthlyBreakdown[selectedMonth].toFixed(2)}
                </Typography>
              )}
              <Button variant="outlined" onClick={() => setSelectedMonth('')}>Reset</Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default EmployeeDashboard;