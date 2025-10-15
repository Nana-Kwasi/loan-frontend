import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('/api/auth/me');
          setUser(response.data);
        } catch (error) {
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (usernameOrEmail, password) => {
    try {
      const response = await axios.post('/api/auth/login', {
        usernameOrEmail,
        password
      });
      
      console.log('Login response from backend:', response.data);
      
      const { token, user } = response.data;
      console.log('User data:', user);
      console.log('mustChangePassword from backend:', user.mustChangePassword);
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      return { 
        success: true, 
        mustChangePassword: user.mustChangePassword || false 
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || error.response?.data || 'Login failed' 
      };
    }
  };

  const changePassword = async (newPassword) => {
    try {
      const response = await axios.post('/api/auth/change-password', {
        newPassword
      });
      
      // Refresh user data after password change
      const userResponse = await axios.get('/api/auth/me');
      setUser(userResponse.data);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Password change failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    changePassword,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
