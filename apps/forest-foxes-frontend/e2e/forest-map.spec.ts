import { test, expect, waitForBackend, resetToWorking, gotoHome } from './seed-helpers.js';

test.beforeEach(async ({ page, request }) => {
    await waitForBackend(request);
    await resetToWorking(request);
    await gotoHome(page);
});

test.describe('Forest map', () => {
    async function getMapCard(page: any) {
        return page.getByText('Карта леса').locator('..').locator('..');
    }

    async function getCell(page: any, id: number) {
        const card = await getMapCard(page);
        const buttons = card.locator('button');
        const count = await buttons.count();
        for (let i = 0; i < count; i++) {
            const text = await buttons.nth(i).innerText();
            if (text.trim().startsWith(String(id))) return buttons.nth(i);
        }
        return buttons.first();
    }

    test('renders 9 cells in the map', async ({ page }) => {
        const card = await getMapCard(page);
        const buttons = card.locator('button');
        await expect(buttons).toHaveCount(9);
    });

    test('clicking a cell highlights it with ring', async ({ page }) => {
        const cell = await getCell(page, 1);
        await cell.click();
        await expect(cell).toHaveClass(/ring-2/);
    });

    test('clicking the same cell toggles off highlight', async ({ page }) => {
        const cell = await getCell(page, 2);
        await cell.click();
        await expect(cell).toHaveClass(/ring-2/);
        await cell.click();
        await expect(cell).not.toHaveClass(/ring-2/);
    });

    test('cells contain location names', async ({ page }) => {
        const card = await getMapCard(page);
        await expect(card.getByText('Северная поляна')).toBeVisible();
        await expect(card.getByText('Лисья нора')).toBeVisible();
    });
});
