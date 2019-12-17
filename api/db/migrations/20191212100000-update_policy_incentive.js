'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(
  ['policy/20191212100000_update_policy_incentive_table', 'policy/20191212100000_create_policy_trip_view'],
  __dirname,
);

exports.setup = setup;
exports.up = up;
exports.down = down;
