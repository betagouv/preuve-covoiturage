'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration([
  'carpool/20220419000000_update_carpool_indexes',
  'trip/20220419000000_refactor_trip_list',
  'policy/20220419000000_update_policy_trips_view',
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
