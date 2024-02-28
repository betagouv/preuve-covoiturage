'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration([
  'fraudcheck/20230710000000_create_triangulaire',
], __dirname);
exports.setup = setup;
exports.up = up;
exports.down = down;
