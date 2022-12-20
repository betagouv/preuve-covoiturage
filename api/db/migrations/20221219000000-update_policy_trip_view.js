'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration([
  'policy/20221219000000_update_policy_trip_view',
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
