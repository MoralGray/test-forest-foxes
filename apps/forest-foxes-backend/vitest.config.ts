import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
    resolve: {
        alias: {
            '@mg-nx-forge/forest-foxes-shared-prisma': path.resolve(
                __dirname,
                '../../packages/forest-foxes-shared-prisma/src/index.ts'
            ),
        },
    },
    test: {
        globals: true,
        environment: 'node',
        include: ['src/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            include: ['src/**/*.ts'],
            exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'src/generated/**'],
        },
    },
});
