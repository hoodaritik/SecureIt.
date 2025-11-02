import api from './api';

export const authService = {
  // Register a new user
  register: async (userData) => {
    console.log("userData06:", userData);
    const response = await api.post('/api/auth/register', userData);
    if (response.data.token) {
      console.log("response09", response);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    if (response.data.token) {
      console.log("response20", response);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Logout user
  logout: async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await api.put('/api/auth/update-profile', userData);
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Request password reset
  forgotPassword: async (email) => {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response.data;
  },

  // Verify password reset OTP
  verifyResetOTP: async (email, otp) => {
    const response = await api.post('/api/auth/verify-reset-otp', { email, otp });
    return response.data;
  },

  // Reset password with OTP
  resetPassword: async (email, otp, newPassword) => {
    const response = await api.post('/api/auth/reset-password', {
      email,
      otp,
      newPassword
    });
    return response.data;
  },

  // Reset master password
  resetMasterPassword: async (currentMasterPassword, newMasterPassword) => {
    const response = await api.post('/api/auth/reset-master-password', {
      currentMasterPassword,
      newMasterPassword
    });
    return response.data;
  },

  // Set security questions
  setSecurityQuestions: async (questions) => {
    const response = await api.post('/api/auth/security-questions', { questions });
    return response.data;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get stored user data
  getStoredUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Get stored token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // 2FA Methods
  generate2FA: async () => {
    const response = await api.post('/api/auth/2fa/generate');
    return response.data;
  },

  verifyEnable2FA: async (token) => {
    const response = await api.post('/api/auth/2fa/verify-enable', { token });
    return response.data;
  },

  disable2FA: async (token) => {
    const response = await api.post('/api/auth/2fa/disable', { token });
    return response.data;
  },

  verify2FA: async (email, token) => {
    const response = await api.post('/api/auth/2fa/verify', { email, token });
    if (response.data.token) {
      console.log("response92", response);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  regenerateBackupCodes: async () => {
    const response = await api.post('/api/auth/2fa/regenerate-backup-codes');
    return response.data;
  },

  get2FAStatus: async () => {
    const response = await api.get('/api/auth/2fa/status');
    return response.data;
  },

  requestEmailOTP: async (email) => {
    const response = await api.post('/api/auth/2fa/email-otp', { email });
    return response.data;
  }
};
