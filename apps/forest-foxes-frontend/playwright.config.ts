import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    timeout: 30000,
    fullyParallel: false,
    retries: 1,
    use: {
        baseURL: 'http://localhost:3020',
        trace: 'retain-on-failure',
    },
});
