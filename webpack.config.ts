import type {Configuration} from 'webpack';

module.exports = {
  entry: {background: 'src/background.ts', content: 'src/content.ts'},
} as Configuration;
