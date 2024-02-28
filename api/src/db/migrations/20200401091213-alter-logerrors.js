'use strict';
var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(['acquisition/20200401091213_alter_logerrors'], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
