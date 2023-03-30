const path = require('path');

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const ROOT_DIR = '../../';

const server = async (getConfig, mode = 'development') => {
  // Do this as the first thing so that any code reading it knows the right env.
  process.env.BABEL_ENV = mode;
  process.env.NODE_ENV = mode;
  process.env.ASSET_PATH = '/';

  const config = getConfig();

  const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 3000,
  };

  Object.keys(config.entry).forEach(entryName => {
    // do not hot reload content script
    if (entryName !== 'contentScript') {
      config.entry[entryName] = [
        'webpack/hot/dev-server',
        `webpack-dev-server/client?hot=true&hostname=localhost&port=${env.PORT}`,
        config.entry[entryName],
      ];
    }
  });

  config.plugins = [new webpack.HotModuleReplacementPlugin(), ...(config.plugins || [])];

  const compiler = webpack(config);

  const devServer = new WebpackDevServer(
    {
      https: false,
      hot: false,
      client: false,
      host: 'localhost',
      port: env.PORT,
      static: {
        directory: path.join(__dirname, ROOT_DIR, 'dist'),
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
    compiler,
  );

  if (process.env.NODE_ENV === 'development' && module.hot) {
    module.hot.accept();
  }

  return devServer.start();
};

module.exports = { server };
