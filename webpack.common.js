const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const commonConfig = {
    module: {
        rules: [
            {
                //enforce: "pre",
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "ts-loader", 
                        options: { transpileOnly: true }
                    },
                    "source-map-loader"
                ]
            },
            {
                //enforce: "pre",
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "ts-loader", 
                        options: { transpileOnly: true }
                    },
                    "source-map-loader"
                ]
            },
            {
                test: /\.scss$/,
                use: [ "style-loader" // creates style nodes from JS strings
                        , "css-loader" // translates CSS into CommonJS
                        , "sass-loader" // compiles Sass to CSS
                ]
            },
            {
                test: /\.css$/,
                use: [ "style-loader" // creates style nodes from JS strings
                        , "css-loader" // translates CSS into CommonJS
                ]
            },
            {
                test: /\.wasm$/,
                type: "webassembly/experimental",
            },
            { test: /\.html$/, loader: "html-loader" },
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js", ".mjs", ".wasm"],
        alias: {
            "components": path.resolve(__dirname, "src/components/"), 
            "utils": path.resolve(__dirname, "src/utils/")
        }
    },
}

const browserConfig = Object.assign({}, commonConfig, {
    entry: {
        main: path.resolve('./src/Main.ts'),
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].bundle.js",
        chunkFilename: "[name].bundle.js",
        sourceMapFilename: "[name].bundle.map",
        publicPath: '',
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, './site/index.html'),
            hash: true,
        }),

        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify(process.env['NODE_ENV']),
                'BROADCAST': JSON.stringify(process.env['BROADCAST']),
                'BUILD_VERSION': JSON.stringify(require("./package.json").version),
                'DEVELOPER': JSON.stringify(process.env['DEVELOPER'])
            }
        }),
        new ForkTsCheckerWebpackPlugin()
    ],
});


module.exports = {browserConfig: Object.assign(browserConfig, commonConfig)}; 
