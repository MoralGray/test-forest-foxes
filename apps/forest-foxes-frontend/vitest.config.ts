import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
    resolve: {
        alias: [
            {
                find: '@',
                replacement: path.resolve(__dirname, './src'),
            },
            {
                find: '@mg-nx-forge/mg-ui-shadcn-4',
                replacement: path.resolve(__dirname, '../../packages/mg-ui-shadcn-4/src/index.ts'),
            },
            {
                find: '@mg-nx-forge/mg-api-axios-1',
                replacement: path.resolve(__dirname, '../../packages/mg-api-axios-1/src/index.ts'),
            },
            {
                find: '@mg-nx-forge/mg-infinite-view-tanstack',
                replacement: path.resolve(__dirname, '../../packages/mg-infinite-view-tanstack/src/index.ts'),
            },
            {
                find: '@mg-nx-forge/mg-table-tanstack',
                replacement: path.resolve(__dirname, '../../packages/mg-table-tanstack/src/index.ts'),
            },
        ],
    },
    test: {
        globals: true,
        environment: 'jsdom',
        include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
        setupFiles: ['./src/test-setup.ts'],
        coverage: {
            provider: 'v8',
            include: ['src/**/*.ts', 'src/**/*.tsx'],
            exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/**/*.spec.ts'],
        },
    },
});
