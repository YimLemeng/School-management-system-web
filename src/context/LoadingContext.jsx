import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

export const ROUTE_LOADING_CONFIG = {
  '/': {
    title: 'Loading dashboard...',
    subtitle: 'កំពុងទាញយកទិន្នន័យ Dashboard សូមរង់ចាំ...',
  },
  '/departments': {
    title: 'Loading departments...',
    subtitle: 'កំពុងទាញយកទិន្នន័យ Departments សូមរង់ចាំ...',
  },
  '/students': {
    title: 'Loading students...',
    subtitle: 'កំពុងទាញយកទិន្នន័យ Students សូមរង់ចាំ...',
  },
  '/teachers': {
    title: 'Loading teachers...',
    subtitle: 'កំពុងទាញយកទិន្នន័យ Teachers សូមរង់ចាំ...',
  },
  '/courses': {
    title: 'Loading courses...',
    subtitle: 'កំពុងទាញយកទិន្នន័យ Courses សូមរង់ចាំ...',
  },
  '/enrollments': {
    title: 'Loading enrollments...',
    subtitle: 'កំពុងទាញយកទិន្នន័យ Enrollments សូមរង់ចាំ...',
  },
  '/profile': {
    title: 'Loading profile...',
    subtitle: 'កំពុងទាញយកទិន្នន័យ Profile សូមរង់ចាំ...',
  },
};

const LoadingContext = createContext(null);

export const LoadingProvider = ({ children }) => {
  const [loadingState, setLoadingState] = useState({
    isOpen: false,
    title: 'Loading dashboard...',
    subtitle: 'កំពុងទាញយកទិន្នន័យ Dashboard សូមរង់ចាំ...',
  });

  const timerRef = useRef(null);

  const showLoading = useCallback(
    (title = 'Loading...', subtitle = 'កំពុងដំណើរការ សូមរង់ចាំ...') => {
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
    (title = 'Loading...', subtitle = 'កំពុងដំណើរការ សូមរង់ចាំ...', duration = 500) => {
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
      const subtitle = options.subtitle || 'កំពុងដំណើរការ សូមរង់ចាំ...';
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

  // Global button click interceptor for action buttons
  useEffect(() => {
    const handleDocumentClick = (e) => {
      const targetBtn = e.target.closest('button, [data-loading-title]');
      if (!targetBtn) return;

      // Skip passive controls
      if (
        targetBtn.classList.contains('btn-close') ||
        targetBtn.classList.contains('btn-toggle-eye') ||
        targetBtn.classList.contains('btn-dismiss') ||
        targetBtn.classList.contains('btn-icon') ||
        targetBtn.disabled
      ) {
        return;
      }

      // Check explicit data attributes first
      const explicitTitle = targetBtn.getAttribute('data-loading-title');
      const explicitSubtitle = targetBtn.getAttribute('data-loading-subtitle');
      if (explicitTitle) {
        triggerLoading(
          explicitTitle,
          explicitSubtitle || 'កំពុងដំណើរការ សូមរង់ចាំ...',
          500
        );
        return;
      }

      // Handle common button text / actions
      const btnText = (targetBtn.innerText || targetBtn.textContent || '').trim();
      if (!btnText) return;

      if (/sign out|logout/i.test(btnText)) {
        triggerLoading('Signing out...', 'កំពុងចាកចេញពីប្រព័ន្ធ សូមរង់ចាំ...', 600);
      } else if (/search|filter/i.test(btnText) && !targetBtn.classList.contains('btn-page')) {
        triggerLoading('Searching data...', 'កំពុងស្វែងរកទិន្នន័យ សូមរង់ចាំ...', 450);
      } else if (/add student|save student|new student/i.test(btnText)) {
        triggerLoading('Processing student...', 'កំពុងដំណើរការទិន្នន័យសិស្ស សូមរង់ចាំ...', 500);
      } else if (/add teacher|save teacher|new teacher/i.test(btnText)) {
        triggerLoading('Processing teacher...', 'កំពុងដំណើរការទិន្នន័យគ្រូ សូមរង់ចាំ...', 500);
      } else if (/add course|save course|new course/i.test(btnText)) {
        triggerLoading('Processing course...', 'កំពុងដំណើរការទិន្នន័យវគ្គសិក្សា សូមរង់ចាំ...', 500);
      } else if (/enroll now|enroll in course|confirm enrollment/i.test(btnText)) {
        triggerLoading('Processing enrollment...', 'កំពុងដំណើរការចុះឈ្មោះ សូមរង់ចាំ...', 600);
      } else if (/change password|update password/i.test(btnText)) {
        triggerLoading('Updating password...', 'កំពុងប្តូរលេខសម្ងាត់ សូមរង់ចាំ...', 600);
      } else if (/delete|remove/i.test(btnText)) {
        triggerLoading('Deleting record...', 'កំពុងលុបទិន្នន័យ សូមរង់ចាំ...', 500);
      } else if (
        targetBtn.classList.contains('btn-primary') &&
        !targetBtn.classList.contains('btn-page')
      ) {
        triggerLoading('Processing...', 'កំពុងដំណើរការ សូមរង់ចាំ...', 450);
      }
    };

    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [triggerLoading]);

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
