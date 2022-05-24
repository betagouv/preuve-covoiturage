'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration([
  'geo/20220419000000_create_geo_helper',
  'carpool/20220419000000_update_carpool_indexes',
  'trip/20220419000000_refactor_trip_list',
  'policy/20220419000000_update_policy_trips_view',
  'territory/20220419000000_create_territory_helpers',
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
