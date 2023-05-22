'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration([
  'cee/20230522000000-update_identity_key',
], __dirname);
exports.setup = setup;
exports.up = up;
exports.down = down;
