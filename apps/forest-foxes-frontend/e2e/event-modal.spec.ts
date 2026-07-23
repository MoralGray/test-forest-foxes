import { test, expect, waitForBackend, resetToWorking, gotoHome } from './seed-helpers.js';

test.beforeEach(async ({ page, request }) => {
    await waitForBackend(request);
    await resetToWorking(request);
    await gotoHome(page);
});

test.describe('Event detail modal', () => {
    test('clicking a pending event opens modal', async ({ page }) => {
        await page.waitForTimeout(2000);
        const eventBtn = page.locator('button').filter({ hasText: /obs_/ }).first();
        await expect(eventBtn).toBeVisible({ timeout: 15000 });
        await eventBtn.click();
        await expect(page.getByRole('dialog')).toBeVisible();
    });

    test('modal shows Отработано button for pending events', async ({ page }) => {
        await page.waitForTimeout(2000);
        const eventBtn = page.locator('button').filter({ hasText: /obs_/ }).first();
        await expect(eventBtn).toBeVisible({ timeout: 15000 });
        await eventBtn.click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Отработано' })).toBeVisible();
    });

    test('modal shows Save button', async ({ page }) => {
        await page.waitForTimeout(2000);
        const eventBtn = page.locator('button').filter({ hasText: /obs_/ }).first();
        await expect(eventBtn).toBeVisible({ timeout: 15000 });
        await eventBtn.click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
    });
});
