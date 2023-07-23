const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { LimitChunkCountPlugin } = require('webpack').optimize;

const { getCommonConfig } = require('./common');

const ROOT_DIR = '../../';

const getWebConfig = (common = getCommonConfig()) => {
  const ASSET_PATH = process.env.ASSET_PATH || '/synology-download/';

  const options = {
    ...common,
    entry: {
      main: path.join(__dirname, ROOT_DIR, 'src', 'pages', 'web', 'main.ts'),
      index: path.join(__dirname, ROOT_DIR, 'src', 'pages', 'web', 'index.ts'),
    },
    output: {
      path: path.resolve(__dirname, ROOT_DIR, 'dist'),
      filename: 'entry/[name].js',
      chunkFilename: 'chunks/[name].chunk.js',
      publicPath: ASSET_PATH,
      library: {
        type: 'module',
      },
      clean: true,
    },
    experiments: {
      outputModule: true,
    },
    plugins: [
      ...common.plugins,
      new HtmlWebpackPlugin({
        template: path.join(__dirname, ROOT_DIR, 'src', 'pages', 'web', 'index.html'),
        favicon: path.join(__dirname, ROOT_DIR, 'src', 'assets', 'favicon.ico'),
        chunks: 'main',
        filename: 'index.html',
        scriptLoading: 'module',
        chunkFilename: '[name].chunk.js',
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.join(__dirname, ROOT_DIR, 'src', 'pages', 'web', 'json'),
            to: path.join(__dirname, ROOT_DIR, 'dist', 'json'),
          },
          {
            from: path.join(__dirname, ROOT_DIR, 'src', 'manifest.json'),
            to: path.join(__dirname, ROOT_DIR, 'dist', 'json', 'manifest.json'),
          },
        ],
      }),
    ],
  };

  if (process.env.ANALYSE_BUNDLE || process.env.NODE_ENV === 'development') {
    options.optimization.splitChunks = {
      ...options.optimization.splitChunks,
      chunks: 'all',
      cacheGroups: {
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
          name: 'vendor-react',
          chunks: 'all',
        },
        mui_data_grid: {
          priority: 10,
          test: /[\\/]node_modules[\\/]@mui[\\/]x-data-grid[\\/]/,
          name: 'vendor-mui_data_grid',
          chunks: 'all',
        },
        mui_icons: {
          priority: 10,
          test: /[\\/]node_modules[\\/]@mui[\\/]icons-material[\\/]/,
          name: 'vendor-mui_icons',
          chunks: 'all',
        },
        mui: {
          test: /[\\/]node_modules[\\/]@mui[\\/]/,
          name: 'vendor-mui',
          chunks: 'all',
        },
        dnd: {
          test: /[\\/]node_modules[\\/]@dnd-kit[\\/]/,
          name: 'vendor-dnd_kit',
          chunks: 'all',
        },
        node_modules: {
          priority: -10,
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor-node_modules',
        },
      },
    };
  } else {
    options.module.parser = {
      ...options.module.parser,
      javascript: {
        dynamicImportMode: 'eager',
      },
    };
    options.plugins.push(
      new LimitChunkCountPlugin({
        maxChunks: 1,
      }),
    );
  }
  return options;
};

module.exports = { getWebConfig };
