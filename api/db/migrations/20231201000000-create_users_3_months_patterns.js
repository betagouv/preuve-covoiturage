'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(['fraudcheck/20231201000000_create_users_3_months_patterns'], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;