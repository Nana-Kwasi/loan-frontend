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
  Assessment,
  DateRange
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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchReportData();
  }, [dateRange, startDate, endDate]);

  const fetchReportData = async () => {
    try {
      const [loansResponse, customersResponse] = await Promise.all([
        axios.get('/api/csa/loans'),
        axios.get('/api/csa/customers')
      ]);

      const loansData = Array.isArray(loansResponse.data) ? loansResponse.data : [];
      const customersData = Array.isArray(customersResponse.data) ? customersResponse.data : [];

      // Filter by date range if custom range selected
      let filteredLoans = [...loansData];
      if (dateRange === 'custom' && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        filteredLoans = loansData.filter(l => {
          const created = new Date(l.createdAt || l.created_at || l.applicationDate);
          return created >= start && created <= new Date(end.getTime() + 24*60*60*1000 - 1);
        });
      } else {
        const days = parseInt(dateRange, 10) || 30;
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        filteredLoans = loansData.filter(l => {
          const created = new Date(l.createdAt || l.created_at || l.applicationDate);
          return created >= cutoff;
        });
      }

      // Sort by most recent first for table
      filteredLoans.sort((a, b) => new Date(b.createdAt || b.created_at || b.applicationDate) - new Date(a.createdAt || a.created_at || a.applicationDate));

      // Calculate report metrics
      const totalLoans = filteredLoans.length;
      const totalAmount = filteredLoans.reduce((sum, loan) => sum + parseFloat(loan.amount || 0), 0);
      const approvedLoans = filteredLoans.filter(loan => loan.status === 'APPROVED').length;
      const rejectedLoans = filteredLoans.filter(loan => loan.status === 'REJECTED').length;
      const pendingLoans = filteredLoans.filter(loan => loan.status === 'PENDING').length;
      const disbursedLoans = filteredLoans.filter(loan => loan.status === 'DISBURSED').length;
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

      setLoans(filteredLoans);
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

  const generatePDFReport = () => {
    // Create a new window for PDF generation
    const printWindow = window.open('', '_blank');
    
    // Get current date range for the report
    const reportDate = startDate && endDate ? 
      `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}` :
      `Last ${dateRange} days`;
    
    // Generate HTML content for the PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Loan Management Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { color: #1976d2; margin: 0; }
          .header p { color: #666; margin: 5px 0; }
          .summary { display: flex; justify-content: space-around; margin: 20px 0; }
          .summary-item { text-align: center; }
          .summary-item h3 { margin: 0; color: #1976d2; }
          .summary-item p { margin: 5px 0; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
          .status-pending { background-color: #fff3cd; color: #856404; }
          .status-approved { background-color: #d4edda; color: #155724; }
          .status-rejected { background-color: #f8d7da; color: #721c24; }
          .status-disbursed { background-color: #cce5ff; color: #004085; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Loan Management System Report</h1>
          <p>Report Period: ${reportDate}</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="summary">
          <div class="summary-item">
            <h3>${reportData.totalLoans}</h3>
            <p>Total Loans</p>
          </div>
          <div class="summary-item">
            <h3>$${reportData.totalAmount.toLocaleString()}</h3>
            <p>Total Amount</p>
          </div>
          <div class="summary-item">
            <h3>${reportData.approvalRate.toFixed(1)}%</h3>
            <p>Approval Rate</p>
          </div>
          <div class="summary-item">
            <h3>$${reportData.averageLoanAmount.toLocaleString()}</h3>
            <p>Average Loan</p>
          </div>
        </div>
        
        <h3>Loan Applications</h3>
        <table>
          <thead>
            <tr>
              <th>Loan Number</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Purpose</th>
              <th>Status</th>
              <th>Created Date</th>
            </tr>
          </thead>
          <tbody>
            ${loans.slice(0, 50).map(loan => `
              <tr>
                <td>${loan.loanNumber || 'N/A'}</td>
                <td>${loan.customer?.name || 'N/A'}</td>
                <td>$${parseFloat(loan.amount || 0).toLocaleString()}</td>
                <td>${loan.purpose || 'N/A'}</td>
                <td><span class="status status-${loan.status?.toLowerCase() || 'pending'}">${loan.status || 'PENDING'}</span></td>
                <td>${new Date(loan.createdAt).toLocaleDateString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>This report was generated by the Loan Management System</p>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
    }, 500);
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
        <Box display="flex" gap={2} alignItems="center">
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
              <MenuItem value="custom">Custom Range</MenuItem>
            </Select>
          </FormControl>
          
          {dateRange === 'custom' && (
            <>
              <TextField
                size="small"
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 150 }}
              />
              <TextField
                size="small"
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 150 }}
              />
            </>
          )}
          
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={generatePDFReport}
            sx={{ ml: 1 }}
          >
            Download PDF
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
            {loan.customer?.name || `${loan.customer?.firstName || ''} ${loan.customer?.lastName || ''}`}
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
