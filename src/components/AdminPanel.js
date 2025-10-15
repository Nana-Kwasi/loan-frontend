import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  Snackbar
} from '@mui/material';
import {
  People,
  Settings,
  Security,
  MoreVert,
  Edit,
  Delete,
  Add,
  Save,
  PersonAdd,
  SettingsApplications
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const AdminPanel = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [systemSettings, setSystemSettings] = useState([]);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openSettingsDialog, setOpenSettingsDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingSetting, setEditingSetting] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const userForm = useForm();
  const settingsForm = useForm();
  
  const { register: registerUser, handleSubmit: handleSubmitUser, reset: resetUser, formState: { errors: userErrors }, getValues: getUserValues, trigger: triggerUser } = userForm;
  const { register: registerSettings, handleSubmit: handleSubmitSettings, reset: resetSettings, formState: { errors: settingsErrors } } = settingsForm;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersResponse, settingsResponse] = await Promise.all([
        axios.get('/api/admin/users'),
        axios.get('/api/admin/system-settings')
      ]);
      setUsers(Array.isArray(usersResponse.data) ? usersResponse.data : []);
      setSystemSettings(Array.isArray(settingsResponse.data) ? settingsResponse.data : []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setSnackbar({ 
        open: true, 
        message: 'Error fetching data: ' + (error.response?.data?.message || error.message), 
        severity: 'error' 
      });
    }
  };

  const handleOpenUserDialog = (user = null) => {
    setEditingUser(user);
    if (user) {
      resetUser({
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        branch: user.branch,
        phone: user.phone,
        status: user.status
      });
    } else {
      resetUser({
        role: 'CSA',
        status: 'ACTIVE'
      });
    }
    setOpenUserDialog(true);
  };

  const handleCloseUserDialog = () => {
    setOpenUserDialog(false);
    setEditingUser(null);
    resetUser();
  };

  const handleOpenSettingsDialog = (setting = null) => {
    setEditingSetting(setting);
    if (setting) {
      resetSettings({
        settingKey: setting.settingKey,
        settingValue: setting.settingValue,
        description: setting.description
      });
    } else {
      resetSettings();
    }
    setOpenSettingsDialog(true);
  };

  const handleCloseSettingsDialog = () => {
    setOpenSettingsDialog(false);
    setEditingSetting(null);
    resetSettings();
  };

  const onSubmitUser = async (data) => {
    console.log('AdminPanel onSubmitUser clicked with data:', data);
    console.log('User form errors:', userErrors);
    console.log('Editing user:', editingUser);
    
    // Check for validation errors
    if (Object.keys(userErrors).length > 0) {
      console.error('User form has validation errors:', userErrors);
      setSnackbar({ 
        open: true, 
        message: 'Please fix form errors before submitting', 
        severity: 'error' 
      });
      return;
    }
    
    try {
      if (editingUser) {
        console.log('Updating user id:', editingUser.id);
        const response = await axios.put(`/api/admin/users/${editingUser.id}`, data);
        console.log('Update response:', response);
        setSnackbar({ open: true, message: 'User updated successfully', severity: 'success' });
      } else {
        // Use provided temp password if set, else fallback
        const tempPassword = data.tempPassword && data.tempPassword.trim() ? data.tempPassword : 'Password123!';
        console.log('Creating user with temp password:', tempPassword);
        const response = await axios.post('/api/admin/users', { ...data, password: tempPassword });
        console.log('Create response:', response);
        setSnackbar({ open: true, message: 'User created successfully', severity: 'success' });
      }
      fetchData();
      handleCloseUserDialog();
    } catch (error) {
      console.error('AdminPanel onSubmitUser error:', error);
      console.error('Error response:', error.response);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || error.message || 'Error saving user', 
        severity: 'error' 
      });
    }
  };

  const onSubmitSetting = async (data) => {
    try {
      if (editingSetting) {
        await axios.put(`/api/admin/system-settings/${editingSetting.id}`, data);
        setSnackbar({ open: true, message: 'Setting updated successfully', severity: 'success' });
      } else {
        await axios.post('/api/admin/system-settings', data);
        setSnackbar({ open: true, message: 'Setting created successfully', severity: 'success' });
      }
      fetchData();
      handleCloseSettingsDialog();
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Error saving setting', 
        severity: 'error' 
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/admin/users/${userId}`);
        setSnackbar({ open: true, message: 'User deleted successfully', severity: 'success' });
        fetchData();
      } catch (error) {
        setSnackbar({ 
          open: true, 
          message: error.response?.data?.message || 'Error deleting user', 
          severity: 'error' 
        });
      }
    }
    setAnchorEl(null);
  };

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'SYSTEM_ADMIN': return 'error';
      case 'CREDIT_MANAGER': return 'warning';
      case 'BRANCH_MANAGER': return 'info';
      case 'LOAN_OFFICER': return 'primary';
      case 'CSA': return 'success';
      case 'COMPLIANCE_OFFICER': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Panel
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab icon={<People />} label="User Management" />
            <Tab icon={<Settings />} label="System Settings" />
          </Tabs>
        </CardContent>
      </Card>

      {/* User Management Tab */}
      {tabValue === 0 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">User Management</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenUserDialog()}
            >
              Add User
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Branch</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.firstName} {user.lastName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role?.replace('_', ' ')}
                        color={getRoleColor(user.role)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{user.branch || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.status}
                        color={user.status === 'ACTIVE' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={(e) => handleMenuOpen(e, user)}>
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* System Settings Tab */}
      {tabValue === 1 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">System Settings</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenSettingsDialog()}
            >
              Add Setting
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Setting Key</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {systemSettings.map((setting) => (
                  <TableRow key={setting.id}>
                    <TableCell>{setting.settingKey}</TableCell>
                    <TableCell>{setting.settingValue}</TableCell>
                    <TableCell>{setting.description}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleOpenSettingsDialog(setting)}>
                        <Edit />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* User Dialog */}
      <Dialog 
        open={openUserDialog} 
        onClose={handleCloseUserDialog} 
        maxWidth="md" 
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
            <PersonAdd sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
          {editingUser ? 'Edit User' : 'Add New User'}
              </Typography>
              <Typography className="mint-dialog-subtitle" variant="body2">
                {editingUser ? 'Update user information and permissions' : 'Create a new user account for the system'}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <form onSubmit={handleSubmitUser(onSubmitUser)}>
          <DialogContent 
            className="mint-dialog-content"
            sx={{ 
              padding: '28px !important',
              background: 'linear-gradient(to bottom, #ffffff 0%, #f4fcf9 100%)'
            }}
          >
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Username"
                  {...registerUser('username', { required: 'Username is required' })}
                  error={!!userErrors.username}
                  helperText={userErrors.username?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  {...registerUser('email', { required: 'Email is required' })}
                  error={!!userErrors.email}
                  helperText={userErrors.email?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  {...registerUser('firstName', { required: 'First name is required' })}
                  error={!!userErrors.firstName}
                  helperText={userErrors.firstName?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  {...registerUser('lastName', { required: 'Last name is required' })}
                  error={!!userErrors.lastName}
                  helperText={userErrors.lastName?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Role"
                  select
                  {...registerUser('role', { required: 'Role is required' })}
                  error={!!userErrors.role}
                  helperText={userErrors.role?.message}
                  sx={{ 
                    '& .MuiSelect-root': { width: '100% !important' },
                    '& .MuiSelect-select': { width: '100% !important', paddingRight: '40px !important' },
                    '& .MuiOutlinedInput-root': { width: '100% !important' },
                    '& .MuiInputBase-root': { width: '100% !important' }
                  }}
                >
                  <MenuItem value="SYSTEM_ADMIN">System Admin (IT Admin)</MenuItem>
                  <MenuItem value="CSA">Customer Service Agent</MenuItem>
                  <MenuItem value="LOAN_PROCESSING_OFFICER">Loan Processing Officer</MenuItem>
                  <MenuItem value="CREDIT_MANAGER">Credit Manager</MenuItem>
                  <MenuItem value="COMPLIANCE_OFFICER">Compliance/Audit Officer</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Branch"
                  {...registerUser('branch')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  {...registerUser('phone', {
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: 'Phone number must be exactly 10 digits'
                    }
                  })}
                  error={!!userErrors.phone}
                  helperText={userErrors.phone?.message || 'Enter 10-digit phone number (e.g., 0241234567)'}
                  placeholder="0241234567"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Status"
                  select
                  {...registerUser('status', { required: 'Status is required' })}
                  error={!!userErrors.status}
                  helperText={userErrors.status?.message}
                  sx={{ 
                    '& .MuiSelect-root': { width: '100% !important' },
                    '& .MuiSelect-select': { width: '100% !important', paddingRight: '40px !important' },
                    '& .MuiOutlinedInput-root': { width: '100% !important' },
                    '& .MuiInputBase-root': { width: '100% !important' }
                  }}
                >
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                  <MenuItem value="SUSPENDED">Suspended</MenuItem>
                </TextField>
              </Grid>
              {!editingUser && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Temporary Password (will require change on first login)"
                    type="password"
                    {...registerUser('tempPassword')}
                    placeholder="Leave empty for default: Password123!"
                    helperText="User will be required to change this password on first login"
                  />
                </Grid>
              )}
            </Grid>
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
              onClick={handleCloseUserDialog}
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
              onClick={async (e) => {
                console.log('Button clicked!', e);
                console.log('Current user form values:', getUserValues());
                console.log('User form errors:', userErrors);
                
                // Trigger validation
                const isValid = await triggerUser();
                console.log('User form is valid:', isValid);
                
                if (isValid) {
                  console.log('User form is valid, submitting...');
                  const formData = getUserValues();
                  onSubmitUser(formData);
                } else {
                  console.log('User form validation failed');
                }
              }}
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
              {editingUser ? 'Update User' : 'Create User'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog 
        open={openSettingsDialog} 
        onClose={handleCloseSettingsDialog} 
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
            background: 'linear-gradient(135deg, #3eb489 0%, #52c9a0 100%)',
            color: 'white',
            padding: '24px 28px',
            borderBottom: '3px solid #26d0a1'
          }}
        >
          <Box className="mint-dialog-title">
            <SettingsApplications sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
                {editingSetting ? 'Edit System Setting' : 'Add New Setting'}
              </Typography>
              <Typography className="mint-dialog-subtitle" variant="body2">
                {editingSetting ? 'Modify system configuration' : 'Configure a new system parameter'}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <form onSubmit={handleSubmitSettings(onSubmitSetting)}>
          <DialogContent 
            className="mint-dialog-content"
            sx={{ 
              padding: '28px !important',
              background: 'linear-gradient(to bottom, #ffffff 0%, #f4fcf9 100%)'
            }}
          >
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Setting Key"
                  {...registerSettings('settingKey', { required: 'Setting key is required' })}
                  error={!!settingsErrors.settingKey}
                  helperText={settingsErrors.settingKey?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Setting Value"
                  {...registerSettings('settingValue', { required: 'Setting value is required' })}
                  error={!!settingsErrors.settingValue}
                  helperText={settingsErrors.settingValue?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  {...registerSettings('description')}
                />
              </Grid>
            </Grid>
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
              onClick={handleCloseSettingsDialog}
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
              {editingSetting ? 'Update Setting' : 'Create Setting'}
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
        <MenuItem onClick={() => { handleOpenUserDialog(selectedUser); handleMenuClose(); }}>
          <Edit sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleDeleteUser(selectedUser?.id)}>
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
        {/* Enable/Disable actions */}
        <MenuItem onClick={async () => {
          try {
            if (!selectedUser) return;
            const newStatus = selectedUser.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
            console.log('Toggling user status', selectedUser.id, '->', newStatus);
            await axios.put(`/api/admin/users/${selectedUser.id}`, { ...selectedUser, status: newStatus });
            setSnackbar({ open: true, message: `User ${newStatus === 'ACTIVE' ? 'enabled' : 'disabled'}`, severity: 'success' });
            fetchData();
          } catch (e) {
            console.error('Toggle user status error:', e);
            setSnackbar({ open: true, message: e.response?.data?.message || 'Error toggling user status', severity: 'error' });
          }
          handleMenuClose();
        }}>
          <Save sx={{ mr: 1 }} />
          {selectedUser?.status === 'ACTIVE' ? 'Disable' : 'Enable'}
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

export default AdminPanel;
