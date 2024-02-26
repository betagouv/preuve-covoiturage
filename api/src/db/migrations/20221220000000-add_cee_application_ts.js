'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration([
  'cee/20221220000000-add_application_ts',
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
