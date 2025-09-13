import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();

test('login and verify dashboard', async ({ page }) => {
  await page.goto(process.env.TWIF_URL);

  // --- LOGIN ---
  const emailInput = page.locator('input[placeholder="you@example.com"]');
  const passwordInput = page.locator('input[placeholder="••••••••"]');
  const loginButton = page.locator('button[type="submit"]');

  // Fill in credentials
  await emailInput.fill(process.env.TWIF_USERNAME);
  await passwordInput.fill(process.env.TWIF_PASSWORD);

  // Wait for the button to be visible AND enabled
  await expect(loginButton).toBeVisible({ timeout: 15000 });
  await expect(loginButton).toBeEnabled({ timeout: 15000 });

  // Extra safeguard: scroll into view
  await loginButton.scrollIntoViewIfNeeded();

  // Click using Playwright's robust click
  await loginButton.click({ force: true, timeout: 15000 });

  // --- POST-LOGIN VERIFICATION (SPA-aware) ---
const dashboardLink = page.locator('a[aria-label="Dashboard"]');

  // Wait for the element to appear in the DOM
  await dashboardLink.waitFor({ state: 'attached', timeout: 20000 });

  // Ensure it is visible and enabled
  await expect(dashboardLink).toBeVisible({ timeout: 20000 });
  await expect(dashboardLink).toBeEnabled({ timeout: 20000 });

console.log('Dashboard is visible. Login flow complete.');

});
