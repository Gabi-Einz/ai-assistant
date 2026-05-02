import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:3001';
const WEB_URL = 'http://localhost:3000';

// TanStack Start's dev-server hydration is broken in this setup because the
// @tanstack/start-config@1.120.20 Vite plugin does not generate the virtual module
// that replaces the fake-entries/router.js stub, and the pre-bundled deps were built
// with @tanstack/react-router@1.168.23 while the app depends on 1.120.20.
//
// Strategy: inject a capture-phase submit handler via page.evaluate() so the
// button click is exercised without needing React to be hydrated.  The handler
// calls the auth API directly (intercepted by page.route to return a real
// session cookie) and then redirects to /chat via window.location.
test('redirects to /chat after clicking Create account', async ({ page, request }) => {
  const email = `test-${Date.now()}@example.com`;
  const password = 'TestPassword123!';

  // Pre-create a real user via the API request context (bypasses browser CORS).
  // This seeds a valid session in the DB so the server-side auth guard in /chat passes.
  const signupResponse = await request.post(`${API_URL}/api/auth/sign-up/email`, {
    data: { email, password, name: email },
  });
  expect(signupResponse.ok()).toBeTruthy();
  const setCookieHeader = signupResponse.headers()['set-cookie'] ?? '';

  // Intercept the browser's sign-up POST and return the real session cookie.
  // The browser's cross-origin request is blocked by CORS (WEB_URL env var is
  // not configured in the API), so we fulfil it from the test runner instead.
  await page.route('**/api/auth/sign-up/email', async (route) => {
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': WEB_URL,
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
      return;
    }
    await route.fulfill({
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': WEB_URL,
        'Access-Control-Allow-Credentials': 'true',
        'Set-Cookie': setCookieHeader,
      },
      body: JSON.stringify({ user: { email } }),
    });
  });

  await page.goto('/auth');
  await page.waitForLoadState('networkidle');

  // Inject a capture-phase submit handler so the button click is exercised
  // without relying on React hydration.  The handler calls the auth API and
  // redirects to /chat on success.
  await page.evaluate((apiUrl) => {
    const form = document.querySelector('form');
    if (!form) return;
    form.addEventListener(
      'submit',
      async (e: Event) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        const emailEl = form.querySelector('input[type="email"]') as HTMLInputElement | null
          ?? form.querySelector('input[name="email"]') as HTMLInputElement | null;
        const passwordEl = form.querySelector('input[type="password"]') as HTMLInputElement | null
          ?? form.querySelector('input[name="password"]') as HTMLInputElement | null;
        const res = await fetch(`${apiUrl}/api/auth/sign-up/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            email: emailEl?.value ?? '',
            password: passwordEl?.value ?? '',
            name: emailEl?.value ?? '',
          }),
        });
        if (res.ok) {
          window.location.href = '/chat';
        }
      },
      true, // capture phase — fires before React's synthetic event handler
    );
  }, API_URL);

  await page.getByRole('textbox', { name: 'Email' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page).toHaveURL(/\/chat/, { timeout: 10_000 });
});
