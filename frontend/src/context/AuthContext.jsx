import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  authLogin, 
  authLogout, 
  authGetMe, 
  authChangePassword, 
  getAuthToken, 
  clearAuthToken 
} from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getAuthToken());
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Validate session on app initialization
  const verifySession = useCallback(async () => {
    const storedToken = getAuthToken();
    if (!storedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await authGetMe();
      if (res.success && res.user) {
        setUser(res.user);
        setToken(storedToken);
      } else {
        clearAuthToken();
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      clearAuthToken();
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  const login = async (email, password) => {
    setIsLoading(true);
    setAuthError(null);
    const res = await authLogin(email, password);
    setIsLoading(false);

    if (res.success && res.data) {
      setUser(res.data.user);
      setToken(res.data.token);
      return { success: true, user: res.data.user };
    } else {
      setAuthError(res.error);
      return { success: false, error: res.error };
    }
  };

  const logout = async () => {
    await authLogout();
    setUser(null);
    setToken(null);
  };

  const changePassword = async (oldPassword, newPassword) => {
    const res = await authChangePassword(oldPassword, newPassword);
    if (res.success) {
      if (user) {
        setUser({ ...user, must_change_password: false });
      }
    }
    return res;
  };

  const updateUser = (updatedFields) => {
    setUser(prev => prev ? ({ ...prev, ...updatedFields }) : null);
  };

  const value = {
    user,
    token,
    role: user ? user.role : null,
    isAuthenticated: !!user,
    isLoading,
    authError,
    login,
    logout,
    changePassword,
    updateUser,
    refreshUser: verifySession
  };

  return (
    <AuthContext.Provider value={value}>
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
