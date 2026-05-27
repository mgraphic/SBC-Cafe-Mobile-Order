import { defineConfig } from 'tsup';
import { cpSync, existsSync } from 'fs';

export default defineConfig([
    // Node/Server build
    {
        format: ['cjs', 'esm'],
        entry: ['./src/index.ts'],
        dts: true,
        shims: true,
        skipNodeModulesBundle: true,
        sourcemap: true,
        clean: true,
        onSuccess: async () => {
            // Copy templates directory to dist
            const templatesSource = './src/com/templates';
            const templatesDest = './dist/templates';

            if (existsSync(templatesSource)) {
                cpSync(templatesSource, templatesDest, { recursive: true });
            }
        },
    },
    // Browser build - including JS implementation
    {
        format: ['esm'],
        entry: ['./src/browser.ts'],
        dts: true,
        outDir: 'dist',
        outExtension: () => ({ js: '.browser.js', dts: '.browser.d.ts' }),
        skipNodeModulesBundle: true,
        sourcemap: true,
        clean: false,
        minify: true,
    },
]);
