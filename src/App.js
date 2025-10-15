import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CustomerManagement from './components/CustomerManagement';
import LoanManagement from './components/LoanManagement';
import AdminPanel from './components/AdminPanel';
import Reports from './components/Reports';
import AuditLogs from './components/AuditLogs';
import Layout from './components/Layout';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3eb489',
      light: '#52c9a0',
      dark: '#2a8a67',
    },
    secondary: {
      main: '#26d0a1',
      light: '#e8f8f3',
    },
    background: {
      default: '#f4fcf9',
      paper: '#ffffff',
    },
    success: {
      main: '#3eb489',
      light: '#e8f8f3',
    },
    warning: {
      main: '#f59e0b',
    },
    error: {
      main: '#ef4444',
    },
    info: {
      main: '#3b82f6',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 2px 8px rgba(62, 180, 137, 0.15)',
    '0 4px 12px rgba(62, 180, 137, 0.15)',
    '0 6px 16px rgba(62, 180, 137, 0.25)',
    '0 8px 24px rgba(0, 0, 0, 0.15)',
    ...Array(20).fill('0 8px 24px rgba(0, 0, 0, 0.15)')
  ],
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(62, 180, 137, 0.15)',
          border: '1px solid #e8f8f3',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
        contained: {
          boxShadow: '0 2px 6px rgba(62, 180, 137, 0.15)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(62, 180, 137, 0.25)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  
  // If no user OR user must change password, show login page
  if (!user || user.mustChangePassword) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }
  
  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Customer Management Routes - CSA creates, others view */}
        <Route 
          path="/customers" 
          element={
            <ProtectedRoute allowedRoles={['CSA', 'LOAN_PROCESSING_OFFICER', 'CREDIT_MANAGER', 'SYSTEM_ADMIN', 'COMPLIANCE_OFFICER']}>
              <CustomerManagement />
            </ProtectedRoute>
          } 
        />
        
        {/* Loan Management Routes - Role-based access */}
        <Route 
          path="/loans" 
          element={
            <ProtectedRoute allowedRoles={['CSA', 'LOAN_PROCESSING_OFFICER', 'CREDIT_MANAGER', 'SYSTEM_ADMIN', 'COMPLIANCE_OFFICER']}>
              <LoanManagement />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['SYSTEM_ADMIN']}>
              <AdminPanel />
            </ProtectedRoute>
          } 
        />
        
        {/* Reports Routes - Compliance Officer and Management */}
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute allowedRoles={['LOAN_PROCESSING_OFFICER', 'CREDIT_MANAGER', 'SYSTEM_ADMIN', 'COMPLIANCE_OFFICER']}>
              <Reports />
            </ProtectedRoute>
          } 
        />
        
        {/* Audit Logs Routes */}
        <Route 
          path="/audit-logs" 
          element={
            <ProtectedRoute allowedRoles={['SYSTEM_ADMIN', 'COMPLIANCE_OFFICER']}>
              <AuditLogs />
            </ProtectedRoute>
          } 
        />
        
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;