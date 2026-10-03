import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useLoading, ROUTE_LOADING_CONFIG } from '../context/LoadingContext';

export const RouteLoadingWatcher = () => {
  const location = useLocation();
  const { triggerLoading } = useLoading();
  const prevPathRef = useRef(null);

  useEffect(() => {
    const currentPath = location.pathname;

    // Show loading on route change or initial load
    if (prevPathRef.current !== currentPath) {
      const config = ROUTE_LOADING_CONFIG[currentPath];
      if (config) {
        triggerLoading(config.title, config.subtitle, 450);
      } else {
        triggerLoading('Loading page...', 'កំពុងដំណើរការ សូមរង់ចាំ...', 400);
      }
      prevPathRef.current = currentPath;
    }
  }, [location.pathname, triggerLoading]);

  return null;
};
