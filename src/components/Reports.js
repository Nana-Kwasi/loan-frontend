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
  TextField,
  Chip,
  Alert,
  Snackbar,
  CircularProgress
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
  Search,
  Refresh
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Reports = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [loansResponse, customersResponse] = await Promise.all([
        axios.get('/api/loans'),
        axios.get('/api/customers')
      ]);

      const loansData = Array.isArray(loansResponse.data) ? loansResponse.data : [];
      const customersData = Array.isArray(customersResponse.data) ? customersResponse.data : [];

      setLoans(loansData);
      setCustomers(customersData);
      setFilteredLoans(loansData);
      calculateReportData(loansData, customersData);
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

  const calculateReportData = (loansData, customersData) => {
    const totalLoans = loansData.length;
    const totalAmount = loansData.reduce((sum, loan) => sum + parseFloat(loan.totalAmount || loan.amount || 0), 0);
    const approvedLoans = loansData.filter(loan => loan.status === 'APPROVED').length;
    const rejectedLoans = loansData.filter(loan => loan.status === 'REJECTED').length;
    const pendingLoans = loansData.filter(loan => loan.status === 'PENDING').length;
    const disbursedLoans = loansData.filter(loan => loan.status === 'DISBURSED').length;
    const totalCustomers = customersData.length;
    const averageLoanAmount = totalLoans > 0 ? totalAmount / totalLoans : 0;
    const approvalRate = totalLoans > 0 ? ((approvedLoans + disbursedLoans) / totalLoans) * 100 : 0;

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
  };

  const handleDateFilter = () => {
    if (!startDate || !endDate) {
      setSnackbar({ 
        open: true, 
        message: 'Please select both start and end dates', 
        severity: 'warning' 
      });
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setSnackbar({ 
        open: true, 
        message: 'Start date must be before end date', 
        severity: 'error' 
      });
      return;
    }

    setFiltering(true);
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const filtered = loans.filter(loan => {
      const loanDate = new Date(loan.createdAt || loan.created_at || loan.applicationDate);
      return loanDate >= start && loanDate <= end;
    });

    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.created_at || a.applicationDate);
      const dateB = new Date(b.createdAt || b.created_at || b.applicationDate);
      return dateB - dateA;
    });

    setFilteredLoans(filtered);
    calculateReportData(filtered, customers);
    setFiltering(false);
    
    setSnackbar({ 
      open: true, 
      message: `Found ${filtered.length} loans in the selected date range`, 
      severity: 'success' 
    });
  };

  const handleResetFilter = () => {
    setStartDate('');
    setEndDate('');
    setFilteredLoans(loans);
    calculateReportData(loans, customers);
    setSnackbar({ 
      open: true, 
      message: 'Filter reset. Showing all loans', 
      severity: 'info' 
    });
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
    const printWindow = window.open('', '_blank');
    
    const reportDate = startDate && endDate ? 
      `${new Date(startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} - ${new Date(endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}` :
      'All Time';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Loan Management Report</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 30px;
            background: #f5f5f5;
            color: #333;
          }
          
          .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
          
          .header { 
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 30px;
            border-bottom: 3px solid #1976d2;
          }
          
          .header h1 { 
            color: #1976d2;
            margin: 0 0 10px 0;
            font-size: 32px;
            font-weight: 600;
          }
          
          .header .subtitle {
            color: #666;
            font-size: 16px;
            margin: 5px 0;
          }
          
          .header .date-range {
            color: #1976d2;
            font-size: 18px;
            font-weight: 500;
            margin: 10px 0;
          }
          
          .summary { 
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin: 30px 0;
          }
          
          .summary-item { 
            text-align: center;
            padding: 25px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 10px;
            color: white;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          
          .summary-item:nth-child(2) {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          }
          
          .summary-item:nth-child(3) {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          }
          
          .summary-item:nth-child(4) {
            background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
          }
          
          .summary-item h3 { 
            margin: 0 0 10px 0;
            font-size: 32px;
            font-weight: 700;
          }
          
          .summary-item p { 
            margin: 0;
            font-size: 14px;
            opacity: 0.9;
            font-weight: 500;
          }
          
          .status-breakdown {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin: 30px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
          }
          
          .status-item {
            text-align: center;
            padding: 15px;
            background: white;
            border-radius: 8px;
            border-left: 4px solid #1976d2;
          }
          
          .status-item.pending { border-left-color: #ff9800; }
          .status-item.approved { border-left-color: #4caf50; }
          .status-item.rejected { border-left-color: #f44336; }
          .status-item.disbursed { border-left-color: #2196f3; }
          
          .status-item h4 {
            font-size: 24px;
            margin: 0 0 5px 0;
            color: #333;
          }
          
          .status-item p {
            font-size: 13px;
            color: #666;
            margin: 0;
          }
          
          h2 {
            color: #1976d2;
            margin: 40px 0 20px 0;
            font-size: 24px;
            font-weight: 600;
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 10px;
          }
          
          table { 
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          }
          
          th, td { 
            border: 1px solid #e0e0e0;
            padding: 12px 15px;
            text-align: left;
          }
          
          th { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          
          tr:hover {
            background-color: #e3f2fd;
          }
          
          td {
            font-size: 14px;
            color: #333;
          }
          
          .status { 
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            display: inline-block;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .status-pending { 
            background-color: #fff3cd;
            color: #856404;
            border: 1px solid #ffeaa7;
          }
          
          .status-approved { 
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
          }
          
          .status-rejected { 
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
          }
          
          .status-disbursed { 
            background-color: #cce5ff;
            color: #004085;
            border: 1px solid #b8daff;
          }
          
          .status-verified { 
            background-color: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
          }
          
          .footer { 
            margin-top: 50px;
            padding-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #999;
            border-top: 2px solid #e0e0e0;
          }
          
          .footer p {
            margin: 5px 0;
          }
          
          .footer .company {
            font-weight: 600;
            color: #1976d2;
            font-size: 14px;
          }
          
          .amount {
            font-weight: 600;
            color: #2e7d32;
          }
          
          @media print {
            body {
              background: white;
              padding: 0;
            }
            
            .container {
              box-shadow: none;
              padding: 20px;
            }
            
            tr:hover {
              background-color: inherit;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
        <div class="header">
            <h1>📊 Loan Management System Report</h1>
            <p class="date-range">${reportDate}</p>
            <p class="subtitle">Generated on: ${new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
        </div>
        
        <div class="summary">
          <div class="summary-item">
            <h3>${reportData.totalLoans}</h3>
            <p>Total Loans</p>
          </div>
          <div class="summary-item">
              <h3>GHS ${reportData.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <p>Total Amount</p>
          </div>
          <div class="summary-item">
            <h3>${reportData.approvalRate.toFixed(1)}%</h3>
            <p>Approval Rate</p>
          </div>
          <div class="summary-item">
              <h3>GHS ${reportData.averageLoanAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <p>Average Loan</p>
          </div>
        </div>
        
          <div class="status-breakdown">
            <div class="status-item pending">
              <h4>${reportData.pendingLoans}</h4>
              <p>Pending</p>
            </div>
            <div class="status-item approved">
              <h4>${reportData.approvedLoans}</h4>
              <p>Approved</p>
            </div>
            <div class="status-item rejected">
              <h4>${reportData.rejectedLoans}</h4>
              <p>Rejected</p>
            </div>
            <div class="status-item disbursed">
              <h4>${reportData.disbursedLoans}</h4>
              <p>Disbursed</p>
            </div>
          </div>
          
          <h2>📋 Loan Applications Details</h2>
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
              ${filteredLoans.map(loan => `
                <tr>
                  <td><strong>${loan.loanNumber || 'N/A'}</strong></td>
                  <td>${loan.customer?.name || `${loan.customer?.firstName || ''} ${loan.customer?.lastName || ''}`.trim() || 'N/A'}</td>
                  <td class="amount">GHS ${parseFloat(loan.totalAmount || loan.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>${loan.purpose || 'N/A'}</td>
                  <td><span class="status status-${(loan.status || 'pending').toLowerCase()}">${loan.status || 'PENDING'}</span></td>
                  <td>${new Date(loan.createdAt || loan.created_at || loan.applicationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
            <p class="company">Loan Management System</p>
            <p>This is an automated report generated by the system.</p>
            <p>For inquiries, please contact your administrator.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Reports & Analytics
        </Typography>
      </Box>

      {/* Date Filter Section */}
      <Paper sx={{ p: 3, mb: 3, background: 'white', border: '1px solid #e8f8f3' }}>
        <Typography variant="h6" sx={{ color: '#2a8a67', mb: 2 }}>
          📅 Select Date Range
        </Typography>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
              <TextField
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ 
                  minWidth: 200,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#3eb489',
                    },
                    '&:hover fieldset': {
                      borderColor: '#2a8a67',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#3eb489',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#2a8a67',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#3eb489',
                  },
                }}
              />
              <TextField
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ 
                  minWidth: 200,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#3eb489',
                    },
                    '&:hover fieldset': {
                      borderColor: '#2a8a67',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#3eb489',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#2a8a67',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#3eb489',
                  },
                }}
          />
          <Button
            variant="contained"
            startIcon={filtering ? <CircularProgress size={20} color="inherit" /> : <Search />}
            onClick={handleDateFilter}
            disabled={filtering}
            sx={{ 
              backgroundColor: '#3eb489',
              color: 'white',
              '&:hover': {
                backgroundColor: '#2a8a67'
              }
            }}
          >
            Filter
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleResetFilter}
            sx={{ 
              borderColor: '#3eb489',
              color: '#3eb489',
              '&:hover': {
                borderColor: '#2a8a67',
                backgroundColor: '#f4fcf9',
                color: '#2a8a67'
              }
            }}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={generatePDFReport}
            disabled={filteredLoans.length === 0}
            sx={{ 
              backgroundColor: '#52c9a0',
              '&:hover': {
                backgroundColor: '#3eb489'
              }
            }}
          >
            Download PDF
          </Button>
        </Box>
      </Paper>

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
            value={`GHS ${reportData.totalAmount.toLocaleString()}`}
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
            value={`GHS ${reportData.averageLoanAmount.toLocaleString()}`}
            icon={<TrendingUp />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Status Breakdown */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
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
        <Grid item xs={12} sm={6} md={3}>
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
        <Grid item xs={12} sm={6} md={3}>
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
        <Grid item xs={12} sm={6} md={3}>
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
      </Grid>

      {/* Loans Table */}
      <Paper sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Loan Applications ({filteredLoans.length})
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Assessment />}
            onClick={fetchReportData}
          >
            Refresh Data
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
              {filteredLoans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="textSecondary">
                      No loans found for the selected date range
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLoans.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell>{loan.loanNumber}</TableCell>
                  <TableCell>
                      {loan.customer?.name || `${loan.customer?.firstName || ''} ${loan.customer?.lastName || ''}`.trim()}
                  </TableCell>
                  <TableCell>GHS {parseFloat(loan.totalAmount || loan.amount || 0).toLocaleString()}</TableCell>
                  <TableCell>{loan.purpose || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(loan.status)}
                      label={loan.status}
                      color={getStatusColor(loan.status)}
                      size="small"
                    />
                  </TableCell>
                    <TableCell>{new Date(loan.createdAt || loan.created_at || loan.applicationDate).toLocaleDateString()}</TableCell>
                </TableRow>
                ))
              )}
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