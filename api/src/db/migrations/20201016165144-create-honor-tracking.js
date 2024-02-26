'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(
  ['honor/20201016165144-create-schema', 'honor/20201016165316-create-table'],
  __dirname,
);

exports.setup = setup;
exports.up = up;
exports.down = down;
