'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration([
  'policy/20221116000000-create_cee_tables',
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
