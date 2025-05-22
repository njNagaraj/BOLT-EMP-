import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  // Configure axios defaults
  axios.defaults.withCredentials = true;

  // Load user from session
  const loadUser = async () => {
    try {
      const res = await axios.get('/api/auth/user');
      setCurrentUser(res.data);
      setIsAuthenticated(true);
      setLoading(false);
    } catch (err) {
      setIsAuthenticated(false);
      setCurrentUser(null);
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      
      setCurrentUser(res.data.user);
      setIsAuthenticated(true);
      
      toast.success(`Welcome back, ${res.data.user.name}!`);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Login failed');
      return false;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
      setCurrentUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    } catch (err) {
      console.error('Logout error:', err);
      toast.error('Error logging out');
    }
  };

  // Update user profile
  const updateUserProfile = (updatedProfile) => {
    setCurrentUser({ ...currentUser, ...updatedProfile });
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    logout,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};