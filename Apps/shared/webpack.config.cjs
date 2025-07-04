const path = require('path');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const { ProvidePlugin } = require('webpack');

module.exports = [
    // Browser Bundle
    {
        mode: 'production',
        entry: './src/browser.ts',
        target: 'web',
        experiments: { outputModule: true },
        output: {
            filename: 'bundle.browser.js',
            path: path.resolve(__dirname, 'dist'),
            libraryTarget: 'umd',
            iife: true,
        },
        resolve: {
            extensions: ['.ts', '.js'],
            fallback: {
                crypto: path.resolve(
                    __dirname,
                    'src/polyfills/crypto-polyfill.cjs'
                ),
                net: false,
            },
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
            ],
        },
        plugins: [
            new NodePolyfillPlugin(),
            new ProvidePlugin({
                process: 'process/browser',
                Buffer: ['buffer', 'Buffer'],
            }),
        ],
    },
];
