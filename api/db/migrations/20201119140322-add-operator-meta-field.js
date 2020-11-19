'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(['operator/20201119140322_add_meta_field'], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
