import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Grid,
  Alert,
  Snackbar,
  Pagination
} from '@mui/material';
import {
  Search,
  FilterList,
  Person,
  CalendarToday,
  Computer,
  Refresh
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const AuditLogs = () => {
  const { user } = useAuth();
  const [auditLogs, setAuditLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(1);
  const [logsPerPage] = useState(10);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [auditLogs, searchTerm, actionFilter, entityFilter, userFilter]);

  const fetchAuditLogs = async () => {
    try {
      const response = await axios.get('/api/audit-logs');
      setAuditLogs(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setLoading(false);
      setSnackbar({ 
        open: true, 
        message: 'Error fetching audit logs: ' + (error.response?.data?.message || error.message), 
        severity: 'error' 
      });
    }
  };

  const applyFilters = () => {
    let filtered = [...auditLogs];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entityType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ipAddress?.includes(searchTerm) ||
        log.userAgent?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Action filter
    if (actionFilter) {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    // Entity filter
    if (entityFilter) {
      filtered = filtered.filter(log => log.entityType === entityFilter);
    }

    // User filter
    if (userFilter) {
      filtered = filtered.filter(log => log.user?.username === userFilter);
    }

    setFilteredLogs(filtered);
    setPage(1); // Reset to first page when filters change
  };

  const getActionColor = (action) => {
    if (action?.includes('CREATE')) return 'success';
    if (action?.includes('UPDATE')) return 'warning';
    if (action?.includes('DELETE')) return 'error';
    if (action?.includes('LOGIN')) return 'info';
    if (action?.includes('APPROVE')) return 'success';
    if (action?.includes('REJECT')) return 'error';
    return 'default';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getUniqueValues = (array, key) => {
    const values = array.map(item => item[key]).filter(Boolean);
    return [...new Set(values)];
  };

  const getUniqueUsers = () => {
    const users = auditLogs.map(log => log.user?.username).filter(Boolean);
    return [...new Set(users)];
  };

  // Pagination
  const indexOfLastLog = page * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  if (loading) {
    return <Typography>Loading audit logs...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Audit Logs
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Total Logs
                  </Typography>
                  <Typography variant="h6">
                    {auditLogs.length}
                  </Typography>
                </Box>
                <Computer color="primary" />
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
                    Unique Users
                  </Typography>
                  <Typography variant="h6">
                    {getUniqueUsers().length}
                  </Typography>
                </Box>
                <Person color="info" />
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
                    Filtered Results
                  </Typography>
                  <Typography variant="h6">
                    {filteredLogs.length}
                  </Typography>
                </Box>
                <FilterList color="warning" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Search"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1 }} />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Action</InputLabel>
              <Select
                value={actionFilter}
                label="Action"
                onChange={(e) => setActionFilter(e.target.value)}
              >
                <MenuItem value="">All Actions</MenuItem>
                {getUniqueValues(auditLogs, 'action').map(action => (
                  <MenuItem key={action} value={action}>{action}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Entity</InputLabel>
              <Select
                value={entityFilter}
                label="Entity"
                onChange={(e) => setEntityFilter(e.target.value)}
              >
                <MenuItem value="">All Entities</MenuItem>
                {getUniqueValues(auditLogs, 'entityType').map(entity => (
                  <MenuItem key={entity} value={entity}>{entity}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>User</InputLabel>
              <Select
                value={userFilter}
                label="User"
                onChange={(e) => setUserFilter(e.target.value)}
              >
                <MenuItem value="">All Users</MenuItem>
                {getUniqueUsers().map(username => (
                  <MenuItem key={username} value={username}>{username}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchAuditLogs}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Audit Logs Table */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Audit Trail
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Entity</TableCell>
                <TableCell>Entity ID</TableCell>
                <TableCell>IP Address</TableCell>
                <TableCell>User Agent</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <CalendarToday sx={{ mr: 1, fontSize: 16 }} />
                      {formatDate(log.createdAt)}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Person sx={{ mr: 1, fontSize: 16 }} />
                      {log.user?.username || 'System'}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={log.action}
                      color={getActionColor(log.action)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{log.entityType}</TableCell>
                  <TableCell>{log.entityId || 'N/A'}</TableCell>
                  <TableCell>{log.ipAddress || 'N/A'}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {log.userAgent || 'N/A'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        )}
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

export default AuditLogs;
