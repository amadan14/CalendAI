import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';

const theme = createTheme({
  palette: {
    primary: {
      main: '#7E698B', // Purple pastel
      light: '#9A9CAB', // Light gray-purple
      dark: '#828B85', // Sage green
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#E3C6CD', // Pink pastel
      light: '#F5E6E9',
      dark: '#D4A5B0',
      contrastText: '#5A5A5A',
    },
    background: {
      default: '#F8F7F9', // Very light pastel background
      paper: '#FFFFFF',
    },
    text: {
      primary: '#5A5A5A',
      secondary: '#828B85',
    },
    grey: {
      100: '#F5F5F5',
      200: '#E8E8E8',
      300: '#D0D0D0',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      color: '#7E698B',
    },
    h5: {
      fontWeight: 600,
      color: '#7E698B',
    },
    h6: {
      fontWeight: 600,
      color: '#7E698B',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(126, 105, 139, 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

