import { test, expect, waitForBackend, resetToWorking, gotoHome } from './seed-helpers.js';

test.beforeEach(async ({ page, request }) => {
    await waitForBackend(request);
    await resetToWorking(request);
    await gotoHome(page);
});

test.describe('Analytics', () => {
    test('summary card is visible', async ({ page }) => {
        await expect(page.getByText('Сводка').first()).toBeVisible();
    });

    test('top 5 table is visible', async ({ page }) => {
        await expect(page.getByText('Top 5 подозрительных').first()).toBeVisible();
    });

    test('tab switch works', async ({ page }) => {
        await page.getByRole('tab', { name: 'Обработанные' }).click();
        await expect(page.getByRole('tab', { name: 'Обработанные' })).toHaveAttribute('data-state', 'active');
    });
});
