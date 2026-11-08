const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Wait until the backend reports the requested plan as ACTIVE.
 * A checkout callback alone is never sufficient to grant paid access.
 */
export async function waitForSubscriptionActivation({
  planCode,
  fetchSubscriptionMe,
  maxAttempts = 10,
  intervalMs = 1500,
  wait = delay,
}) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const subscription = await fetchSubscriptionMe();
      if (subscription?.status === 'ACTIVE' && subscription?.effectivePlanCode === planCode) {
        return true;
      }
    } catch {
      // Retry while backend verification/webhook processing is pending.
    }
    if (attempt < maxAttempts - 1) await wait(intervalMs);
  }
  return false;
}
