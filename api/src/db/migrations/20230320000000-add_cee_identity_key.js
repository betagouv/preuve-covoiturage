'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration([
  'cee/20230320000000-add_identity_key',
], __dirname);
exports.setup = setup;
exports.up = up;
exports.down = down;
