'use client';
// Authentication context - manages user state and auth functions across the app
// This allows any component to access user info and auth methods without prop drilling

import { createContext, useContext, useState, useEffect } from 'react';
import { userAPI } from '../lib/api';

const AuthContext = createContext();

// Custom hook to use auth context - makes it easier to access in components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Auth provider component - wraps the app and provides auth state
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in when the app loads
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Verify if we have a valid token and get user profile
  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Try to get user profile to verify token is still valid
        const userData = await userAPI.getProfile();
        setUser(userData);
      }
    } catch (error) {
      // Token is invalid or expired, clear it
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Login function - handles user login and stores the token
  const login = async (email, password) => {
    try {
      const response = await userAPI.login({ email, password });
      // Store the token for future API calls
      localStorage.setItem('token', response.token);
      setUser(response.user);
      return { success: true, user: response.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Register function - creates a new user account
  const register = async (userData) => {
    try {
      const response = await userAPI.register(userData);
      // Store the token after successful registration
      localStorage.setItem('token', response.token);
      setUser(response.user);
      return { success: true, user: response.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Logout function - clears user state and token
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Value object that will be provided to all children
  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

