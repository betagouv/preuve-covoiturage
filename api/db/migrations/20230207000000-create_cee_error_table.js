'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration([
  'cee/20230207000000-create_cee_error_table',
], __dirname);
exports.setup = setup;
exports.up = up;
exports.down = down;
