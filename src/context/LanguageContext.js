import React, { createContext, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from './AuthContext';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const { user } = useAuthContext();

  // Initialize language from user preference or localStorage
  useEffect(() => {
    if (user?.language) {
      i18n.changeLanguage(user.language);
      localStorage.setItem('i18nextLng', user.language);
    } else {
      const savedLang = localStorage.getItem('i18nextLng') || 'en';
      i18n.changeLanguage(savedLang);
    }
  }, [user, i18n]);

  return <LanguageContext.Provider value={{}}>{children}</LanguageContext.Provider>;
};

