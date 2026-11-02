import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('lablens_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('lablens_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load current user details if token exists
  const fetchCurrentUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      localStorage.setItem('lablens_user', JSON.stringify(res.data.user));
      setError(null);
    } catch (err) {
      console.warn('Auth verification failed:', err.message);
      // Only clear credentials if server explicitly rejected with 401 Unauthorized
      if (err.response?.status === 401) {
        localStorage.removeItem('lablens_token');
        localStorage.removeItem('lablens_user');
        setToken(null);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Login handler
  const login = async (email, password) => {
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('lablens_token', newToken);
      localStorage.setItem('lablens_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return userData;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  // Register handler with role and licenseNumber support
  const register = async (name, email, password, role = 'patient', licenseNumber = '') => {
    setError(null);
    try {
      const res = await api.post('/auth/register', { name, email, password, role, licenseNumber });
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('lablens_token', newToken);
      localStorage.setItem('lablens_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return userData;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('lablens_token');
    localStorage.removeItem('lablens_user');
    setToken(null);
    setUser(null);
    setError(null);
  };

  const updateUserProfileState = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        updateUserProfileState,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
