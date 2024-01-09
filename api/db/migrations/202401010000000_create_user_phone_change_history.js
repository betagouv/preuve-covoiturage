'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(['fraudcheck/202401010000000_create_user_phone_change_history'], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;