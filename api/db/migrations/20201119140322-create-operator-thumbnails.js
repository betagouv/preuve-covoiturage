'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(['operator/20201119140322_create_thumbnails_table'], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
