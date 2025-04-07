// Source: https://medium.com/the-andela-way/how-to-set-up-an-express-api-using-webpack-and-typescript-69d18c8c4f52

const path = require('path');
const nodeExternals = require('webpack-node-externals');
const { NODE_ENV = 'production' } = process.env;
module.exports = {
    entry: './src/index.ts',
    mode: NODE_ENV,
    target: 'node',
    externals: [nodeExternals()],
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'index.cjs',
        clean: true,
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
