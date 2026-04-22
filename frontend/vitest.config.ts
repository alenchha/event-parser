import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/test/setup.ts'],
        exclude: ['**/node_modules/**', '**/e2e/**'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            include: ['src/**/*.{ts,tsx}'],
            exclude: ['src/test/**', 'src/main.tsx', 'src/vite-env.d.ts'],
        },
    },
});
