import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setOnUnauthorized } from '@/lib/apiClient';
import { AUTH_STORAGE_KEY, clearAuthSession } from '@/lib/mappers/authMapper';
import {
  logout,
  bootstrapWorkspace,
  fetchTrades,
  fetchMarketAnalytics,
  fetchSubscriptionContext,
  selectUser,
  selectSelectedMarketId,
  selectWorkspaceLoading,
  selectOnboardingComplete,
  selectIsAuthenticated,
  selectSubscriptionStatus,
} from '@/app/store';

export function AppEffects() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const selectedMarketId = useSelector(selectSelectedMarketId);
  const workspaceLoading = useSelector(selectWorkspaceLoading);
  const onboardingComplete = useSelector(selectOnboardingComplete);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const subscriptionStatus = useSelector(selectSubscriptionStatus);

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
    if (!user?.id) return;
    if (subscriptionStatus === 'idle' || subscriptionStatus === 'error') {
      dispatch(fetchSubscriptionContext());
    }
  }, [dispatch, user?.id, subscriptionStatus]);

  useEffect(() => {
    if (!user?.id || !onboardingComplete) return;
    dispatch(bootstrapWorkspace());
  }, [dispatch, user?.id, onboardingComplete]);

  useEffect(() => {
    if (!isAuthenticated || !onboardingComplete) return;
    if (workspaceLoading) return;
    dispatch(fetchTrades());
    if (selectedMarketId != null) dispatch(fetchMarketAnalytics(selectedMarketId));
  }, [dispatch, selectedMarketId, workspaceLoading, isAuthenticated, onboardingComplete]);

  return null;
}
