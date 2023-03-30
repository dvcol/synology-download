const { getExtensionConfig } = require('../config/extension');

const { build } = require('./common');

build(getExtensionConfig());
