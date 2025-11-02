import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../context/AuthContext';
import { FiCheck } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const LanguageSelector = () => {
  const { t, i18n } = useTranslation();
  const { updateProfile } = useAuthContext();

  const languages = [
    { code: 'en', name: t('settings.language.english'), flag: '🇺🇸' },
    { code: 'hi', name: t('settings.language.hindi'), flag: '🇮🇳' }
  ];

  const handleLanguageChange = async (langCode) => {
    try {
      // Change language immediately
      i18n.changeLanguage(langCode);
      localStorage.setItem('i18nextLng', langCode);

      // Update backend
      await updateProfile({ language: langCode });
      toast.success('Language updated successfully');
    } catch (error) {
      toast.error('Failed to update language');
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {t('settings.language.selectLanguage')}
      </label>
      
      <div className="space-y-2">
        {languages.map((lang) => (
          <motion.button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
              i18n.language === lang.code
                ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/30'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{lang.flag}</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {lang.name}
              </span>
            </div>
            {i18n.language === lang.code && (
              <FiCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;

