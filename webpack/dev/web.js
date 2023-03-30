const { getWebConfig } = require('../config/web');

const { server } = require('./common');

server(getWebConfig)
  .then(start => console.info(`dev server started for 'web' config`, start))
  .catch(err => console.error(`dev server failed to start for 'web' config`, err));
