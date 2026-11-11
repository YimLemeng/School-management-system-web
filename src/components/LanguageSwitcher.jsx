import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const LanguageSwitcher = ({ collapsed = false, className = '' }) => {
  const { language, setLanguage } = useLanguage();

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setLanguage(language === 'en' ? 'km' : 'en')}
        className={`lang-switch-collapsed ${className}`}
        title={language === 'en' ? 'Switch to ភាសាខ្មែរ' : 'Switch to English'}
        aria-label="Switch Language"
      >
        <span style={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'monospace' }}>
          {language === 'en' ? 'EN' : 'KH'}
        </span>
      </button>
    );
  }

  return (
    <div className={`lang-segmented-control ${className}`} role="group" aria-label="Language selection">
      <button
        type="button"
        className={`lang-seg-btn ${language === 'en' ? 'active' : ''}`}
        onClick={() => setLanguage('en')}
        title="Switch to English"
      >
        <span>🇬🇧 EN</span>
      </button>
      <button
        type="button"
        className={`lang-seg-btn ${language === 'km' ? 'active' : ''}`}
        onClick={() => setLanguage('km')}
        title="ប្តូរទៅ ភាសាខ្មែរ"
      >
        <span>🇰🇭 ខ្មែរ</span>
      </button>
    </div>
  );
};
