import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { emailValidation, usernameValidation, passwordValidation, masterPasswordValidation } from '../utils/validation';
import { getPasswordStrength } from '../utils/encryption';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiArrowRight, FiStar, FiCheckCircle, FiAlertCircle, FiInfo } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const Register = () => {
  const { register: registerUser, isRegistering } = useAuthContext();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showMasterPassword, setShowMasterPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [authError, setAuthError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  // Update password strength when password changes
  React.useEffect(() => {
    if (password) {
      setPasswordStrength(getPasswordStrength(password));
    }
  }, [password]);

  const onSubmit = async (data) => {
    try {
      setAuthError('');
      await registerUser(data);
      navigate('/dashboard');
    } catch (error) {
      setAuthError(error.message || 'Registration failed. Please try again.');
    }
  };

  const getStrengthColor = (strength) => {
    if (!strength) return 'bg-slate-200';
    switch (strength.label) {
      case 'Weak': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Strong': return 'bg-green-500';
      default: return 'bg-slate-200';
    }
  };

  const getStrengthTextColor = (strength) => {
    if (!strength) return 'text-slate-500';
    switch (strength.label) {
      case 'Weak': return 'text-red-600';
      case 'Medium': return 'text-yellow-600';
      case 'Strong': return 'text-green-600';
      default: return 'text-slate-500';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden relative transition-colors duration-500">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, 40, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-green-400/20 to-blue-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <motion.div
        className="max-w-lg w-full space-y-8 relative z-10"
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
            whileHover={{ scale: 1.05, rotate: 5 }}
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
              Create Account
            </motion.h2>
            <motion.p
              className="text-slate-600 dark:text-slate-400 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              Set up your secure password vault
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
                <span>Free Forever</span>
              </motion.span>
              <motion.span
                className="px-3 py-1 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 rounded-full text-sm flex items-center space-x-1"
                whileHover={{ scale: 1.05 }}
              >
                <FiShield className="w-3 h-3" />
                <span>Military-Grade Security</span>
              </motion.span>
            </motion.div>
          </div>
        </motion.div>

        {/* Registration Form */}
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
              <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Get Started</h3>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Create your account to start securing your passwords
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

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                {/* Username Field */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <label htmlFor="username" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
                    <FiUser className="w-4 h-4 text-blue-600 mr-2" />
                    Username
                  </label>
                  <div className="relative">
                    <motion.input
                      id="username"
                      type="text"
                      autoComplete="username"
                      placeholder="Choose a unique username"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-all duration-300 ${
                        errors.username
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-950/20'
                          : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 hover:border-blue-400 dark:hover:border-blue-500'
                      } text-slate-900 dark:text-slate-100`}
                      {...register('username', usernameValidation)}
                      whileFocus={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    />
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                  <AnimatePresence>
                    {errors.username && (
                      <motion.p
                        className="text-sm text-red-600 flex items-center"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <FiAlertCircle className="w-4 h-4 mr-2" />
                        {errors.username.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Email Field */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
                    <FiMail className="w-4 h-4 text-blue-600 mr-2" />
                    Email address
                  </label>
                  <div className="relative">
                    <motion.input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="Enter your email address"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-all duration-300 ${
                        errors.email
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
                        <FiAlertCircle className="w-4 h-4 mr-2" />
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
                  transition={{ duration: 0.6, delay: 0.7 }}
                >
                  <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
                    <FiLock className="w-4 h-4 text-blue-600 mr-2" />
                    Password
                  </label>
                  <div className="relative">
                    <motion.input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Create a strong password"
                      className={`w-full pl-10 pr-10 py-3 border rounded-lg transition-all duration-300 ${
                        errors.password
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

                  {/* Password Strength Indicator */}
                  <AnimatePresence>
                    {password && (
                      <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                              <motion.div
                                className={`h-2 rounded-full transition-all duration-500 ${getStrengthColor(passwordStrength)}`}
                                initial={{ width: 0 }}
                                animate={{ width: passwordStrength ? `${(passwordStrength.score / 6) * 100}%` : '0%' }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                              />
                            </div>
                            <motion.span
                              className={`text-xs font-medium ${getStrengthTextColor(passwordStrength)}`}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            >
                              {passwordStrength ? passwordStrength.label : 'Enter password'}
                            </motion.span>
                          </div>
                        </div>
                        <AnimatePresence>
                          {passwordStrength && (
                            <motion.div
                              className="flex items-center space-x-2 text-xs"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.3 }}
                            >
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                              >
                                {passwordStrength.label === 'Strong' ? (
                                  <FiCheckCircle className="w-3 h-3 text-green-600" />
                                ) : (
                                  <FiAlertCircle className="w-3 h-3 text-yellow-600" />
                                )}
                              </motion.div>
                              <span className="text-slate-600 dark:text-slate-400">
                                {passwordStrength.label === 'Strong'
                                  ? 'Excellent! Your password is very secure.'
                                  : 'Consider adding numbers, symbols, and mixed case for better security.'
                                }
                              </span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {errors.password && (
                      <motion.p
                        className="text-sm text-red-600 flex items-center"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <FiAlertCircle className="w-4 h-4 mr-2" />
                        {errors.password.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Master Password Field */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <label htmlFor="masterPassword" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
                    <FiShield className="w-4 h-4 text-purple-600 mr-2" />
                    Master Password
                    <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full flex items-center">
                      <FiInfo className="w-3 h-3 mr-1" />
                      Required
                    </span>
                  </label>
                  <div className="relative">
                    <motion.input
                      id="masterPassword"
                      type={showMasterPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Create your master password"
                      className={`w-full pl-10 pr-10 py-3 border rounded-lg transition-all duration-300 ${
                        errors.masterPassword
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-950/20'
                          : 'border-slate-300 dark:border-slate-600 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-slate-800 hover:border-purple-400 dark:hover:border-purple-500'
                      } text-slate-900 dark:text-slate-100`}
                      {...register('masterPassword', masterPasswordValidation)}
                      whileFocus={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    />
                    <FiShield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <motion.button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      onClick={() => setShowMasterPassword(!showMasterPassword)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {showMasterPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </motion.button>
                  </div>
                  <AnimatePresence>
                    {errors.masterPassword && (
                      <motion.p
                        className="text-sm text-red-600 flex items-center"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <FiAlertCircle className="w-4 h-4 mr-2" />
                        {errors.masterPassword.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                  <motion.div
                    className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.9 }}
                  >
                    <div className="flex items-start space-x-2">
                      <FiInfo className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-blue-700 dark:text-blue-300">
                        <p className="font-medium mb-1">Your master password is crucial!</p>
                        <p>It encrypts all your passwords. Never forget it - there's no recovery option.</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isRegistering}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  {isRegistering ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
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
                Already have an account?
              </span>
            </div>
          </div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full px-6 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200 text-slate-700 dark:text-slate-300 font-medium hover:shadow-md"
            >
              Sign in instead
            </Link>
          </motion.div>
        </motion.div>

        {/* Security Features */}
        <motion.div
          className="grid grid-cols-2 gap-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <motion.div
            className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <FiShield className="w-6 h-6 text-green-600" />
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              End-to-End Encrypted
            </span>
          </motion.div>
          <motion.div
            className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <FiCheckCircle className="w-6 h-6 text-blue-600" />
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Zero-Knowledge
            </span>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;