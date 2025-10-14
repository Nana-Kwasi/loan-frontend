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
    {loan.customer?.name || loan.customer?.fullName || 'N/A'}
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
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>Comprehensive Loan Application Form</DialogTitle>
        <form onSubmit={handleSubmit(onSubmitLoan)}>
          <DialogContent sx={{ maxHeight: '80vh', overflow: 'auto' }}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {/* Personal Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary">1. Personal Information</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name(s)"
                  {...register('firstName', { required: 'First name is required' })}
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Surname"
                  {...register('surname', { required: 'Surname is required' })}
                  error={!!errors.surname}
                  helperText={errors.surname?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Middle Name(s)"
                  {...register('middleName')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Maiden Name"
                  {...register('maidenName')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  {...register('dateOfBirth')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select {...register('gender')} label="Gender">
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nationality"
                  {...register('nationality')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Country / Place of Birth"
                  {...register('placeOfBirth')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Marital Status</InputLabel>
                  <Select {...register('maritalStatus')} label="Marital Status">
                    <MenuItem value="Single">Single</MenuItem>
                    <MenuItem value="Married">Married</MenuItem>
                    <MenuItem value="Divorced">Divorced</MenuItem>
                    <MenuItem value="Widowed">Widowed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Number of Dependents"
                  type="number"
                  {...register('numberOfDependents')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Residential Address"
                  multiline
                  rows={2}
                  {...register('residentialAddress')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Postal Address"
                  multiline
                  rows={2}
                  {...register('postalAddress')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Landmark"
                  {...register('landmark')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Residential Status</InputLabel>
                  <Select {...register('residentialStatus')} label="Residential Status">
                    <MenuItem value="Own">Own</MenuItem>
                    <MenuItem value="Rent">Rent</MenuItem>
                    <MenuItem value="Family">Family</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Years at Current Address"
                  type="number"
                  {...register('yearsAtCurrentAddress')}
                />
              </Grid>

              {/* Identification */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom color="primary">2. Identification</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>ID Type</InputLabel>
                  <Select {...register('idType')} label="ID Type">
                    <MenuItem value="National ID">National ID</MenuItem>
                    <MenuItem value="Voter ID">Voter ID</MenuItem>
                    <MenuItem value="Driver's Licence">Driver's Licence</MenuItem>
                    <MenuItem value="Passport">Passport</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ID Number"
                  {...register('idNumber')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Issue Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  {...register('idIssueDate')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Expiry Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  {...register('idExpiryDate')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="SSF Number"
                  {...register('ssfNumber')}
                />
              </Grid>

              {/* Contact Information */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom color="primary">3. Contact Information</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Mobile Number"
                  {...register('mobileNumber')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  {...register('emailAddress')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Telephone (Home)"
                  {...register('telephoneHome')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Telephone (Office)"
                  {...register('telephoneOffice')}
                />
              </Grid>

              {/* Employment Details */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom color="primary">4. Employment Details</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Employer's Name"
                  {...register('employerName')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Occupation / Position Held"
                  {...register('occupation')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Employer's Address"
                  multiline
                  rows={2}
                  {...register('employerAddress')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Years in Current Job"
                  type="number"
                  {...register('yearsInCurrentJob')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Previous Employment (if less than 3 years)"
                  multiline
                  rows={2}
                  {...register('previousEmployment')}
                />
              </Grid>

              {/* Loan Request */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom color="primary">5. Loan Request</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Amount Requested"
                  type="number"
                  step="0.01"
                  {...register('amount', { 
                    required: 'Amount is required', 
                    min: { value: 1, message: 'Amount must be greater than 0' },
                    max: { value: 1000000, message: 'Amount cannot exceed 1,000,000' }
                  })}
                  error={!!errors.amount}
                  helperText={errors.amount?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Loan Duration (months)"
                  type="number"
                  {...register('durationMonths', { 
                    required: 'Duration is required', 
                    min: { value: 1, message: 'Duration must be at least 1 month' },
                    max: { value: 360, message: 'Duration cannot exceed 30 years' }
                  })}
                  error={!!errors.durationMonths}
                  helperText={errors.durationMonths?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Purpose of Loan"
                  multiline
                  rows={2}
                  {...register('purpose')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Customer Account Number (if already a customer)"
                  {...register('customerAccountNumber')}
                />
              </Grid>

              {/* Next of Kin / Emergency Contact */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom color="primary">6. Next of Kin / Emergency Contact</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Person Name"
                  {...register('contactPersonName')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Relationship to Applicant"
                  {...register('relationshipToApplicant')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number of Contact"
                  {...register('contactPersonPhone')}
                />
              </Grid>

              {/* Financial / Income Details */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom color="primary">7. Financial / Income Details</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Gross Annual Income"
                  type="number"
                  step="0.01"
                  {...register('grossAnnualIncome')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Net Monthly Income"
                  type="number"
                  step="0.01"
                  {...register('netMonthlyIncome')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Monthly Expenses"
                  type="number"
                  step="0.01"
                  {...register('monthlyExpenses')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Disposable Income"
                  type="number"
                  step="0.01"
                  {...register('disposableIncome')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Existing Loans (Lender, Amount, Remaining months)"
                  multiline
                  rows={2}
                  {...register('existingLoans')}
                />
              </Grid>

              {/* Collateral Information */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom color="primary">Collateral Information</Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Collateral Details"
                  multiline
                  rows={3}
                  {...register('collateralDescription')}
                />
              </Grid>

              {/* Guarantor Information */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom color="primary">Guarantor Information</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Guarantor Name"
                  {...register('guarantorName')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Guarantor Contact"
                  {...register('guarantorContact')}
                />
              </Grid>

              {/* Declaration & Consent */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom color="primary">8. Declaration & Consent</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Signature Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  {...register('signatureDate')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Information Correct</InputLabel>
                  <Select {...register('informationCorrect')} label="Information Correct">
                    <MenuItem value={true}>Yes</MenuItem>
                    <MenuItem value={false}>No</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Authorization to Debit</InputLabel>
                  <Select {...register('authorizationDebit')} label="Authorization to Debit">
                    <MenuItem value={true}>Yes</MenuItem>
                    <MenuItem value={false}>No</MenuItem>
                  </Select>
                </FormControl>
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
