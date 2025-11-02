// Application configuration
export const APP_CONFIG = {
  name: process.env.REACT_APP_APP_NAME || 'SecureIt',
  description: 'Secure Password Manager',
  tagline: 'Secure Password Manager'
};

// Helper function to get app name
export const getAppName = () => APP_CONFIG.name;
export const getAppDescription = () => APP_CONFIG.description;
export const getAppTagline = () => APP_CONFIG.tagline;

