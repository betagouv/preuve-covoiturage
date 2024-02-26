'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration([
  'cee/20221116000000-create_cee_tables',
  'carpool/20221116000000_add_operator_journey_id_index',
], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
