import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { emailValidation, passwordValidation } from '../utils/validation';
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiAlertCircle, FiArrowRight, FiStar } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useEnhancedTheme } from '../context/EnhancedThemeContext';

const Login = () => {
  const { t } = useTranslation();
  const { login, isLoggingIn, authService, updateUserAfter2FA } = useAuthContext();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showTwoFactorInput, setShowTwoFactorInput] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const { updateTheme } = useEnhancedTheme();
  const [loginEmail, setLoginEmail] = useState('');
  const [emailOTPRequested, setEmailOTPRequested] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setAuthError('');
      setLoginEmail(data.email); // for 2FA verification
      const response = await login(data);

      // Apply theme immediately from backend
      if (response.user?.theme && ['light', 'dark'].includes(response.user.theme)) {
        updateTheme(response.user.theme);
      }

      if (response.twoFactorRequired) {
        setShowTwoFactorInput(true);
        setAuthError(response.message);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      setAuthError(error.message || 'Login failed. Please try again.');
    }
  };

  const onVerify2FA = async () => {
    try {
      setAuthError('');
      const response = await authService.verify2FA(loginEmail, twoFactorToken);
      if (response.token && response.user) {
        // Update token and user in localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Update AuthContext user state
        if (updateUserAfter2FA) {
          updateUserAfter2FA(response.user);
        }
        
        // Small delay to ensure state is updated
        setTimeout(() => {
          navigate('/dashboard');
        }, 100);
      } else {
        setAuthError(response.message || '2FA verification failed.');
      }
    } catch (error) {
      setAuthError(error.response?.data?.message || '2FA verification failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden relative transition-colors duration-500">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-400/20 to-blue-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <motion.div
        className="max-w-md w-full space-y-8 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo and Header */}
        <motion.div
          className="text-center space-y-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.div
            className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <FiShield className="w-10 h-10 text-white" />
          </motion.div>
          <div className="space-y-2">
            <motion.h2
              className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {t('auth.login.title')}
            </motion.h2>
            <motion.p
              className="text-slate-600 dark:text-slate-400 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {t('auth.login.subtitle')}
            </motion.p>
            <motion.div
              className="flex items-center justify-center space-x-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <motion.span
                className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm flex items-center space-x-1"
                whileHover={{ scale: 1.05 }}
              >
                <FiStar className="w-3 h-3" />
                <span>Secure</span>
              </motion.span>
              <motion.span
                className="px-3 py-1 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 rounded-full text-sm flex items-center space-x-1"
                whileHover={{ scale: 1.05 }}
              >
                <FiShield className="w-3 h-3" />
                <span>256-bit Encryption</span>
              </motion.span>
            </motion.div>
          </div>
        </motion.div>

        {/* Login Form */}
        <motion.div
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-2xl border-0 p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="space-y-6">
            <motion.div
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Sign In</h3>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Enter your credentials to access your password SecureIt
              </p>
            </motion.div>

            {/* Auth Error Display */}
            <AnimatePresence>
              {authError && (
                <motion.div
                  className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg p-4"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center space-x-2">
                    <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-800 dark:text-red-200 font-medium">{authError}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {!showTwoFactorInput ? (
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-4">
                  {/* Email Field */}
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
                      <FiMail className="w-4 h-4 text-blue-600 mr-2" />
                      {t('auth.login.email')}
                    </label>
                    <div className="relative">
                      <motion.input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="Enter your email"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-all duration-300 ${errors.email
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-950/20'
                          : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 hover:border-blue-400 dark:hover:border-blue-500'
                          } text-slate-900 dark:text-slate-100`}
                        {...register('email', emailValidation)}
                        whileFocus={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      />
                      <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                    <AnimatePresence>
                      {errors.email && (
                        <motion.p
                          className="text-sm text-red-600 flex items-center"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                          {errors.email.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Password Field */}
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
                      <FiLock className="w-4 h-4 text-blue-600 mr-2" />
                      {t('auth.login.password')}
                    </label>
                    <div className="relative">
                      <motion.input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        className={`w-full pl-10 pr-10 py-3 border rounded-lg transition-all duration-300 ${errors.password
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-950/20'
                          : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 hover:border-blue-400 dark:hover:border-blue-500'
                          } text-slate-900 dark:text-slate-100`}
                        {...register('password', passwordValidation)}
                        whileFocus={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      />
                      <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <motion.button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                      </motion.button>
                    </div>
                    <AnimatePresence>
                      {errors.password && (
                        <motion.p
                          className="text-sm text-red-600 flex items-center"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                          {errors.password.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <span className="relative z-10 flex items-center justify-center space-x-2">
                    {isLoggingIn ? (
                      <>
                        <motion.div
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <span>{t('auth.login.signIn')}</span>
                        <FiArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                </motion.button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{t('auth.login.twoFactorTitle')}</h3>
                  <p className="text-slate-600 dark:text-slate-400 mt-2">
                    {t('auth.login.twoFactorSubtitle')}{emailOTPRequested ? ' ' + t('auth.login.orEmail', 'or email') : ''}.
                  </p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="2fa-token" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
                    <FiLock className="w-4 h-4 text-blue-600 mr-2" />
                    {t('auth.login.twoFactorCode')}
                  </label>
                  <div className="relative">
                    <motion.input
                      id="2fa-token"
                      type="text"
                      value={twoFactorToken}
                      onChange={(e) => setTwoFactorToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit code"
                      maxLength="6"
                      className="w-full pl-10 pr-4 py-3 border rounded-lg transition-all duration-300 border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 hover:border-blue-400 dark:hover:border-blue-500 text-slate-900 dark:text-slate-100 text-center text-2xl tracking-widest"
                      whileFocus={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    />
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                  {emailOTPRequested && (
                    <p className="text-xs text-green-600 dark:text-green-400 text-center">
                      {t('settings.twoFactor.checkEmail')}
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  <motion.button
                    onClick={onVerify2FA}
                    disabled={isLoggingIn || !twoFactorToken || twoFactorToken.length !== 6}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <span className="relative z-10 flex items-center justify-center space-x-2">
                      {isLoggingIn ? (
                        <>
                          <motion.div
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <>
                        <span>{t('auth.login.verify2FA')}</span>
                        <FiArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                    />
                  </motion.button>
                  {!emailOTPRequested && (
                    <motion.button
                      onClick={async () => {
                        try {
                          const response = await authService.requestEmailOTP(loginEmail);
                          setEmailOTPRequested(true);
                          toast.success(response.message || 'Verification code sent to your email');
                        } catch (error) {
                          toast.error(error.response?.data?.message || 'Failed to send email code');
                        }
                      }}
                      disabled={isLoggingIn}
                      className="w-full border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium py-2 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FiMail className="w-4 h-4" />
                      <span>{t('auth.login.sendEmailCode')}</span>
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200 dark:border-slate-700"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 px-4 text-slate-500 dark:text-slate-400">
                {t('auth.login.noAccount')}
              </span>
            </div>
          </div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="space-y-3"
          >
            <Link
              to="/register"
              className="inline-flex items-center justify-center w-full px-6 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200 text-slate-700 dark:text-slate-300 font-medium hover:shadow-md"
            >
              {t('auth.login.createAccount')}
            </Link>
            <Link
              to="/forgot-password"
              className="inline-flex items-center justify-center w-full text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {t('auth.login.forgotPassword')}
            </Link>
          </motion.div>
        </motion.div>

        {/* Security badges */}
        <motion.div
          className="flex items-center justify-center space-x-6 text-xs text-slate-500 dark:text-slate-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <motion.div
            className="flex items-center space-x-1"
            whileHover={{ scale: 1.05 }}
          >
            <FiShield className="w-3 h-3" />
            <span>256-bit encryption</span>
          </motion.div>
          <motion.div
            className="flex items-center space-x-1"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
            <span>Bank-level security</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
