const webpack = require('webpack');

const build = config => {
  // Do this as the first thing so that any code reading it knows the right env.
  process.env.BABEL_ENV = 'production';
  process.env.NODE_ENV = 'production';
  process.env.ASSET_PATH = '/';

  config.mode = 'production';

  return webpack(config, (err, stats) => {
    if ((config.stats?.preset ?? config.stats) === 'verbose') {
      if (err) {
        // Fatal webpack errors (wrong configuration, etc)
        console.error('[Fatal error]:\t', err.stack || err);
        if (err.details) {
          console.error('\t[Details]:\t', err.details);
        }
      }

      const info = stats.toJson(config.stats);

      if (stats.hasWarnings()) {
        console.warn('[Compilation warning]:\t', info.warnings);
      }

      // Compilation errors (missing modules, syntax errors, etc)
      if (stats.hasErrors()) {
        console.error('[Compilation error]:\t', info.errors);
      }
    }

    if (err || stats.hasErrors()) process.exit(1);

    console.info(stats.toString(config.stats));
  });
};

module.exports = { build };
