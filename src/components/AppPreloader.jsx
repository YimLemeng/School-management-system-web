import React from 'react';
import { SchoolLogo } from './SchoolLogo';
import { useLanguage } from '../context/LanguageContext';

export const AppPreloader = ({ message }) => {
  const { t } = useLanguage();

  return (
    <div className="adminlte-preloader-wrapper">
      <div className="adminlte-preloader-card">
        <div className="preloader-logo-pulse">
          <SchoolLogo size={52} />
        </div>
        <div className="preloader-brand">
          <h2 className="preloader-title">
            <span className="preloader-title-light">School</span>
            <span className="preloader-title-space">&nbsp;</span>
            <span className="preloader-title-bold">MS</span>
          </h2>
          <span className="preloader-subtitle">
            {t('brand.subtitle')}
          </span>
        </div>
        <div className="preloader-progress-track">
          <div className="preloader-progress-bar"></div>
        </div>
        <p className="preloader-status-text">
          {message || t('common.verifyingSession')}
        </p>
      </div>
    </div>
  );
};
