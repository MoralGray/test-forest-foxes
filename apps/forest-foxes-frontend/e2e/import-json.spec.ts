import { test, expect, waitForBackend, resetToWorking, gotoHome } from './seed-helpers.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testDataPath = path.resolve(__dirname, 'test-data.json');

test.beforeEach(async ({ page, request }) => {
    await waitForBackend(request);
    await resetToWorking(request);
    await gotoHome(page);
});

test.describe('Import JSON', () => {
    test('import button opens file picker', async ({ page }) => {
        const [fileChooser] = await Promise.all([
            page.waitForEvent('filechooser'),
            page.getByRole('button', { name: 'Import JSON' }).click(),
        ]);
        await fileChooser.setFiles(testDataPath);
        await page.waitForTimeout(2000);
    });
});
