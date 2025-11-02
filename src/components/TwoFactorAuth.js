import React, { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { FiShield, FiCheckCircle, FiXCircle, FiKey, FiRefreshCcw, FiCopy, FiInfo, FiAlertCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { QRCodeSVG } from 'qrcode.react';


const TwoFactorAuth = () => {
  const { authService, /* getCurrentUser, user, */ } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [twoFactorStatus, setTwoFactorStatus] = useState(null);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  const fetch2FAStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const status = await authService.get2FAStatus();
      setTwoFactorStatus(status);
      if (status.twoFactorEnabled) {
        const response = await authService.regenerateBackupCodes();
        setBackupCodes(response.backupCodes);
        setQrCode('');
        setSecret('');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch 2FA status');
    } finally {
      setIsLoading(false);
    }
  }, [authService]);

  useEffect(() => {
    fetch2FAStatus();
  }, [fetch2FAStatus]);

  const handleGenerate2FA = async () => {
    try {
      setIsLoading(true);
      const response = await authService.generate2FA();
      setQrCode(response.qrCode);
      setSecret(response.secret);
      toast.success('2FA secret and QR code generated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEnable2FA = async () => {
    try {
      setIsLoading(true);
      const response = await authService.verifyEnable2FA(token);
      setBackupCodes(response.backupCodes);
      await fetch2FAStatus();
      setToken('');
      setShowBackupCodes(true);
      toast.success('2FA enabled successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to enable 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    // TwoFactorAuth component should require verification code
    // This function should not be called directly without a code
    // If used, it should get code from user input
    toast.error('Please disable 2FA from Settings page with verification code');
  };

  const handleRegenerateBackupCodes = async () => {
    try {
      setIsLoading(true);
      const response = await authService.regenerateBackupCodes();
      setBackupCodes(response.backupCodes);
      toast.success('New backup codes generated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to regenerate backup codes');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.info('Copied to clipboard!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 space-y-6"
    >
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
        <FiShield className="text-purple-600" />
        <span>Two-Factor Authentication</span>
      </h2>

      {isLoading && <p className="text-center text-slate-500">Loading...</p>}

      {twoFactorStatus && (
        <div className="border-b border-slate-200 dark:border-slate-700 pb-4 space-y-4">
          <p className="text-slate-700 dark:text-slate-300 flex items-center space-x-2">
            <FiInfo className="text-blue-500" />
            <span>Status: </span>
            {twoFactorStatus.twoFactorEnabled ? (
              <span className="text-green-600 font-medium flex items-center"><FiCheckCircle className="mr-1" /> Enabled</span>
            ) : (
              <span className="text-red-600 font-medium flex items-center"><FiXCircle className="mr-1" /> Disabled</span>
            )}
          </p>
          {twoFactorStatus.twoFactorEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400">
              <p>Setup Date: {twoFactorStatus.setupDate ? new Date(twoFactorStatus.setupDate).toLocaleDateString() : 'N/A'}</p>
              <p>Last Used: {twoFactorStatus.lastUsed ? new Date(twoFactorStatus.lastUsed).toLocaleString() : 'N/A'}</p>
              <p>Unused Backup Codes: {twoFactorStatus.unusedBackupCodes}</p>
            </div>
          )}
        </div>
      )}

      {!twoFactorStatus?.twoFactorEnabled ? (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Enable 2FA</h3>
          <p className="text-slate-700 dark:text-slate-300">Secure your account with an authenticator app like Google Authenticator or Authy.</p>

          {!qrCode ? (
            <motion.button
              onClick={handleGenerate2FA}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiKey />
              <span>Generate Secret</span>
            </motion.button>
          ) : (
            <div className="space-y-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
              <p className="text-center text-slate-700 dark:text-slate-300 font-medium">Scan this QR code with your authenticator app:</p>
              <div className="flex justify-center">
                <QRCodeSVG
                  value={secret}
                  size={256}
                  className="rounded-lg border-4 border-white dark:border-slate-900"
                />

              </div>
              <div className="flex items-center space-x-2">
                <span className="text-slate-700 dark:text-slate-300">Secret Key: </span>
                <code className="flex-1 bg-slate-100 dark:bg-slate-700 p-2 rounded text-sm break-all">{secret}</code>
                <motion.button
                  onClick={() => copyToClipboard(secret)}
                  className="px-3 py-1 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 rounded text-sm hover:bg-slate-300 dark:hover:bg-slate-500"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiCopy />
                </motion.button>
              </div>
              <div className="space-y-2">
                <label htmlFor="2fa-token" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Enter 2FA Token:</label>
                <input
                  id="2fa-token"
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-blue-500 focus:border-blue-500"
                />
                <motion.button
                  onClick={handleVerifyEnable2FA}
                  disabled={isLoading || !token}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiCheckCircle />
                  <span>Verify & Enable 2FA</span>
                </motion.button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Manage 2FA</h3>
          <p className="text-slate-700 dark:text-slate-300">Two-Factor Authentication is currently enabled for your account.</p>

          <motion.button
            onClick={() => setShowBackupCodes(!showBackupCodes)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiKey />
            <span>{showBackupCodes ? 'Hide' : 'View'} Backup Codes</span>
          </motion.button>

          <AnimatePresence>
            {showBackupCodes && backupCodes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Your Backup Codes:</h4>
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                  <FiAlertCircle />
                  <span>Store these codes in a safe place. Each can be used once to log in if you lose your authenticator.</span>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-700 p-2 rounded">
                      <code className="flex-1 text-sm">{code}</code>
                      <motion.button
                        onClick={() => copyToClipboard(code)}
                        className="px-2 py-1 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 rounded text-xs hover:bg-slate-300 dark:hover:bg-slate-500"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FiCopy />
                      </motion.button>
                    </div>
                  ))}
                </div>
                <motion.button
                  onClick={handleRegenerateBackupCodes}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiRefreshCcw />
                  <span>Regenerate Backup Codes</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={handleDisable2FA}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiXCircle />
            <span>Disable 2FA</span>
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};

export default TwoFactorAuth;
