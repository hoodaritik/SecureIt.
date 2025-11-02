import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';

const EnhancedThemeContext = createContext();

export const useEnhancedTheme = () => {
  const context = useContext(EnhancedThemeContext);
  if (!context) throw new Error('useEnhancedTheme must be used within EnhancedThemeProvider');
  return context;
};

export const EnhancedThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  // Helper to get user from localStorage
  const getUserFromStorage = () => {
    try {
      return JSON.parse(localStorage.getItem('user')) || {};
    } catch {
      return {};
    }
  };

  // Initialize theme from localStorage, user preference, or system preference
  useEffect(() => {
    const user = getUserFromStorage();
    
    if (user.theme && ['light', 'dark'].includes(user.theme)) {
      setTheme(user.theme);
    } else {
      // Auto-detect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  // Update theme (used for applying theme from backend/user data)
  const updateTheme = (newTheme) => {
    if (newTheme && ['light', 'dark'].includes(newTheme) && newTheme !== theme) {
      setTheme(newTheme);
      
      // Update localStorage
      const user = getUserFromStorage();
      const updatedUser = {
        ...user,
        theme: newTheme
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  // Toggle theme and update backend
  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);

    try {
      // Update localStorage immediately
      const user = getUserFromStorage();
      const updatedUser = {
        ...user,
        theme: newTheme
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Update backend (async, don't block UI)
      authService.updateProfile({
        theme: newTheme
      }).then((response) => {
        if (response?.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      }).catch((err) => {
        console.error('Failed to update theme on backend:', err);
      });
    } catch (err) {
      console.error('Failed to update theme:', err);
    }
  };

  return (
    <EnhancedThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        updateTheme
      }}
    >
      {children}
    </EnhancedThemeContext.Provider>
  );
};
