import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();

test('login and verify landing page', async ({ page }) => {
  // --- NAVIGATE TO LOGIN PAGE ---
  await page.goto(process.env.TWIF_URL);

  // --- LOGIN STEPS (DO NOT CHANGE) ---
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

  // --- SPA-AWARE LANDING PAGE WAIT ---
// Wait for the container that wraps all post-login nav links
const navContainer = page.locator('div.flex.items-center.gap-1.flex-shrink-0');

// Wait until the container is attached to DOM
await navContainer.waitFor({ state: 'attached', timeout: 15000 });

// Optionally: wait until it has at least one visible child
await page.waitForFunction(() => {
  const container = document.querySelector('div.flex.items-center.gap-1.flex-shrink-0');
  if (!container) return false;
  return Array.from(container.children).some(el => el.offsetParent !== null);
}, { timeout: 15000 });

// --- After successful login ---

// Wait for any of the post-login indicators to appear
const postLoginSelector = [
  'a[title="Your Teams and Profile"]', // user page
  'a[title="Dashboard"]',              // dashboard page
  'a[title="Compare Players"]'         // compare page
].join(',');

// --- Wait for logout button to appear ---
const logoutButton = page.locator('button[aria-label="Logout"]');

// Wait until the button is visible and enabled
await expect(logoutButton).toBeVisible({ timeout: 30000 });
await expect(logoutButton).toBeEnabled({ timeout: 15000 });

// Click it using robust Playwright options
await logoutButton.click({ force: true });


});
