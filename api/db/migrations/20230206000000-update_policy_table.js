'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration([
  'policy/20230206000000-update_policy_table',
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
