'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(
  [
    'trip/20191220000000_update_trip_view',
    'trip/20191220000000_update_export_view',
    'policy/20191220000000_update_policy_trip_view',
  ],
  __dirname,
);

exports.setup = setup;
exports.up = up;
exports.down = down;
