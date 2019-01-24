require('dotenv').config();

const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
const webpack = require('webpack');

//common settings on all configurations
const extend = target => {
    const extended = Object.assign({}, target, {
        mode: "development",
        devtool: "inline-source-map",
    });
    
    
    return extended;
}

//separate configurations
const browserConfig = merge(extend(common.browserConfig), {
    devServer: {
        //contentBase: path.join(__dirname, "dist/"),
        contentBase: path.resolve(__dirname, './site'),
        compress: true,
        port: 3001,
        headers: { "Access-Control-Allow-Origin": "*" },
        historyApiFallback: {
            disableDotRule: true
        },
        watchContentBase: true,
    },
    plugins: [
        
    ]
});

module.exports = browserConfig;
