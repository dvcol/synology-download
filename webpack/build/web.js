const { getWebConfig } = require('../config/web');

const { build } = require('./common');

build(getWebConfig());
