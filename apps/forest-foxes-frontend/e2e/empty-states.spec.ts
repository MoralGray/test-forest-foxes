import { test, expect, waitForBackend, resetToClean, gotoHome } from './seed-helpers.js';

test.beforeEach(async ({ page, request }) => {
    await waitForBackend(request);
    await resetToClean(request);
    await gotoHome(page);
});

test.describe('Empty states', () => {
    test('pending sidebar shows Нет событий', async ({ page }) => {
        await page.waitForTimeout(2000);
        await expect(page.getByText('Нет событий').first()).toBeVisible({ timeout: 10000 });
    });

    test('processed sidebar shows Нет обработанных', async ({ page }) => {
        await page.waitForTimeout(2000);
        await expect(page.getByText('Нет обработанных').first()).toBeVisible({ timeout: 10000 });
    });
});
