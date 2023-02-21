'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration([
  'policy/20221215000000_create_policy_lock_table',
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
