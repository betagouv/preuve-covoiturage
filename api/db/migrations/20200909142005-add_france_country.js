'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(['territory/20200909142005_add_france_country'], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
