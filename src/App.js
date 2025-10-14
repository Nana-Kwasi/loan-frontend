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
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
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
  
  if (!user) {
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
        
        {/* CSA Routes */}
        <Route 
          path="/customers" 
          element={
            <ProtectedRoute allowedRoles={['CSA', 'LOAN_OFFICER', 'BRANCH_MANAGER', 'CREDIT_MANAGER', 'SYSTEM_ADMIN']}>
              <CustomerManagement />
            </ProtectedRoute>
          } 
        />
        
        {/* Loan Management Routes */}
        <Route 
          path="/loans" 
          element={
            <ProtectedRoute allowedRoles={['CSA', 'LOAN_OFFICER', 'BRANCH_MANAGER', 'CREDIT_MANAGER', 'SYSTEM_ADMIN']}>
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
        
        {/* Reports Routes */}
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute allowedRoles={['BRANCH_MANAGER', 'CREDIT_MANAGER', 'SYSTEM_ADMIN', 'COMPLIANCE_OFFICER']}>
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