'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(['territory/20211122000000_move_territory_operator_as_legacy'], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
