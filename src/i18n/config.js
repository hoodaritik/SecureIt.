import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import deTranslations from '../locales/de/translation.json';
import esTranslations from '../locales/es/translation.json';
import frTranslations from '../locales/fr/translation.json';
import enTranslations from '../locales/en/translation.json';
import hiTranslations from '../locales/hi/translation.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            de: {
                translation: deTranslations
            },
            en: {
                translation: enTranslations
            },
            es: {
                translation: esTranslations
            },
            fr: {
                translation: frTranslations
            },
            hi: {
                translation: hiTranslations
            }
        },
        fallbackLng: 'en',
        debug: false,
        interpolation: {
            escapeValue: false
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
            lookupLocalStorage: 'i18nextLng'
        }
    });

export default i18n;

