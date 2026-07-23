import { test as base } from '@playwright/test';
import type { APIRequestContext, Page } from '@playwright/test';

export { expect } from '@playwright/test';

export const BACKEND_URL = 'http://localhost:8020';
const MAX_RETRIES = 10;
const RETRY_DELAY = 2000;

async function retryOnFail<T>(fn: () => Promise<T>): Promise<T> {
    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            return await fn();
        } catch (e) {
            if (i === MAX_RETRIES - 1) throw e;
            await new Promise((r) => setTimeout(r, RETRY_DELAY));
        }
    }
    throw new Error('unreachable');
}

export async function waitForBackend(request: APIRequestContext) {
    await retryOnFail(async () => {
        const res = await request.get(`${BACKEND_URL}/api/health`);
        if (!res.ok()) throw new Error(`health check failed: ${res.status()}`);
    });
}

export async function resetToClean(request: APIRequestContext) {
    await retryOnFail(async () => {
        const res = await request.post(`${BACKEND_URL}/api/seeds/clean`);
        if (!res.ok()) {
            const body = await res.text();
            throw new Error(`seed clean failed (${res.status()}): ${body}`);
        }
    });
}

export async function resetToWorking(request: APIRequestContext) {
    await retryOnFail(async () => {
        const res = await request.post(`${BACKEND_URL}/api/seeds/working`);
        if (!res.ok()) {
            const body = await res.text();
            throw new Error(`seed working failed (${res.status()}): ${body}`);
        }
    });
}

export async function gotoHome(page: Page) {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('header', { timeout: 15000 });
}

export const test = base;
