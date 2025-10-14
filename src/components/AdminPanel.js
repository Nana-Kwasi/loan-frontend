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
  Save
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

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

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
      reset({
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
      reset({
        role: 'CSA',
        status: 'ACTIVE'
      });
    }
    setOpenUserDialog(true);
  };

  const handleCloseUserDialog = () => {
    setOpenUserDialog(false);
    setEditingUser(null);
    reset();
  };

  const handleOpenSettingsDialog = (setting = null) => {
    setEditingSetting(setting);
    if (setting) {
      reset({
        settingKey: setting.settingKey,
        settingValue: setting.settingValue,
        description: setting.description
      });
    } else {
      reset();
    }
    setOpenSettingsDialog(true);
  };

  const handleCloseSettingsDialog = () => {
    setOpenSettingsDialog(false);
    setEditingSetting(null);
    reset();
  };

  const onSubmitUser = async (data) => {
    try {
      if (editingUser) {
        await axios.put(`/api/admin/users/${editingUser.id}`, data);
        setSnackbar({ open: true, message: 'User updated successfully', severity: 'success' });
      } else {
        await axios.post('/api/admin/users', { ...data, password: 'password123' });
        setSnackbar({ open: true, message: 'User created successfully', severity: 'success' });
      }
      fetchData();
      handleCloseUserDialog();
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Error saving user', 
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
      <Dialog open={openUserDialog} onClose={handleCloseUserDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmitUser)}>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Username"
                  {...register('username', { required: 'Username is required' })}
                  error={!!errors.username}
                  helperText={errors.username?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  {...register('firstName', { required: 'First name is required' })}
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  {...register('lastName', { required: 'Last name is required' })}
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Role"
                  select
                  {...register('role', { required: 'Role is required' })}
                  error={!!errors.role}
                  helperText={errors.role?.message}
                >
                  <MenuItem value="SYSTEM_ADMIN">System Admin</MenuItem>
                  <MenuItem value="CREDIT_MANAGER">Credit Manager</MenuItem>
                  <MenuItem value="BRANCH_MANAGER">Branch Manager</MenuItem>
                  <MenuItem value="LOAN_OFFICER">Loan Officer</MenuItem>
                  <MenuItem value="CSA">CSA</MenuItem>
                  <MenuItem value="COMPLIANCE_OFFICER">Compliance Officer</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Branch"
                  {...register('branch')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  {...register('phone')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Status"
                  select
                  {...register('status', { required: 'Status is required' })}
                  error={!!errors.status}
                  helperText={errors.status?.message}
                >
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                  <MenuItem value="SUSPENDED">Suspended</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseUserDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingUser ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={openSettingsDialog} onClose={handleCloseSettingsDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingSetting ? 'Edit Setting' : 'Add New Setting'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmitSetting)}>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Setting Key"
                  {...register('settingKey', { required: 'Setting key is required' })}
                  error={!!errors.settingKey}
                  helperText={errors.settingKey?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Setting Value"
                  {...register('settingValue', { required: 'Setting value is required' })}
                  error={!!errors.settingValue}
                  helperText={errors.settingValue?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  {...register('description')}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseSettingsDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingSetting ? 'Update' : 'Create'}
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
