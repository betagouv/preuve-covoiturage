'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(['fraudcheck/20240101000000_create_user_phone_change_history'], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;