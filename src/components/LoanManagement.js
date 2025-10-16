import React, { useState, useEffect, useCallback } from 'react';
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
  MenuItem as MenuItemComponent,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Add,
  MoreVert,
  AccountBalance,
  Person,
  AttachMoney,
  Search,
  Schedule,
  CheckCircle,
  Cancel,
  Visibility,
  Edit,
  Download,
  PictureAsPdf,
  Description,
  Image
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
  const [openLoanDetailsDialog, setOpenLoanDetailsDialog] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [actionType, setActionType] = useState('');
  const [loanDocuments, setLoanDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Loan type and documents state
  const [selectedLoanType, setSelectedLoanType] = useState('personal');
  const [documents, setDocuments] = useState({}); // { label: File }
  const [collateralDocuments, setCollateralDocuments] = useState([]); // Array of Files
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedIdType, setSelectedIdType] = useState('');
  const [calculatedInterest, setCalculatedInterest] = useState(0);
  const [totalAmountPayable, setTotalAmountPayable] = useState(0);
  
  // Checkbox states for validation
  const [informationCorrect, setInformationCorrect] = useState(false);
  const [authorizationDebit, setAuthorizationDebit] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  
  // Employment type state
  const [employmentType, setEmploymentType] = useState('');
  
  // Pagination state
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps] = useState(6); // Total number of form steps
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Loan type configuration (ID Proof only for all loan types)
  const loanTypesConfig = {
    personal: {
      label: 'Personal Loan',
      requiredDocuments: ['ID Proof']
    },
    business: {
      label: 'Business / Commercial Loan',
      requiredDocuments: ['ID Proof']
    },
    auto: {
      label: 'Auto / Vehicle Loan',
      requiredDocuments: ['ID Proof']
    },
    mortgage: {
      label: 'Mortgage / Home Loan',
      requiredDocuments: ['ID Proof']
    },
    asset_backed: {
      label: 'Asset-Backed / Collateral Loan',
      requiredDocuments: ['ID Proof']
    }
  };

  // Employment type specific documents and fields
  const employmentConfig = {
    'self_employed': {
      documents: [
        'Business Registration Certificate (if registered)',
        'Tax Return / Business Financials',
        'Bank Statement (business or personal)'
      ],
      fields: ['yearsInCurrentJob']
    },
    'salaried': {
      documents: [
        'Payslips (last 3 months)',
        'Employment Letter or Contract',
        'Bank Statement showing salary credits'
      ],
      fields: ['occupation', 'staffIdNumber']
    },
    'informal': {
      documents: [
        'Proof of Business Activity (e.g., photos, receipts)',
        'Bank Statement'
      ],
      fields: []
    }
  };

  // Form steps configuration
  const formSteps = [
    {
      id: 1,
      title: 'Customer Selection & Loan Type',
      description: 'Select customer and choose loan type'
    },
    {
      id: 2,
      title: 'Personal Information',
      description: 'Customer personal details (auto-filled)'
    },
    {
      id: 3,
      title: 'Identification & Contact',
      description: 'ID verification and contact information'
    },
    {
      id: 4,
      title: 'Employment Details',
      description: 'Employment type and related documents'
    },
    {
      id: 5,
      title: 'Loan Request & Financials',
      description: 'Loan amount, terms, and financial details'
    },
    {
      id: 6,
      title: 'Collateral & Declaration',
      description: 'Collateral information and final consent'
    }
  ];

  const { register, handleSubmit, reset, getValues, setValue, formState: { errors } } = useForm();
  
  // Separate form for action dialogs (Verify, Approve, Reject, etc.)
  const { register: registerAction, handleSubmit: handleSubmitAction, reset: resetAction, getValues: getValuesAction, formState: { errors: errorsAction } } = useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    console.log('=== fetchData START ===');
    try {
      console.log('Fetching loans and customers data...');
      const [loansResponse, customersResponse] = await Promise.all([
        axios.get('/api/loans'),
        axios.get('/api/customers')
      ]);
      
      console.log('Loans response:', loansResponse);
      console.log('Loans data:', loansResponse.data);
      console.log('Customers response:', customersResponse);
      console.log('Customers data:', customersResponse.data);
      
      const loansArray = Array.isArray(loansResponse.data) ? loansResponse.data : [];
      const customersArray = Array.isArray(customersResponse.data) ? customersResponse.data : [];
      
      console.log('Setting loans:', loansArray);
      console.log('Setting customers:', customersArray);
      
      setLoans(loansArray);
      setCustomers(customersArray);
      setLoading(false);
      
      console.log('Data fetch completed successfully');
    } catch (error) {
      console.error('=== fetchData ERROR ===');
      console.error('Error fetching data:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      setLoans([]);
      setCustomers([]);
      setLoading(false);
      setSnackbar({ 
        open: true, 
        message: 'Error fetching data: ' + (error.response?.data?.message || error.message), 
        severity: 'error' 
      });
    }
    console.log('=== fetchData END ===');
  };

  const handleOpenDialog = () => {
    reset();
    setSelectedLoanType('');
    setDocuments({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    reset();
    setDocuments({});
    setCollateralDocuments([]);
    setSelectedLoanType('personal');
    setSelectedCustomerId('');
    setSelectedIdType('');
    setInformationCorrect(false);
    setAuthorizationDebit(false);
    setTermsAccepted(false);
    setEmploymentType('');
    setCurrentStep(1); // Reset to first step
  };

  const handleOpenTermsModal = () => {
    setTermsModalOpen(true);
  };

  const handleCloseTermsModal = () => {
    setTermsModalOpen(false);
  };

  // Pagination functions
  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepChange = (step) => {
    setCurrentStep(step);
  };

  // Function to render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      case 6:
        return renderStep6();
      default:
        return renderStep1();
    }
  };

  const handleCustomerSelect = (customerId) => {
    setSelectedCustomerId(customerId);
    if (customerId) {
      const customer = customers.find(c => c.id === customerId);
      if (customer) {
        // Auto-fill form fields with customer data using react-hook-form setValue
        setValue('firstName', customer.firstName || '');
        setValue('surname', customer.lastName || '');
        setValue('middleName', customer.middleName || '');
        setValue('maidenName', customer.maidenName || '');
        setValue('dateOfBirth', customer.dateOfBirth || '');
        setValue('gender', customer.gender || '');
        setValue('nationality', customer.nationality || '');
        setValue('placeOfBirth', customer.placeOfBirth || '');
        setValue('maritalStatus', customer.maritalStatus || '');
        setValue('numberOfDependents', customer.numberOfDependents || '');
        setValue('residentialAddress', customer.address || '');
        setValue('postalAddress', customer.postalAddress || '');
        setValue('landmark', customer.landmark || '');
        setValue('residentialStatus', customer.residentialStatus || '');
        setValue('yearsAtCurrentAddress', customer.yearsAtCurrentAddress || '');
        setValue('idType', customer.idType || '');
        setValue('idNumber', customer.idCard || '');
        setValue('mobileNumber', customer.phoneNumber || '');
        setValue('emailAddress', customer.email || '');
        setValue('telephoneHome', customer.telephoneHome || '');
        setValue('telephoneOffice', customer.telephoneOffice || '');
        
        // Set the selected ID type for conditional rendering
        setSelectedIdType(customer.idType || '');
        
        // DO NOT auto-fill guarantor fields - these should be manually entered
        // setValue('guarantorName', ''); - intentionally left empty
        // setValue('guarantorContact', ''); - intentionally left empty
        
        console.log('Auto-filled customer data:', {
          firstName: customer.firstName,
          surname: customer.lastName,
          phoneNumber: customer.phoneNumber,
          idType: customer.idType
        });
      }
    } else {
      // Clear form when no customer is selected
      setValue('firstName', '');
      setValue('surname', '');
      setValue('middleName', '');
      setValue('maidenName', '');
      setValue('dateOfBirth', '');
      setValue('gender', '');
      setValue('nationality', '');
      setValue('placeOfBirth', '');
      setValue('maritalStatus', '');
      setValue('numberOfDependents', '');
      setValue('residentialAddress', '');
      setValue('postalAddress', '');
      setValue('landmark', '');
      setValue('residentialStatus', '');
      setValue('yearsAtCurrentAddress', '');
      setValue('idType', '');
      setValue('idNumber', '');
      setValue('mobileNumber', '');
      setValue('emailAddress', '');
      setValue('telephoneHome', '');
      setValue('telephoneOffice', '');
      setSelectedIdType('');
    }
  };

  const calculateInterest = (principal, durationMonths) => {
    const rate = 5; // 5% annual rate
    // Convert months to years for annual calculation
    const durationYears = durationMonths / 12;
    const simpleInterest = (principal * rate * durationYears) / 100;
    const totalAmount = principal + simpleInterest;
    
    setCalculatedInterest(simpleInterest);
    setTotalAmountPayable(totalAmount);
    
    return { interest: simpleInterest, total: totalAmount };
  };

  // Phone number validation function
  const validatePhoneNumber = (value) => {
    if (!value) return true; // Optional fields
    // Remove any non-digit characters and check length
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length !== 10) {
      return 'Phone number must be exactly 10 digits';
    }
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(digitsOnly) || 'Phone number must be exactly 10 digits';
  };

  // Handle collateral document uploads
  const handleCollateralDocumentUpload = (event) => {
    const files = Array.from(event.target.files);
    setCollateralDocuments(prev => [...prev, ...files]);
  };

  // Remove collateral document
  const removeCollateralDocument = (index) => {
    setCollateralDocuments(prev => prev.filter((_, i) => i !== index));
  };

  // Step rendering functions
  const renderStep1 = () => (
    <>
      {/* Customer Selection */}
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom color="primary" sx={{ 
          fontWeight: 600, 
          mb: 1,
          borderBottom: '2px solid #e0e0e0',
          paddingBottom: 1
        }}>
          1. Customer Selection *
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Only registered customers can apply for loans. Please select a customer from the list below.
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth required>
          <InputLabel>Select Customer *</InputLabel>
          <Select 
            value={selectedCustomerId || ''} 
            onChange={(e) => handleCustomerSelect(e.target.value)}
            label="Select Customer *"
            sx={{ mb: 2 }}
            error={!selectedCustomerId}
          >
            <MenuItem value="">Select a customer...</MenuItem>
            {customers.map((customer) => (
              <MenuItem key={customer.id} value={customer.id}>
                {customer.name} ({customer.phoneNumber}) - {customer.customerId}
              </MenuItem>
            ))}
          </Select>
          {!selectedCustomerId && (
            <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
              Please select a registered customer to proceed with the loan application.
            </Typography>
          )}
        </FormControl>
      </Grid>

              {/* Loan Type Selection */}
              <Grid item xs={12}>
        <Typography variant="h6" gutterBottom color="primary" sx={{ 
          fontWeight: 600, 
          mb: 1,
          borderBottom: '2px solid #e0e0e0',
          paddingBottom: 1
        }}>
          2. Loan Type Selection
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth required>
          <InputLabel>Loan Type *</InputLabel>
                  <Select
                    value={selectedLoanType}
                    onChange={(e) => setSelectedLoanType(e.target.value)}
            label="Loan Type *"
            sx={{ width: '100% !important' }}
                  >
                    <MenuItem value="personal">Personal Loan</MenuItem>
                    <MenuItem value="business">Business / Commercial Loan</MenuItem>
            <MenuItem value="auto">Auto / Vehicle Loan</MenuItem>
                    <MenuItem value="mortgage">Mortgage / Home Loan</MenuItem>
                    <MenuItem value="asset_backed">Asset-Backed / Collateral Loan</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
    </>
  );

  const renderStep2 = () => (
    <>
              {/* Personal Information */}
              <Grid item xs={12}>
        <Typography variant="h6" gutterBottom color="primary" sx={{ 
          fontWeight: 600, 
          mb: 1,
          borderBottom: '2px solid #e0e0e0',
          paddingBottom: 1
        }}>
          Personal Information
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Customer information is automatically filled from the selected customer's registration data.
        </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name(s)"
                  {...register('firstName', { required: 'First name is required' })}
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message}
          InputProps={{ readOnly: true }}
          sx={{ '& .MuiInputBase-input': { backgroundColor: '#f5f5f5' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Surname"
                  {...register('surname', { required: 'Surname is required' })}
                  error={!!errors.surname}
                  helperText={errors.surname?.message}
          InputProps={{ readOnly: true }}
          sx={{ '& .MuiInputBase-input': { backgroundColor: '#f5f5f5' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Middle Name(s)"
                  {...register('middleName')}
          InputProps={{ readOnly: true }}
          sx={{ '& .MuiInputBase-input': { backgroundColor: '#f5f5f5' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Maiden Name"
                  {...register('maidenName')}
          InputProps={{ readOnly: true }}
          sx={{ '& .MuiInputBase-input': { backgroundColor: '#f5f5f5' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  {...register('dateOfBirth')}
          InputProps={{ readOnly: true }}
          sx={{ '& .MuiInputBase-input': { backgroundColor: '#f5f5f5' } }}
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
          label="Place of Birth"
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
      <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Postal Address"
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
            <MenuItem value="Owned">Owned</MenuItem>
            <MenuItem value="Rented">Rented</MenuItem>
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
    </>
  );

  const renderStep3 = () => (
    <>
              {/* Identification */}
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom color="primary" sx={{ 
          fontWeight: 600, 
          mb: 1,
          borderBottom: '2px solid #e0e0e0',
          paddingBottom: 1
        }}>
          Identification
        </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>ID Type</InputLabel>
          <Select 
            {...register('idType')} 
            label="ID Type"
            value={selectedIdType || ''}
            onChange={(e) => setSelectedIdType(e.target.value)}
          >
            <MenuItem value="">Select ID Type...</MenuItem>
                    <MenuItem value="National ID">National ID</MenuItem>
                    <MenuItem value="Voter ID">Voter ID</MenuItem>
                    <MenuItem value="Driver's Licence">Driver's Licence</MenuItem>
                    <MenuItem value="Passport">Passport</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
      
      {/* Conditional ID fields */}
      {(selectedIdType === 'National ID' || selectedIdType === 'Voter ID') && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ID Number"
            {...register('idNumber', { required: 'ID Number is required' })}
            error={!!errors.idNumber}
            helperText={errors.idNumber?.message}
          />
        </Grid>
      )}
      
      {selectedIdType === "Driver's Licence" && (
        <>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="License Number"
              {...register('licenseNumber', { required: 'License Number is required' })}
              error={!!errors.licenseNumber}
              helperText={errors.licenseNumber?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Issue Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
              {...register('idIssueDate', { required: 'Issue Date is required' })}
              error={!!errors.idIssueDate}
              helperText={errors.idIssueDate?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Expiry Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
              {...register('idExpiryDate', { required: 'Expiry Date is required' })}
              error={!!errors.idExpiryDate}
              helperText={errors.idExpiryDate?.message}
                />
              </Grid>
        </>
      )}
      
      {selectedIdType === 'Passport' && (
        <>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
              label="Passport ID Number"
              {...register('passportNumber', { required: 'Passport Number is required' })}
              error={!!errors.passportNumber}
              helperText={errors.passportNumber?.message}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Issue Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              {...register('idIssueDate', { required: 'Issue Date is required' })}
              error={!!errors.idIssueDate}
              helperText={errors.idIssueDate?.message}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Expiry Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              {...register('idExpiryDate', { required: 'Expiry Date is required' })}
              error={!!errors.idExpiryDate}
              helperText={errors.idExpiryDate?.message}
            />
          </Grid>
        </>
      )}

      {/* ID Proof Documents */}
      <Grid item xs={12} sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom color="primary" sx={{ 
          fontWeight: 600, 
          mb: 1,
          borderBottom: '2px solid #e0e0e0',
          paddingBottom: 1
        }}>
          ID Proof Documents *
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Upload a clear copy of your selected ID document
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Button 
              variant="outlined" 
              component="label" 
              fullWidth
              sx={{
                height: '48px',
                textAlign: 'left',
                justifyContent: 'flex-start',
                padding: '12px 16px',
                borderColor: '#3eb489',
                color: '#3eb489',
                '&:hover': {
                  borderColor: '#2a8a67',
                  backgroundColor: '#f4fcf9'
                }
              }}
            >
              {documents['ID Proof']?.name || `Upload: ID Proof Document`}
              <input
                hidden
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setDocuments(prev => ({ ...prev, 'ID Proof': file }));
                }}
              />
            </Button>
          </Grid>
        </Grid>
              </Grid>

              {/* Contact Information */}
      <Grid item xs={12} sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom color="primary" sx={{ 
          fontWeight: 600, 
          mb: 1,
          borderBottom: '2px solid #e0e0e0',
          paddingBottom: 1
        }}>
          Contact Information
        </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Mobile Number"
          {...register('mobileNumber', { 
            required: 'Mobile number is required',
            validate: validatePhoneNumber 
          })}
          error={!!errors.mobileNumber}
          helperText={errors.mobileNumber?.message || 'Enter 10-digit phone number (required)'}
          placeholder="0241234567"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
          label="Email Address (Optional)"
                  type="email"
                  {...register('emailAddress')}
          helperText="Optional - Leave blank if not available"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
          label="Telephone (Home) - Optional"
          {...register('telephoneHome', { 
            validate: validatePhoneNumber 
          })}
          error={!!errors.telephoneHome}
          helperText={errors.telephoneHome?.message || 'Enter 10-digit phone number (optional)'}
          placeholder="0241234567"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
          label="Telephone (Office) - Optional"
          {...register('telephoneOffice', { 
            validate: validatePhoneNumber 
          })}
          error={!!errors.telephoneOffice}
          helperText={errors.telephoneOffice?.message || 'Enter 10-digit phone number (optional)'}
          placeholder="0241234567"
                />
              </Grid>
    </>
  );

  const renderStep4 = () => (
    <>
              {/* Employment Details */}
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom color="primary" sx={{ 
          fontWeight: 600, 
          mb: 1,
          borderBottom: '2px solid #e0e0e0',
          paddingBottom: 1
        }}>
          Employment Details
        </Typography>
              </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Employment Type *</InputLabel>
          <Select 
            value={employmentType} 
            onChange={(e) => setEmploymentType(e.target.value)}
            label="Employment Type *"
            sx={{ width: '100% !important' }}
          >
            <MenuItem value="">Select Employment Type...</MenuItem>
            <MenuItem value="self_employed">Self Employed</MenuItem>
            <MenuItem value="salaried">Salaried / Employed</MenuItem>
            <MenuItem value="informal">Informal / Casual Worker</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      {/* Conditional Employment Fields */}
      {employmentType && (
        <>
          {/* Self Employed Fields */}
          {employmentType === 'self_employed' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                label="Years in Current Business"
                type="number"
                {...register('yearsInCurrentJob', { 
                  required: 'Years in current business is required',
                  min: { value: 0, message: 'Years cannot be negative' }
                })}
                error={!!errors.yearsInCurrentJob}
                helperText={errors.yearsInCurrentJob?.message}
                />
              </Grid>
          )}

          {/* Salaried/Employed Fields */}
          {employmentType === 'salaried' && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Occupation / Position Held"
                  {...register('occupation', { required: 'Occupation is required' })}
                  error={!!errors.occupation}
                  helperText={errors.occupation?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Staff ID Number"
                  {...register('staffIdNumber', { required: 'Staff ID number is required' })}
                  error={!!errors.staffIdNumber}
                  helperText={errors.staffIdNumber?.message}
                />
              </Grid>
            </>
          )}

          {/* Employment Documents Section */}
          <Grid item xs={12} sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom color="primary" sx={{
              fontWeight: 600,
              mb: 1
            }}>
              Employment Documents *
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Upload the required documents for your employment type:
            </Typography>
            
            <Grid container spacing={3}>
              {employmentConfig[employmentType]?.documents.map((label) => (
                <Grid item xs={12} sm={6} key={label}>
                  <Button 
                    variant="outlined" 
                    component="label" 
                  fullWidth
                    sx={{
                      height: '48px',
                      textAlign: 'left',
                      justifyContent: 'flex-start',
                      padding: '12px 16px',
                      borderColor: '#3eb489',
                      color: '#3eb489',
                      '&:hover': {
                        borderColor: '#2a8a67',
                        backgroundColor: '#f4fcf9'
                      }
                    }}
                  >
                    {documents[label]?.name || `Upload: ${label}`}
                    <input
                      hidden
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setDocuments(prev => ({ ...prev, [label]: file }));
                      }}
                    />
                  </Button>
              </Grid>
              ))}
            </Grid>
          </Grid>
        </>
      )}
    </>
  );

  const renderStep5 = () => (
    <>
              {/* Loan Request */}
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom color="primary" sx={{ 
          fontWeight: 600, 
          mb: 1,
          borderBottom: '2px solid #e0e0e0',
          paddingBottom: 1
        }}>
          Loan Request
        </Typography>
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
          onChange={(e) => {
            const amount = parseFloat(e.target.value) || 0;
            const duration = parseFloat(getValues('durationMonths')) || 0;
            if (amount > 0 && duration > 0) {
              calculateInterest(amount, duration);
            }
          }}
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
                            onChange={(e) => {
            const amount = parseFloat(getValues('amount')) || 0;
            const duration = parseFloat(e.target.value) || 0;
            if (amount > 0 && duration > 0) {
              calculateInterest(amount, duration);
            }
          }}
        />
                      </Grid>
      
      {/* Interest Calculation Display */}
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Interest Rate"
          value="5% (Annual)"
          InputProps={{ readOnly: true }}
          helperText="Fixed rate for all loans"
        />
                  </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Calculated Interest"
          value={`GHS ${calculatedInterest.toLocaleString()}`}
          InputProps={{ readOnly: true }}
          helperText="Simple Interest for the duration"
        />
                </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Total Amount Payable"
          value={`GHS ${totalAmountPayable.toLocaleString()}`}
          InputProps={{ readOnly: true }}
          helperText="Principal + Interest"
          sx={{ 
            '& .MuiInputBase-input': { 
              fontWeight: 'bold',
              color: '#2e7d32'
            }
          }}
        />
      </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Purpose of Loan"
                  multiline
                  rows={2}
          {...register('purpose', { required: 'Purpose of loan is required' })}
          error={!!errors.purpose}
          helperText={errors.purpose?.message}
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
      <Grid item xs={12} sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom color="primary" sx={{ 
          fontWeight: 600, 
          mb: 1,
          borderBottom: '2px solid #e0e0e0',
          paddingBottom: 1
        }}>
          Next of Kin / Emergency Contact
        </Typography>
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
      <Grid item xs={12} sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom color="primary" sx={{ 
          fontWeight: 600, 
          mb: 1,
          borderBottom: '2px solid #e0e0e0',
          paddingBottom: 1
        }}>
          Financial / Income Details
        </Typography>
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
          label="Existing Loans (Lender, Amount, Monthly Payment)"
                  multiline
                  rows={2}
                  {...register('existingLoans')}
                />
              </Grid>
    </>
  );

  const renderStep6 = () => (
    <>
              {/* Collateral Information */}
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom color="primary" sx={{ 
          fontWeight: 600, 
          mb: 1,
          borderBottom: '2px solid #e0e0e0',
          paddingBottom: 1
        }}>
          Collateral Information
        </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Collateral Details"
                  multiline
                  rows={3}
          {...register('collateralDescription', { required: 'Collateral details are required' })}
          error={!!errors.collateralDescription}
          helperText={errors.collateralDescription?.message}
          placeholder="Describe the collateral being provided (e.g., property address, vehicle details, etc.)"
                />
              </Grid>
      
      {/* Collateral Document Upload */}
      <Grid item xs={12} sx={{ mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom color="primary" sx={{
          fontWeight: 600,
          mb: 1
        }}>
          Collateral Documents *
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Upload all relevant collateral documents (title deeds, valuation reports, ownership certificates, etc.)
        </Typography>
        
        <Button
          variant="outlined"
          component="label"
          startIcon={<Add />}
          sx={{ 
            mb: 3,
            height: '48px',
            padding: '12px 24px',
            borderColor: '#3eb489',
            color: '#3eb489',
            '&:hover': {
              borderColor: '#2a8a67',
              backgroundColor: '#f4fcf9'
            }
          }}
        >
          Upload Collateral Documents
          <input
            hidden
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={handleCollateralDocumentUpload}
          />
        </Button>
        
        {/* Display uploaded collateral documents */}
        {collateralDocuments.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Uploaded Collateral Documents ({collateralDocuments.length}):
            </Typography>
            {collateralDocuments.map((file, index) => (
              <Box key={index} sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                p: 1,
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                mb: 1,
                backgroundColor: '#f9f9f9'
              }}>
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  {file.name}
                </Typography>
                <Button
                  size="small"
                  color="error"
                  onClick={() => removeCollateralDocument(index)}
                >
                  Remove
                </Button>
              </Box>
            ))}
          </Box>
        )}
      </Grid>

              {/* Guarantor Information */}
      <Grid item xs={12} sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom color="primary" sx={{ 
          fontWeight: 600, 
          mb: 1,
          borderBottom: '2px solid #e0e0e0',
          paddingBottom: 1
        }}>
          Guarantor Information
        </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Guarantor Name"
          {...register('guarantorName', { 
            required: 'Guarantor name is required' 
          })}
          error={!!errors.guarantorName}
          helperText={errors.guarantorName?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Guarantor Contact"
          {...register('guarantorContact', { 
            required: 'Guarantor contact is required',
            validate: validatePhoneNumber 
          })}
          error={!!errors.guarantorContact}
          helperText={errors.guarantorContact?.message || 'Enter 10-digit phone number (required)'}
          placeholder="0241234567"
                />
              </Grid>
      
      {/* Guarantor ID Card Upload */}
      <Grid item xs={12}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, color: '#2a8a67', mt: 2 }}>
          Guarantor ID Card *
        </Typography>
        <Button 
          variant="outlined" 
          component="label" 
          fullWidth
          sx={{
            height: '48px',
            textAlign: 'left',
            justifyContent: 'flex-start',
            padding: '12px 16px',
            borderColor: '#3eb489',
            color: '#3eb489',
            '&:hover': {
              borderColor: '#2a8a67',
              backgroundColor: '#f4fcf9'
            }
          }}
        >
          {documents['Guarantor ID Card']?.name || `Upload: Guarantor ID Card`}
          <input
            hidden
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setDocuments(prev => ({ ...prev, 'Guarantor ID Card': file }));
            }}
          />
        </Button>
      </Grid>

              {/* Declaration & Consent */}
      <Grid item xs={12} sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom color="primary" sx={{ 
          fontWeight: 600, 
          mb: 1,
          borderBottom: '2px solid #e0e0e0',
          paddingBottom: 1
        }}>
          Declaration & Consent
        </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Signature Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
          {...register('signatureDate', { required: 'Signature date is required' })}
          error={!!errors.signatureDate}
          helperText={errors.signatureDate?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
        <FormControlLabel
          control={
            <Checkbox
              checked={informationCorrect}
              onChange={(e) => setInformationCorrect(e.target.checked)}
              color="primary"
              sx={{ 
                color: '#3eb489',
                '&.Mui-checked': {
                  color: '#3eb489'
                }
              }}
            />
          }
          label="I confirm that all information provided is correct and accurate"
          sx={{ 
            mt: 2,
            alignItems: 'flex-start',
            '& .MuiFormControlLabel-label': {
              marginTop: '4px',
              lineHeight: 1.4
            }
          }}
        />
              </Grid>
              <Grid item xs={12} sm={6}>
        <FormControlLabel
          control={
            <Checkbox
              checked={authorizationDebit}
              onChange={(e) => setAuthorizationDebit(e.target.checked)}
              color="primary"
              sx={{ 
                color: '#3eb489',
                '&.Mui-checked': {
                  color: '#3eb489'
                }
              }}
            />
          }
          label="I authorize the bank to debit my account for loan repayments"
          sx={{ 
            mt: 2,
            alignItems: 'flex-start',
            '& .MuiFormControlLabel-label': {
              marginTop: '4px',
              lineHeight: 1.4
            }
          }}
        />
              </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              color="primary"
              sx={{ 
                color: '#3eb489',
                '&.Mui-checked': {
                  color: '#3eb489'
                }
              }}
            />
          }
          label={
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2">
                I have read and agree to the 
              </Typography>
              <Button
                variant="text"
                size="small"
                onClick={handleOpenTermsModal}
                sx={{
                  color: '#3eb489',
                  textTransform: 'none',
                  fontWeight: 600,
                  padding: 0,
                  minWidth: 'auto',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    textDecoration: 'underline'
                  }
                }}
              >
                Terms and Conditions
              </Button>
              <Typography variant="body2">
                and understand the consequences of loan default
              </Typography>
            </Box>
          }
          sx={{ 
            mt: 2,
            alignItems: 'flex-start',
            '& .MuiFormControlLabel-label': {
              marginTop: '4px',
              lineHeight: 1.4
            }
          }}
        />
      </Grid>
    </>
  );

  const handleOpenActionDialog = async (loan, type) => {
    console.log('=== handleOpenActionDialog CALLED ===');
    console.log('Loan:', loan);
    console.log('Action type:', type);
    setSelectedLoan(loan);
    setActionType(type);
    resetAction(); // Reset the action form
    
    // If viewing documents, fetch them first
    if (type === 'ViewDocuments') {
      await fetchLoanDocuments(loan.id);
    }
    
    setOpenActionDialog(true);
    setAnchorEl(null);
    console.log('Action dialog opened');
  };

  const fetchLoanDocuments = async (loanId) => {
    try {
      setLoadingDocuments(true);
      const response = await axios.get(`/api/loans/${loanId}/documents`);
      setLoanDocuments(response.data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setSnackbar({ open: true, message: 'Error fetching documents', severity: 'error' });
      setLoanDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const downloadDocument = async (documentId, fileName) => {
    try {
      const response = await axios.get(`/api/documents/${documentId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      setSnackbar({ open: true, message: 'Error downloading document', severity: 'error' });
    }
  };

  const [viewingDocument, setViewingDocument] = useState(null);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);

  const viewDocument = async (documentId, fileName) => {
    try {
      const response = await axios.get(`/api/documents/${documentId}/view`, {
        responseType: 'blob'
      });
      
      // Create blob with proper MIME type for PDFs
      const blob = new Blob([response.data], { 
        type: fileName.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream' 
      });
      const url = window.URL.createObjectURL(blob);
      setViewingDocument({ url, fileName });
      setDocumentViewerOpen(true);
    } catch (error) {
      console.error('Error viewing document:', error);
      setSnackbar({ open: true, message: 'Error opening document', severity: 'error' });
    }
  };

  const getDocumentIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return <PictureAsPdf sx={{ color: '#d32f2f', fontSize: 24 }} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image sx={{ color: '#1976d2', fontSize: 24 }} />;
      case 'doc':
      case 'docx':
        return <Description sx={{ color: '#1976d2', fontSize: 24 }} />;
      default:
        return <Description sx={{ color: '#666', fontSize: 24 }} />;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleCloseActionDialog = () => {
    setOpenActionDialog(false);
    setSelectedLoan(null);
    setActionType('');
    reset();
  };

  const handleOpenLoanDetails = (loan) => {
    setSelectedLoan(loan);
    setOpenLoanDetailsDialog(true);
  };

  const handleCloseLoanDetailsDialog = () => {
    setOpenLoanDetailsDialog(false);
    setSelectedLoan(null);
  };

  const onSubmitLoan = async (data) => {
    try {
      if (!selectedLoanType) {
        setSnackbar({ open: true, message: 'Please select a loan type', severity: 'error' });
        return;
      }

      if (!selectedCustomerId) {
        setSnackbar({ open: true, message: 'Please select a registered customer to proceed with the loan application', severity: 'error' });
        return;
      }

      if (!informationCorrect) {
        setSnackbar({ open: true, message: 'Please confirm that the information provided is correct', severity: 'error' });
        return;
      }

      if (!authorizationDebit) {
        setSnackbar({ open: true, message: 'Please authorize debit from your account', severity: 'error' });
        return;
      }

      if (!employmentType) {
        setSnackbar({ open: true, message: 'Please select your employment type', severity: 'error' });
        return;
      }

      if (collateralDocuments.length === 0) {
        setSnackbar({ open: true, message: 'Please upload at least one collateral document', severity: 'error' });
        return;
      }

      if (!documents['Guarantor ID Card']) {
        setSnackbar({ open: true, message: 'Please upload guarantor ID card', severity: 'error' });
        return;
      }

      const requiredDocs = loanTypesConfig[selectedLoanType]?.requiredDocuments || [];
      const missing = requiredDocs.filter(label => !documents[label]);
      if (missing.length > 0) {
        setSnackbar({ open: true, message: `Missing required documents: ${missing.join(', ')}` , severity: 'error' });
        return;
      }

      // Validate employment documents
      const employmentDocs = employmentConfig[employmentType]?.documents || [];
      const missingEmploymentDocs = employmentDocs.filter(label => !documents[label]);
      if (missingEmploymentDocs.length > 0) {
        setSnackbar({ open: true, message: `Missing employment documents: ${missingEmploymentDocs.join(', ')}` , severity: 'error' });
        return;
      }

      const payload = { 
        ...data, 
        loanType: selectedLoanType,
        customerId: selectedCustomerId ? parseInt(selectedCustomerId) : null,
        interestRate: 5.0, // Fixed 5% interest rate
        amount: parseFloat(data.amount) || 0,
        employmentType: employmentType,
        informationCorrect: informationCorrect,
        authorizationDebit: authorizationDebit,
        termsAccepted: termsAccepted,
        // Explicitly set guarantor fields to prevent auto-fill
        guarantorName: data.guarantorName || '',
        guarantorContact: data.guarantorContact || ''
      };
      
      console.log('Loan creation payload:', payload);
      const createRes = await axios.post('/api/loans', payload);
      const createdLoan = createRes?.data;

      // Upload documents (best effort)
      if (createdLoan?.id && (requiredDocs.length > 0 || employmentDocs.length > 0 || collateralDocuments.length > 0)) {
        const formData = new FormData();
        
        // Upload required documents (ID Proof)
        requiredDocs.forEach((label) => {
          if (documents[label]) formData.append('files', documents[label], documents[label].name);
        });
        
        // Upload employment documents
        employmentDocs.forEach((label) => {
          if (documents[label]) formData.append('files', documents[label], documents[label].name);
        });
        
        // Upload collateral documents
        collateralDocuments.forEach((file, index) => {
          formData.append('files', file, `collateral_${index}_${file.name}`);
        });
        
        // Upload guarantor ID card
        if (documents['Guarantor ID Card']) {
          formData.append('files', documents['Guarantor ID Card'], documents['Guarantor ID Card'].name);
        }
        
        // Create labels array
        const allLabels = [
          ...requiredDocs, 
          ...employmentDocs, 
          ...collateralDocuments.map((_, index) => `Collateral Document ${index + 1}`)
        ];
        
        // Add guarantor ID card label if uploaded
        if (documents['Guarantor ID Card']) {
          allLabels.push('Guarantor ID Card');
        }
        formData.append('labels', JSON.stringify(allLabels));
        
        try {
          const uploadResponse = await axios.post(`/api/loans/${createdLoan.id}/documents`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          console.log('Documents uploaded successfully:', uploadResponse.data);
        } catch (e) {
          console.error('Document upload error:', e);
          setSnackbar({ open: true, message: 'Loan created successfully, but document upload failed: ' + (e.response?.data?.message || e.message), severity: 'warning' });
        }
      }

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
    console.log('=== onSubmitAction START ===');
    console.log('Action type:', actionType);
    console.log('Form data:', data);
    console.log('Selected loan:', selectedLoan);
    
    try {
      if (actionType === 'ViewDocuments') {
        console.log('ViewDocuments action - closing dialog');
        handleCloseActionDialog();
        return;
      }
      
      const endpoint = getActionEndpoint();
      console.log('API endpoint:', endpoint);
      console.log('Making API call...');
      
      const response = await axios.post(endpoint, data);
      console.log('API response:', response);
      console.log('Response data:', response.data);
      
      setSnackbar({ open: true, message: `${actionType === 'AddRemarks' ? 'Remarks added' : actionType} successful`, severity: 'success' });
      
      console.log('Calling fetchData to refresh loan list...');
      await fetchData();
      console.log('fetchData completed');
      
      handleCloseActionDialog();
      console.log('Dialog closed');
    } catch (error) {
      console.error('=== onSubmitAction ERROR ===');
      console.error('Error object:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || `Error ${actionType.toLowerCase()}`, 
        severity: 'error' 
      });
    }
    console.log('=== onSubmitAction END ===');
  };

  const getActionEndpoint = () => {
    const loanId = selectedLoan.id;
    switch (actionType) {
      case 'Verify':
        return `/api/lpo/loans/${loanId}/verify`;
      case 'AddRemarks':
        return `/api/lpo/loans/${loanId}/remarks`;
      case 'Approve':
        return `/api/credit-manager/loans/${loanId}/approve`;
      case 'Reject':
        return `/api/credit-manager/loans/${loanId}/reject`;
      case 'Disburse':
        return `/api/credit-manager/loans/${loanId}/disburse`;
      case 'ViewDocuments':
        return `/api/loans/${loanId}/documents`;
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

  const getAvailableActions = useCallback((loan) => {
    const actions = [];
    
    // Check if loan exists and has status
    if (!loan || !loan.status) {
      return actions;
    }
    
    // Loan Processing Officer (LPO) actions
    if (user?.role === 'LOAN_PROCESSING_OFFICER' && loan.status === 'PENDING') {
      actions.push({ label: 'Verify', type: 'Verify' });
      actions.push({ label: 'Add Remarks', type: 'AddRemarks' });
    }
    
    // Credit Manager actions
    if (user?.role === 'CREDIT_MANAGER' && loan.status === 'VERIFIED') {
      actions.push({ label: 'Approve', type: 'Approve' });
      actions.push({ label: 'Reject', type: 'Reject' });
    }
    
    // Credit Manager disbursement
    if (user?.role === 'CREDIT_MANAGER' && loan.status === 'APPROVED') {
      actions.push({ label: 'Disburse', type: 'Disburse' });
    }
    
    // System Admin and Compliance Officer - View only (no loan operations)
    // They can only view documents and see loan details
    
    // Add informational message for Credit Manager viewing PENDING loans
    if (user?.role === 'CREDIT_MANAGER' && loan.status === 'PENDING') {
      actions.push({ label: 'Awaiting LPO Verification', type: 'InfoOnly' });
    }
    
    // View Documents - available for all roles
    actions.push({ label: 'View Documents', type: 'ViewDocuments' });
    
    return actions;
  }, [user?.role]);

  const filteredLoans = Array.isArray(loans) ? loans.filter(loan => {
    // Filter by tab (status)
    let statusMatch = false;
    switch (tabValue) {
      case 0: statusMatch = loan.status === 'PENDING'; break;
      case 1: statusMatch = loan.status === 'VERIFIED'; break;
      case 2: statusMatch = loan.status === 'APPROVED'; break;
      case 3: statusMatch = loan.status === 'REJECTED'; break;
      case 4: statusMatch = loan.status === 'DISBURSED'; break;
      default: statusMatch = true; break;
    }
    
    // Filter by search term
    let searchMatch = true;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      searchMatch = 
        loan.loanNumber?.toLowerCase().includes(searchLower) ||
        loan.customer?.name?.toLowerCase().includes(searchLower) ||
        loan.customer?.fullName?.toLowerCase().includes(searchLower) ||
        loan.customer?.firstName?.toLowerCase().includes(searchLower) ||
        loan.customer?.lastName?.toLowerCase().includes(searchLower);
    }
    
    return statusMatch && searchMatch;
  }) : [];

  if (loading) {
    return <Typography>Loading loans...</Typography>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Loan Management</Typography>
        {/* Only CSA can create new loan applications */}
        {user?.role === 'CSA' && (
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenDialog}
        >
          New Loan Application
        </Button>
        )}
      </Box>

      {/* View-only banner for Compliance Officer and IT Admin */}
      {(user?.role === 'COMPLIANCE_OFFICER' || user?.role === 'SYSTEM_ADMIN') && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="info" sx={{ backgroundColor: '#e3f2fd', color: '#1565c0' }}>
            <Typography variant="body2">
              <strong>View-Only Mode:</strong> You can view loan details and documents, but cannot perform loan operations (verify, approve, reject, disburse).
            </Typography>
          </Alert>
        </Box>
      )}

      {/* Search Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by Loan ID or Customer Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: '#3eb489' }} />
              }}
              sx={{
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
                }
              }}
            />
            {searchTerm && (
              <Button
                variant="outlined"
                onClick={() => setSearchTerm('')}
                sx={{
                  borderColor: '#3eb489',
                  color: '#3eb489',
                  '&:hover': {
                    borderColor: '#2a8a67',
                    backgroundColor: '#f4fcf9'
                  }
                }}
              >
                Clear
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

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
                    GHS {parseFloat(loan.totalAmount || loan.amount || 0).toLocaleString()}
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
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          className: 'mint-dialog-paper',
          sx: { borderRadius: '16px', overflow: 'hidden' }
        }}
      >
        <DialogTitle 
          className="mint-dialog-header"
          sx={{ 
            background: 'linear-gradient(135deg, #3eb489 0%, #52c9a0 100%)',
            color: 'white',
            padding: '24px 28px',
            borderBottom: '3px solid #26d0a1'
          }}
        >
          <Box className="mint-dialog-title">
            <AccountBalance sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
                Comprehensive Loan Application Form
              </Typography>
              <Typography className="mint-dialog-subtitle" variant="body2">
                Complete all required fields for loan processing
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmitLoan)}>
          <DialogContent 
            className="mint-dialog-content"
            sx={{ 
              padding: '32px !important',
              background: 'linear-gradient(to bottom, #ffffff 0%, #f4fcf9 100%)',
              maxHeight: '75vh', 
              overflow: 'auto',
              paddingBottom: '120px'
            }}
          >
            {/* Progress Indicator */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom color="primary" sx={{ fontWeight: 600, mb: 2 }}>
                {formSteps[currentStep - 1]?.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {formSteps[currentStep - 1]?.description}
              </Typography>
              
              {/* Step Progress Bar */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                {formSteps.map((step, index) => (
                  <React.Fragment key={step.id}>
                    <Box
                      onClick={() => handleStepChange(step.id)}
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: currentStep >= step.id ? '#3eb489' : '#e0e0e0',
                        color: currentStep >= step.id ? 'white' : '#666',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: currentStep >= step.id ? '#2a8a67' : '#d0d0d0',
                          transform: 'scale(1.05)'
                        }
                      }}
                    >
                      {step.id}
                    </Box>
                    {index < formSteps.length - 1 && (
                      <Box
                        sx={{
                          flex: 1,
                          height: 2,
                          backgroundColor: currentStep > step.id ? '#3eb489' : '#e0e0e0',
                          margin: '0 8px',
                          transition: 'background-color 0.3s ease'
                        }}
                      />
                    )}
                  </React.Fragment>
                ))}
              </Box>
            </Box>

            <Grid container spacing={3} sx={{ mt: 0 }}>
              {renderCurrentStep()}
            </Grid>
          </DialogContent>
          <DialogActions 
            className="mint-dialog-actions"
            sx={{ 
              padding: '20px 28px !important',
              backgroundColor: '#f9fafb',
              borderTop: '1px solid #b8e6d5',
              gap: 2,
              position: 'sticky',
              bottom: 0,
              zIndex: 1000,
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                onClick={handleCloseDialog}
                variant="outlined"
                sx={{
                  borderColor: '#b8e6d5',
                  color: '#2a8a67',
                  '&:hover': {
                    borderColor: '#3eb489',
                    backgroundColor: '#f4fcf9'
                  }
                }}
              >
                Cancel
              </Button>
              
              {currentStep > 1 && (
                <Button 
                  onClick={handlePreviousStep}
                  variant="outlined"
                  sx={{
                    color: '#3eb489',
                    borderColor: '#3eb489',
                    padding: '10px 24px',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: '#f4fcf9',
                      borderColor: '#2a8a67'
                    }
                  }}
                >
                  Previous
                </Button>
              )}
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              {currentStep < totalSteps ? (
                <Button 
                  onClick={handleNextStep}
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(135deg, #3eb489 0%, #52c9a0 100%)',
                    color: 'white',
                    padding: '10px 32px',
                    fontWeight: 600,
                    boxShadow: '0 2px 6px rgba(62, 180, 137, 0.15)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #2a8a67 0%, #3eb489 100%)',
                      boxShadow: '0 4px 12px rgba(62, 180, 137, 0.25)',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  Next
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  variant="contained"
                  disabled={!informationCorrect || !authorizationDebit || !termsAccepted || !employmentType || collateralDocuments.length === 0 || !documents['Guarantor ID Card']}
                  sx={{
                    background: (!informationCorrect || !authorizationDebit || !termsAccepted || !employmentType || collateralDocuments.length === 0 || !documents['Guarantor ID Card']) 
                      ? 'linear-gradient(135deg, #cccccc 0%, #999999 100%)'
                      : 'linear-gradient(135deg, #3eb489 0%, #52c9a0 100%)',
                    color: 'white',
                    padding: '10px 32px',
                    fontWeight: 600,
                    boxShadow: (!informationCorrect || !authorizationDebit || !termsAccepted || !employmentType || collateralDocuments.length === 0 || !documents['Guarantor ID Card']) 
                      ? 'none'
                      : '0 2px 6px rgba(62, 180, 137, 0.15)',
                    '&:hover': {
                      background: (!informationCorrect || !authorizationDebit || !termsAccepted || !employmentType || collateralDocuments.length === 0 || !documents['Guarantor ID Card'])
                        ? 'linear-gradient(135deg, #cccccc 0%, #999999 100%)'
                        : 'linear-gradient(135deg, #2a8a67 0%, #3eb489 100%)',
                      boxShadow: (!informationCorrect || !authorizationDebit || !termsAccepted || !employmentType || collateralDocuments.length === 0 || !documents['Guarantor ID Card'])
                        ? 'none'
                        : '0 4px 12px rgba(62, 180, 137, 0.25)',
                      transform: (!informationCorrect || !authorizationDebit || !termsAccepted || !employmentType || collateralDocuments.length === 0 || !documents['Guarantor ID Card'])
                        ? 'none'
                        : 'translateY(-1px)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  Create Loan Application
                </Button>
              )}
            </Box>
          </DialogActions>
        </form>
      </Dialog>

      {/* Action Dialog */}
      <Dialog 
        open={openActionDialog} 
        onClose={handleCloseActionDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          className: 'mint-dialog-paper',
          sx: { borderRadius: '16px', overflow: 'hidden' }
        }}
      >
        <DialogTitle 
          className="mint-dialog-header"
          sx={{ 
            background: actionType === 'Reject' 
              ? 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)'
              : actionType === 'ViewDocuments'
              ? 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)'
              : 'linear-gradient(135deg, #3eb489 0%, #52c9a0 100%)',
            color: 'white',
            padding: '24px 28px',
            borderBottom: `3px solid ${actionType === 'Reject' ? '#dc2626' : actionType === 'ViewDocuments' ? '#2563eb' : '#26d0a1'}`
          }}
        >
          <Box className="mint-dialog-title">
            {actionType === 'Reject' ? <Cancel sx={{ fontSize: 28 }} /> : 
             actionType === 'ViewDocuments' ? <Visibility sx={{ fontSize: 28 }} /> :
             <CheckCircle sx={{ fontSize: 28 }} />}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
                {actionType === 'AddRemarks' ? 'Add Remarks' : 
                 actionType === 'ViewDocuments' ? 'View Documents' :
                 actionType} Loan
              </Typography>
              <Typography className="mint-dialog-subtitle" variant="body2">
                {actionType === 'Reject' ? 'Provide reason for rejection' : 
                 actionType === 'AddRemarks' ? 'Add internal remarks or flag missing information' :
                 actionType === 'ViewDocuments' ? 'Review uploaded documents' :
                 `Confirm ${actionType.toLowerCase()} action`}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <form onSubmit={handleSubmitAction((data) => {
          console.log('=== FORM SUBMIT HANDLER CALLED ===');
          console.log('Form data:', data);
          console.log('Action type:', actionType);
          onSubmitAction(data);
        }, (errors) => {
          console.log('=== FORM VALIDATION ERRORS ===');
          console.log('Validation errors:', errors);
        })}>
            <DialogContent 
              className="mint-dialog-content"
              sx={{ 
                padding: '32px !important',
                background: 'linear-gradient(to bottom, #ffffff 0%, #f4fcf9 100%)',
                maxHeight: '75vh',
                overflowY: 'auto'
              }}
            >
            <Typography variant="body1" gutterBottom>
              Loan: {selectedLoan?.loanNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Customer: {selectedLoan?.customer?.firstName} {selectedLoan?.customer?.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Amount: GHS {parseFloat(selectedLoan?.totalAmount || selectedLoan?.amount || 0).toLocaleString()}
            </Typography>
            
            {actionType === 'ViewDocuments' ? (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>Uploaded Documents</Typography>
                {loadingDocuments ? (
                  <Typography variant="body2" color="text.secondary">
                    Loading documents...
                  </Typography>
                ) : loanDocuments.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No documents uploaded for this loan.
                  </Typography>
                ) : (
                  <Box sx={{ mt: 2 }}>
                    {loanDocuments.map((doc) => (
                      <Box key={doc.id} sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        p: 2, 
                        mb: 1, 
                        border: '1px solid #e0e0e0', 
                        borderRadius: 1,
                        backgroundColor: '#f9f9f9'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                          {getDocumentIcon(doc.fileName)}
                          <Box sx={{ ml: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {doc.fileName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {doc.documentType} • {formatFileSize(doc.fileSize)}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => viewDocument(doc.id, doc.fileName)}
                            sx={{ minWidth: 'auto', px: 1 }}
                          >
                            View
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => downloadDocument(doc.id, doc.fileName)}
                            sx={{ minWidth: 'auto', px: 1 }}
                          >
                            Download
                          </Button>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            ) : (
            <TextField
              fullWidth
              multiline
              rows={3}
                label={
                  actionType === 'Reject' ? 'Rejection Reason' : 
                  actionType === 'AddRemarks' ? 'Internal Remarks' :
                  `${actionType} Notes`
                }
                {...registerAction(
                  actionType === 'Reject' ? 'rejectionReason' : 
                  actionType === 'AddRemarks' ? 'reviewNotes' :
                  actionType === 'Verify' ? 'reviewNotes' :
                  'approvalNotes', 
                  {
                    required: `${actionType === 'AddRemarks' ? 'Remarks' : actionType} are required`
                  }
                )}
                error={!!errorsAction[actionType === 'Reject' ? 'rejectionReason' : 
                                actionType === 'AddRemarks' || actionType === 'Verify' ? 'reviewNotes' : 'approvalNotes']}
                helperText={errorsAction[actionType === 'Reject' ? 'rejectionReason' : 
                                  actionType === 'AddRemarks' || actionType === 'Verify' ? 'reviewNotes' : 'approvalNotes']?.message}
              sx={{ mt: 2 }}
                placeholder={
                  actionType === 'AddRemarks' ? 
                  'e.g., Missing payslip, ID expired, Income verification needed...' :
                  actionType === 'Reject' ?
                  'Please provide detailed reason for rejection...' :
                  'Add your notes here...'
                }
              />
            )}
          </DialogContent>
          <DialogActions 
            className="mint-dialog-actions"
            sx={{ 
              padding: '20px 28px !important',
              backgroundColor: '#f9fafb',
              borderTop: '1px solid #b8e6d5',
              gap: 2
            }}
          >
            <Button 
              onClick={handleCloseActionDialog}
              variant="outlined"
              sx={{
                borderColor: '#b8e6d5',
                color: '#2a8a67',
                '&:hover': {
                  borderColor: '#3eb489',
                  backgroundColor: '#f4fcf9'
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              onClick={() => {
                console.log('=== ACTION DIALOG SUBMIT BUTTON CLICKED ===');
                console.log('Action type:', actionType);
                console.log('Form errors:', errorsAction);
                console.log('Form values:', getValuesAction());
              }}
              sx={{
                background: actionType === 'Reject' 
                  ? 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)'
                  : actionType === 'ViewDocuments'
                  ? 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)'
                  : 'linear-gradient(135deg, #3eb489 0%, #52c9a0 100%)',
                color: 'white',
                padding: '10px 32px',
                fontWeight: 600,
                boxShadow: `0 2px 6px ${
                  actionType === 'Reject' ? 'rgba(239, 68, 68, 0.15)' : 
                  actionType === 'ViewDocuments' ? 'rgba(59, 130, 246, 0.15)' :
                  'rgba(62, 180, 137, 0.15)'
                }`,
                '&:hover': {
                  background: actionType === 'Reject'
                    ? 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)'
                    : actionType === 'ViewDocuments'
                    ? 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)'
                    : 'linear-gradient(135deg, #2a8a67 0%, #3eb489 100%)',
                  boxShadow: `0 4px 12px ${
                    actionType === 'Reject' ? 'rgba(239, 68, 68, 0.25)' : 
                    actionType === 'ViewDocuments' ? 'rgba(59, 130, 246, 0.25)' :
                    'rgba(62, 180, 137, 0.25)'
                  }`,
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              {actionType === 'AddRemarks' ? 'Add Remarks' : 
               actionType === 'ViewDocuments' ? 'Close' :
               actionType}
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
        <MenuItemComponent onClick={() => { 
          handleMenuClose(); 
          handleOpenLoanDetails(selectedLoan); 
        }}>
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

      {/* Loan Details Dialog */}
      <Dialog 
        open={openLoanDetailsDialog} 
        onClose={handleCloseLoanDetailsDialog} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          className: 'mint-dialog-paper',
          sx: { borderRadius: '16px', overflow: 'hidden' }
        }}
      >
        <DialogTitle 
          className="mint-dialog-header"
          sx={{ 
            background: 'linear-gradient(135deg, #3eb489 0%, #52c9a0 100%)',
            color: 'white',
            padding: '24px 28px',
            borderBottom: '3px solid #26d0a1'
          }}
        >
          <Box className="mint-dialog-title">
            <AccountBalance sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
                Loan Details
              </Typography>
              <Typography className="mint-dialog-subtitle" variant="body2">
                {selectedLoan?.loanNumber} - {selectedLoan?.customer?.firstName} {selectedLoan?.customer?.lastName}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent 
          className="mint-dialog-content"
          sx={{ 
            padding: '28px !important',
            background: 'linear-gradient(to bottom, #ffffff 0%, #f4fcf9 100%)',
            maxHeight: '70vh',
            overflow: 'auto'
          }}
        >
          {selectedLoan && (
            <>
              {/* Status Banner */}
              <Box sx={{ mb: 3, p: 2, borderRadius: 2, background: 'rgba(62, 180, 137, 0.1)', border: '1px solid rgba(62, 180, 137, 0.3)' }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Loan Status: {selectedLoan.status}
                </Typography>
                {user?.role === 'CREDIT_MANAGER' && selectedLoan.status === 'PENDING' && (
                  <Typography variant="body2" color="text.secondary">
                    ⏳ This loan is awaiting LPO verification before it can be processed by Credit Manager.
                  </Typography>
                )}
                {user?.role === 'LOAN_PROCESSING_OFFICER' && selectedLoan.status === 'PENDING' && (
                  <Typography variant="body2" color="text.secondary">
                    ✅ This loan is ready for your verification and document review.
                  </Typography>
                )}
                {selectedLoan.status === 'VERIFIED' && (
                  <Typography variant="body2" color="text.secondary">
                    ✅ Loan has been verified by LPO and is ready for Credit Manager review.
                  </Typography>
                )}
              </Box>
              
              <Grid container spacing={3}>
                {/* Loan Information */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', background: 'rgba(62, 180, 137, 0.05)' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Loan Information
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography><strong>Loan Number:</strong> {selectedLoan.loanNumber}</Typography>
                      <Typography><strong>Amount:</strong> GHS {parseFloat(selectedLoan.totalAmount || selectedLoan.amount || 0).toLocaleString()}</Typography>
                      <Typography><strong>Purpose:</strong> {selectedLoan.purposeOfLoan}</Typography>
                      <Typography><strong>Duration:</strong> {selectedLoan.loanDurationMonths} months</Typography>
                      <Typography><strong>Status:</strong> 
                        <Chip 
                          label={selectedLoan.status} 
                          color={getStatusColor(selectedLoan.status)}
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                      <Typography><strong>Created:</strong> {new Date(selectedLoan.createdAt).toLocaleDateString()}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Customer Information */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', background: 'rgba(62, 180, 137, 0.05)' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Customer Information
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography><strong>Name:</strong> {selectedLoan.customer?.firstName} {selectedLoan.customer?.lastName}</Typography>
                      <Typography><strong>Phone:</strong> {selectedLoan.customer?.phoneNumber}</Typography>
                      <Typography><strong>Email:</strong> {selectedLoan.customer?.email}</Typography>
                      <Typography><strong>ID:</strong> {selectedLoan.customer?.idCard}</Typography>
                      <Typography><strong>Address:</strong> {selectedLoan.customer?.address}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Financial Information */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', background: 'rgba(62, 180, 137, 0.05)' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Financial Information
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography><strong>Monthly Income:</strong> GHS {parseFloat(selectedLoan.netMonthlyIncome || 0).toLocaleString()}</Typography>
                      <Typography><strong>Annual Income:</strong> GHS {parseFloat(selectedLoan.grossAnnualIncome || 0).toLocaleString()}</Typography>
                      <Typography><strong>Monthly Expenses:</strong> GHS {parseFloat(selectedLoan.monthlyExpenses || 0).toLocaleString()}</Typography>
                      <Typography><strong>Disposable Income:</strong> GHS {parseFloat(selectedLoan.disposableIncome || 0).toLocaleString()}</Typography>
                      <Typography><strong>Existing Loans:</strong> {selectedLoan.existingLoans || 'None'}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Employment Information */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', background: 'rgba(62, 180, 137, 0.05)' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Employment Information
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography><strong>Employer:</strong> {selectedLoan.employerName}</Typography>
                      <Typography><strong>Position:</strong> {selectedLoan.positionHeld}</Typography>
                      <Typography><strong>Years in Job:</strong> {selectedLoan.yearsInCurrentJob}</Typography>
                      <Typography><strong>Employer Address:</strong> {selectedLoan.employerAddress}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Review Notes */}
              {selectedLoan.reviewNotes && (
                <Grid item xs={12}>
                  <Card sx={{ background: 'rgba(62, 180, 137, 0.05)' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary">
                        Review Notes
                      </Typography>
                      <Typography>{selectedLoan.reviewNotes}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Approval Notes */}
              {selectedLoan.approvalNotes && (
                <Grid item xs={12}>
                  <Card sx={{ background: 'rgba(62, 180, 137, 0.05)' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary">
                        Approval Notes
                      </Typography>
                      <Typography>{selectedLoan.approvalNotes}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Rejection Reason */}
              {selectedLoan.rejectionReason && (
                <Grid item xs={12}>
                  <Card sx={{ background: 'rgba(239, 68, 68, 0.05)' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="error">
                        Rejection Reason
                      </Typography>
                      <Typography>{selectedLoan.rejectionReason}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
            </>
          )}
        </DialogContent>
        
        <DialogActions 
          className="mint-dialog-actions"
          sx={{ 
            padding: '20px 28px !important',
            backgroundColor: '#f9fafb',
            borderTop: '1px solid #b8e6d5',
            gap: 2,
            flexWrap: 'wrap'
          }}
        >
          <Button 
            onClick={handleCloseLoanDetailsDialog}
            variant="outlined"
            sx={{
              borderColor: '#b8e6d5',
              color: '#2a8a67',
              '&:hover': {
                borderColor: '#3eb489',
                backgroundColor: '#f4fcf9'
              }
            }}
          >
            Close
          </Button>
          
          {/* Action Buttons based on role and loan status */}
          {selectedLoan && getAvailableActions(selectedLoan)?.map((action) => (
            <Button 
              key={action.type}
              onClick={() => {
                if (action.type === 'InfoOnly') {
                  // Show informational message
                  setSnackbar({ 
                    open: true, 
                    message: 'This loan is pending LPO verification before it can be processed by Credit Manager.', 
                    severity: 'info' 
                  });
                  return;
                }
                handleCloseLoanDetailsDialog();
                handleOpenActionDialog(selectedLoan, action.type);
              }}
              variant={action.type === 'InfoOnly' ? 'outlined' : 'contained'}
              sx={{
                background: action.type === 'Reject' 
                  ? 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)'
                  : action.type === 'ViewDocuments'
                  ? 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)'
                  : action.type === 'InfoOnly'
                  ? 'transparent'
                  : 'linear-gradient(135deg, #3eb489 0%, #52c9a0 100%)',
                color: action.type === 'InfoOnly' ? '#6b7280' : 'white',
                borderColor: action.type === 'InfoOnly' ? '#d1d5db' : 'transparent',
                padding: '10px 24px',
                fontWeight: 600,
                boxShadow: action.type === 'InfoOnly' ? 'none' : `0 2px 6px ${
                  action.type === 'Reject' ? 'rgba(239, 68, 68, 0.15)' : 
                  action.type === 'ViewDocuments' ? 'rgba(59, 130, 246, 0.15)' :
                  'rgba(62, 180, 137, 0.15)'
                }`,
                '&:hover': {
                  background: action.type === 'Reject'
                    ? 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)'
                    : action.type === 'ViewDocuments'
                    ? 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)'
                    : action.type === 'InfoOnly'
                    ? '#f3f4f6'
                    : 'linear-gradient(135deg, #2a8a67 0%, #3eb489 100%)',
                  boxShadow: action.type === 'InfoOnly' ? 'none' : `0 4px 12px ${
                    action.type === 'Reject' ? 'rgba(239, 68, 68, 0.25)' : 
                    action.type === 'ViewDocuments' ? 'rgba(59, 130, 246, 0.25)' :
                    'rgba(62, 180, 137, 0.25)'
                  }`,
                  transform: action.type === 'InfoOnly' ? 'none' : 'translateY(-1px)'
                },
                transition: 'all 0.2s ease',
                cursor: action.type === 'InfoOnly' ? 'default' : 'pointer'
              }}
            >
              {action.label}
            </Button>
          ))}
        </DialogActions>
      </Dialog>

      {/* Terms and Conditions Modal */}
      <Dialog 
        open={termsModalOpen} 
        onClose={handleCloseTermsModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
          }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #3eb489 0%, #52c9a0 100%)',
          color: 'white',
          textAlign: 'center',
          padding: '24px',
          fontWeight: 600,
          fontSize: '1.5rem'
        }}>
          Terms and Conditions
        </DialogTitle>
        <DialogContent sx={{ padding: '32px', maxHeight: '60vh', overflow: 'auto' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#2a8a67', mb: 2 }}>
            Loan Agreement Terms
          </Typography>
          
          <Typography variant="body1" paragraph sx={{ mb: 2 }}>
            By accepting this loan, you agree to the following terms and conditions:
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#2a8a67', mt: 3, mb: 1 }}>
            1. Loan Repayment
          </Typography>
          <Typography variant="body2" paragraph sx={{ mb: 2 }}>
            • You are required to make monthly payments on or before the due date specified in your loan agreement.<br/>
            • Late payments will incur additional charges as outlined in the loan schedule.<br/>
            • Failure to make payments may result in legal action to recover the outstanding amount.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#2a8a67', mt: 3, mb: 1 }}>
            2. Consequences of Loan Default
          </Typography>
          <Typography variant="body2" paragraph sx={{ mb: 2 }}>
            <strong>If you default on your loan payments, the following actions may be taken:</strong><br/><br/>
            • <strong>Credit Score Impact:</strong> Your credit score will be severely affected, making it difficult to obtain future loans, credit cards, or mortgages.<br/><br/>
            • <strong>Legal Action:</strong> We may pursue legal action to recover the outstanding amount, including court proceedings and asset seizure.<br/><br/>
            • <strong>Asset Seizure:</strong> Any collateral provided may be seized and sold to recover the loan amount.<br/><br/>
            • <strong>Blacklisting:</strong> Your name may be reported to credit bureaus and financial institutions, affecting your ability to access financial services.<br/><br/>
            • <strong>Additional Costs:</strong> You will be responsible for all legal fees, collection costs, and additional interest accrued during the default period.<br/><br/>
            • <strong>Garnishment:</strong> Your wages or bank accounts may be garnished to recover outstanding amounts.<br/><br/>
            • <strong>Property Liens:</strong> Liens may be placed on your property until the debt is fully satisfied.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#2a8a67', mt: 3, mb: 1 }}>
            3. Interest and Fees
          </Typography>
          <Typography variant="body2" paragraph sx={{ mb: 2 }}>
            • Interest will accrue on the outstanding principal amount at the rate specified in your loan agreement.<br/>
            • Additional fees may apply for late payments, returned checks, or account maintenance.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#2a8a67', mt: 3, mb: 1 }}>
            4. Right to Information
          </Typography>
          <Typography variant="body2" paragraph sx={{ mb: 2 }}>
            • You have the right to request a statement of your account at any time.<br/>
            • You must notify us immediately of any change in your contact information or financial circumstances.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#2a8a67', mt: 3, mb: 1 }}>
            5. Governing Law
          </Typography>
          <Typography variant="body2" paragraph sx={{ mb: 2 }}>
            This agreement is governed by the laws of Ghana and any disputes will be resolved in the courts of Ghana.
          </Typography>

          <Alert severity="warning" sx={{ mt: 3, backgroundColor: '#fff3cd', borderColor: '#ffeaa7' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              <strong>Important:</strong> Please read and understand all terms before accepting this loan. 
              Defaulting on your loan will have serious financial and legal consequences that may affect your future financial opportunities.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 32px', gap: 2 }}>
          <Button 
            onClick={handleCloseTermsModal}
            variant="outlined"
            sx={{
              borderColor: '#b8e6d5',
              color: '#2a8a67',
              '&:hover': {
                borderColor: '#3eb489',
                backgroundColor: '#f4fcf9'
              }
            }}
          >
            Close
          </Button>
          <Button 
            onClick={() => {
              setTermsAccepted(true);
              handleCloseTermsModal();
            }}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #3eb489 0%, #52c9a0 100%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #2a8a67 0%, #3eb489 100%)'
              }
            }}
          >
            I Accept Terms
          </Button>
        </DialogActions>
      </Dialog>

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

      {/* Document Viewer Modal */}
      <Dialog
        open={documentViewerOpen}
        onClose={() => {
          setDocumentViewerOpen(false);
          if (viewingDocument?.url) {
            window.URL.revokeObjectURL(viewingDocument.url);
          }
          setViewingDocument(null);
        }}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {viewingDocument && getDocumentIcon(viewingDocument.fileName)}
            <Typography variant="h6" sx={{ ml: 1 }}>
              {viewingDocument?.fileName || 'Document Viewer'}
            </Typography>
          </Box>
          <IconButton 
            onClick={() => {
              setDocumentViewerOpen(false);
              if (viewingDocument?.url) {
                window.URL.revokeObjectURL(viewingDocument.url);
              }
              setViewingDocument(null);
            }}
          >
            <Cancel />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: '100%', overflow: 'hidden' }}>
          {viewingDocument && (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {viewingDocument.fileName.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={`${viewingDocument.url}#toolbar=1&navpanes=1&scrollbar=1`}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none'
                  }}
                  title={viewingDocument.fileName}
                  type="application/pdf"
                />
              ) : viewingDocument.fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/) ? (
                <Box sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: '#f9f9f9',
                  p: 2
                }}>
                  <img
                    src={viewingDocument.url}
                    alt={viewingDocument.fileName}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      borderRadius: '8px'
                    }}
                  />
                </Box>
              ) : (
                <Box sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexDirection: 'column',
                  backgroundColor: '#f9f9f9'
                }}>
                  <Description sx={{ fontSize: 64, color: '#666', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Document Preview Not Available
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    This file type cannot be previewed in the browser.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = viewingDocument.url;
                      link.download = viewingDocument.fileName;
                      link.click();
                    }}
                    startIcon={<Download />}
                  >
                    Download File
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default LoanManagement;
