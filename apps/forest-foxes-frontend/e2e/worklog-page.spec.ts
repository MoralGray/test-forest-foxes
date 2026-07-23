import { test, expect } from '@playwright/test';

test.describe('Worklog page', () => {
    test('navigates to /worklog and shows heading', async ({ page }) => {
        await page.goto('/worklog');
        await expect(page.getByRole('heading', { name: 'AI Worklog' })).toBeVisible();
        const sections = page.locator('section');
        const count = await sections.count();
        expect(count).toBeGreaterThanOrEqual(5);
    });

    test('renders stage headings', async ({ page }) => {
        await page.goto('/worklog');
        await expect(page.getByText('1. Описание Raw')).toBeVisible();
        await expect(page.getByText('9. Backend Data Phase')).toBeVisible();
    });

    test('header link navigates home', async ({ page }) => {
        await page.goto('/worklog');
        await page.getByRole('link', { name: 'Лисий диспетчер' }).click();
        await expect(page).toHaveURL('/');
    });

    test('AI Worklog link in header navigates to worklog', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('link', { name: 'AI Worklog' }).click();
        await expect(page).toHaveURL('/worklog');
    });
});
