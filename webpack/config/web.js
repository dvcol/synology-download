const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');

const { getCommonConfig } = require('./common');

const ROOT_DIR = '../../';

const getWebConfig = (common = getCommonConfig()) => {
  const ASSET_PATH = process.env.ASSET_PATH || '/';
  return {
    ...common,
    entry: path.join(__dirname, ROOT_DIR, 'src', 'pages', 'web', 'index.ts'),
    output: {
      path: path.resolve(__dirname, ROOT_DIR, 'dist'),
      filename: '[name].bundle.js',
      publicPath: ASSET_PATH,
      clean: true,
    },
    plugins: [
      ...common.plugins,
      new HtmlWebpackPlugin({
        template: path.join(__dirname, ROOT_DIR, 'src', 'pages', 'web', 'index.html'),
        filename: 'index.html',
        scriptLoading: 'module',
      }),
    ],
  };
};

module.exports = { getWebConfig };
