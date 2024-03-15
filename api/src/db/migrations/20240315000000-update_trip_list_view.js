'use strict';

/* eslint-disable-next-line */
var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(['trip/20240315000000-update_trip_list_view'], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
