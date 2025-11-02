import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authService } from '../services/authService';
import { emailValidation, passwordValidation } from '../utils/validation';
import { FiMail, FiLock, FiArrowRight, FiArrowLeft, FiShield, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const ForgotPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm();

  const newPassword = watch('newPassword');

  // Step 1: Request OTP
  const onSubmitEmail = async (data) => {
    try {
      setLoading(true);
      setEmail(data.email);
      const response = await authService.forgotPassword(data.email);
      setOtpSent(true);
      setStep(2);
      toast.success(response.message || 'Password reset code sent to your email');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    try {
      setLoading(true);
      await authService.verifyResetOTP(email, otp);
      setOtpVerified(true);
      setStep(3);
      toast.success('OTP verified successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const onSubmitNewPassword = async (data) => {
    try {
      setLoading(true);
      await authService.resetPassword(email, otp, data.newPassword);
      toast.success('Password reset successfully! Please login with your new password.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setLoading(true);
      const response = await authService.forgotPassword(email);
      toast.success(response.message || 'Password reset code resent to your email');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend code');
    } finally {
      setLoading(false);
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
      </div>

      <motion.div
        className="max-w-md w-full space-y-8 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
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
              {t('auth.forgotPassword.title')}
            </motion.h2>
            <motion.p
              className="text-slate-600 dark:text-slate-400 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {step === 1 && t('auth.forgotPassword.step1Subtitle')}
              {step === 2 && t('auth.forgotPassword.step2Subtitle')}
              {step === 3 && t('auth.forgotPassword.step3Subtitle')}
            </motion.p>
          </div>
        </motion.div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className="flex items-center">
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                  }`}
                  animate={{ scale: step === s ? [1, 1.1, 1] : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {step > s ? <FiCheckCircle className="w-6 h-6" /> : s}
                </motion.div>
              </div>
              {s < 3 && (
                <div
                  className={`w-12 h-1 ${
                    step > s ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Form Card */}
        <motion.div
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-2xl border-0 p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <AnimatePresence mode="wait">
            {/* Step 1: Enter Email */}
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSubmit(onSubmitEmail)}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
                    <FiMail className="w-4 h-4 text-blue-600 mr-2" />
                    {t('auth.login.email')}
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    className={`w-full px-4 py-3 border rounded-lg transition-all duration-300 ${
                      errors.email
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-950/20'
                        : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800'
                    } text-slate-900 dark:text-slate-100`}
                    {...register('email', emailValidation)}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 flex items-center">
                      <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
                      <span>{t('auth.forgotPassword.sending')}</span>
                    </>
                  ) : (
                    <>
                      <span>{t('auth.forgotPassword.sendCode')}</span>
                      <FiArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </motion.form>
            )}

            {/* Step 2: Verify OTP */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label htmlFor="otp" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
                    <FiMail className="w-4 h-4 text-blue-600 mr-2" />
                    {t('auth.forgotPassword.verifyCode')}
                  </label>
                  <input
                    id="otp"
                    type="text"
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-center text-2xl tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                    {t('auth.forgotPassword.codeSent')} {email}
                  </p>
                </div>

                <div className="space-y-3">
                  <motion.button
                    onClick={handleVerifyOTP}
                    disabled={loading || otp.length !== 6}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
                        <span>{t('auth.forgotPassword.verifying')}</span>
                      </>
                    ) : (
                      <>
                        <span>{t('auth.forgotPassword.verifyCode')}</span>
                        <FiArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    onClick={() => setStep(1)}
                    className="w-full flex items-center justify-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FiArrowLeft className="w-4 h-4" />
                    <span>{t('auth.forgotPassword.backToEmail')}</span>
                  </motion.button>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="w-full text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
                  >
                    {t('auth.forgotPassword.resendCode')}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
              <motion.form
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSubmit(onSubmitNewPassword)}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label htmlFor="newPassword" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
                    <FiLock className="w-4 h-4 text-blue-600 mr-2" />
                    {t('auth.forgotPassword.newPassword')}
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Enter new password"
                    className={`w-full px-4 py-3 border rounded-lg transition-all duration-300 ${
                      errors.newPassword
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-950/20'
                        : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800'
                    } text-slate-900 dark:text-slate-100`}
                    {...register('newPassword', passwordValidation)}
                  />
                  {errors.newPassword && (
                    <p className="text-sm text-red-600 flex items-center">
                      <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                      {errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
                    <FiLock className="w-4 h-4 text-blue-600 mr-2" />
                    {t('auth.forgotPassword.confirmPassword')}
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Confirm new password"
                    className={`w-full px-4 py-3 border rounded-lg transition-all duration-300 ${
                      errors.confirmPassword
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-950/20'
                        : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800'
                    } text-slate-900 dark:text-slate-100`}
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) =>
                        value === newPassword || 'Passwords do not match'
                    })}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600 flex items-center">
                      <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
                        <span>{t('auth.forgotPassword.resetting')}</span>
                      </>
                    ) : (
                      <>
                        <span>{t('auth.forgotPassword.resetPassword')}</span>
                        <FiArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full flex items-center justify-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FiArrowLeft className="w-4 h-4" />
                    <span>{t('auth.forgotPassword.backToVerification')}</span>
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <Link
            to="/login"
            className="inline-flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')} {t('auth.login.signIn')}
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;

