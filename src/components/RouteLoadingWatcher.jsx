import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * RouteLoadingWatcher - Kept lightweight for route transition tracking without
 * intrusive full-screen blocking modals.
 */
export const RouteLoadingWatcher = () => {
  const location = useLocation();
  const prevPathRef = useRef(null);

  useEffect(() => {
    prevPathRef.current = location.pathname;
    // Scroll to top on route change
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  return null;
};
