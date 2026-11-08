const SCRIPT_ID = 'razorpay-checkout-js';

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(window.Razorpay);
      return;
    }
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      existing.addEventListener('load', () => resolve(window.Razorpay));
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay')));
      return;
    }
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(window.Razorpay);
    script.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.body.appendChild(script);
  });
}

/**
 * Opens Razorpay subscription checkout from backend checkout payload.
 * Uses Checkout.js with subscription_id (recommended). short_url often shows
 * "Hosted page is not available" in test mode or when the hosted page is disabled.
 */
export async function openRazorpaySubscriptionCheckout({ keyId, subscriptionId }) {
  if (!keyId || !subscriptionId) {
    throw new Error('Checkout is missing Razorpay key or subscription id.');
  }
  const Razorpay = await loadRazorpayScript();
  return new Promise((resolve, reject) => {
    let settled = false;
    const settle = (callback, value) => {
      if (settled) return;
      settled = true;
      callback(value);
    };
    const options = {
      key: keyId,
      subscription_id: subscriptionId,
      name: 'Partner in Trade',
      description: 'Subscription',
      // This only reports that Razorpay invoked its client callback. It is not
      // proof of payment; subscription access must come from backend entitlements.
      handler: () => settle(resolve, { outcome: 'checkout_callback' }),
      modal: {
        ondismiss: () => settle(reject, new Error('Checkout dismissed')),
      },
    };
    const instance = new Razorpay(options);
    instance.on('payment.failed', () => settle(reject, new Error('Payment failed')));
    instance.open();
  });
}
