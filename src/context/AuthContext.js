import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { useTranslation } from 'react-i18next';
import { useEnhancedTheme } from './EnhancedThemeContext';

const AuthContext = createContext();

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { i18n } = useTranslation();
  const { updateTheme } = useEnhancedTheme();

  useEffect(() => {
    // Check if user is logged in on app start
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const userData = authService.getStoredUser();
          if (userData) {
            setUser(userData);
            // Apply theme and language from user data
            if (userData.theme && ['light', 'dark'].includes(userData.theme)) {
              updateTheme(userData.theme);
            }
            if (userData.language) {
              i18n.changeLanguage(userData.language);
              localStorage.setItem('i18nextLng', userData.language);
            }
          } else {
            // Token exists but user data doesn't, fetch from API
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser.user);
            // Apply theme and language from fetched user data
            if (currentUser.user?.theme && ['light', 'dark'].includes(currentUser.user.theme)) {
              updateTheme(currentUser.user.theme);
            }
            if (currentUser.user?.language) {
              i18n.changeLanguage(currentUser.user.language);
              localStorage.setItem('i18nextLng', currentUser.user.language);
            }
          }
        } catch (error) {
          // Token is invalid, remove it
          authService.logout();
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      // Apply theme and language after login
      if (response.user?.theme && ['light', 'dark'].includes(response.user.theme)) {
        updateTheme(response.user.theme);
      }
      if (response.user?.language) {
        i18n.changeLanguage(response.user.language);
        localStorage.setItem('i18nextLng', response.user.language);
      }
      return response;
    } catch (error) {
      // Extract error message from API response
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      throw new Error(errorMessage);
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      setUser(response.user);
      return response;
    } catch (error) {
      // Extract error message from API response
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      // Even if logout fails on backend, clear local state
      setUser(null);
    }
  };

  const updateProfile = async (userData) => {
    try {
      const response = await authService.updateProfile(userData);
      setUser(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Update user state after 2FA verification
  const updateUserAfter2FA = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    updateUserAfter2FA,
    isAuthenticated: !!user,
    // Expose 2FA methods
    authService // Directly expose authService for 2FA methods
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
