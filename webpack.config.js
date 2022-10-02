/* eslint-disable */
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        background: './src/background.ts',
        context: './src/context.ts',
        options: './src/options.ts',
    },
    devtool: false,
    mode: 'production',
    performance: {
        hints: false,
    },
    node: false,
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
                options: {},
            },
            // {
            //     test: /\.css$/,
            //     use: ['css-loader'],
            // },
        ],
    },
    optimization: {
        minimize: false,
        // leaving this here in case it's needed in the future, but currently,
        // using splitChunks causes the extension to break
        // splitChunks: {
        //     chunks: (chunk) => {
        //         return ['options', 'context'].includes(chunk.name);
        //     },
        // },
    },
    resolve: {
        extensions: ['.ts', '.js'],
        plugins: [],
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                'LICENSE',
                'src/manifest.json',
                'src/options.html',
                'src/popup.html',
                'src/options-redir.html',
                { from: 'src/icons', to: 'icons' },
                { from: 'src/css', to: 'css' },
            ],
        }),
    ],
    devServer: {
        hot: false,
        inline: false,
        writeToDisk: true,
    },
};
