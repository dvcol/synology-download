const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const { getCommonConfig } = require('./common.js');

const ASSET_PATH = process.env.ASSET_PATH || '/';
const ROOT_DIR = '../../';

const getExtensionConfig = (common = getCommonConfig()) => ({
  ...common,
  entry: {
    popup: path.join(__dirname, ROOT_DIR, 'src', 'pages', 'popup'),
    panel: path.join(__dirname, ROOT_DIR, 'src', 'pages', 'panel'),
    options: path.join(__dirname, ROOT_DIR, 'src', 'pages', 'options'),
    background: path.join(__dirname, ROOT_DIR, 'src', 'pages', 'background'),
    contentScript: path.join(__dirname, ROOT_DIR, 'src', 'pages', 'content'),
  },
  output: {
    path: path.resolve(__dirname, ROOT_DIR, 'build'),
    filename: 'entry/[name].entry.js',
    chunkFilename: 'chunks/[name].chunk.js',
    publicPath: ASSET_PATH,
    clean: true,
  },
  plugins: [
    ...common.plugins,
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/manifest.json',
          to: path.join(__dirname, ROOT_DIR, 'build'),
          force: true,
          // generates the manifest file using the package.json information
          transform: content =>
            Buffer.from(
              JSON.stringify({
                description: process.env.npm_package_description,
                version: process.env.npm_package_version,
                ...JSON.parse(content.toString()),
              }),
            ),
        },
        {
          from: 'src/assets',
          to: path.join(__dirname, ROOT_DIR, 'build/assets'),
          force: true,
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, ROOT_DIR, 'src', 'pages', 'options', 'index.html'),
      filename: 'options.html',
      chunks: ['options'],
      cache: false,
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, ROOT_DIR, 'src', 'pages', 'panel', 'index.html'),
      filename: 'panel.html',
      chunks: ['panel'],
      cache: false,
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, ROOT_DIR, 'src', 'pages', 'popup', 'index.html'),
      filename: 'popup.html',
      chunks: ['popup'],
      cache: false,
    }),
  ],
});

module.exports = { getExtensionConfig };
