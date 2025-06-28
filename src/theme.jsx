import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: '#red',
    },
    background: {
      default: '#f4f6f8', // A light grey background for the overall page
      paper: '#ffffff', // White background for Paper components
    },
  },
  typography: {
    fontFamily: 'Cormorant Garamond, serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
      color: '#333',
    },
    h4: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#333',
    },
    h6: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#333',
    },
    body1: {
      fontSize: '1rem',
      color: '#555',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none', // Prevent uppercase text
          fontWeight: 600,
        },
        containedPrimary: {
          backgroundColor: '#556cd6',
          '&:hover': {
            backgroundColor: '#4a5cb8',
          },
        },
        outlinedPrimary: {
          borderColor: '#556cd6',
          color: '#556cd6',
          '&:hover': {
            backgroundColor: 'rgba(85, 108, 214, 0.04)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)', // Soft shadow
          padding: '24px',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'medium',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': {
              borderColor: '#e0e0e0',
            },
            '&:hover fieldset': {
              borderColor: '#a0a0a0',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#556cd6',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#757575',
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#556cd6',
          },
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        variant: 'outlined',
        size: 'medium',
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          minWidth: 180, // Set a minimum width for select components
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#e0e0e0',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#a0a0a0',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#556cd6',
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#757575',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#f0f2f5', // Light background for table headers
          color: '#333',
          fontWeight: 600,
          fontSize: '0.9rem',
          padding: '12px 16px',
        },
        body: {
          color: '#555',
          fontSize: '0.9rem',
          padding: '10px 16px',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        },
      },
    },
  },
});

export default theme;