import api from './api';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'your-32-character-encryption-key-here';

// Encrypt password before sending to backend
const encryptPassword = (password) => {
  return CryptoJS.AES.encrypt(password, ENCRYPTION_KEY).toString();
};

// Decrypt password from backend response
const decryptPassword = (encryptedPassword) => {
  const bytes = CryptoJS.AES.decrypt(encryptedPassword, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export const passwordService = {
  // Get all passwords
  getPasswords: async () => {
    const response = await api.get('/api/passwords');
    // Decrypt passwords in the response
    const passwords = response.data.passwords.map(password => ({
      ...password,
      password: decryptPassword(password.password)
    }));
    return { ...response.data, passwords };
  },

  // Get single password
  getPassword: async (id) => {
    const response = await api.get(`/api/passwords/${id}`);
    // Decrypt password in the response
    return {
      ...response.data,
      password: {
        ...response.data.password,
        password: decryptPassword(response.data.password.password)
      }
    };
  },

  // Create new password
  createPassword: async (passwordData) => {
    const encryptedData = {
      ...passwordData,
      password: encryptPassword(passwordData.password)
    };
    const response = await api.post('/api/passwords', encryptedData);
    return response.data;
  },

  // Update password
  updatePassword: async (id, passwordData) => {
    const encryptedData = {
      ...passwordData,
      password: passwordData.password ? encryptPassword(passwordData.password) : undefined
    };
    const response = await api.put(`/api/passwords/${id}`, encryptedData);
    // Decrypt password in the response if it exists
    if (response.data.password && response.data.password.password) {
      response.data.password.password = decryptPassword(response.data.password.password);
    }
    return response.data;
  },

  // Delete password
  deletePassword: async (id) => {
    const response = await api.delete(`/api/passwords/${id}`);
    return response.data;
  },

  // Search passwords
  searchPasswords: async (query) => {
    const response = await api.get(`/api/passwords/search/${encodeURIComponent(query)}`);
    // Decrypt passwords in search results
    const passwords = response.data.passwords.map(password => ({
      ...password,
      password: decryptPassword(password.password)
    }));
    return { ...response.data, passwords };
  }
};
