'use strict';

/* eslint-disable-next-line */
var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(['policy/20240404000000_update_policy_trip_view'], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
