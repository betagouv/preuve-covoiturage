'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(['carpool/20191122100001_update_carpool_table'], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
