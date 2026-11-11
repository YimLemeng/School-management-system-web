import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem('app_language');
      return saved === 'km' || saved === 'en' ? saved : 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = (lang) => {
    if (lang === 'en' || lang === 'km') {
      setLanguageState(lang);
      try {
        localStorage.setItem('app_language', lang);
      } catch {}
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'km' : 'en');
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  /**
   * Translate a dotted key path, e.g. t('nav.dashboard') or t('common.save')
   */
  const t = useCallback((keyPath, fallback = '') => {
    if (!keyPath) return '';
    const keys = keyPath.split('.');
    
    // 1. Try current language
    let current = translations[language];
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        current = undefined;
        break;
      }
    }

    if (typeof current === 'string') return current;

    // 2. Fallback to English
    if (language !== 'en') {
      let enCurrent = translations.en;
      for (const key of keys) {
        if (enCurrent && typeof enCurrent === 'object' && key in enCurrent) {
          enCurrent = enCurrent[key];
        } else {
          enCurrent = undefined;
          break;
        }
      }
      if (typeof enCurrent === 'string') return enCurrent;
    }

    return fallback || keyPath;
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        isKhmer: language === 'km',
        setLanguage,
        toggleLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
