'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration([
  'policy/20230309000000-add_tz_to_policies',
], __dirname);
exports.setup = setup;
exports.up = up;
exports.down = down;
