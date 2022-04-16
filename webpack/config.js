const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MergeJsonWebpackPlugin = require('merge-jsons-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');

const ASSET_PATH = process.env.ASSET_PATH || '/';

const alias = {
  'react-dom': '@hot-loader/react-dom',
  '@src': path.resolve(__dirname, '../', 'src'),
};

const fileExtensions = ['jpg', 'jpeg', 'png', 'gif', 'eot', 'otf', 'svg', 'ttf', 'woff', 'woff2'];

// TODO: Investigate content script tree shaking issues (big bundle size)
const options = {
  mode: process.env.NODE_ENV || 'development',
  stats: {
    preset: 'normal',
    colors: true,
    env: true,
  },
  entry: {
    popup: path.join(__dirname, '../', 'src', 'pages', 'popup'),
    options: path.join(__dirname, '../', 'src', 'pages', 'options'),
    background: path.join(__dirname, '../', 'src', 'pages', 'background'),
    contentScript: path.join(__dirname, '../', 'src', 'pages', 'content'),
  },
  output: {
    path: path.resolve(__dirname, '../', 'build'),
    filename: '[name].bundle.js',
    publicPath: ASSET_PATH,
    clean: true,
  },
  module: {
    rules: [
      {
        // look for .css or .scss files
        test: /\.(css|scss)$/,
        // in the `src` directory
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: new RegExp(`.(${fileExtensions.join('|')})$`),
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
        },
        exclude: /node_modules/,
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
        exclude: /node_modules/,
      },
      { test: /\.(ts|tsx)$/, loader: 'ts-loader', exclude: /node_modules/ },
      {
        test: /\.(js|jsx)$/,
        use: [
          {
            loader: 'source-map-loader',
          },
          {
            loader: 'babel-loader',
            /* This configuration aids babel-preset-env to disable transpiling of import or export modules to commonJS */
            options: { presets: [['es2021', { modules: false }]] },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    alias,
    extensions: fileExtensions.map(extension => `.${extension}`).concat(['.js', '.jsx', '.ts', '.tsx', '.css', '.scss']),
  },
  plugins: [
    new webpack.ProgressPlugin(),
    // expose and write the allowed env vars on the compiled bundle
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/manifest.json',
          to: path.join(__dirname, '../', 'build'),
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
          to: path.join(__dirname, '../', 'build/assets'),
          force: true,
        },
      ],
    }),
    new MergeJsonWebpackPlugin({
      output: {
        groupBy: [
          {
            pattern: 'src/i18n/en/**/*.json',
            fileName: '_locales/en/messages.json',
          },
          // {
          //   pattern: 'src/i18n/fr/**/*.json',
          //   fileName: '_locales/fr/messages.json',
          // },
        ],
      },
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../', 'src', 'pages', 'options', 'index.html'),
      filename: 'options.html',
      chunks: ['options'],
      cache: false,
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../', 'src', 'pages', 'popup', 'index.html'),
      filename: 'popup.html',
      chunks: ['popup'],
      cache: false,
    }),
  ],
  infrastructureLogging: {
    level: 'info',
  },
};

if (process.env.NODE_ENV === 'development') {
  options.devtool = 'cheap-module-source-map';
} else {
  options.optimization = {
    usedExports: true,
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          compress: {
            drop_console: true,
          },
        },
      }),
    ],
  };
}

module.exports = options;
