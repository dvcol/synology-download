const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');

const { getCommonConfig } = require('./common');

const ROOT_DIR = '../../';

const getWebConfig = (common = getCommonConfig()) => {
  const ASSET_PATH = process.env.ASSET_PATH || '/';
  return {
    ...common,
    entry: {
      main: path.join(__dirname, ROOT_DIR, 'src', 'pages', 'web', 'main.ts'),
      'src/index': path.join(__dirname, ROOT_DIR, 'src', 'pages', 'web', 'index.ts'),
    },
    output: {
      path: path.resolve(__dirname, ROOT_DIR, 'dist'),
      filename: '[name].js',
      publicPath: ASSET_PATH,
      libraryTarget: 'umd',
      clean: true,
    },
    plugins: [
      ...common.plugins,
      new HtmlWebpackPlugin({
        template: path.join(__dirname, ROOT_DIR, 'src', 'pages', 'web', 'index.html'),
        chunks: 'main',
        filename: 'index.html',
        scriptLoading: 'module',
      }),
    ],
  };
};

module.exports = { getWebConfig };
