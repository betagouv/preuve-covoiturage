'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(['policy/20210930135857_create_policy_trips_view'], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
