// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   Container,
//   Paper,
//   TextField,
//   Button,
//   Typography,
//   Box,
//   Alert,
//   CircularProgress,
//   Card,
//   CardContent,
//   Avatar,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions
// } from '@mui/material';
// import { LockOutlined } from '@mui/icons-material';
// import { useAuth } from '../contexts/AuthContext';

// const Login = () => {
//   const [formData, setFormData] = useState({
//     usernameOrEmail: '',
//     password: ''
//   });
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [showPasswordChange, setShowPasswordChange] = useState(false);
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [passwordError, setPasswordError] = useState('');
//   const { login, changePassword } = useAuth();
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     const result = await login(formData.usernameOrEmail, formData.password);
    
//     console.log('Login result:', result);
//     console.log('Must change password?', result.mustChangePassword);
    
//     if (result.success) {
//       if (result.mustChangePassword) {
//         console.log('Showing password change modal');
//         setLoading(false);
//         setShowPasswordChange(true);
//         console.log('showPasswordChange state set to true');
//         // Don't navigate yet - wait for password change
//         return;
//       } else {
//         console.log('Navigating to dashboard');
//         setLoading(false);
//         navigate('/dashboard');
//       }
//     } else {
//       setError(result.message);
//       setLoading(false);
//     }
//   };

//   const handlePasswordChange = async () => {
//     setPasswordError('');
    
//     if (!newPassword || newPassword.length < 8) {
//       setPasswordError('Password must be at least 8 characters long');
//       return;
//     }
    
//     if (newPassword !== confirmPassword) {
//       setPasswordError('Passwords do not match');
//       return;
//     }
    
//     setLoading(true);
//     const result = await changePassword(newPassword);
    
//     if (result.success) {
//       setShowPasswordChange(false);
//       navigate('/dashboard');
//     } else {
//       setPasswordError(result.message);
//     }
    
//     setLoading(false);
//   };

//   return (
//     <Container component="main" maxWidth="sm">
//       <Box
//         sx={{
//           marginTop: 8,
//           display: 'flex',
//           flexDirection: 'column',
//           alignItems: 'center',
//         }}
//       >
//         <Card sx={{ width: '100%', maxWidth: 400 }}>
//           <CardContent sx={{ padding: 4 }}>
//             <Box
//               sx={{
//                 display: 'flex',
//                 flexDirection: 'column',
//                 alignItems: 'center',
//               }}
//             >
//               <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
//                 <LockOutlined />
//               </Avatar>
//               <Typography component="h1" variant="h4" sx={{ mb: 2 }}>
//                 Loan Management System
//               </Typography>
//               <Typography component="h2" variant="h6" color="text.secondary" sx={{ mb: 3 }}>
//                 Sign in to your account
//               </Typography>
              
//               {error && (
//                 <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
//                   {error}
//                 </Alert>
//               )}

//               <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
//                 <TextField
//                   margin="normal"
//                   required
//                   fullWidth
//                   id="usernameOrEmail"
//                   label="Username or Email"
//                   name="usernameOrEmail"
//                   autoComplete="email"
//                   autoFocus
//                   value={formData.usernameOrEmail}
//                   onChange={handleChange}
//                 />
//                 <TextField
//                   margin="normal"
//                   required
//                   fullWidth
//                   name="password"
//                   label="Password"
//                   type="password"
//                   id="password"
//                   autoComplete="current-password"
//                   value={formData.password}
//                   onChange={handleChange}
//                 />
//                 <Button
//                   type="submit"
//                   fullWidth
//                   variant="contained"
//                   sx={{ mt: 3, mb: 2 }}
//                   disabled={loading}
//                 >
//                   {loading ? <CircularProgress size={24} /> : 'Sign In'}
//                 </Button>
//               </Box>

//               <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1, width: '100%' }}>
//                 <Typography variant="subtitle2" color="text.secondary" gutterBottom>
//                   Demo Credentials:
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   <strong>CSA:</strong> csa.alice / password123<br/>
//                   <strong>Loan Officer:</strong> loan.officer / password123<br/>
//                   <strong>Credit Manager:</strong> credit.manager / password123<br/>
//                   <strong>Branch Manager:</strong> branch.manager / password123<br/>
//                   <strong>Admin:</strong> admin / password123
//                 </Typography>
//               </Box>
//             </Box>
//           </CardContent>
//         </Card>
//       </Box>

//       {/* Password Change Modal */}
//       {console.log('Rendering Password Change Modal, showPasswordChange:', showPasswordChange)}
//       <Dialog 
//         open={showPasswordChange} 
//         onClose={() => {
//           console.log('Dialog onClose called (should not happen)');
//         }} 
//         disableEscapeKeyDown 
//         maxWidth="sm" 
//         fullWidth
//         PaperProps={{
//           className: 'mint-dialog-paper',
//           sx: {
//             borderRadius: '16px',
//             overflow: 'hidden',
//             zIndex: 9999
//           }
//         }}
//         sx={{
//           zIndex: 9999
//         }}
//       >
//         <DialogTitle 
//           className="mint-dialog-header"
//           sx={{ 
//             background: 'linear-gradient(135deg, #3eb489 0%, #52c9a0 100%)',
//             color: 'white',
//             padding: '24px 28px',
//             borderBottom: '3px solid #26d0a1'
//           }}
//         >
//           <Box className="mint-dialog-title">
//             <LockOutlined sx={{ fontSize: 28 }} />
//             <Box>
//               <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
//                 Change Your Password
//               </Typography>
//               <Typography className="mint-dialog-subtitle" variant="body2">
//                 Set a secure password for your account
//               </Typography>
//             </Box>
//           </Box>
//         </DialogTitle>
//         <DialogContent 
//           className="mint-dialog-content"
//           sx={{ 
//             padding: '28px !important',
//             background: 'linear-gradient(to bottom, #ffffff 0%, #f4fcf9 100%)'
//           }}
//         >
//           <Typography variant="body2" className="mint-dialog-content-text" sx={{ mb: 3 }}>
//             For security reasons, you must change your temporary password before continuing.
//           </Typography>
          
//           {passwordError && (
//             <Alert 
//               severity="error" 
//               sx={{ 
//                 mb: 3,
//                 borderRadius: '8px',
//                 borderLeft: '4px solid #ef4444'
//               }}
//             >
//               {passwordError}
//             </Alert>
//           )}
          
//           <TextField
//             fullWidth
//             label="New Password"
//             type="password"
//             value={newPassword}
//             onChange={(e) => setNewPassword(e.target.value)}
//             sx={{ mb: 2.5 }}
//             helperText="Minimum 8 characters, include letters and numbers"
//           />
//           <TextField
//             fullWidth
//             label="Confirm New Password"
//             type="password"
//             value={confirmPassword}
//             onChange={(e) => setConfirmPassword(e.target.value)}
//             helperText="Re-enter your new password"
//           />
//         </DialogContent>
//         <DialogActions 
//           className="mint-dialog-actions"
//           sx={{ 
//             padding: '20px 28px !important',
//             backgroundColor: '#f9fafb',
//             borderTop: '1px solid #b8e6d5',
//             gap: 2
//           }}
//         >
//           <Button 
//             onClick={handlePasswordChange} 
//             variant="contained" 
//             disabled={loading}
//             fullWidth
//             sx={{
//               background: 'linear-gradient(135deg, #3eb489 0%, #52c9a0 100%)',
//               color: 'white',
//               padding: '12px 24px',
//               fontWeight: 600,
//               fontSize: '15px',
//               boxShadow: '0 2px 6px rgba(62, 180, 137, 0.15)',
//               '&:hover': {
//                 background: 'linear-gradient(135deg, #2a8a67 0%, #3eb489 100%)',
//                 boxShadow: '0 4px 12px rgba(62, 180, 137, 0.25)',
//                 transform: 'translateY(-1px)'
//               },
//               transition: 'all 0.2s ease'
//             }}
//           >
//             {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Change Password & Continue'}
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Container>
//   );
// };

// export default Login;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { login, changePassword } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.usernameOrEmail, formData.password);
    
    console.log('Login result:', result);
    console.log('Must change password?', result.mustChangePassword);
    
    if (result.success) {
      if (result.mustChangePassword) {
        console.log('Showing password change modal');
        setLoading(false);
        setShowPasswordChange(true);
        console.log('showPasswordChange state set to true');
        // Don't navigate yet - wait for password change
        return;
      } else {
        console.log('Navigating to dashboard');
        setLoading(false);
        navigate('/dashboard');
      }
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError('');
    
    if (!newPassword || newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    const result = await changePassword(newPassword);
    
    if (result.success) {
      setShowPasswordChange(false);
      navigate('/dashboard');
    } else {
      setPasswordError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: 'url(/back.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Card sx={{ width: '100%', maxWidth: 400 }}>
            <CardContent sx={{ padding: 4 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                  <LockOutlined />
                </Avatar>
                <Typography component="h1" variant="h4" sx={{ mb: 2 }}>
                  Loan Management System
                </Typography>
                <Typography component="h2" variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                  Sign in to your account
                </Typography>
                
                {error && (
                  <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="usernameOrEmail"
                    label="Username or Email"
                    name="usernameOrEmail"
                    autoComplete="email"
                    autoFocus
                    value={formData.usernameOrEmail}
                    onChange={handleChange}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Sign In'}
                  </Button>
                </Box>

                {/* <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1, width: '100%' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Demo Credentials:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>CSA:</strong> csa.alice / password123<br/>
                    <strong>Loan Officer:</strong> loan.officer / password123<br/>
                    <strong>Credit Manager:</strong> credit.manager / password123<br/>
                    <strong>Branch Manager:</strong> branch.manager / password123<br/>
                    <strong>Admin:</strong> admin / password123
                  </Typography>
                </Box> */}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>

      {/* Password Change Modal */}
      {console.log('Rendering Password Change Modal, showPasswordChange:', showPasswordChange)}
      <Dialog 
        open={showPasswordChange} 
        onClose={() => {
          console.log('Dialog onClose called (should not happen)');
        }} 
        disableEscapeKeyDown 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          className: 'mint-dialog-paper',
          sx: {
            borderRadius: '16px',
            overflow: 'hidden',
            zIndex: 9999
          }
        }}
        sx={{
          zIndex: 9999
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
            <LockOutlined sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
                Change Your Password
              </Typography>
              <Typography className="mint-dialog-subtitle" variant="body2">
                Set a secure password for your account
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent 
          className="mint-dialog-content"
          sx={{ 
            padding: '28px !important',
            background: 'linear-gradient(to bottom, #ffffff 0%, #f4fcf9 100%)'
          }}
        >
          <Typography variant="body2" className="mint-dialog-content-text" sx={{ mb: 3 }}>
            For security reasons, you must change your temporary password before continuing.
          </Typography>
          
          {passwordError && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: '8px',
                borderLeft: '4px solid #ef4444'
              }}
            >
              {passwordError}
            </Alert>
          )}
          
          <TextField
            fullWidth
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={{ mb: 2.5 }}
            helperText="Minimum 8 characters, include letters and numbers"
          />
          <TextField
            fullWidth
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            helperText="Re-enter your new password"
          />
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
            onClick={handlePasswordChange} 
            variant="contained" 
            disabled={loading}
            fullWidth
            sx={{
              background: 'linear-gradient(135deg, #3eb489 0%, #52c9a0 100%)',
              color: 'white',
              padding: '12px 24px',
              fontWeight: 600,
              fontSize: '15px',
              boxShadow: '0 2px 6px rgba(62, 180, 137, 0.15)',
              '&:hover': {
                background: 'linear-gradient(135deg, #2a8a67 0%, #3eb489 100%)',
                boxShadow: '0 4px 12px rgba(62, 180, 137, 0.25)',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Change Password & Continue'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login;