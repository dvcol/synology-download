const fs = require('fs');
const path = require('path');

const MergeJsonWebpackPlugin = require('merge-jsons-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { ProgressPlugin, EnvironmentPlugin } = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const ROOT_DIR = '../../';

const alias = {
  '@src': path.resolve(__dirname, ROOT_DIR, 'src'),
};

const fileExtensions = ['jpg', 'jpeg', 'png', 'gif', 'eot', 'otf', 'svg', 'ttf', 'woff', 'woff2'];

// TODO: Investigate content script tree shaking issues (big bundle size)
const getCommonConfig = () => {
  process.env.DEBUG = process.env.DEBUG ?? process.env.NODE_ENV === 'development';
  process.env.DEVTOOL = process.env.DEVTOOL ?? process.env.NODE_ENV === 'development';

  if (process.env.NODE_ENV === 'development') {
    alias['react-dom'] = '@hot-loader/react-dom';
  }

  const options = {
    mode: process.env.NODE_ENV || 'development',
    stats: {
      preset: 'normal',
      colors: true,
      env: true,
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
                sourceMap: process.env.NODE_ENV === 'development',
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
        {
          test: /\.(ts|tsx)$/,
          loader: 'ts-loader',
          exclude: /node_modules/,
          options: {
            compilerOptions: {
              declarationMap: process.env.NODE_ENV === 'development',
            },
          },
        },
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
      new ProgressPlugin(),
      // expose and write the allowed env vars on the compiled bundle
      new EnvironmentPlugin(['NODE_ENV', 'DEBUG', 'DEVTOOL']),
      new MergeJsonWebpackPlugin({
        output: {
          groupBy: fs.readdirSync('src/i18n')?.map(lang => ({
            pattern: `src/i18n/${lang}/**/*.json`,
            fileName: `_locales/${lang}/messages.json`,
          })),
        },
      }),
    ],
    infrastructureLogging: {
      level: 'info',
    },
  };

  if (process.env.ANALYSE_BUNDLE) {
    options.plugins.push(
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
      }),
    );
  }

  if (process.env.NODE_ENV === 'development') {
    options.devtool = 'eval-source-map';
    options.optimization = {};
  } else {
    options.optimization = {
      usedExports: true,
      minimize: true,
      minimizer: [
        new TerserPlugin({
          extractComments: false,
          terserOptions: {
            compress: {
              drop_console: false,
            },
          },
        }),
      ],
    };
  }

  options.optimization.splitChunks = {
    name: (module, chunks) => chunks.map(chunk => chunk.name).join('-'),
  };

  return options;
};

module.exports = { getCommonConfig };
