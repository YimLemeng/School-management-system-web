import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

export const ROUTE_LOADING_CONFIG = {
  '/': {
    title: 'Loading dashboard...',
    subtitle: 'Fetching dashboard analytics, please wait...',
  },
  '/departments': {
    title: 'Loading departments...',
    subtitle: 'Fetching departments data, please wait...',
  },
  '/students': {
    title: 'Loading students...',
    subtitle: 'Fetching students list, please wait...',
  },
  '/teachers': {
    title: 'Loading teachers...',
    subtitle: 'Fetching faculty data, please wait...',
  },
  '/courses': {
    title: 'Loading courses...',
    subtitle: 'Fetching courses catalog, please wait...',
  },
  '/enrollments': {
    title: 'Loading enrollments...',
    subtitle: 'Fetching enrollments and capacity, please wait...',
  },
  '/profile': {
    title: 'Loading profile...',
    subtitle: 'Fetching profile information, please wait...',
  },
};

const LoadingContext = createContext(null);

export const LoadingProvider = ({ children }) => {
  const [loadingState, setLoadingState] = useState({
    isOpen: false,
    title: 'Loading dashboard...',
    subtitle: 'Fetching dashboard analytics, please wait...',
  });

  const timerRef = useRef(null);

  const showLoading = useCallback(
    (title = 'Loading...', subtitle = 'Processing, please wait...') => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setLoadingState({
        isOpen: true,
        title,
        subtitle,
      });
    },
    []
  );

  const hideLoading = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setLoadingState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const triggerLoading = useCallback(
    (title = 'Loading...', subtitle = 'Processing, please wait...', duration = 500) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      setLoadingState({
        isOpen: true,
        title,
        subtitle,
      });
      return new Promise((resolve) => {
        timerRef.current = setTimeout(() => {
          setLoadingState((prev) => ({ ...prev, isOpen: false }));
          timerRef.current = null;
          resolve();
        }, duration);
      });
    },
    []
  );

  const withLoading = useCallback(
    async (action, options = {}) => {
      const title = options.title || 'Loading...';
      const subtitle = options.subtitle || 'Processing, please wait...';
      const minDuration = options.minDuration ?? 450;

      showLoading(title, subtitle);
      const startTime = Date.now();
      try {
        if (typeof action === 'function') {
          return await action();
        }
      } finally {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minDuration - elapsed);
        timerRef.current = setTimeout(() => {
          hideLoading();
        }, remaining);
      }
    },
    [showLoading, hideLoading]
  );

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <LoadingContext.Provider
      value={{
        isOpen: loadingState.isOpen,
        title: loadingState.title,
        subtitle: loadingState.subtitle,
        showLoading,
        hideLoading,
        triggerLoading,
        withLoading,
      }}
    >
      {children}
      {loadingState.isOpen && (
        <div className="global-loading-backdrop" role="status" aria-live="polite">
          <div className="global-loading-card">
            <div className="global-loading-spinner" />
            <h3 className="global-loading-title">{loadingState.title}</h3>
            <p className="global-loading-subtitle">{loadingState.subtitle}</p>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
