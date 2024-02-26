'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration([
  'trip/20220629000000_update_trip_indexes',
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
