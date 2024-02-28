'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(['carpool/20191130003916_create_unique_index'], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
