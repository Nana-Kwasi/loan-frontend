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
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Menu
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Delete,
  MoreVert,
  Person,
  Phone,
  Email,
  LocationOn,
  Work
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import axios from 'axios';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('/api/csa/customers');
      // Ensure we always set an array
      setCustomers(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]); // Set empty array on error
      setLoading(false);
      setSnackbar({ 
        open: true, 
        message: 'Error fetching customers: ' + (error.response?.data?.message || error.message), 
        severity: 'error' 
      });
    }
  };

  const handleOpenDialog = (customer = null) => {
    setEditingCustomer(customer);
    if (customer) {
      reset({
        name: customer.name,
        maritalStatus: customer.maritalStatus,
        employmentStatus: customer.employmentStatus,
        employerName: customer.employerName,
        dateOfBirth: customer.dateOfBirth,
        idType: customer.idType,
        idCard: customer.idCard,
        address: customer.address,
        phoneNumber: customer.phoneNumber
      });
    } else {
      reset();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCustomer(null);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      if (editingCustomer) {
        await axios.put(`/api/csa/customers/${editingCustomer.id}`, data);
        setSnackbar({ open: true, message: 'Customer updated successfully', severity: 'success' });
      } else {
        await axios.post('/api/csa/customers', data);
        setSnackbar({ open: true, message: 'Customer created successfully', severity: 'success' });
      }
      fetchCustomers();
      handleCloseDialog();
    } catch (error) {
      console.error('Customer save error:', error);
      console.error('Error response:', error.response);
      
      let errorMessage = 'Error saving customer';
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.errors) {
          // Handle validation errors
          const validationErrors = Object.values(error.response.data.errors).flat();
          errorMessage = validationErrors.join(', ');
        } else if (typeof error.response.data === 'object') {
          // Backend may return a plain field->message map
          try {
            const values = Object.values(error.response.data).filter(Boolean);
            if (values.length) errorMessage = values.join(', ');
          } catch (_) {}
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setSnackbar({ 
        open: true, 
        message: errorMessage, 
        severity: 'error' 
      });
    }
  };

  const handleDelete = async (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await axios.delete(`/api/csa/customers/${customerId}`);
        setSnackbar({ open: true, message: 'Customer deleted successfully', severity: 'success' });
        fetchCustomers();
      } catch (error) {
        setSnackbar({ 
          open: true, 
          message: error.response?.data?.message || 'Error deleting customer', 
          severity: 'error' 
        });
      }
    }
    setAnchorEl(null);
  };

  const handleMenuOpen = (event, customer) => {
    setAnchorEl(event.currentTarget);
    setSelectedCustomer(customer);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCustomer(null);
  };

  const filteredCustomers = Array.isArray(customers) ? customers.filter(customer =>
    customer.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm) ||
    customer.customerId?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Customer Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Customer
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Customer ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Phone Number</TableCell>
              <TableCell>ID Type</TableCell>
              <TableCell>ID Number</TableCell>
              <TableCell>Employment Status</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>{customer.customerId}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Person sx={{ mr: 1 }} />
                    {customer.name}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Phone sx={{ mr: 1, fontSize: 16 }} />
                    {customer.phoneNumber}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={customer.idType || 'N/A'}
                    color="info"
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {customer.idCard || 'N/A'}
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Work sx={{ mr: 1, fontSize: 16 }} />
                    {customer.employmentStatus || 'N/A'}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={customer.status}
                    color={customer.status === 'ACTIVE' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={(e) => handleMenuOpen(e, customer)}>
                    <MoreVert />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Customer Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  {...register('name', { 
                    required: 'Full name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' },
                    maxLength: { value: 100, message: 'Name cannot exceed 100 characters' }
                  })}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Marital Status</InputLabel>
                  <Select
                    {...register('maritalStatus', { required: 'Marital status is required' })}
                    label="Marital Status"
                    error={!!errors.maritalStatus}
                  >
                    <MenuItem value="Single">Single</MenuItem>
                    <MenuItem value="Married">Married</MenuItem>
                    <MenuItem value="Divorced">Divorced</MenuItem>
                    <MenuItem value="Widowed">Widowed</MenuItem>
                  </Select>
                </FormControl>
                {errors.maritalStatus && (
                  <Typography color="error" variant="caption">
                    {errors.maritalStatus.message}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Employment Status</InputLabel>
                  <Select
                    {...register('employmentStatus', { required: 'Employment status is required' })}
                    label="Employment Status"
                    error={!!errors.employmentStatus}
                  >
                    <MenuItem value="Employed">Employed</MenuItem>
                    <MenuItem value="Self-Employed">Self-Employed</MenuItem>
                    <MenuItem value="Unemployed">Unemployed</MenuItem>
                    <MenuItem value="Student">Student</MenuItem>
                    <MenuItem value="Retired">Retired</MenuItem>
                  </Select>
                </FormControl>
                {errors.employmentStatus && (
                  <Typography color="error" variant="caption">
                    {errors.employmentStatus.message}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Employer Name"
                  {...register('employerName', { required: 'Employer name is required' })}
                  error={!!errors.employerName}
                  helperText={errors.employerName?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  {...register('dateOfBirth', { required: 'Date of birth is required' })}
                  error={!!errors.dateOfBirth}
                  helperText={errors.dateOfBirth?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>ID Type</InputLabel>
                  <Select
                    {...register('idType', { required: 'ID type is required' })}
                    label="ID Type"
                    error={!!errors.idType}
                  >
                    <MenuItem value="GHANA_CARD">Ghana Card</MenuItem>
                    <MenuItem value="VOTERS_ID">Voters ID</MenuItem>
                    <MenuItem value="PASSPORT">Passport</MenuItem>
                  </Select>
                </FormControl>
                {errors.idType && (
                  <Typography color="error" variant="caption">
                    {errors.idType.message}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ID Card Number"
                  {...register('idCard', { 
                    required: 'ID card number is required',
                    minLength: { value: 5, message: 'ID card number must be at least 5 characters' },
                    maxLength: { value: 20, message: 'ID card number cannot exceed 20 characters' }
                  })}
                  error={!!errors.idCard}
                  helperText={errors.idCard?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  multiline
                  rows={2}
                  {...register('address', { 
                    required: 'Address is required',
                    minLength: { value: 10, message: 'Address must be at least 10 characters' },
                    maxLength: { value: 500, message: 'Address cannot exceed 500 characters' }
                  })}
                  error={!!errors.address}
                  helperText={errors.address?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  {...register('phoneNumber', { 
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[0-9+\-\s()]+$/,
                      message: 'Please enter a valid phone number'
                    },
                    minLength: { value: 10, message: 'Phone number must be at least 10 digits' }
                  })}
                  error={!!errors.phoneNumber}
                  helperText={errors.phoneNumber?.message}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingCustomer ? 'Update' : 'Create'}
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
        <MenuItem onClick={() => { handleOpenDialog(selectedCustomer); handleMenuClose(); }}>
          <Edit sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleDelete(selectedCustomer?.id)}>
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
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

export default CustomerManagement;
