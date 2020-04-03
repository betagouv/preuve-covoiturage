'use strict';
var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(['acquisition/20200319000001_acquisition_process'], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
