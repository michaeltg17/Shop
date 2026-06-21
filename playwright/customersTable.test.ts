import { expect } from '@playwright/test';
import { test } from './fixtures';

test('loadUsers invoked only once across navigation', async ({ page }) => {
  let apiCount = 0;

  page.on('response', response => {
    try {
      if (response.url().includes('/users') && response.request().method() === 'GET') apiCount++;
    } catch {}
  });

  // Open app (navigate directly to /admin/users)
  await page.goto('/admin/users');

  // Wait for the first users response
  await page.waitForResponse(resp => resp.url().includes('/users') && resp.request().method() === 'GET');
  expect(apiCount).toBeGreaterThanOrEqual(1);

  const initialCount = apiCount;

  // Click toolbar button to go to user page (exact match: "User" not "Users")
  const userBtnExact = page.getByRole('button', { name: 'User', exact: true });
  await expect(userBtnExact).toBeVisible();
  await userBtnExact.click();
  await page.waitForURL(/\/admin\/user/);

  // Navigate back to users page
  await page.goBack();
  await page.waitForURL(/\/admin\/users/);

  // Allow a short grace period for any unexpected network calls
  await page.waitForTimeout(500);

  // Ensure no additional API calls were made on re-entry
  // (the component caches users in a signal, so it shouldn't re-fetch)
  expect(apiCount).toBe(initialCount);
});
