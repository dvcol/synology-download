const { getExtensionConfig } = require('../config/extension');

const { server } = require('./common');

server(getExtensionConfig)
  .then(start => console.info(`dev server started for 'extension' config`, start))
  .catch(err => console.error(`dev server failed to start for 'extension' config`, err));
