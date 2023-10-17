'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration([
  'territory/20231016000000_update_get_com_helper',
], __dirname);
exports.setup = setup;
exports.up = up;
exports.down = down;
