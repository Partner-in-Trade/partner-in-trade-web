import { apiClient } from '@/lib/apiClient';

export async function fetchSubscriptionMe() {
  const { data } = await apiClient.get('/subscriptions/me');
  return data;
}

export async function fetchSubscriptionPlans() {
  const { data } = await apiClient.get('/subscriptions/plans');
  return data;
}

export async function fetchSubscriptionEntitlements() {
  const { data } = await apiClient.get('/subscriptions/entitlements');
  return data;
}

export async function postStartTrial() {
  const { data } = await apiClient.post('/subscriptions/start-trial');
  return data;
}

export async function postCheckout(planCode) {
  const { data } = await apiClient.post('/subscriptions/checkout', { planCode });
  return data;
}
