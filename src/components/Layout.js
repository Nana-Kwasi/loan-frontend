import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Badge
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  AccountBalance,
  AdminPanelSettings,
  Assessment,
  History,
  Logout,
  Notifications,
  ChevronLeft
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 240;

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleProfileMenuClose();
  };

  const getMenuItems = () => {
    const baseItems = [
      { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' }
    ];

    const roleBasedItems = {
      CSA: [
        { text: 'Customers', icon: <People />, path: '/customers' },
        { text: 'Loans', icon: <AccountBalance />, path: '/loans' }
      ],
      LOAN_OFFICER: [
        { text: 'Customers', icon: <People />, path: '/customers' },
        { text: 'Loans', icon: <AccountBalance />, path: '/loans' }
      ],
      BRANCH_MANAGER: [
        { text: 'Customers', icon: <People />, path: '/customers' },
        { text: 'Loans', icon: <AccountBalance />, path: '/loans' },
        { text: 'Reports', icon: <Assessment />, path: '/reports' }
      ],
      CREDIT_MANAGER: [
        { text: 'Customers', icon: <People />, path: '/customers' },
        { text: 'Loans', icon: <AccountBalance />, path: '/loans' },
        { text: 'Reports', icon: <Assessment />, path: '/reports' }
      ],
      SYSTEM_ADMIN: [
        { text: 'Customers', icon: <People />, path: '/customers' },
        { text: 'Loans', icon: <AccountBalance />, path: '/loans' },
        { text: 'Admin Panel', icon: <AdminPanelSettings />, path: '/admin' },
        { text: 'Reports', icon: <Assessment />, path: '/reports' },
        { text: 'Audit Logs', icon: <History />, path: '/audit-logs' }
      ],
      COMPLIANCE_OFFICER: [
        { text: 'Reports', icon: <Assessment />, path: '/reports' },
        { text: 'Audit Logs', icon: <History />, path: '/audit-logs' }
      ]
    };

    return [...baseItems, ...(roleBasedItems[user?.role] || [])];
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Loan Management System
        </Typography>
      </Toolbar>
      <List>
        {getMenuItems().map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {getMenuItems().find(item => item.path === location.pathname)?.text || 'Dashboard'}
          </Typography>

          <IconButton color="inherit">
            <Badge badgeContent={4} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="primary-search-account-menu"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        {children}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
      >
        <MenuItem disabled>
          <Typography variant="body2" color="text.secondary">
            {user?.firstName} {user?.lastName}
          </Typography>
        </MenuItem>
        <MenuItem disabled>
          <Typography variant="body2" color="text.secondary">
            {user?.role?.replace('_', ' ')}
          </Typography>
        </MenuItem>
        <MenuItem disabled>
          <Typography variant="body2" color="text.secondary">
            {user?.branch}
          </Typography>
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Layout;
