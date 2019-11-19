'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(['carpool/20191119091826_create_carpool_identity_table'], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
