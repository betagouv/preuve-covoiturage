'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(['trip/20210922135412-update_trip_view_operator_ids_fix'], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
