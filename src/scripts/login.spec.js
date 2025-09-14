import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();

const COOKIE_MODE = process.env.COOKIE_MODE || 'accept';
const TIMEOUT_MS = parseInt(process.env.TIMEOUT_MS || '10000', 10);

test.describe('TWIF login tests', () => {

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      // Test failed
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const screenshotPath = `screenshots/failure-${timestamp}.png`;
      const htmlPath = `screenshots/failure-${timestamp}.html`;

      await page.screenshot({ path: screenshotPath, fullPage: true });
      await page.content().then(html => require('fs').writeFileSync(htmlPath, html));

      console.log(`Test failed. Screenshot saved to: ${screenshotPath}`);
      console.log(`Test failed. HTML saved to: ${htmlPath}`);
    }
  });

  test('login and verify landing page', async ({ page }) => {
    // --- NAVIGATE TO LOGIN PAGE ---
    await page.goto(process.env.TWIF_URL);

    // --- HANDLE COOKIE BANNER ---
    try {
      console.log('Checking for cookie banner...');
      const bannerHeading = page.getByRole('heading', { name: 'Your Privacy Choices' });
      await bannerHeading.waitFor({ state: 'visible', timeout: TIMEOUT_MS });

      let buttonName = COOKIE_MODE === 'accept' ? 'Accept All' : 'Necessary Only';
      console.log(`Cookie banner detected, clicking "${buttonName}"...`);
      await page.getByRole('button', { name: new RegExp(buttonName, 'i') }).click();
      console.log('Clicked cookie banner button.');
    } catch (err) {
      console.log('No cookie banner found (already dismissed or not shown). Continuing...');
    }

    // --- LOGIN STEPS (DO NOT CHANGE) ---
    const emailInput = page.locator('input[placeholder="you@example.com"]');
    const passwordInput = page.locator('input[placeholder="••••••••"]');
    const loginButton = page.locator('button[type="submit"]');

    await emailInput.fill(process.env.TWIF_USERNAME);
    await passwordInput.fill(process.env.TWIF_PASSWORD);

    await expect(loginButton).toBeVisible({ timeout: TIMEOUT_MS });
    await expect(loginButton).toBeEnabled({ timeout: TIMEOUT_MS });

    await loginButton.scrollIntoViewIfNeeded();
    await loginButton.click({ force: true, timeout: TIMEOUT_MS });
    console.log('Clicked login button.');

    // --- WAIT FOR POST-LOGIN INDICATORS ---
    const postLoginSelector = [
      'a[title="Your Teams and Profile"]:not(.md\\:hidden)',
      'a[title="Dashboard"]:not(.md\\:hidden)',
      'a[title="Compare Players"]:not(.md\\:hidden)'
    ].join(',');

    const postLoginLocators = page.locator(postLoginSelector);

    console.log('Waiting for post-login indicator...');
    await postLoginLocators.first().waitFor({ state: 'visible', timeout: TIMEOUT_MS });

    const count = await postLoginLocators.count();
    console.log(`Found ${count} matching post-login elements:`);
    for (let i = 0; i < count; i++) {
      const text = await postLoginLocators.nth(i).innerText().catch(() => 'N/A');
      const href = await postLoginLocators.nth(i).getAttribute('href').catch(() => 'N/A');
      console.log(`  [${i}] text="${text}", href="${href}"`);
    }

    // --- WAIT FOR LOGOUT BUTTON ---
    const logoutButton = page.locator('button[aria-label="Logout"]');
    console.log('Waiting for logout button...');

    await expect(logoutButton).toBeVisible({ timeout: TIMEOUT_MS });
    await expect(logoutButton).toBeEnabled({ timeout: TIMEOUT_MS });

    const logoutText = await logoutButton.innerText().catch(() => 'N/A');
    console.log(`Logout button found. Text="${logoutText}"`);

    // --- CLICK LOGOUT ---
    await logoutButton.click({ force: true });
    console.log('Clicked logout button.');
  });

});
