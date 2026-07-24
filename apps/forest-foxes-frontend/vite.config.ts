import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: [
            {
                find: '@',
                replacement: path.resolve(__dirname, './src'),
            },
            {
                find: '@mg-nx-forge/mg-ui-shadcn-4/src',
                replacement: path.resolve(__dirname, '../../packages/mg-ui-shadcn-4/src'),
            },
            {
                find: '@mg-nx-forge/mg-ui-shadcn-4',
                replacement: path.resolve(__dirname, '../../packages/mg-ui-shadcn-4/src/index.ts'),
            },
            {
                find: '@ui',
                replacement: path.resolve(__dirname, '../../packages/mg-ui-shadcn-4/src'),
            },
            {
                find: '@ui/*',
                replacement: path.resolve(__dirname, '../../packages/mg-ui-shadcn-4/src/*'),
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
        dedupe: ['react', 'react-dom', '@tanstack/react-query'],
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:8020',
                changeOrigin: true,
            },
        },
    },
});
