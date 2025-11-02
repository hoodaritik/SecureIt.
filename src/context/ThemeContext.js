import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  // Helper to get user from localStorage
  const getUserFromStorage = () => {
    try {
      return JSON.parse(localStorage.getItem('user')) || {};
    } catch {
      return {};
    }
  };

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const user = getUserFromStorage();
    if (user.theme && ['light', 'dark'].includes(user.theme)) setTheme(user.theme);
    else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  // Apply theme class to <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  // Update theme locally and on backend
  const updateTheme = async (newTheme) => {
    if (!['light', 'dark'].includes(newTheme)) return;
    const previousTheme = theme;
    setTheme(newTheme);

    try {
      // Update localStorage immediately
      const user = getUserFromStorage();
      const updatedUser = { ...user, theme: newTheme };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Update backend
      const response = await authService.updateProfile({ theme: newTheme });
      if (response.user) localStorage.setItem('user', JSON.stringify(response.user));
    } catch (err) {
      console.error('Failed to update theme on backend:', err);
      setTheme(previousTheme); // rollback on failure
    }
  };

  const toggleTheme = () => updateTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
