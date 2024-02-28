'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration([
  'carpool/20230316000000_create_incentive_table',
], __dirname);
exports.setup = setup;
exports.up = up;
exports.down = down;
