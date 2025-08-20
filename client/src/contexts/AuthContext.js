import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

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
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Set up axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const res = await axios.get('/api/auth/user');
      setUser(res.data);
    } catch (err) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['x-auth-token'];
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const { token: newToken, user: userData } = res.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      axios.defaults.headers.common['x-auth-token'] = newToken;
      
      toast.success('Login successful!');
      return true;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      toast.error(message);
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const res = await axios.post('/api/auth/register', userData);
      const { token: newToken, user: newUser } = res.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      axios.defaults.headers.common['x-auth-token'] = newToken;
      
      toast.success('Registration successful!');
      return true;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      toast.error(message);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['x-auth-token'];
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await axios.put('/api/users/profile', profileData);
      setUser(res.data);
      toast.success('Profile updated successfully!');
      return true;
    } catch (err) {
      const message = err.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return false;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await axios.put('/api/users/password', { currentPassword, newPassword });
      toast.success('Password changed successfully!');
      return true;
    } catch (err) {
      const message = err.response?.data?.message || 'Password change failed';
      toast.error(message);
      return false;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
