/* eslint-disable @typescript-eslint/no-var-requires */
// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';
process.env.ASSET_PATH = '/';

const webpack = require('webpack');

const config = require('../webpack.config');

config.mode = 'production';

webpack(config, (err, stats) => {
  if ((config.stats?.preset ?? config.stats) === 'verbose') {
    if (err) {
      // Fatal webpack errors (wrong configuration, etc)
      console.error('[Fatal error]:\t', err.stack || err);
      if (err.details) {
        console.error('\t[Details]:\t', err.details);
      }
    }

    const info = stats.toJson(config.stats);

    // Compilation errors (missing modules, syntax errors, etc)
    if (stats.hasErrors()) {
      console.error('[Compilation error]:\t', info.errors);
    }

    if (stats.hasWarnings()) {
      console.warn('[Compilation warning]:\t', info.warnings);
    }
  }

  console.info(stats.toString(config.stats));
});
