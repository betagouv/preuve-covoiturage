'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(['acquisition/20191217111323_create_errors_table'], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
