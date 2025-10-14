import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Alert,
  Snackbar
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  People,
  AttachMoney,
  Schedule,
  CheckCircle,
  Cancel,
  Download,
  Assessment
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Reports = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [reportData, setReportData] = useState({
    totalLoans: 0,
    totalAmount: 0,
    approvedLoans: 0,
    rejectedLoans: 0,
    pendingLoans: 0,
    disbursedLoans: 0,
    totalCustomers: 0,
    averageLoanAmount: 0,
    approvalRate: 0
  });
  const [dateRange, setDateRange] = useState('30');
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      const [loansResponse, customersResponse] = await Promise.all([
        axios.get('/api/csa/loans'),
        axios.get('/api/csa/customers')
      ]);

      const loansData = Array.isArray(loansResponse.data) ? loansResponse.data : [];
      const customersData = Array.isArray(customersResponse.data) ? customersResponse.data : [];

      // Calculate report metrics
      const totalLoans = loansData.length;
      const totalAmount = loansData.reduce((sum, loan) => sum + parseFloat(loan.amount || 0), 0);
      const approvedLoans = loansData.filter(loan => loan.status === 'APPROVED').length;
      const rejectedLoans = loansData.filter(loan => loan.status === 'REJECTED').length;
      const pendingLoans = loansData.filter(loan => loan.status === 'PENDING').length;
      const disbursedLoans = loansData.filter(loan => loan.status === 'DISBURSED').length;
      const totalCustomers = customersData.length;
      const averageLoanAmount = totalLoans > 0 ? totalAmount / totalLoans : 0;
      const approvalRate = totalLoans > 0 ? (approvedLoans / totalLoans) * 100 : 0;

      setReportData({
        totalLoans,
        totalAmount,
        approvedLoans,
        rejectedLoans,
        pendingLoans,
        disbursedLoans,
        totalCustomers,
        averageLoanAmount,
        approvalRate
      });

      setLoans(loansData);
      setCustomers(customersData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching report data:', error);
      setLoading(false);
      setSnackbar({ 
        open: true, 
        message: 'Error fetching report data: ' + (error.response?.data?.message || error.message), 
        severity: 'error' 
      });
    }
  };

  const StatCard = ({ title, value, icon, color = 'primary', trend = null }) => (
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
            {trend && (
              <Box display="flex" alignItems="center" mt={1}>
                {trend > 0 ? <TrendingUp color="success" /> : <TrendingDown color="error" />}
                <Typography variant="body2" color={trend > 0 ? 'success.main' : 'error.main'}>
                  {Math.abs(trend)}%
                </Typography>
              </Box>
            )}
          </Box>
          <Box color={`${color}.main`}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

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
      default: return <Schedule />;
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Loan Number', 'Customer', 'Amount', 'Status', 'Created Date', 'Purpose'].join(','),
      ...loans.map(loan => [
        loan.loanNumber,
        `${loan.customer?.firstName} ${loan.customer?.lastName}`,
        loan.amount,
        loan.status,
        new Date(loan.createdAt).toLocaleDateString(),
        loan.purpose || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loan-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return <Typography>Loading reports...</Typography>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Reports & Analytics
        </Typography>
        <Box display="flex" gap={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Date Range</InputLabel>
            <Select
              value={dateRange}
              label="Date Range"
              onChange={(e) => setDateRange(e.target.value)}
            >
              <MenuItem value="7">Last 7 days</MenuItem>
              <MenuItem value="30">Last 30 days</MenuItem>
              <MenuItem value="90">Last 90 days</MenuItem>
              <MenuItem value="365">Last year</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={exportToCSV}
          >
            Export CSV
          </Button>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Loans"
            value={reportData.totalLoans}
            icon={<AccountBalance />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Amount"
            value={`$${reportData.totalAmount.toLocaleString()}`}
            icon={<AttachMoney />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Approval Rate"
            value={`${reportData.approvalRate.toFixed(1)}%`}
            icon={<CheckCircle />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average Loan"
            value={`$${reportData.averageLoanAmount.toLocaleString()}`}
            icon={<TrendingUp />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Status Breakdown */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Pending
                  </Typography>
                  <Typography variant="h6">
                    {reportData.pendingLoans}
                  </Typography>
                </Box>
                <Schedule color="warning" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Approved
                  </Typography>
                  <Typography variant="h6">
                    {reportData.approvedLoans}
                  </Typography>
                </Box>
                <CheckCircle color="success" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Rejected
                  </Typography>
                  <Typography variant="h6">
                    {reportData.rejectedLoans}
                  </Typography>
                </Box>
                <Cancel color="error" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Disbursed
                  </Typography>
                  <Typography variant="h6">
                    {reportData.disbursedLoans}
                  </Typography>
                </Box>
                <AccountBalance color="primary" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Total Customers
                  </Typography>
                  <Typography variant="h6">
                    {reportData.totalCustomers}
                  </Typography>
                </Box>
                <People color="info" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Loans Table */}
      <Paper sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Recent Loan Applications
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Assessment />}
            onClick={fetchReportData}
          >
            Refresh
          </Button>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Loan Number</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Purpose</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loans.slice(0, 10).map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell>{loan.loanNumber}</TableCell>
                  <TableCell>
                    {loan.customer?.firstName} {loan.customer?.lastName}
                  </TableCell>
                  <TableCell>${parseFloat(loan.amount).toLocaleString()}</TableCell>
                  <TableCell>{loan.purpose || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(loan.status)}
                      label={loan.status}
                      color={getStatusColor(loan.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{new Date(loan.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Reports;
