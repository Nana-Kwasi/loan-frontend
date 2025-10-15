// import React, { useState, useEffect } from 'react';
// import {
//   Grid,
//   Paper,
//   Typography,
//   Box,
//   Card,
//   CardContent,
//   List,
//   ListItem,
//   ListItemText,
//   Chip,
//   Button
// } from '@mui/material';
// import {
//   AccountBalance,
//   People,
//   TrendingUp,
//   Warning,
//   CheckCircle,
//   Schedule,
//   Cancel
// } from '@mui/icons-material';
// import { useAuth } from '../contexts/AuthContext';
// import axios from 'axios';

// const Dashboard = () => {
//   const { user } = useAuth();
//   const [stats, setStats] = useState({
//     totalLoans: 0,
//     pendingLoans: 0,
//     approvedLoans: 0,
//     rejectedLoans: 0,
//     totalCustomers: 0,
//     totalAmount: 0
//   });
//   const [recentLoans, setRecentLoans] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     try {
//       const [loansResponse, customersResponse] = await Promise.all([
//         axios.get('/api/loans'),
//         axios.get('/api/customers')
//       ]);

//       const loans = Array.isArray(loansResponse.data) ? loansResponse.data : [];
//       const customers = Array.isArray(customersResponse.data) ? customersResponse.data : [];

//       const totalLoans = loans.length;
//       const pendingLoans = loans.filter(loan => loan.status === 'PENDING').length;
//       const approvedLoans = loans.filter(loan => loan.status === 'APPROVED').length;
//       const rejectedLoans = loans.filter(loan => loan.status === 'REJECTED').length;
//       const totalCustomers = customers.length;
//       const totalAmount = loans.reduce((sum, loan) => sum + parseFloat(loan.totalAmount || loan.amount || 0), 0);

//       setStats({
//         totalLoans,
//         pendingLoans,
//         approvedLoans,
//         rejectedLoans,
//         totalCustomers,
//         totalAmount
//       });

//       setRecentLoans(loans.slice(0, 5));
//       setLoading(false);
//     } catch (error) {
//       console.error('Error fetching dashboard data:', error);
//       setStats({
//         totalLoans: 0,
//         pendingLoans: 0,
//         approvedLoans: 0,
//         rejectedLoans: 0,
//         totalCustomers: 0,
//         totalAmount: 0
//       });
//       setRecentLoans([]);
//       setLoading(false);
//     }
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'PENDING': return 'warning';
//       case 'APPROVED': return 'success';
//       case 'REJECTED': return 'error';
//       case 'VERIFIED': return 'info';
//       case 'DISBURSED': return 'primary';
//       default: return 'default';
//     }
//   };

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case 'PENDING': return <Schedule />;
//       case 'APPROVED': return <CheckCircle />;
//       case 'REJECTED': return <Cancel />;
//       case 'VERIFIED': return <CheckCircle />;
//       case 'DISBURSED': return <AccountBalance />;
//       default: return <Warning />;
//     }
//   };

//   const StatCard = ({ title, value, icon, color = 'primary' }) => (
//     <Card>
//       <CardContent>
//         <Box display="flex" alignItems="center" justifyContent="space-between">
//           <Box>
//             <Typography color="textSecondary" gutterBottom variant="h6">
//               {title}
//             </Typography>
//             <Typography variant="h4">
//               {value}
//             </Typography>
//           </Box>
//           <Box color={`${color}.main`}>
//             {icon}
//           </Box>
//         </Box>
//       </CardContent>
//     </Card>
//   );

//   if (loading) {
//     return <Typography>Loading dashboard...</Typography>;
//   }

//   return (
//     <Box>
//       <Typography variant="h4" gutterBottom>
//         Welcome back, {user?.firstName}!
//       </Typography>
//       <Typography variant="subtitle1" color="text.secondary" gutterBottom>
//         {user?.role?.replace('_', ' ')} • {user?.branch}
//       </Typography>

//       <Grid container spacing={3} sx={{ mt: 2 }}>
//         {/* Stats Cards */}
//         <Grid item xs={12} sm={6} md={2}>
//           <StatCard
//             title="Total Loans"
//             value={stats.totalLoans}
//             icon={<AccountBalance />}
//             color="primary"
//           />
//         </Grid>
//         <Grid item xs={12} sm={6} md={2}>
//           <StatCard
//             title="Pending"
//             value={stats.pendingLoans}
//             icon={<Schedule />}
//             color="warning"
//           />
//         </Grid>
//         <Grid item xs={12} sm={6} md={2}>
//           <StatCard
//             title="Approved"
//             value={stats.approvedLoans}
//             icon={<CheckCircle />}
//             color="success"
//           />
//         </Grid>
//         <Grid item xs={12} sm={6} md={2}>
//           <StatCard
//             title="Rejected"
//             value={stats.rejectedLoans}
//             icon={<Cancel />}
//             color="error"
//           />
//         </Grid>
//         <Grid item xs={12} sm={6} md={2}>
//           <StatCard
//             title="Customers"
//             value={stats.totalCustomers}
//             icon={<People />}
//             color="info"
//           />
//         </Grid>
//         <Grid item xs={12} sm={6} md={2}>
//           <StatCard
//             title="Total Amount"
//             value={`$${stats.totalAmount.toLocaleString()}`}
//             icon={<TrendingUp />}
//             color="secondary"
//           />
//         </Grid>

//         {/* Recent Loans */}
//         <Grid item xs={12} md={8}>
//           <Paper sx={{ p: 2 }}>
//             <Typography variant="h6" gutterBottom>
//               Recent Loan Applications
//             </Typography>
//             <List>
//               {recentLoans.map((loan) => (
//                 <ListItem key={loan.id} divider>
//                   <ListItemText
//                     primary={
//                       <Box display="flex" alignItems="center" gap={1}>
//                         <Typography variant="subtitle1">
//                           {loan.loanNumber}
//                         </Typography>
//                         <Chip
//                           icon={getStatusIcon(loan.status)}
//                           label={loan.status}
//                           color={getStatusColor(loan.status)}
//                           size="small"
//                         />
//                       </Box>
//                     }
//                     secondary={
//                       <Box>
//                         <Typography variant="body2" color="text.secondary">
//                           Customer: {loan.customer?.firstName} {loan.customer?.lastName}
//                         </Typography>
//                         <Typography variant="body2" color="text.secondary">
//                           Amount: ${parseFloat(loan.amount).toLocaleString()}
//                         </Typography>
//                       </Box>
//                     }
//                   />
//                 </ListItem>
//               ))}
//             </List>
//           </Paper>
//         </Grid>

//         {/* Quick Actions */}
//         <Grid item xs={12} md={4}>
//           <Paper sx={{ p: 2 }}>
//             <Typography variant="h6" gutterBottom>
//               Quick Actions
//             </Typography>
//             <Box display="flex" flexDirection="column" gap={1}>
//               <Button variant="contained" fullWidth>
//                 New Customer
//               </Button>
//               <Button variant="outlined" fullWidth>
//                 New Loan Application
//               </Button>
//               {user?.role === 'LOAN_OFFICER' && (
//                 <Button variant="outlined" fullWidth>
//                   Review Pending Loans
//                 </Button>
//               )}
//               {user?.role === 'CREDIT_MANAGER' && (
//                 <Button variant="outlined" fullWidth>
//                   Approve Loans
//                 </Button>
//               )}
//             </Box>
//           </Paper>
//         </Grid>
//       </Grid>
//     </Box>
//   );
// };

// export default Dashboard;

import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  AccountBalance,
  People,
  TrendingUp,
  Warning,
  CheckCircle,
  Schedule,
  Cancel,
  AttachMoney
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalLoans: 0,
    pendingLoans: 0,
    approvedLoans: 0,
    rejectedLoans: 0,
    disbursedLoans: 0,
    totalCustomers: 0,
    totalAmount: 0
  });
  const [recentLoans, setRecentLoans] = useState([]);
  const [chartData, setChartData] = useState({
    statusData: [],
    monthlyData: [],
    amountByStatus: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [loansResponse, customersResponse] = await Promise.all([
        axios.get('/api/loans'),
        axios.get('/api/customers')
      ]);

      const loans = Array.isArray(loansResponse.data) ? loansResponse.data : [];
      const customers = Array.isArray(customersResponse.data) ? customersResponse.data : [];

      const totalLoans = loans.length;
      const pendingLoans = loans.filter(loan => loan.status === 'PENDING').length;
      const approvedLoans = loans.filter(loan => loan.status === 'APPROVED').length;
      const rejectedLoans = loans.filter(loan => loan.status === 'REJECTED').length;
      const disbursedLoans = loans.filter(loan => loan.status === 'DISBURSED').length;
      const totalCustomers = customers.length;
      const totalAmount = loans.reduce((sum, loan) => sum + parseFloat(loan.totalAmount || loan.amount || 0), 0);

      setStats({
        totalLoans,
        pendingLoans,
        approvedLoans,
        rejectedLoans,
        disbursedLoans,
        totalCustomers,
        totalAmount
      });

      const sortedLoans = [...loans].sort((a, b) => 
        new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at)
      );
      setRecentLoans(sortedLoans.slice(0, 5));

      prepareChartData(loans);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats({
        totalLoans: 0,
        pendingLoans: 0,
        approvedLoans: 0,
        rejectedLoans: 0,
        disbursedLoans: 0,
        totalCustomers: 0,
        totalAmount: 0
      });
      setRecentLoans([]);
      setLoading(false);
    }
  };

  const prepareChartData = (loans) => {
    const statusCounts = {
      PENDING: loans.filter(l => l.status === 'PENDING').length,
      APPROVED: loans.filter(l => l.status === 'APPROVED').length,
      REJECTED: loans.filter(l => l.status === 'REJECTED').length,
      DISBURSED: loans.filter(l => l.status === 'DISBURSED').length,
      VERIFIED: loans.filter(l => l.status === 'VERIFIED').length
    };

    const statusData = Object.entries(statusCounts)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({
        name: status,
        value: count
      }));

    const monthlyMap = {};
    loans.forEach(loan => {
      const date = new Date(loan.createdAt || loan.created_at);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      monthlyMap[monthYear] = (monthlyMap[monthYear] || 0) + 1;
    });

    const monthlyData = Object.entries(monthlyMap)
      .slice(-6)
      .map(([month, count]) => ({
        month,
        loans: count
      }));

    const amountByStatus = [
      {
        status: 'Pending',
        amount: loans.filter(l => l.status === 'PENDING')
          .reduce((sum, l) => sum + parseFloat(l.totalAmount || l.amount || 0), 0)
      },
      {
        status: 'Approved',
        amount: loans.filter(l => l.status === 'APPROVED')
          .reduce((sum, l) => sum + parseFloat(l.totalAmount || l.amount || 0), 0)
      },
      {
        status: 'Rejected',
        amount: loans.filter(l => l.status === 'REJECTED')
          .reduce((sum, l) => sum + parseFloat(l.totalAmount || l.amount || 0), 0)
      },
      {
        status: 'Disbursed',
        amount: loans.filter(l => l.status === 'DISBURSED')
          .reduce((sum, l) => sum + parseFloat(l.totalAmount || l.amount || 0), 0)
      }
    ].filter(item => item.amount > 0);

    setChartData({
      statusData,
      monthlyData,
      amountByStatus
    });
  };

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
      default: return <Warning />;
    }
  };

  const COLORS = {
    PENDING: '#ff9800',
    APPROVED: '#4caf50',
    REJECTED: '#f44336',
    DISBURSED: '#2196f3',
    VERIFIED: '#00bcd4'
  };

  const CircularStatCard = ({ title, value, icon, color, percentage }) => (
    <Card 
      sx={{ 
        height: '100%',
        minHeight: 280,
        background: 'white',
        border: '2px solid #7dd3c0',
        boxShadow: 2,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
          borderColor: '#5dbfa9'
        }
      }}
    >
      <CardContent sx={{ py: 4, px: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
          <CircularProgress
            variant="determinate"
            value={100}
            size={160}
            thickness={5}
            sx={{ color: '#e5e7eb', position: 'absolute' }}
          />
          <CircularProgress
            variant="determinate"
            value={percentage}
            size={160}
            thickness={5}
            sx={{ color: color }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ fontSize: 48, color: color, opacity: 0.8, mb: 1 }}>
              {icon}
            </Box>
            <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: '#374151' }}>
              {value}
            </Typography>
          </Box>
        </Box>
        <Typography 
          color="#6b7280" 
          variant="h6"
          sx={{ fontWeight: 600, textAlign: 'center', mt: 2 }}
        >
          {title}
        </Typography>
        <Typography 
          color="#9ca3af" 
          variant="body1"
          sx={{ mt: 1, fontSize: '1rem', fontWeight: 500 }}
        >
          {percentage.toFixed(0)}%
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  const totalLoansForPercentage = stats.totalLoans || 1;

  return (
    <Box sx={{ p: 3, bgcolor: '#f9fafb', display: 'flex', justifyContent: 'center' }}>
      <Box sx={{ maxWidth: 1600, width: '100%' }}>
        {/* Header Section */}
        <Box 
          sx={{ 
            mb: 4,
            p: 3,
            background: 'white',
            borderRadius: 2,
            border: '1px solid #e5e7eb',
            boxShadow: 1
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#374151' }}>
            Welcome back, {user?.firstName}! 👋
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#6b7280' }}>
            {user?.role?.replace('_', ' ')} • {user?.branch}
          </Typography>
        </Box>

        {/* Stats Cards with Circular Progress */}
        <Grid container spacing={4} sx={{ mb: 5 }}>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <CircularStatCard
              title="Total Loans"
              value={stats.totalLoans}
              icon={<AccountBalance />}
              color="#7dd3c0"
              percentage={100}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <CircularStatCard
              title="Pending"
              value={stats.pendingLoans}
              icon={<Schedule />}
              color="#fbbf24"
              percentage={(stats.pendingLoans / totalLoansForPercentage) * 100}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <CircularStatCard
              title="Approved"
              value={stats.approvedLoans}
              icon={<CheckCircle />}
              color="#34d399"
              percentage={(stats.approvedLoans / totalLoansForPercentage) * 100}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <CircularStatCard
              title="Disbursed"
              value={stats.disbursedLoans}
              icon={<AttachMoney />}
              color="#60a5fa"
              percentage={(stats.disbursedLoans / totalLoansForPercentage) * 100}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <CircularStatCard
              title="Rejected"
              value={stats.rejectedLoans}
              icon={<Cancel />}
              color="#f87171"
              percentage={(stats.rejectedLoans / totalLoansForPercentage) * 100}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <CircularStatCard
              title="Customers"
              value={stats.totalCustomers}
              icon={<People />}
              color="#a78bfa"
              percentage={stats.totalCustomers > 0 ? 100 : 0}
            />
          </Grid>
        </Grid>

        {/* Total Amount and Recent Loans Row */}
        <Grid container spacing={4} sx={{ mb: 5 }}>
          <Grid item xs={12} md={6}>
            <Card 
              sx={{ 
                background: 'white',
                border: '2px solid #7dd3c0',
                boxShadow: 2,
                height: '100%',
                minHeight: 220
              }}
            >
              <CardContent sx={{ py: 5, px: 5 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h5" sx={{ color: '#6b7280', mb: 2, fontWeight: 500 }}>
                      Total Loan Amount
                    </Typography>
                    <Typography variant="h2" sx={{ fontWeight: 'bold', color: '#374151' }}>
                      GHS {stats.totalAmount.toLocaleString()}
                    </Typography>
                  </Box>
                  <TrendingUp sx={{ fontSize: 100, opacity: 0.2, color: '#7dd3c0' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Recent Loans */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 5, boxShadow: 2, border: '2px solid #7dd3c0', height: '100%', minHeight: 220, maxHeight: 450, overflow: 'auto' }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3, color: '#374151' }}>
                Recent Loan Applications
              </Typography>
              <List sx={{ pt: 0 }}>
                {recentLoans.length === 0 ? (
                  <ListItem>
                    <ListItemText 
                      primary="No recent loans"
                      secondary="There are no loan applications yet"
                    />
                  </ListItem>
                ) : (
                  recentLoans.slice(0, 3).map((loan) => (
                    <ListItem 
                      key={loan.id} 
                      divider
                      sx={{
                        '&:hover': {
                          backgroundColor: '#f9fafb'
                        },
                        py: 2.5
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#374151' }}>
                              {loan.loanNumber}
                            </Typography>
                            <Chip
                              icon={getStatusIcon(loan.status)}
                              label={loan.status}
                              color={getStatusColor(loan.status)}
                              size="medium"
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1.5 }}>
                            <Typography variant="body1" color="text.secondary">
                              Customer: {loan.customer?.name || `${loan.customer?.firstName || ''} ${loan.customer?.lastName || ''}`.trim()}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                              Amount: GHS {parseFloat(loan.totalAmount || loan.amount || 0).toLocaleString()}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                              Date: {new Date(loan.createdAt || loan.created_at).toLocaleDateString()}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>

        {/* Charts Row */}
        <Grid container spacing={4}>
          {/* Loan Status Distribution - Pie Chart */}
          <Grid item xs={12} lg={6}>
            <Paper sx={{ p: 5, height: 600, boxShadow: 2, border: '2px solid #7dd3c0' }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 4, color: '#374151' }}>
                Loan Status Distribution
              </Typography>
              <ResponsiveContainer width="100%" height="86%">
                <PieChart>
                  <Pie
                    data={chartData.statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={140}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Monthly Loan Applications - Area Chart */}
          <Grid item xs={12} lg={6}>
            <Paper sx={{ p: 5, height: 600, boxShadow: 2, border: '2px solid #7dd3c0' }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 4, color: '#374151' }}>
                Monthly Loan Applications
              </Typography>
              <ResponsiveContainer width="100%" height="86%">
                <AreaChart data={chartData.monthlyData}>
                  <defs>
                    <linearGradient id="colorLoans" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7dd3c0" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#7dd3c0" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="loans" 
                    stroke="#7dd3c0" 
                    fillOpacity={1} 
                    fill="url(#colorLoans)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Loan Amount by Status - Bar Chart */}
          <Grid item xs={12}>
            <Paper sx={{ p: 5, height: 600, boxShadow: 2, border: '2px solid #7dd3c0' }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 4, color: '#374151' }}>
                Loan Amount by Status
              </Typography>
              <ResponsiveContainer width="100%" height="86%">
                <BarChart data={chartData.amountByStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => `GHS ${value.toLocaleString()}`}
                  />
                  <Legend />
                  <Bar dataKey="amount" fill="#7dd3c0" radius={[8, 8, 0, 0]}>
                    {chartData.amountByStatus.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[entry.status.toUpperCase()] || '#7dd3c0'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;