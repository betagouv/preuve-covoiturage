'use strict';
var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(['acquisition/20200401132407_acquisition_carpools'], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
