const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { camelCase } = require('lodash');

// recommended : set the CONFIG_DIR as env variable
const configFolder = path.resolve(__dirname, process.env.CONFIG_DIR || '../../../config');
const config = {};

// Load all .yml files from the config/ folder
fs.readdirSync(configFolder, 'utf8').forEach((basename) => {
  if (basename.indexOf('.yml') === -1) return;

  // eslint-disable-next-line no-param-reassign
  basename = basename.replace('.yml', '');
  config[camelCase(basename)] = yaml.safeLoad(fs.readFileSync(`${configFolder}/${basename}.yml`, 'utf8'));
});

module.exports = config;
