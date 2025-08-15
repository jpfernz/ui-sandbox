import { test, expect } from '@playwright/test';
import { TimeBoxPage } from './pages/time-box.page';

test.describe('Time Box', () => {
  let timeBoxPage: TimeBoxPage;

  test.beforeEach(async ({ page }) => {
    timeBoxPage = new TimeBoxPage(page);
  });

  test('should display Time Box', async ({ page }) => {
    await timeBoxPage.navigateTo();

    // Expect h1 to contain a substring.
    expect(await page.locator('h1').innerText()).toContain('Time Box');
  });

  test('should display Add Time Block button', async ({ page }) => {
    await timeBoxPage.navigateTo();

    // Expect button to be visible.
    await expect(timeBoxPage.addTimeBlockButton).toBeVisible();
  });
});
