import { defineConfig } from 'tsup';

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
