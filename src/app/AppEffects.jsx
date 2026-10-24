import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setOnUnauthorized } from '@/lib/apiClient';
import { AUTH_STORAGE_KEY, clearAuthSession } from '@/lib/mappers/authMapper';
import {
  logout,
  bootstrapWorkspace,
  fetchTrades,
  selectUser,
  selectSelectedMarketId,
  selectWorkspaceLoading,
} from '@/app/store';

export function AppEffects() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const selectedMarketId = useSelector(selectSelectedMarketId);
  const workspaceLoading = useSelector(selectWorkspaceLoading);

  useEffect(() => {
    const handler = () => dispatch(logout());
    setOnUnauthorized(handler);
    return () => setOnUnauthorized(null);
  }, [dispatch]);

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

  useEffect(() => {
    if (user?.id) {
      dispatch(bootstrapWorkspace());
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (!workspaceLoading) {
      dispatch(fetchTrades());
    }
  }, [dispatch, selectedMarketId, workspaceLoading]);

  return null;
}
