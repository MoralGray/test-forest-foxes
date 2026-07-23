import { test, expect, waitForBackend, resetToWorking, gotoHome } from './seed-helpers.js';

test.beforeEach(async ({ page, request }) => {
    await waitForBackend(request);
    await resetToWorking(request);
    await gotoHome(page);
});

test.describe('Tabs', () => {
    test('default active tab is Все события', async ({ page }) => {
        await expect(page.getByRole('tab', { name: 'Все события' })).toHaveAttribute('data-state', 'active');
    });

    test('click Самые подозрительные activates it', async ({ page }) => {
        await page.getByRole('tab', { name: 'Самые подозрительные' }).click();
        await expect(page.getByRole('tab', { name: 'Самые подозрительные' })).toHaveAttribute('data-state', 'active');
    });

    test('click Обработанные activates it', async ({ page }) => {
        await page.getByRole('tab', { name: 'Обработанные' }).click();
        await expect(page.getByRole('tab', { name: 'Обработанные' })).toHaveAttribute('data-state', 'active');
    });
});
