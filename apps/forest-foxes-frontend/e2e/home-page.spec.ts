import { test, expect, waitForBackend, resetToWorking, gotoHome } from './seed-helpers.js';

test.beforeEach(async ({ page, request }) => {
    await waitForBackend(request);
    await resetToWorking(request);
    await gotoHome(page);
});

test.describe('Home page smoke', () => {
    test('shows header with title and navigation', async ({ page }) => {
        await expect(page.locator('header')).toContainText('Лисий диспетчер');
        await expect(page.getByRole('link', { name: 'AI Worklog' })).toBeVisible();
    });

    test('displays forest map with title', async ({ page }) => {
        await expect(page.getByText('Карта леса')).toBeVisible();
    });

    test('displays left sidebar with events', async ({ page }) => {
        await expect(page.getByText('События').first()).toBeVisible();
    });

    test('displays right sidebar with processed events', async ({ page }) => {
        await expect(page.getByText('Обработанные').first()).toBeVisible();
    });

    test('shows Import JSON button', async ({ page }) => {
        await expect(page.getByRole('button', { name: 'Import JSON' })).toBeVisible();
    });

    test('shows three tab triggers', async ({ page }) => {
        await expect(page.getByRole('tab', { name: 'Все события' })).toBeVisible();
        await expect(page.getByRole('tab', { name: 'Самые подозрительные' })).toBeVisible();
        await expect(page.getByRole('tab', { name: 'Обработанные' })).toBeVisible();
    });

    test('shows summary card', async ({ page }) => {
        await expect(page.getByText('Сводка').first()).toBeVisible();
    });

    test('shows top 5 ranking table', async ({ page }) => {
        await expect(page.getByText('Top 5 подозрительных')).toBeVisible();
    });

    test('shows factor impact table', async ({ page }) => {
        await expect(page.getByText('Влияние признаков')).toBeVisible();
    });
});
