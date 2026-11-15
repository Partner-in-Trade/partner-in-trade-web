import { test, expect } from '@playwright/test';

const originalProfile = {
  id: 42,
  name: 'Test Trader',
  email: 'trader@example.com',
  username: 'testtrader',
  bio: 'Intraday trader',
  location: 'Bengaluru',
  tradingMarkets: 'Options, Stocks',
  tradingExperience: '1 to 2 years',
  tradingStyle: 'Intraday',
  usualSessionStart: '09:15',
  usualSessionEnd: '15:30',
  riskPerTrade: 1,
  accountCurrency: 'INR',
  timeZone: 'Asia/Kolkata',
};

async function mockBackend(page, { rejectProfileUpdate = false } = {}) {
  let profile = { ...originalProfile };
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const method = request.method();

    if (path.endsWith('/users/login') && method === 'POST') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          accessToken: 'playwright-test-token',
          user: { id: 42, name: 'Test Trader', email: 'trader@example.com' },
        }),
      });
    }
    if (path.endsWith('/subscriptions/me')) {
      return route.fulfill({ status: 200, json: {
        planCode: 'PRO', effectivePlanCode: 'PRO', status: 'ACTIVE', onboardingCompleted: true,
      }});
    }
    if (path.endsWith('/subscriptions/plans')) return route.fulfill({ status: 200, json: [] });
    if (path.endsWith('/subscriptions/entitlements')) {
      return route.fulfill({ status: 200, json: { effectivePlanCode: 'PRO', capabilities: null } });
    }
    if (path.endsWith('/users/me/profile') && method === 'PUT') {
      if (rejectProfileUpdate) {
        return route.fulfill({ status: 400, json: { success: false, message: 'Username is already taken' } });
      }
      profile = { ...profile, ...request.postDataJSON() };
      return route.fulfill({ status: 200, json: profile });
    }
    if (path.endsWith('/users/me') && method === 'GET') {
      return route.fulfill({ status: 200, json: profile });
    }
    return route.fulfill({ status: 200, json: [] });
  });
}

async function signIn(page) {
  await page.goto('/');
  await page.locator('input[type="email"]').fill('trader@example.com');
  await page.locator('input[type="password"]').fill('not-a-real-password');
  await page.getByRole('button', { name: 'Sign In' }).last().click();
  await expect(page.getByRole('button', { name: 'Settings' })).toBeVisible();
}

test('signs in and displays the loaded trading profile', async ({ page }) => {
  await mockBackend(page);
  await signIn(page);
  await page.getByRole('button', { name: 'View profile' }).click();
  await expect(page.getByRole('heading', { name: 'Profile', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Test Trader' })).toBeVisible();
  await expect(page.getByText('@testtrader')).toBeVisible();
});

test('opens settings and saves profile changes', async ({ page }) => {
  await mockBackend(page);
  await signIn(page);
  await page.getByRole('button', { name: 'Settings' }).click();
  await expect(page.getByRole('heading', { name: 'Account settings' })).toBeVisible();
  await page.getByLabel('Full name').fill('Updated Trader');

  const updateRequest = page.waitForRequest((request) =>
    request.url().includes('/users/me/profile') && request.method() === 'PUT'
  );
  await page.getByRole('button', { name: 'Save changes' }).click();
  const request = await updateRequest;
  expect(request.postDataJSON()).toMatchObject({
    name: 'Updated Trader',
    email: 'trader@example.com',
    username: 'testtrader',
    accountCurrency: 'INR',
    timeZone: 'Asia/Kolkata',
  });
  await expect(page.getByRole('status')).toContainText('Profile saved successfully.');
});

test('shows backend validation feedback in the browser', async ({ page }) => {
  await mockBackend(page, { rejectProfileUpdate: true });
  await signIn(page);
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByLabel('Full name').fill('Updated Trader');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('alert')).toContainText('Username is already taken');
});
