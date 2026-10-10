import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authLogin, authLogout, authGetMe, getAuthToken, MOCK_USERS } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('Main Supervisor');
  const [isLoading, setIsLoading] = useState(true);

  const initAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await authGetMe();
      if (res.success && res.user) {
        setUser(res.user);
        setRole(res.user.role || 'Main Supervisor');
      } else {
        // Default guest user for quick preview/testing if no token
        const defaultUser = MOCK_USERS['supervisor@PRAMAAN.ai'];
        setUser(defaultUser);
        setRole(defaultUser.role || 'Main Supervisor');
      }
    } catch (err) {
      console.warn('Auth Context initialization failed, fallback to supervisor:', err);
      const defaultUser = MOCK_USERS['supervisor@PRAMAAN.ai'];
      setUser(defaultUser);
      setRole('Main Supervisor');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = async (email, password) => {
    setIsLoading(true);
    const res = await authLogin(email, password);
    if (res.success && res.data?.user) {
      setUser(res.data.user);
      setRole(res.data.user.role || 'Main Supervisor');
    }
    setIsLoading(false);
    return res;
  };

  const logout = async () => {
    setIsLoading(true);
    await authLogout();
    setUser(null);
    setRole('Main Supervisor');
    setIsLoading(false);
  };

  const isAuthenticated = Boolean(user || getAuthToken());

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        role,
        setRole,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshAuth: initAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    // Graceful fallback if context is consumed outside provider
    return {
      user: MOCK_USERS['supervisor@PRAMAAN.ai'],
      role: 'Main Supervisor',
      isAuthenticated: true,
      isLoading: false,
      login: async () => ({ success: true }),
      logout: async () => { },
      refreshAuth: async () => { }
    };
  }
  return context;
}
