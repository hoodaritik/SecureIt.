import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { authService } from '../services/authService';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSelector';
import {
  FiShield,
  FiCheckCircle,
  FiXCircle,
  FiKey,
  FiCopy,
  FiRefreshCw,
  FiAlertCircle,
  FiMail,
  FiInfo,
  FiUser,
  FiEdit2,
  FiSave,
  FiGlobe
} from 'react-icons/fi';
import { HiOutlineQrCode } from "react-icons/hi2";
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

const Settings = () => {
  const { t } = useTranslation();
  const { user, updateProfile, authService: authServiceFromContext } = useAuthContext();
  const [twoFactorStatus, setTwoFactorStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [secret, setSecret] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [backupCodes, setBackupCodes] = useState([]);
  const [disableCode, setDisableCode] = useState('');
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [emailOTPRequested, setEmailOTPRequested] = useState(false);

  // Personal Details state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '',
    email: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    fetch2FAStatus();
    // Initialize profile data from user
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    // Validation
    if (!profileData.username || !profileData.email) {
      toast.error('Please fill in all fields');
      return;
    }

    if (profileData.username.length < 3) {
      toast.error('Username must be at least 3 characters long');
      return;
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(profileData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setProfileLoading(true);
      await updateProfile({
        username: profileData.username,
        email: profileData.email
      });

      setIsEditingProfile(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const fetch2FAStatus = async () => {
    try {
      const status = await authService.get2FAStatus();
      setTwoFactorStatus(status);
    } catch (error) {
      console.error('Error fetching 2FA status:', error);
    }
  };

  const handleGenerate2FA = async () => {
    try {
      setLoading(true);
      const response = await authService.generate2FA();
      setQrCodeData(response.qrCode);
      setSecret(response.secret);
      setShowQrCode(true);
      toast.success('2FA secret generated. Scan the QR code with your authenticator app.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate 2FA secret');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEnable2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    try {
      setLoading(true);
      const response = await authService.verifyEnable2FA(verificationCode);
      setBackupCodes(response.backupCodes);
      setShowBackupCodes(true);
      setShowQrCode(false);
      setVerificationCode('');
      await fetch2FAStatus();
      toast.success('2FA enabled successfully! Save your backup codes in a safe place.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to enable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!disableCode || disableCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    try {
      setLoading(true);
      const response = await authService.disable2FA(disableCode);

      // Update user state in context if available
      if (response.twoFactorEnabled === false) {
        // Force refresh user data to reflect 2FA disabled status
        try {
          const currentUser = await authServiceFromContext.getCurrentUser();
          if (currentUser?.user) {
            // Update localStorage with latest user data
            localStorage.setItem('user', JSON.stringify({
              ...JSON.parse(localStorage.getItem('user') || '{}'),
              twoFactorEnabled: false
            }));
          }
        } catch (err) {
          console.warn('Could not refresh user data after disabling 2FA:', err);
        }
      }

      setShowDisableModal(false);
      setDisableCode('');
      await fetch2FAStatus();
      toast.success('2FA disabled successfully. You can now log in without 2FA.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    try {
      setLoading(true);
      const response = await authService.regenerateBackupCodes();
      setBackupCodes(response.backupCodes);
      setShowBackupCodes(true);
      toast.success('Backup codes regenerated. Save them in a safe place.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to regenerate backup codes');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleRequestEmailOTP = async () => {
    try {
      setLoading(true);
      await authService.requestEmailOTP(user.email);
      setEmailOTPRequested(true);
      toast.success('Verification code sent to your email');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send email OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your account security settings</p>
        </div>
      </motion.div>

      {/* Personal Details Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
              <FiUser className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Personal Details
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Manage your account information
              </p>
            </div>
          </div>
          {!isEditingProfile && (
            <motion.button
              onClick={() => setIsEditingProfile(true)}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiEdit2 className="w-4 h-4" />
              <span>Edit</span>
            </motion.button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Username
            </label>
            {isEditingProfile ? (
              <input
                type="text"
                value={profileData.username}
                onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter username"
              />
            ) : (
              <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-slate-900 dark:text-slate-100">
                {user?.username || 'N/A'}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('settings.personalDetails.email')}
            </label>
            {isEditingProfile ? (
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email address"
              />
            ) : (
              <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-slate-900 dark:text-slate-100">
                {user?.email || 'N/A'}
              </div>
            )}
          </div>

          {isEditingProfile && (
            <div className="flex space-x-3 pt-2">
              <motion.button
                onClick={handleSaveProfile}
                disabled={profileLoading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {profileLoading ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4" />
                    <span>{t('settings.personalDetails.saveChanges')}</span>
                  </>
                )}
              </motion.button>
              <motion.button
                onClick={() => {
                  setIsEditingProfile(false);
                  // Reset to original values
                  setProfileData({
                    username: user?.username || '',
                    email: user?.email || ''
                  });
                }}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {t('common.cancel')}
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Two-Factor Authentication Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
            <FiShield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {t('settings.twoFactor.title')}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t('settings.twoFactor.subtitle')}
            </p>
          </div>
        </div>

        {/* 2FA Status */}
        {twoFactorStatus && (
          <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {twoFactorStatus.twoFactorEnabled ? (
                  <>
                    <FiCheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      {t('settings.twoFactor.enabled')}
                    </span>
                  </>
                ) : (
                  <>
                    <FiXCircle className="w-5 h-5 text-red-500" />
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">
                      {t('settings.twoFactor.disabled')}
                    </span>
                  </>
                )}
              </div>
              {twoFactorStatus.twoFactorEnabled && (
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {twoFactorStatus.unusedBackupCodes} {t('settings.twoFactor.backupCodesRemaining')}
                </div>
              )}
            </div>
            {twoFactorStatus.setupDate && (
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {t('settings.twoFactor.enabledOn')} {new Date(twoFactorStatus.setupDate).toLocaleDateString()}
              </div>
            )}
          </div>
        )}

        {/* Enable 2FA Flow */}
        {!twoFactorStatus?.twoFactorEnabled && (
          <div className="space-y-4">
            {!showQrCode ? (
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
                <motion.button
                  onClick={handleGenerate2FA}
                  disabled={loading}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>{t('common.loading')}</span>
                    </>
                  ) : (
                    <>
                      <HiOutlineQrCode className="text-blue-500 text-3xl mb-3" />
                      <span>{t('settings.twoFactor.enable2FA')}</span>
                    </>
                  )}
                </motion.button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col items-center p-6 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                  <img
                    src={qrCodeData}
                    alt="2FA QR Code"
                    className="w-64 h-64 mb-4 rounded-lg border-2 border-slate-200 dark:border-slate-700"
                  />
                  <div className="w-full max-w-md space-y-2">
                    <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
                      {t('settings.twoFactor.cantScan')}
                    </p>
                    <div className="flex items-center space-x-2 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <code className="flex-1 text-sm font-mono text-slate-900 dark:text-slate-100 text-center">
                        {secret}
                      </code>
                      <button
                        onClick={() => copyToClipboard(secret)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                      >
                        <FiCopy className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t('settings.twoFactor.verificationCode')}
                  </label>
                  <input
                    type="text"
                    maxLength="6"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    placeholder={t('settings.twoFactor.enterCode')}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-center text-2xl tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex space-x-3">
                  <motion.button
                    onClick={handleVerifyEnable2FA}
                    disabled={loading || verificationCode.length !== 6}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? t('auth.login.verifying') : t('settings.twoFactor.verifyEnable')}
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setShowQrCode(false);
                      setQrCodeData(null);
                      setSecret(null);
                      setVerificationCode('');
                    }}
                    className="px-6 py-3 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {t('common.cancel')}
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Disable 2FA */}
        {twoFactorStatus?.twoFactorEnabled && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <motion.button
                onClick={() => setShowDisableModal(true)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-lg flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiXCircle className="w-4 h-4" />
                <span>Disable 2FA</span>
              </motion.button>
              <motion.button
                onClick={handleRegenerateBackupCodes}
                disabled={loading}
                className="flex-1 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiRefreshCw className="w-4 h-4" />
                <span>Regenerate Backup Codes</span>
              </motion.button>
            </div>
            {twoFactorStatus.unusedBackupCodes === 0 && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start space-x-2">
                <FiAlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  You have no unused backup codes. Consider regenerating them for account recovery.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Backup Codes Modal */}
        <AnimatePresence>
          {showBackupCodes && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowBackupCodes(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4"
              >
                <div className="flex items-center space-x-3">
                  <FiKey className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Backup Codes
                  </h3>
                </div>
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <FiInfo className="w-4 h-4 inline mr-1" />
                    Save these codes in a safe place. Each code can only be used once.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                  {backupCodes.map((code, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700"
                    >
                      <code className="text-sm font-mono text-slate-900 dark:text-slate-100">
                        {code}
                      </code>
                      <button
                        onClick={() => copyToClipboard(code)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                      >
                        <FiCopy className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                      </button>
                    </div>
                  ))}
                </div>
                <motion.button
                  onClick={() => setShowBackupCodes(false)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {t('settings.twoFactor.savedCodes')}
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Disable 2FA Modal */}
        <AnimatePresence>
          {showDisableModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowDisableModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4"
              >
                <div className="flex items-center space-x-3">
                  <FiAlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Disable 2FA
                  </h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  To disable 2FA, please enter a verification code from your authenticator app or a backup code.
                </p>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength="6"
                    value={disableCode}
                    onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-center text-2xl tracking-widest focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div className="flex space-x-3">
                  <motion.button
                    onClick={handleDisable2FA}
                    disabled={loading || disableCode.length !== 6}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? 'Disabling...' : 'Disable 2FA'}
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setShowDisableModal(false);
                      setDisableCode('');
                    }}
                    className="px-6 py-3 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Email OTP Fallback Info */}
      {twoFactorStatus?.twoFactorEnabled && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <FiMail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {t('settings.twoFactor.emailOTP')}
            </h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            {t('settings.twoFactor.emailOTPDesc')}
          </p>
          <motion.button
            onClick={handleRequestEmailOTP}
            disabled={loading || emailOTPRequested}
            className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiMail className="w-4 h-4" />
            <span>{emailOTPRequested ? t('settings.twoFactor.codeSent') : t('settings.twoFactor.requestEmailCode')}</span>
          </motion.button>
          {emailOTPRequested && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
              {t('settings.twoFactor.checkEmail')}
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Settings;

