import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authApi } from '../api/authApi';
import {
  isTokenExpired,
  getTokenRoles,
  getTimeUntilExpiry,
  isSafeTokenString,
} from '../utils/tokenSecurity';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // 1. Initial State: Fail-closed validation immediately on load
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('accessToken');
    if (!savedToken || !isSafeTokenString(savedToken) || isTokenExpired(savedToken)) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('currentUser');
      return null;
    }
    return savedToken;
  });

  const [user, setUser] = useState(() => {
    const savedToken = localStorage.getItem('accessToken');
    if (!savedToken || !isSafeTokenString(savedToken) || isTokenExpired(savedToken)) {
      return null;
    }
    const savedUser = localStorage.getItem('currentUser');
    try {
      if (!savedUser) return null;
      const parsed = JSON.parse(savedUser);
      // Cryptographically enforce roles from signed JWT token to prevent localStorage tampering
      const tokenRoles = getTokenRoles(savedToken);
      if (tokenRoles.length > 0) {
        parsed.roles = tokenRoles;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);
  const expiryTimerRef = useRef(null);

  const logout = useCallback((reason = 'manual') => {
    if (expiryTimerRef.current) {
      clearTimeout(expiryTimerRef.current);
      expiryTimerRef.current = null;
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
    setToken(null);
    setUser(null);

    // Notify other components or tabs
    window.dispatchEvent(new CustomEvent('auth:logout', { detail: { reason } }));
  }, []);

  // 2. Token Expiration Watcher: Automatically logout when JWT expires
  useEffect(() => {
    if (!token) return;

    if (isTokenExpired(token)) {
      logout('session_expired');
      return;
    }

    const timeRemaining = getTimeUntilExpiry(token);
    if (timeRemaining > 0) {
      if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
      expiryTimerRef.current = setTimeout(() => {
        logout('session_expired');
      }, timeRemaining);
    }

    return () => {
      if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
    };
  }, [token, logout]);

  // 3. Multi-Tab Session Synchronization: Instant logout across all open tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'accessToken') {
        if (!e.newValue || isTokenExpired(e.newValue)) {
          logout('cross_tab_logout');
        } else if (e.newValue !== token) {
          setToken(e.newValue);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [token, logout]);

  // 4. Session Verification with Backend /auth/me
  useEffect(() => {
    let isMounted = true;

    const verifyUser = async () => {
      if (token && !isTokenExpired(token)) {
        try {
          const res = await authApi.getMe();
          if (isMounted && res.data) {
            const tokenRoles = getTokenRoles(token);
            const verifiedUser = {
              ...res.data,
              // Strictly cross-check backend roles with signed JWT token
              roles: tokenRoles.length > 0 ? tokenRoles : Array.from(res.data.roles || []),
            };
            setUser(verifiedUser);
            localStorage.setItem('currentUser', JSON.stringify(verifiedUser));
          }
        } catch {
          if (isMounted) {
            logout('verification_failed');
          }
        }
      } else if (token && isTokenExpired(token)) {
        logout('token_expired');
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    verifyUser();

    return () => {
      isMounted = false;
    };
  }, [token, logout]);

  // 5. Secure Login Handler
  const login = async (usernameOrEmail, password) => {
    const cleanUsernameOrEmail = (usernameOrEmail || '').trim();
    if (!cleanUsernameOrEmail || !password) {
      throw new Error('Please enter both username/email and password.');
    }

    const res = await authApi.login({
      usernameOrEmail: cleanUsernameOrEmail,
      password,
    });

    const authData = res.data;
    const accessToken = authData.accessToken;

    if (!isSafeTokenString(accessToken) || isTokenExpired(accessToken)) {
      throw new Error('Received an invalid or expired token from authentication server.');
    }

    localStorage.setItem('accessToken', accessToken);
    setToken(accessToken);

    const tokenRoles = getTokenRoles(accessToken);
    const resolvedRoles = tokenRoles.length > 0
      ? tokenRoles
      : Array.from(authData.roles || []);

    const userData = {
      id: authData.userId,
      username: authData.username,
      email: authData.email,
      roles: resolvedRoles,
    };

    localStorage.setItem('currentUser', JSON.stringify(userData));
    setUser(userData);

    return authData;
  };

  // 6. Secure Register Handler
  const register = async (formData) => {
    const res = await authApi.register(formData);
    const authData = res.data;
    const accessToken = authData.accessToken;

    if (!isSafeTokenString(accessToken) || isTokenExpired(accessToken)) {
      throw new Error('Received an invalid or expired token from authentication server.');
    }

    localStorage.setItem('accessToken', accessToken);
    setToken(accessToken);

    const tokenRoles = getTokenRoles(accessToken);
    const resolvedRoles = tokenRoles.length > 0
      ? tokenRoles
      : Array.from(authData.roles || []);

    const userData = {
      id: authData.userId,
      username: authData.username,
      email: authData.email,
      fullName: formData.fullName?.trim() || '',
      roles: resolvedRoles,
    };

    localStorage.setItem('currentUser', JSON.stringify(userData));
    setUser(userData);

    return authData;
  };

  // 7. Cryptographically Backed Role Check (Guards against client-side tampering)
  const hasRole = useCallback((role) => {
    if (!role || !token || isTokenExpired(token)) return false;
    const formattedRole = role.startsWith('ROLE_') ? role : `ROLE_${role}`;

    // Cryptographic ground truth: Roles embedded inside signed JWT token
    const tokenRoles = getTokenRoles(token);
    if (tokenRoles.length > 0) {
      return tokenRoles.includes(formattedRole);
    }

    // Fallback to validated user state
    return !!(user?.roles && user.roles.includes(formattedRole));
  }, [token, user]);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token && !isTokenExpired(token) && !!user,
        loading,
        login,
        register,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
