'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(['carpool/20200304000000_create_operator_trip_id_index'], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
