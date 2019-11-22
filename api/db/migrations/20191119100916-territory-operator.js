'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(['application/002_create_territory_operator_table'], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
