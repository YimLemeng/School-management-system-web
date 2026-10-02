import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('accessToken'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await authApi.getMe();
          if (res.data) {
            setUser(res.data);
            localStorage.setItem('currentUser', JSON.stringify(res.data));
          }
        } catch {
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, [token]);

  const login = async (usernameOrEmail, password) => {
    const res = await authApi.login({ usernameOrEmail, password });
    const authData = res.data;
    const accessToken = authData.accessToken;

    localStorage.setItem('accessToken', accessToken);
    setToken(accessToken);

    const userData = {
      id: authData.userId,
      username: authData.username,
      email: authData.email,
      roles: Array.from(authData.roles || []),
    };

    localStorage.setItem('currentUser', JSON.stringify(userData));
    setUser(userData);

    return authData;
  };

  const register = async (formData) => {
    const res = await authApi.register(formData);
    const authData = res.data;
    const accessToken = authData.accessToken;

    localStorage.setItem('accessToken', accessToken);
    setToken(accessToken);

    const userData = {
      id: authData.userId,
      username: authData.username,
      email: authData.email,
      fullName: formData.fullName,
      roles: Array.from(authData.roles || []),
    };

    localStorage.setItem('currentUser', JSON.stringify(userData));
    setUser(userData);

    return authData;
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
    setToken(null);
    setUser(null);
  };

  const hasRole = (role) => {
    if (!user || !user.roles) return false;
    const formattedRole = role.startsWith('ROLE_') ? role : `ROLE_${role}`;
    return user.roles.includes(formattedRole);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token && !!user,
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
