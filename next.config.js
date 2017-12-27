const path = require('path')
const webpack = require('webpack');
// const ExtractTextPlugin = require('extract-text-webpack-plugin');
// const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    webpack: (config, { dev }) => {

        config.module.rules.push(
            {
                test: /\.css/,
                loader: 'emit-file-loader',
                options: {
                    name: 'dist/[path][name].[ext]'
                },
               
            }, {
                test: /\.css$/,
                use: ['babel-loader', 'raw-loader']
            },
            {
                test: /\.(js|jsx)$/,
                use: 'babel-loader',
                exclude: /node_modules/
            },
        )
        
        // config.resolve.extensions = ['.js', '.jsx'];
        // if (config.resolve.alias) {
        //     delete config.resolve.alias['react']
        //     delete config.resolve.alias['react-dom']
        //   }
        return config;
    }
}