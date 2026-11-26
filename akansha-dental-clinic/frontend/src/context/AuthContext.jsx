import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

const TOKEN_KEY = 'akansha_dental_token';
const USER_KEY = 'akansha_dental_user';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  // Synchronize authentication on app launch / refresh
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      if (!savedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await authService.getMe();
        if (response && response.success && response.data) {
          setUser(response.data);
          localStorage.setItem(USER_KEY, JSON.stringify(response.data));
        } else {
          logout();
        }
      } catch {
        // Token invalid or expired
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username, password) => {
    const res = await authService.login(username, password);
    if (res && res.success && res.data) {
      const { accessToken, userId, username: uname, email, fullName, roles } = res.data;
      const userData = { id: userId, username: uname, email, fullName, roles };

      localStorage.setItem(TOKEN_KEY, accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));

      setToken(accessToken);
      setUser(userData);
      return res.data;
    } else {
      throw new Error(res?.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await authService.logout();
      }
    } catch {
      // Ignored
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setToken(null);
      setUser(null);
    }
  };

  const hasRole = (...roles) => {
    if (!user || !user.roles || !Array.isArray(user.roles)) return false;

    // Support single string, array of strings, or multiple arguments
    const targetRoles = roles.flat().filter(Boolean).map(r => {
      const str = String(r).trim().toUpperCase();
      return str.startsWith('ROLE_') ? str : `ROLE_${str}`;
    });

    if (targetRoles.length === 0) return false;

    const userRoles = user.roles.map(r => {
      const str = String(r).trim().toUpperCase();
      return str.startsWith('ROLE_') ? str : `ROLE_${str}`;
    });

    return targetRoles.some(target => userRoles.includes(target));
  };

  const isSuperAdmin = hasRole('ROLE_SUPER_ADMIN');
  const isAdmin = isSuperAdmin || hasRole('ROLE_ADMIN');
  const isStaff = hasRole('ROLE_STAFF');

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isLoading,
    login,
    logout,
    hasRole,
    isSuperAdmin,
    isAdmin,
    isStaff,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
