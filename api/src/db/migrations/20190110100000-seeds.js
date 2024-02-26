'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(['common/003_seed_role_table'], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
