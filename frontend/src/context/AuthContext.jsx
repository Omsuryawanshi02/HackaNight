import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
<<<<<<< HEAD
import { authLogin, authLogout, authGetMe, getAuthToken, MOCK_USERS } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('Main Supervisor');
  const [isLoading, setIsLoading] = useState(true);

  const initAuth = useCallback(async () => {
    setIsLoading(true);
=======
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

>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
    try {
      const res = await authGetMe();
      if (res.success && res.user) {
        setUser(res.user);
<<<<<<< HEAD
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
=======
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
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
<<<<<<< HEAD
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
=======
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
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
