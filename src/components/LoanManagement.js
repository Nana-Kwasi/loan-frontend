import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Menu,
  MenuItem as MenuItemComponent
} from '@mui/material';
import {
  Add,
  MoreVert,
  AccountBalance,
  Person,
  AttachMoney,
  Schedule,
  CheckCircle,
  Cancel,
  Visibility,
  Edit
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const LoanManagement = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openActionDialog, setOpenActionDialog] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [actionType, setActionType] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [anchorEl, setAnchorEl] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [loansResponse, customersResponse] = await Promise.all([
        axios.get('/api/csa/loans'),
        axios.get('/api/csa/customers')
      ]);
      setLoans(Array.isArray(loansResponse.data) ? loansResponse.data : []);
      setCustomers(Array.isArray(customersResponse.data) ? customersResponse.data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoans([]);
      setCustomers([]);
      setLoading(false);
      setSnackbar({ 
        open: true, 
        message: 'Error fetching data: ' + (error.response?.data?.message || error.message), 
        severity: 'error' 
      });
    }
  };

  const handleOpenDialog = () => {
    reset();
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    reset();
  };

  const handleOpenActionDialog = (loan, type) => {
    setSelectedLoan(loan);
    setActionType(type);
    setOpenActionDialog(true);
    setAnchorEl(null);
  };

  const handleCloseActionDialog = () => {
    setOpenActionDialog(false);
    setSelectedLoan(null);
    setActionType('');
    reset();
  };

  const onSubmitLoan = async (data) => {
    try {
      await axios.post('/api/csa/loans', data);
      setSnackbar({ open: true, message: 'Loan application created successfully', severity: 'success' });
      fetchData();
      handleCloseDialog();
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Error creating loan', 
        severity: 'error' 
      });
    }
  };

  const onSubmitAction = async (data) => {
    try {
      const endpoint = getActionEndpoint();
      await axios.post(endpoint, data);
      setSnackbar({ open: true, message: `${actionType} successful`, severity: 'success' });
      fetchData();
      handleCloseActionDialog();
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || `Error ${actionType.toLowerCase()}`, 
        severity: 'error' 
      });
    }
  };

  const getActionEndpoint = () => {
    const loanId = selectedLoan.id;
    switch (actionType) {
      case 'Verify':
        return `/api/loan-officer/loans/${loanId}/verify`;
      case 'Approve':
        return `/api/credit-manager/loans/${loanId}/approve`;
      case 'Reject':
        return `/api/credit-manager/loans/${loanId}/reject`;
      case 'Disburse':
        return `/api/admin/loans/${loanId}/disburse`;
      default:
        return '';
    }
  };

  const handleMenuOpen = (event, loan) => {
    setAnchorEl(event.currentTarget);
    setSelectedLoan(loan);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedLoan(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'VERIFIED': return 'info';
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      case 'DISBURSED': return 'primary';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <Schedule />;
      case 'VERIFIED': return <CheckCircle />;
      case 'APPROVED': return <CheckCircle />;
      case 'REJECTED': return <Cancel />;
      case 'DISBURSED': return <AccountBalance />;
      default: return <Schedule />;
    }
  };

  const getAvailableActions = (loan) => {
    const actions = [];
    
    // Check if loan exists and has status
    if (!loan || !loan.status) {
      return actions;
    }
    
    if (user?.role === 'LOAN_OFFICER' && loan.status === 'PENDING') {
      actions.push({ label: 'Verify', type: 'Verify' });
    }
    
    if ((user?.role === 'CREDIT_MANAGER' || user?.role === 'BRANCH_MANAGER') && loan.status === 'VERIFIED') {
      actions.push({ label: 'Approve', type: 'Approve' });
      actions.push({ label: 'Reject', type: 'Reject' });
    }
    
    if (user?.role === 'SYSTEM_ADMIN' && loan.status === 'APPROVED') {
      actions.push({ label: 'Disburse', type: 'Disburse' });
    }
    
    return actions;
  };

  const filteredLoans = Array.isArray(loans) ? loans.filter(loan => {
    switch (tabValue) {
      case 0: return loan.status === 'PENDING';
      case 1: return loan.status === 'VERIFIED';
      case 2: return loan.status === 'APPROVED';
      case 3: return loan.status === 'REJECTED';
      case 4: return loan.status === 'DISBURSED';
      default: return true;
    }
  }) : [];

  if (loading) {
    return <Typography>Loading loans...</Typography>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Loan Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenDialog}
        >
          New Loan Application
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label={`Pending (${Array.isArray(loans) ? loans.filter(l => l.status === 'PENDING').length : 0})`} />
            <Tab label={`Verified (${Array.isArray(loans) ? loans.filter(l => l.status === 'VERIFIED').length : 0})`} />
            <Tab label={`Approved (${Array.isArray(loans) ? loans.filter(l => l.status === 'APPROVED').length : 0})`} />
            <Tab label={`Rejected (${Array.isArray(loans) ? loans.filter(l => l.status === 'REJECTED').length : 0})`} />
            <Tab label={`Disbursed (${Array.isArray(loans) ? loans.filter(l => l.status === 'DISBURSED').length : 0})`} />
          </Tabs>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Loan Number</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Purpose</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLoans.map((loan) => (
              <TableRow key={loan.id}>
                <TableCell>{loan.loanNumber}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Person sx={{ mr: 1 }} />
                    {loan.customer?.firstName} {loan.customer?.lastName}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <AttachMoney sx={{ mr: 1 }} />
                    ${parseFloat(loan.amount).toLocaleString()}
                  </Box>
                </TableCell>
                <TableCell>{loan.purpose}</TableCell>
                <TableCell>
                  <Chip
                    icon={getStatusIcon(loan.status)}
                    label={loan.status}
                    color={getStatusColor(loan.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{new Date(loan.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton onClick={(e) => handleMenuOpen(e, loan)}>
                    <MoreVert />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* New Loan Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>New Loan Application</DialogTitle>
        <form onSubmit={handleSubmit(onSubmitLoan)}>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Customer</InputLabel>
                  <Select
                    {...register('customerId', { required: 'Customer is required' })}
                    error={!!errors.customerId}
                  >
                    {customers.map((customer) => (
                      <MenuItem key={customer.id} value={customer.id}>
                        {customer.firstName} {customer.lastName} - {customer.customerId}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {errors.customerId && (
                  <Typography color="error" variant="caption">
                    {errors.customerId.message}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Loan Amount"
                  type="number"
                  {...register('amount', { required: 'Amount is required', min: 1 })}
                  error={!!errors.amount}
                  helperText={errors.amount?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Interest Rate (%)"
                  type="number"
                  step="0.01"
                  {...register('interestRate', { required: 'Interest rate is required' })}
                  error={!!errors.interestRate}
                  helperText={errors.interestRate?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Duration (months)"
                  type="number"
                  {...register('durationMonths', { required: 'Duration is required', min: 1 })}
                  error={!!errors.durationMonths}
                  helperText={errors.durationMonths?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Purpose"
                  {...register('purpose')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Collateral Description"
                  multiline
                  rows={3}
                  {...register('collateralDescription')}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">Create Loan</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={openActionDialog} onClose={handleCloseActionDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{actionType} Loan</DialogTitle>
        <form onSubmit={handleSubmit(onSubmitAction)}>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              Loan: {selectedLoan?.loanNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Customer: {selectedLoan?.customer?.firstName} {selectedLoan?.customer?.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Amount: ${parseFloat(selectedLoan?.amount || 0).toLocaleString()}
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label={actionType === 'Reject' ? 'Rejection Reason' : `${actionType} Notes`}
              {...register(actionType === 'Reject' ? 'rejectionReason' : 'approvalNotes', {
                required: `${actionType} notes are required`
              })}
              error={!!errors[actionType === 'Reject' ? 'rejectionReason' : 'approvalNotes']}
              helperText={errors[actionType === 'Reject' ? 'rejectionReason' : 'approvalNotes']?.message}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseActionDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color={actionType === 'Reject' ? 'error' : 'primary'}>
              {actionType}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItemComponent onClick={() => { handleMenuClose(); }}>
          <Visibility sx={{ mr: 1 }} />
          View Details
        </MenuItemComponent>
        {getAvailableActions(selectedLoan)?.map((action) => (
          <MenuItemComponent 
            key={action.type}
            onClick={() => handleOpenActionDialog(selectedLoan, action.type)}
          >
            <Edit sx={{ mr: 1 }} />
            {action.label}
          </MenuItemComponent>
        )) || []}
      </Menu>

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

export default LoanManagement;
