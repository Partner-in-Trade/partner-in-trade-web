import { afterEach, describe, expect, it, vi } from 'vitest';
import { openRazorpaySubscriptionCheckout } from './loadRazorpayCheckout';

describe('openRazorpaySubscriptionCheckout', () => {
  let options;
  let handlers;

  afterEach(() => {
    delete window.Razorpay;
    vi.restoreAllMocks();
  });

  function installRazorpayMock() {
    handlers = {};
    options = null;
    window.Razorpay = class MockRazorpay {
      constructor(config) {
        options = config;
      }

      on(event, callback) {
        handlers[event] = callback;
      }

      open() {}
    };
  }

  it('returns a non-authoritative callback outcome, never a paid-access flag', async () => {
    installRazorpayMock();

    const resultPromise = openRazorpaySubscriptionCheckout({
      keyId: 'rzp_test_key',
      subscriptionId: 'sub_test_id',
    });
    options.handler({ razorpay_payment_id: 'pay_test_id' });

    await expect(resultPromise).resolves.toEqual({ outcome: 'checkout_callback' });
  });

  it('rejects when checkout is dismissed', async () => {
    installRazorpayMock();

    const resultPromise = openRazorpaySubscriptionCheckout({
      keyId: 'rzp_test_key',
      subscriptionId: 'sub_test_id',
    });
    options.modal.ondismiss();

    await expect(resultPromise).rejects.toThrow('Checkout dismissed');
  });

  it('rejects when Razorpay reports payment failure', async () => {
    installRazorpayMock();

    const resultPromise = openRazorpaySubscriptionCheckout({
      keyId: 'rzp_test_key',
      subscriptionId: 'sub_test_id',
    });
    handlers['payment.failed']({ error: { description: 'declined' } });

    await expect(resultPromise).rejects.toThrow('Payment failed');
  });

  it('ignores subsequent events after the checkout promise settles', async () => {
    installRazorpayMock();

    const resultPromise = openRazorpaySubscriptionCheckout({
      keyId: 'rzp_test_key',
      subscriptionId: 'sub_test_id',
    });
    options.handler({});
    options.modal.ondismiss();
    handlers['payment.failed']({});

    await expect(resultPromise).resolves.toEqual({ outcome: 'checkout_callback' });
  });
});
