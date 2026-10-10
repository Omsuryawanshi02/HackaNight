import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authLogin, authLogout, authGetMe, getAuthToken, MOCK_USERS } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const initAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        setUser(null);
        setRole(null);
        setIsLoading(false);
        return;
      }

      const res = await authGetMe();
      if (res.success && res.user) {
        setUser(res.user);
        setRole(res.user.role || 'Main Supervisor');
      } else {
        clearAuthToken();
        setUser(null);
        setRole(null);
      }
    } catch (err) {
      clearAuthToken();
      setUser(null);
      setRole(null);
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
    setRole(null);
    setIsLoading(false);
  };

  const isAuthenticated = Boolean(user && getAuthToken());

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
    return {
      user: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,
      login: async () => ({ success: false }),
      logout: async () => { },
      refreshAuth: async () => { }
    };
  }
  return context;
}
