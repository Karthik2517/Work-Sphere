import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Typography, Container, Paper, Box } from '@mui/material';
import { employeesApi } from '../services/supabaseApi';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee'); // or 'admin'
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      alert('Please enter both username and password');
      return;
    }

    setIsLoading(true);
    try {
      const user = await employeesApi.authenticate(username, password);
      
      if (user && user.role === role) {
        // Store user information in localStorage
        localStorage.setItem('user', JSON.stringify(user));
        
        if (user.role === 'admin') {
          navigate('/admin');
        } else if (user.role === 'employee') {
          navigate(`/employee/${user.id}`);
        }
      } else {
        alert('Invalid credentials or role mismatch');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <Paper elevation={3} sx={{ padding: { xs: 2, sm: 4 }, marginTop: { xs: 4, sm: 8 }, width: '100%', maxWidth: '400px' }}>
        <Box component="form" onSubmit={(e) => { e.preventDefault(); handleLogin(); }} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="16" fill="#556cd6"/>
              <circle cx="16" cy="16" r="11" fill="white" fillOpacity="0.1"/>
              <path d="M16 8.5V16L20 19.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="16" cy="16" r="0.85" fill="white"/>
            </svg>
            <Typography component="h1" variant="h5">
              Work Sphere
            </Typography>
          </Box>
          <Box sx={{ mb: 2, display: 'flex', gap: 1, width: '100%', justifyContent: 'center' }}>
            <Button onClick={() => { setRole('employee'); setUsername(''); setPassword(''); }} variant={role === 'employee' ? 'contained' : 'outlined'} sx={{ flexGrow: 1 }}>Employee</Button>
            <Button onClick={() => { setRole('admin'); setUsername(''); setPassword(''); }} variant={role === 'admin' ? 'contained' : 'outlined'} sx={{ flexGrow: 1 }}>Admin</Button>
          </Box>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default LoginPage;
