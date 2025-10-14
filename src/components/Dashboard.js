import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button
} from '@mui/material';
import {
  AccountBalance,
  People,
  TrendingUp,
  Warning,
  CheckCircle,
  Schedule,
  Cancel
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalLoans: 0,
    pendingLoans: 0,
    approvedLoans: 0,
    rejectedLoans: 0,
    totalCustomers: 0,
    totalAmount: 0
  });
  const [recentLoans, setRecentLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [loansResponse, customersResponse] = await Promise.all([
        axios.get('/api/csa/loans'),
        axios.get('/api/csa/customers')
      ]);

      const loans = Array.isArray(loansResponse.data) ? loansResponse.data : [];
      const customers = Array.isArray(customersResponse.data) ? customersResponse.data : [];

      const totalLoans = loans.length;
      const pendingLoans = loans.filter(loan => loan.status === 'PENDING').length;
      const approvedLoans = loans.filter(loan => loan.status === 'APPROVED').length;
      const rejectedLoans = loans.filter(loan => loan.status === 'REJECTED').length;
      const totalCustomers = customers.length;
      const totalAmount = loans.reduce((sum, loan) => sum + parseFloat(loan.amount || 0), 0);

      setStats({
        totalLoans,
        pendingLoans,
        approvedLoans,
        rejectedLoans,
        totalCustomers,
        totalAmount
      });

      setRecentLoans(loans.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats({
        totalLoans: 0,
        pendingLoans: 0,
        approvedLoans: 0,
        rejectedLoans: 0,
        totalCustomers: 0,
        totalAmount: 0
      });
      setRecentLoans([]);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      case 'VERIFIED': return 'info';
      case 'DISBURSED': return 'primary';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <Schedule />;
      case 'APPROVED': return <CheckCircle />;
      case 'REJECTED': return <Cancel />;
      case 'VERIFIED': return <CheckCircle />;
      case 'DISBURSED': return <AccountBalance />;
      default: return <Warning />;
    }
  };

  const StatCard = ({ title, value, icon, color = 'primary' }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4">
              {value}
            </Typography>
          </Box>
          <Box color={`${color}.main`}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <Typography>Loading dashboard...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.firstName}!
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {user?.role?.replace('_', ' ')} • {user?.branch}
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Total Loans"
            value={stats.totalLoans}
            icon={<AccountBalance />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Pending"
            value={stats.pendingLoans}
            icon={<Schedule />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Approved"
            value={stats.approvedLoans}
            icon={<CheckCircle />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Rejected"
            value={stats.rejectedLoans}
            icon={<Cancel />}
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Customers"
            value={stats.totalCustomers}
            icon={<People />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Total Amount"
            value={`$${stats.totalAmount.toLocaleString()}`}
            icon={<TrendingUp />}
            color="secondary"
          />
        </Grid>

        {/* Recent Loans */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Loan Applications
            </Typography>
            <List>
              {recentLoans.map((loan) => (
                <ListItem key={loan.id} divider>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1">
                          {loan.loanNumber}
                        </Typography>
                        <Chip
                          icon={getStatusIcon(loan.status)}
                          label={loan.status}
                          color={getStatusColor(loan.status)}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Customer: {loan.customer?.firstName} {loan.customer?.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Amount: ${parseFloat(loan.amount).toLocaleString()}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Button variant="contained" fullWidth>
                New Customer
              </Button>
              <Button variant="outlined" fullWidth>
                New Loan Application
              </Button>
              {user?.role === 'LOAN_OFFICER' && (
                <Button variant="outlined" fullWidth>
                  Review Pending Loans
                </Button>
              )}
              {user?.role === 'CREDIT_MANAGER' && (
                <Button variant="outlined" fullWidth>
                  Approve Loans
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
