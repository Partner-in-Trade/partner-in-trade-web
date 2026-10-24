import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '@/features/auth/api/authApi';
import {
  mapLoginResponse,
  persistAuthSession,
  clearAuthSession,
  AUTH_STORAGE_KEY,
} from '@/lib/mappers/authMapper';
import { setOnUnauthorized } from '@/lib/apiClient';

const AuthContext = createContext(null);

const isDev = import.meta.env.DEV;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem('pit_jwt');
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!saved || !token) return null;
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });
  const [authError, setAuthError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  const logout = useCallback(() => {
    setUser(null);
    clearAuthSession();
    setAuthError(null);
  }, []);

  useEffect(() => {
    setOnUnauthorized(() => logout());
    return () => setOnUnauthorized(null);
  }, [logout]);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        clearAuthSession();
      }
    } catch (e) {
      console.error('Failed to persist auth state:', e);
    }
  }, [user]);

  const applyLoginResult = (result) => {
    if (result.error) {
      setAuthError(result.error);
      return false;
    }
    persistAuthSession(result.user, result.token);
    setUser(result.user);
    setAuthError(null);
    return true;
  };

  const login = async ({ email, password }) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const response = await authApi.login({ email, password });
      return applyLoginResult(mapLoginResponse(response));
    } catch (e) {
      const data = e.response?.data;
      if (data && data.success === false && data.message) {
        setAuthError(data.message);
      } else {
        setAuthError(data?.message || 'Invalid email or password');
      }
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async ({ fullName, email, password }) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const response = await authApi.register({
        name: fullName,
        email,
        password,
      });
      return applyLoginResult(mapLoginResponse(response));
    } catch (e) {
      const data = e.response?.data;
      if (data && data.success === false && data.message) {
        setAuthError(data.message);
      } else {
        setAuthError(data?.message || 'Registration failed');
      }
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    if (!isDev) return;
    const mockUser = {
      id: 'usr-google-01',
      fullName: 'Google User',
      email: 'user@gmail.com',
      accountType: 'LIVE PRO',
      baseCurrency: 'USD',
      authProvider: 'google',
    };
    localStorage.setItem('pit_jwt', 'mock-jwt-google-bypass');
    setUser(mockUser);
  };

  const bypassAuth = () => {
    if (!isDev) return;
    const demoUser = {
      id: 'usr-demo-01',
      fullName: 'Alex Mercer',
      email: 'alex@partnerintrade.com',
      accountType: 'FUNDED 100K',
      baseCurrency: 'USD',
    };
    localStorage.setItem('pit_jwt', 'mock-jwt-token-bypass');
    setUser(demoUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        login,
        register,
        loginWithGoogle,
        bypassAuth,
        logout,
        authError,
        authLoading,
        clearAuthError: () => setAuthError(null),
        isDevBypassEnabled: isDev,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}



