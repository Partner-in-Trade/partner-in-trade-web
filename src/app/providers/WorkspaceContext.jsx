import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { ensureUserWorkspace } from '@/lib/bootstrap/ensureUserWorkspace';

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [market, setMarket] = useState(null);
  const [strategiesByName, setStrategiesByName] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const bootstrap = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const userId = Number(user.id);
      const workspace = await ensureUserWorkspace(userId);
      setMarket(workspace.market);
      setStrategiesByName(workspace.strategiesByName);
    } catch (e) {
      console.error('Workspace bootstrap failed:', e);
      setError(e.response?.data?.message || e.message || 'Failed to load account data');
      setMarket(null);
      setStrategiesByName({});
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      bootstrap();
    } else {
      setMarket(null);
      setStrategiesByName({});
      setError(null);
    }
  }, [isAuthenticated, user?.id, bootstrap]);

  return (
    <WorkspaceContext.Provider
      value={{
        market,
        strategiesByName,
        workspaceLoading: loading,
        workspaceError: error,
        refreshWorkspace: bootstrap,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
}
