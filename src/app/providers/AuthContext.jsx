import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);
const AUTH_STORAGE_KEY = 'pit_auth_user_v1';
const JWT_STORAGE_KEY = 'pit_jwt';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(JWT_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to persist auth state:', e);
    }
  }, [user]);

  // Temporary bypass login (accepts any email/password and navigates to Dashboard)
  const login = async ({ email }) => {
    const mockUser = {
      id: 'usr-pit-01',
      fullName: email ? email.split('@')[0] : 'Pro Trader',
      email: email || 'trader@partnerintrade.com',
      accountType: 'LIVE PRO',
      baseCurrency: 'USD',
    };
    localStorage.setItem(JWT_STORAGE_KEY, 'mock-jwt-token-bypass');
    setUser(mockUser);
  };

  // Temporary bypass registration
  const register = async ({ fullName, email }) => {
    const mockUser = {
      id: `usr-${Date.now()}`,
      fullName: fullName || 'Pro Trader',
      email: email || 'trader@partnerintrade.com',
      accountType: 'LIVE PRO',
      baseCurrency: 'USD',
    };
    localStorage.setItem(JWT_STORAGE_KEY, 'mock-jwt-token-bypass');
    setUser(mockUser);
  };

  const loginWithGoogle = async () => {
    const mockUser = {
      id: 'usr-google-01',
      fullName: 'Google User',
      email: 'user@gmail.com',
      accountType: 'LIVE PRO',
      baseCurrency: 'USD',
      authProvider: 'google',
    };
    localStorage.setItem(JWT_STORAGE_KEY, 'mock-jwt-google-bypass');
    setUser(mockUser);
  };

  // One-click instant bypass button handler
  const bypassAuth = () => {
    const demoUser = {
      id: 'usr-demo-01',
      fullName: 'Alex Mercer',
      email: 'alex@partnerintrade.com',
      accountType: 'FUNDED 100K',
      baseCurrency: 'USD',
    };
    localStorage.setItem(JWT_STORAGE_KEY, 'mock-jwt-token-bypass');
    setUser(demoUser);
  };

  const logout = () => {
    setUser(null);
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