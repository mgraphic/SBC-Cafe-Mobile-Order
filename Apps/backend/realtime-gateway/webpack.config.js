// Source: https://medium.com/the-andela-way/how-to-set-up-an-express-api-using-webpack-and-typescript-69d18c8c4f52

import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';
import nodeExternals from 'webpack-node-externals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const { NODE_ENV = 'production' } = process.env;

export default {
    entry: './src/index.ts',
    mode: NODE_ENV,
    target: 'node',
    externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'index.cjs',
        clean: true, // clean the output directory before emit.
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: ['ts-loader'],
            },
        ],
    },
};
