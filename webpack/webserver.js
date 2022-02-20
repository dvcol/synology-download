/* eslint-disable @typescript-eslint/no-var-requires */
// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';
process.env.ASSET_PATH = '/';

const path = require('path');

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const config = require('../webpack.config');

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
};

for (const entryName in config.entry) {
  // do not hot reload content script
  if (entryName !== 'contentScript') {
    config.entry[entryName] = [
      'webpack/hot/dev-server',
      `webpack-dev-server/client?hot=true&hostname=localhost&port=${env.PORT}`,
      config.entry[entryName],
    ];
  }
}

config.plugins = [new webpack.HotModuleReplacementPlugin(), ...(config.plugins || [])];

const compiler = webpack(config);

const server = new WebpackDevServer(
  {
    https: false,
    hot: false,
    client: false,
    host: 'localhost',
    port: env.PORT,
    static: {
      directory: path.join(__dirname, '../build'),
    },
    devMiddleware: {
      publicPath: `http://localhost:${env.PORT}/`,
      writeToDisk: true,
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    allowedHosts: 'all',
  },
  compiler
);

if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept();
}

(async () => {
  await server.start();
})();
