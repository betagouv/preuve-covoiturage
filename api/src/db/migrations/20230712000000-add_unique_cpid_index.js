'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration([
  'cee/20230712000000-add_unique_cpid_index',
], __dirname);
exports.setup = setup;
exports.up = up;
exports.down = down;
