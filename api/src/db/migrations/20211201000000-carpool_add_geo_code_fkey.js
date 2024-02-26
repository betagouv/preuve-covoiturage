'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(['carpool/20211201000000-add_geo_code_fkey'], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
