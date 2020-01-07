'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(['auth/002_user_hard_delete'], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
