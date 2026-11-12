import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { isTokenExpired } from '../utils/tokenSecurity';

/**
 * RouteLoadingWatcher - Kept lightweight for route transition tracking without
 * intrusive full-screen blocking modals.
 * Also handles Safari/WebKit bfcache (Back-Forward Cache) and history traversal
 * to ensure authenticated users never see a stale or restored login screen.
 */
export const RouteLoadingWatcher = () => {
  const location = useLocation();
  const prevPathRef = useRef(null);

  useEffect(() => {
    prevPathRef.current = location.pathname;
    // Scroll to top on route change
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  // Safari/WebKit BFCache and History Traversal Guard
  useEffect(() => {
    const handleBfcacheAndPop = () => {
      const savedToken = localStorage.getItem('accessToken');
      const isAuth = !!savedToken && !isTokenExpired(savedToken);
      const currentPath = window.location.pathname;

      // If user is authenticated but browser back button or bfcache restored /login or /register
      if (isAuth && (currentPath === '/login' || currentPath === '/register')) {
        window.location.replace('/');
      } else if (!isAuth && currentPath !== '/login' && currentPath !== '/register') {
        window.location.replace('/login');
      }
    };

    window.addEventListener('pageshow', handleBfcacheAndPop);
    window.addEventListener('popstate', handleBfcacheAndPop);

    return () => {
      window.removeEventListener('pageshow', handleBfcacheAndPop);
      window.removeEventListener('popstate', handleBfcacheAndPop);
    };
  }, []);

  return null;
};
